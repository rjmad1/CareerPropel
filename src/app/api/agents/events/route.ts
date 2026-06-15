/**
 * GET /api/agents/events
 * Server-Sent Events stream for real-time agent status updates.
 * Works in Next.js App Router without a custom server.
 */

import { NextRequest } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { subscribeToUser, keepAliveConnection } from '@/lib/realtime/sharedSubscriber';

export const dynamic = 'force-dynamic';

const HEARTBEAT_MS = 25_000;

export async function GET(_request: NextRequest) {
  const { userEmail } = await getAuthContext();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // client disconnected
        }
      };

      // Send initial empty snapshot (realtime updates arrive via Redis pub/sub)
      send('snapshot', {});

      let unsubscribe: (() => void) | null = null;

      try {
        unsubscribe = await subscribeToUser(userEmail, (event) => {
          send(event.type, event);
        });
      } catch (error) {
        // Redis or subscription error - client gets snapshot only
      }

      // Heartbeat keeps the connection alive through proxies
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
          // Assert active connection health in shared subscriber connection map
          keepAliveConnection(userEmail);
        } catch {
          clearInterval(heartbeat);
          if (unsubscribe) {
            unsubscribe();
          }
        }
      }, HEARTBEAT_MS);

      // Cleanup when client closes
      return () => {
        clearInterval(heartbeat);
        if (unsubscribe) {
          unsubscribe();
        }
      };
    },
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
