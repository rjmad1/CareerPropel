/**
 * GET /api/agents/events
 * Server-Sent Events stream for real-time agent status updates.
 * Works in Next.js App Router without a custom server.
 */

import { NextRequest } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { getAllAgentStatus } from '@/lib/realtime/wsServer';
import { REDIS_CHANNELS, parseEvent } from '@/lib/realtime/events';
import Redis from 'ioredis';

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

      // Send initial snapshot
      try {
        const snapshot = await getAllAgentStatus(userEmail);
        send('snapshot', snapshot);
      } catch {
        send('snapshot', {});
      }

      // Dedicated subscriber connection (ioredis subscriber mode)
      const sub = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        enableReadyCheck: false,
        lazyConnect: true,
      });

      const channels = [
        REDIS_CHANNELS.AGENT_STATUS(userEmail),
        REDIS_CHANNELS.AGENT_EXECUTIONS(userEmail),
        REDIS_CHANNELS.QUEUE_STATS(userEmail),
      ];

      sub.on('message', (_channel: string, message: string) => {
        const event = parseEvent(message);
        if (event) send(event.type, event);
      });

      try {
        await sub.connect();
        await sub.subscribe(...channels);
      } catch {
        // Redis unavailable — SSE stays open, client gets snapshot only
      }

      // Heartbeat keeps the connection alive through proxies
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeat);
          sub.disconnect();
        }
      }, HEARTBEAT_MS);

      // Cleanup when client closes
      return () => {
        clearInterval(heartbeat);
        sub.disconnect();
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
