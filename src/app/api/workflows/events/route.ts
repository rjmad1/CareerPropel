import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { getCandidate } from '@/lib/route-helpers/candidate';
import { log } from '@/lib/logging/logger';

export const dynamic = 'force-dynamic';

export const GET = withAuth(
  async (req: NextRequest, auth) => {
    try {
      const { userEmail } = auth;
      const candidate = await getCandidate(userEmail);

      const responseHeaders = new Headers({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      });

      const { redis } = await import('@/lib/redis/redisClient');
      const subscriber = redis.duplicate();
      await subscriber.connect();

      const channel = `workflow:execution:${candidate.id}`;
      log.info({ channel, userId: userEmail }, 'SSE Connection: Subscribed to Redis channel');

      const stream = new ReadableStream({
        async start(controller) {
          // Keep-alive heartbeat interval
          const keepAlive = setInterval(() => {
            try {
              controller.enqueue(new TextEncoder().encode(': keepalive\n\n'));
            } catch {
              // Stream already closed
            }
          }, 30000);

          try {
            await subscriber.subscribe(channel, (message) => {
              try {
                controller.enqueue(new TextEncoder().encode(`data: ${message}\n\n`));
              } catch (err) {
                log.warn({ err }, 'SSE stream enqueue failed; client disconnected');
              }
            });
          } catch (err) {
            log.error({ err }, 'SSE stream subscription error');
          }

          req.signal.addEventListener('abort', async () => {
            clearInterval(keepAlive);
            try {
              await subscriber.unsubscribe(channel);
              await subscriber.quit();
            } catch (err) {
              // Ignore cleanup issues
            }
            log.info({ channel }, 'SSE Connection: Stream aborted and cleaned up');
            controller.close();
          });
        },
      });

      return new NextResponse(stream, { headers: responseHeaders });
    } catch (err: unknown) {
      log.error({ err }, 'Failed to initiate SSE connection');
      const message = err instanceof Error ? err.message : 'Server-Sent Events subscription failed';
      return NextResponse.json({ error: { message } }, { status: 500 });
    }
  },
  {
    classification: 'authenticated',
    rateLimitClass: 'standard',
    auditSensitivity: 'low',
  }
);
