import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';
import { contactIntelligenceService } from '@/domains/networking/services/contactIntelligenceService';
import { warmPathService } from '@/domains/networking/services/warmPathService';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userEmail } = await getAuthContext();
    const { id } = await params;

    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });
    if (!candidate) {
      return NextResponse.json({ error: { message: 'Profile not found' } }, { status: 404 });
    }

    const contact = await prisma.contact.findUnique({ where: { id } });
    if (!contact || contact.candidateId !== candidate.id) {
      return NextResponse.json({ error: { message: 'Contact not found' } }, { status: 404 });
    }

    const [intelligence, warmPaths] = await Promise.all([
      contactIntelligenceService.enrichContact(id),
      warmPathService.detectWarmPaths(candidate.id, id),
    ]);

    return NextResponse.json({ data: { ...intelligence, warmPaths } });
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return NextResponse.json(
      { error: { message: e.message ?? 'Failed to get contact insights' } },
      { status: e.status ?? 500 },
    );
  }
}
