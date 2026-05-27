/**
 * GET /api/interview-prep/[jobId]/events
 * SSE stream for interview prep generation progress.
 * Polls DB every 2 s until prepStatus is 'ready' or 'error', then closes.
 * Falls back gracefully when DB is unavailable.
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

const POLL_MS = 2_000;
const HEARTBEAT_MS = 20_000;
const MAX_WAIT_MS = 5 * 60 * 1_000; // 5 minutes hard cap

interface RouteParams {
  params: Promise<{ jobId: string }>;
}

type SendFn = (event: string, data: unknown) => void;

function computeProgress(prepStatus: string, elapsed: number): number {
  if (prepStatus === 'ready') return 100;
  if (prepStatus === 'error') return 0;
  return Math.min(90, Math.round((elapsed / MAX_WAIT_MS) * 90));
}

async function sendInitialStatus(
  jobId: string,
  userEmail: string,
  send: SendFn,
  cleanup: () => void,
): Promise<string | null> {
  try {
    const candidate = await prisma.candidate.findUnique({ where: { email: userEmail } });
    if (!candidate) {
      send('error', { message: 'Candidate not found' });
      cleanup();
      return null;
    }

    const prep = await prisma.interviewPrep.findUnique({ where: { jobId } });
    if (!prep || prep?.candidateId !== candidate.id) {
      send('error', { message: 'Interview prep not found' });
      cleanup();
      return null;
    }

    send('status', { prepStatus: prep.prepStatus, progress: prep.prepStatus === 'ready' ? 100 : 5 });

    if (prep.prepStatus === 'ready' || prep.prepStatus === 'error') {
      cleanup();
      return null;
    }

    return candidate.id;
  } catch {
    send('error', { message: 'Database unavailable' });
    cleanup();
    return null;
  }
}

async function pollTick(
  jobId: string,
  candidateId: string,
  startedAt: number,
  send: SendFn,
  cleanup: () => void,
): Promise<boolean> {
  if (Date.now() - startedAt > MAX_WAIT_MS) {
    send('error', { message: 'Timed out waiting for prep generation' });
    cleanup();
    return true;
  }

  try {
    const prep = await prisma.interviewPrep.findUnique({ where: { jobId } });
    if (!prep) {
      send('error', { message: 'Interview prep not found', jobId });
      cleanup();
      return true;
    }

    if (prep.candidateId !== candidateId) {
      send('error', { message: 'Authorization lost' });
      cleanup();
      return true;
    }

    const elapsed = Date.now() - startedAt;
    send('status', { prepStatus: prep.prepStatus, progress: computeProgress(prep.prepStatus, elapsed) });

    if (prep.prepStatus === 'ready' || prep.prepStatus === 'error') {
      cleanup();
      return true;
    }
  } catch {
    // Transient DB error — keep trying
  }
  return false;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { jobId } = await params;

  let userEmail: string;
  try {
    ({ userEmail } = await getAuthContext());
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send: SendFn = (event, data) => {
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

      // Heartbeat keeps the connection alive through proxies
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

      const candidateId = await sendInitialStatus(jobId, userEmail, send, cleanup);
      if (!candidateId) return;

      while (!done) {
        await new Promise((r) => setTimeout(r, POLL_MS));
        if (done) break;
        if (await pollTick(jobId, candidateId, startedAt, send, cleanup)) break;
      }
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
