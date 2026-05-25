import { NextResponse } from 'next/server';
import { listTemplates } from '@/lib/workflow/templates';

export const dynamic = 'force-dynamic';

export async function GET() {
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
}
