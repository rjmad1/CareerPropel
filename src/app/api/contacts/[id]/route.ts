import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

async function resolveContact(contactId: string, candidateEmail: string) {
  const candidate = await prisma.candidate.findUnique({
    where: { email: candidateEmail },
    select: { id: true },
  });
  if (!candidate) throw Object.assign(new Error('Profile not found'), { status: 404 });

  const contact = await prisma.contact.findUnique({ where: { id: contactId } });
  if (!contact || contact.candidateId !== candidate.id) {
    throw Object.assign(new Error('Contact not found'), { status: 404 });
  }
  return contact;
}

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { userEmail } = await getAuthContext();
    const contact = await resolveContact(id, userEmail);
    return NextResponse.json({ data: contact });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message ?? 'Failed to fetch contact' } },
      { status: err.status ?? 500 }
    );
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { userEmail } = await getAuthContext();
    await resolveContact(id, userEmail);

    const body = await req.json();
    const {
      name, company, role, email, phone, linkedInUrl,
      type, status, jobId, notes, followUpAt, lastContactedAt,
    } = body;

    const updated = await prisma.contact.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(company !== undefined ? { company: company?.trim() || null } : {}),
        ...(role !== undefined ? { role: role?.trim() || null } : {}),
        ...(email !== undefined ? { email: email?.trim() || null } : {}),
        ...(phone !== undefined ? { phone: phone?.trim() || null } : {}),
        ...(linkedInUrl !== undefined ? { linkedInUrl: linkedInUrl?.trim() || null } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(jobId !== undefined ? { jobId: jobId || null } : {}),
        ...(notes !== undefined ? { notes: notes?.trim() || null } : {}),
        ...(followUpAt !== undefined ? { followUpAt: followUpAt ? new Date(followUpAt) : null } : {}),
        ...(lastContactedAt !== undefined ? { lastContactedAt: lastContactedAt ? new Date(lastContactedAt) : null } : {}),
      },
    });

    return NextResponse.json({ data: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message ?? 'Failed to update contact' } },
      { status: err.status ?? 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { userEmail } = await getAuthContext();
    await resolveContact(id, userEmail);
    await prisma.contact.delete({ where: { id } });
    return NextResponse.json({ data: { deleted: true } });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message ?? 'Failed to delete contact' } },
      { status: err.status ?? 500 }
    );
  }
}
