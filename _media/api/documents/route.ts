import { NextRequest, NextResponse } from 'next/server';
import { ValidationError } from '@/app/api/middleware/auth';
import { validateRequest, successResponse, validationErrorResponse, errorResponse } from '@/app/api/middleware/validation';
import { uploadDocumentSchema, listDocumentsQuerySchema } from '@/lib/validation/schemas';
import { getDocuments, uploadDocument } from '@/lib/db/documents';
import { getAuthContext } from '@/lib/middleware/auth';
import { prisma } from '@/lib/db';

// Mark as dynamic to prevent build-time static generation
export const dynamic = 'force-dynamic'

/**
 * GET /api/documents
 * List documents for authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();
    const candidate = await prisma.candidate.findUnique({ where: { email: userEmail } });
    if (!candidate) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Profile not found' } }, { status: 404 });
    }

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const queryData = {
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
      type: searchParams.get('type') || undefined,
      jobId: searchParams.get('jobId') || undefined,
      sortBy: (searchParams.get('sortBy') || 'updatedAt') as any,
      sortOrder: (searchParams.get('sortOrder') || 'desc') as any,
    };

    // Validate query
    const validation = listDocumentsQuerySchema.safeParse(queryData);
    if (!validation.success) {
      const details: Record<string, string[]> = {};
      validation.error.errors.forEach((error) => {
        const path = error.path.join('.');
        if (!details[path]) {
          details[path] = [];
        }
        details[path].push(error.message);
      });
      return validationErrorResponse(new ValidationError('Invalid query parameters', details));
    }

    const result = await getDocuments(candidate.id, validation.data);
    return successResponse(result);
  } catch (error) {
    console.error('GET /api/documents error:', error);
    return errorResponse(error);
  }
}

/**
 * POST /api/documents
 * Upload a new document
 */
export async function POST(req: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();
    const candidate = await prisma.candidate.findUnique({ where: { email: userEmail } });
    if (!candidate) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Profile not found' } }, { status: 404 });
    }

    // Validate request body
    const validation = await validateRequest(req, uploadDocumentSchema);
    if (!validation.valid) {
      return validationErrorResponse(validation.error);
    }

    const document = await uploadDocument(candidate.id, validation.data);
    return successResponse(document, 201);
  } catch (error) {
    console.error('POST /api/documents error:', error);
    return errorResponse(error);
  }
}
