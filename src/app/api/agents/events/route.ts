/**
 * GET /api/agents/events
 * Server-Sent Events stream for real-time agent status updates.
 * Works in Next.js App Router without a custom server.
 */

import { NextRequest } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { subscribeToUser, keepAliveConnection, getBufferedEventsForUser } from '@/lib/realtime/sharedSubscriber';
import { createLogger } from '@/lib/logging/logger';

const sseLogger = createLogger({ component: 'agents-events-sse' });

export const dynamic = 'force-dynamic';

const HEARTBEAT_MS = 25_000;

export async function GET(_request: NextRequest) {
  const { userEmail } = await getAuthContext();
  const lastEventId = _request.headers.get('last-event-id') || _request.nextUrl.searchParams.get('lastEventId');

  const encoder = new TextEncoder();

  let unsubscribe: (() => void) | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let isCleanedUp = false;

  const cleanup = () => {
    if (isCleanedUp) return;
    isCleanedUp = true;
    sseLogger.info({ userEmail, route: 'agents/events/route', action: 'cleanup' }, 'Cleaning up SSE connection and subscriptions');
    if (heartbeat) {
      clearInterval(heartbeat);
      heartbeat = null;
    }
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // client disconnected
          cleanup();
        }
      };

      // Send initial empty snapshot (realtime updates arrive via Redis pub/sub)
      send('snapshot', {});

      // Last-Event-ID recovery replay for client reconnections
      if (lastEventId) {
        try {
          const missedEvents = getBufferedEventsForUser(userEmail, lastEventId);
          if (missedEvents.length > 0) {
            sseLogger.info({ userEmail, lastEventId, count: missedEvents.length }, 'Replaying missed SSE events from reconnect buffer');
            for (const ev of missedEvents) {
              send(ev.type, ev);
            }
          }
        } catch (replayErr) {
          sseLogger.warn({ userEmail, lastEventId, err: replayErr }, 'Failed to replay missed SSE events');
        }
      }

      try {
        unsubscribe = await subscribeToUser(userEmail, (event) => {
          send(event.type, event);
        });
      } catch (error) {
        // Redis or subscription error - client gets snapshot only
        sseLogger.error({ userEmail, err: error, route: 'agents/events/route' }, 'Failed to subscribe to Redis');
      }

      // Heartbeat keeps the connection alive through proxies
      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
          // Assert active connection health in shared subscriber connection map
          keepAliveConnection(userEmail);
        } catch {
          cleanup();
        }
      }, HEARTBEAT_MS);
    },
    cancel(reason) {
      sseLogger.info({ userEmail, reason, route: 'agents/events/route' }, 'Stream cancelled');
      cleanup();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
