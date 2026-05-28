import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { listTemplates } from '@/lib/workflow/templates';

export const dynamic = 'force-dynamic';

export const GET = withAuth(
  async () => {
    try {
      const templates = listTemplates().map(t => ({
        id: t.id,
        displayName: t.displayName,
        description: t.description,
        version: t.version,
        stepCount: t.steps.length,
        metadata: t.metadata,
      }));
      return NextResponse.json({ data: templates });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to list templates';
      return NextResponse.json({ error: { message } }, { status: 500 });
    }
  },
  {
    classification: 'authenticated',
    rateLimitClass: 'standard',
    auditSensitivity: 'low',
  }
);

