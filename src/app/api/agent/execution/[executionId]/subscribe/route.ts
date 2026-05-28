import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getExecutionEnvelope } from '@/lib/agents/store';
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

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let unsubscribe: (() => void) | null = null;
      let heartbeat: NodeJS.Timeout | null = null;

      const close = () => {
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

      const sendCurrentExecution = async () => {
        const envelope = await getExecutionEnvelope(executionId);
        if (!envelope) {
          return;
        }

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
      };

      try {
        controller.enqueue(encoder.encode('retry: 5000\n\n'));
        await sendCurrentExecution();

        unsubscribe = await subscribeToExecution(executionId, async (event) => {
          if (event.type === 'log:new') {
            controller.enqueue(encoder.encode(sseEvent('log:new', event.log)));
            return;
          }

          await sendCurrentExecution();
        });

        heartbeat = setInterval(() => {
          controller.enqueue(
            encoder.encode(
              sseEvent('heartbeat', {
                executionId,
                timestamp: new Date().toISOString(),
              })
            )
          );
        }, runtimeSettings.sseHeartbeatMs);

        request.signal.addEventListener('abort', () => {
          sseLogger.info({ executionId }, 'SSE client disconnected');
          close();
        });
      } catch (error) {
        sseLogger.error({ err: error, executionId }, 'Failed to initialize SSE stream');
        close();
      }
    },
    cancel() {},
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
