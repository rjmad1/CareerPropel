import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

async function getCandidate(email: string) {
  const c = await prisma.candidate.findUnique({ where: { email }, select: { id: true } });
  if (!c) throw Object.assign(new Error('Profile not found'), { status: 404 });
  return c;
}

export async function GET(req: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();
    const candidate = await getCandidate(userEmail);

    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status') ?? undefined;
    const type = searchParams.get('type') ?? undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100', 10), 200);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where: {
          candidateId: candidate.id,
          ...(status ? { status } : {}),
          ...(type ? { type } : {}),
        },
        orderBy: [{ followUpAt: 'asc' }, { updatedAt: 'desc' }],
        take: limit,
        skip: offset,
      }),
      prisma.contact.count({
        where: {
          candidateId: candidate.id,
          ...(status ? { status } : {}),
          ...(type ? { type } : {}),
        },
      }),
    ]);

    return NextResponse.json({ data: contacts, total, limit, offset });
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return NextResponse.json(
      { error: { message: e.message ?? 'Failed to fetch contacts' } },
      { status: e.status ?? 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();
    const candidate = await getCandidate(userEmail);

    const body = await req.json();
    const { name, company, role, email, phone, linkedInUrl, type, status, jobId, notes, followUpAt } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: { message: 'Name is required' } }, { status: 400 });
    }

    const contact = await prisma.contact.create({
      data: {
        candidateId: candidate.id,
        name: name.trim(),
        company: company?.trim() || null,
        role: role?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        linkedInUrl: linkedInUrl?.trim() || null,
        type: type ?? 'recruiter',
        status: status ?? 'to_contact',
        jobId: jobId || null,
        notes: notes?.trim() || null,
        followUpAt: followUpAt ? new Date(followUpAt) : null,
      },
    });

    return NextResponse.json({ data: contact }, { status: 201 });
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return NextResponse.json(
      { error: { message: e.message ?? 'Failed to create contact' } },
      { status: e.status ?? 500 }
    );
  }
}
