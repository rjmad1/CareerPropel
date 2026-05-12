import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/api/middleware/auth';
import { successResponse, errorResponse } from '@/app/api/middleware/validation';
import { getDocumentById, deleteDocument } from '@/lib/db/documents';

/**
 * GET /api/documents/[id]
 * Get a single document
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const document = await getDocumentById(user.id, params.id);
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
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const document = await deleteDocument(user.id, params.id);
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
