import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/app/api/middleware/validation';
import { getDocumentById, deleteDocument } from '@/lib/db/documents';
import { getAuthContext } from '@/lib/middleware/auth';
import { prisma } from '@/lib/db';

// Mark as dynamic to prevent build-time static generation
export const dynamic = 'force-dynamic'

/**
 * GET /api/documents/[id]
 * Get a single document
 */
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { userEmail } = await getAuthContext();
    const candidate = await prisma.candidate.findUnique({ where: { email: userEmail } });
    if (!candidate) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Profile not found' } }, { status: 404 });
    }

    const document = await getDocumentById(candidate.id, id);
    if (!document) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Document not found' } },
        { status: 404 }
      );
    }

    return successResponse(document);
  } catch (error) {
    console.error('GET /api/documents/[id] error:', error);
    return errorResponse(error);
  }
}

/**
 * DELETE /api/documents/[id]
 * Delete a document
 */
export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { userEmail } = await getAuthContext();
    const candidate = await prisma.candidate.findUnique({ where: { email: userEmail } });
    if (!candidate) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Profile not found' } }, { status: 404 });
    }

    const document = await deleteDocument(candidate.id, id);
    if (!document) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Document not found' } },
        { status: 404 }
      );
    }

    return successResponse({ success: true, document });
  } catch (error) {
    console.error('DELETE /api/documents/[id] error:', error);
    return errorResponse(error);
  }
}
