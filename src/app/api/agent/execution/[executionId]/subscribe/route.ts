import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getExecutionEnvelope } from '@/lib/agents/core/store';
import { createLogger } from '@/lib/logging/logger';
import { subscribeToExecution } from '@/lib/realtime/sharedSubscriber';
import { runtimeSettings } from '@/lib/runtime/settings';

const sseLogger = createLogger({ route: '/api/agent/execution/[executionId]/subscribe' });

export const dynamic = 'force-dynamic';

function sseEvent(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ executionId: string }> }
) {
  const { executionId } = await context.params;
  const execution = await prisma.agentExecution.findUnique({
    where: { id: executionId },
  });

  if (!execution) {
    return new Response('Execution not found', { status: 404 });
  }

  let closeStream: (() => void) | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let unsubscribe: (() => void) | null = null;
      let heartbeat: NodeJS.Timeout | null = null;
      let isClosed = false;

      const close = () => {
        if (isClosed) return;
        isClosed = true;

        if (heartbeat) {
          clearInterval(heartbeat);
          heartbeat = null;
        }

        if (unsubscribe) {
          unsubscribe();
          unsubscribe = null;
        }

        try {
          controller.close();
        } catch {}
      };

      closeStream = close;

      const sendCurrentExecution = async () => {
        const envelope = await getExecutionEnvelope(executionId);
        if (!envelope) {
          return;
        }

        try {
          controller.enqueue(
            encoder.encode(
              sseEvent('execution:update', {
                ...envelope,
                progress:
                  envelope.status === 'completed'
                    ? 100
                    : envelope.status === 'running'
                    ? 50
                    : envelope.progress,
              })
            )
          );
        } catch (err) {
          sseLogger.error({ err, executionId }, 'Failed to enqueue execution update, closing stream');
          close();
        }
      };

      try {
        try {
          controller.enqueue(encoder.encode('retry: 5000\n\n'));
        } catch (err) {
          sseLogger.error({ err, executionId }, 'Failed to enqueue initial retry config, closing stream');
          close();
          return;
        }

        await sendCurrentExecution();
        if (isClosed) return;

        unsubscribe = await subscribeToExecution(executionId, async (event) => {
          if (isClosed) return;
          try {
            if (event.type === 'log:new') {
              controller.enqueue(encoder.encode(sseEvent('log:new', event.log)));
              return;
            }

            await sendCurrentExecution();
          } catch (err) {
            sseLogger.error({ err, executionId }, 'Failed to enqueue subscriber event, closing stream');
            close();
          }
        });

        heartbeat = setInterval(() => {
          if (isClosed) return;
          try {
            controller.enqueue(
              encoder.encode(
                sseEvent('heartbeat', {
                  executionId,
                  timestamp: new Date().toISOString(),
                })
              )
            );
          } catch (err) {
            sseLogger.error({ err, executionId }, 'Failed to enqueue heartbeat, closing stream');
            close();
          }
        }, runtimeSettings.sseHeartbeatMs);

        request.signal.addEventListener('abort', () => {
          sseLogger.info({ executionId }, 'SSE client aborted connection');
          close();
        });
      } catch (error) {
        sseLogger.error({ err: error, executionId }, 'Failed to initialize SSE stream');
        close();
      }
    },
    cancel() {
      sseLogger.info({ executionId }, 'SSE stream cancelled by consumer');
      if (closeStream) {
        closeStream();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream',
      'X-Accel-Buffering': 'no',
    },
  });
}
