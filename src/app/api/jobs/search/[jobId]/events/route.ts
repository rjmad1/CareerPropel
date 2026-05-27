/**
 * GET /api/jobs/search/[jobId]/events
 * SSE stream for async job-search execution progress.
 * Polls DB every 2 s until status is 'completed' or 'failed', then closes.
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/middleware/withAuth';

export const dynamic = 'force-dynamic';

const POLL_MS = 2_000;
const HEARTBEAT_MS = 20_000;
const MAX_WAIT_MS = 5 * 60 * 1_000;

export const GET = withAuth(
  async (_request: NextRequest, auth, params) => {
    const jobId = params?.jobId as string;
    const { userEmail } = auth;

    // Verify ownership before opening the stream
    try {
      const execution = await prisma.agentExecution.findUnique({ where: { id: jobId } });
      if (!execution) {
        return new Response('Not Found', { status: 404 });
      }
      if (execution.userId !== userEmail) {
        return new Response('Forbidden', { status: 403 });
      }
    } catch {
      return new Response('Service Unavailable', { status: 503 });
    }


  const encoder = new TextEncoder();

  // Shared cleanup reference so cancel() can tear down the stream
  let cleanupFn: () => void = () => { /* no-op until start initializes */ };

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

      let done = false;
      const startedAt = Date.now();

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeat);
          done = true;
        }
      }, HEARTBEAT_MS);

      const cleanup = () => {
        clearInterval(heartbeat);
        done = true;
        try { controller.close(); } catch { /* already closed */ }
      };
      cleanupFn = cleanup;

      // Send initial status immediately
      try {
        const execution = await prisma.agentExecution.findUnique({ where: { id: jobId } });
        if (!execution) {
          send('error', { message: 'Job search execution not found' });
          cleanup();
          return;
        }
        send('status', { status: execution.status, progress: execution.status === 'running' ? 50 : 0 });
        if (execution.status === 'completed' || execution.status === 'failed') {
          cleanup();
          return;
        }
      } catch {
        send('error', { message: 'Database unavailable' });
        cleanup();
        return;
      }

      // Poll until terminal state or timeout
      while (!done) {
        await new Promise((r) => setTimeout(r, POLL_MS));
        if (done) break;

        if (Date.now() - startedAt > MAX_WAIT_MS) {
          send('error', { message: 'Timed out waiting for search results' });
          cleanup();
          break;
        }

        try {
          const execution = await prisma.agentExecution.findUnique({ where: { id: jobId } });
          if (!execution) { cleanup(); break; }

          send('status', {
            status: execution.status,
            progress: execution.status === 'running' ? 50 : execution.status === 'completed' ? 100 : 0,
          });

          if (execution.status === 'completed' || execution.status === 'failed') {
            cleanup();
          }
        } catch {
          // Transient DB error — keep trying
        }
      }
    },
    cancel() {
      cleanupFn();
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
  },
  {
    classification: 'authenticated',
    rateLimitClass: 'standard',
    auditSensitivity: 'low',
  }
);

