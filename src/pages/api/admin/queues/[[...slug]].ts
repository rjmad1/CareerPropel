import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { can } from '@/lib/security/authorization/authorizationService';
import { getExecutionQueue, getDeadLetterQueue } from '@/lib/queue/queues';
import type { NextApiRequest, NextApiResponse } from 'next';

let globalAdapter: ExpressAdapter | null = null;

function getBullBoardAdapter() {
  if (!globalAdapter) {
    globalAdapter = new ExpressAdapter();
    globalAdapter.setBasePath('/admin/queues');

    createBullBoard({
      queues: [
        new BullMQAdapter(getExecutionQueue()),
        new BullMQAdapter(getDeadLetterQueue()),
      ],
      serverAdapter: globalAdapter,
    });
  }
  return globalAdapter;
}

// GOVERNANCE:
/**
 * GOVERNANCE: Pages Router used ONLY for Bull Board compatibility.
 * App Router remains canonical.
 * Do not expand Pages Router usage.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Enforce authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 2. Enforce admin role check (skip authorization checks only in dev mode, but still check session)
  const isDev = process.env.NODE_ENV === 'development';
  if (!isDev) {
    const hasAccess = await can(session.user.email, 'system.admin.access', {
      actorId: session.user.id,
      skipAuditLog: true,
    });
    if (!hasAccess) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  // 3. Process request via Bull Board router
  const adapter = getBullBoardAdapter();
  const router = adapter.getRouter();

  // Rewire req.url to match adapter basePath
  const originalUrl = req.url ?? '';
  req.url = originalUrl.replace('/api/admin/queues', '/admin/queues');

  // Handle resolution by passing it to the Express router
  return router(req, res, (err: any) => {
    if (err) {
      res.status(500).send(err.message || 'Internal Server Error');
    } else {
      res.status(404).send('Not Found');
    }
  });
}

// Ensure Next.js Page Route knows that this resolver handles the response asynchronously
export const config = {
  api: {
    externalResolver: true,
  },
};
