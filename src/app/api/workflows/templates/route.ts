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
    } catch (err: any) {
      return NextResponse.json({ error: { message: err.message ?? 'Failed to list templates' } }, { status: 500 });
    }
  },
  {
    classification: 'authenticated',
    rateLimitClass: 'standard',
    auditSensitivity: 'low',
  }
);

