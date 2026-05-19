import { NextRequest } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const ImportSchema = z.object({
  jobs: z.array(z.object({
    source: z.enum(['greenhouse', 'indeed', 'linkedin', 'manual']),
    externalId: z.string().nullable().optional(),
    title: z.string(),
    company: z.string(),
    location: z.string().optional(),
    description: z.string().optional(),
    url: z.string().optional(),
    salary: z.string().nullable().optional(),
    department: z.string().nullable().optional(),
    postedAt: z.string().optional(),
  })),
});

/**
 * POST /api/jobs/import
 * Save scraped jobs as JobImport staging records and immediately
 * create Job pipeline entries for each.
 */
export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();

    const candidate = await prisma.candidate.findUniqueOrThrow({
      where: { email: userEmail },
      select: { id: true },
    });

    const body = await request.json();
    const parsed = ImportSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(new Error('Invalid payload: ' + parsed.error.issues[0]?.message));
    }

    const created: string[] = [];

    for (const raw of parsed.data.jobs) {
      // Create Job record in the pipeline
      const job = await prisma.job.create({
        data: {
          candidateId: candidate.id,
          title: raw.title,
          company: raw.company,
          location: raw.location ?? '',
          description: raw.description ?? '',
          url: raw.url ?? '',
          stage: 'sourced',
          tags: [raw.source],
        },
      });

      // Store the staging record with full raw payload
      await prisma.jobImport.create({
        data: {
          candidateId: candidate.id,
          source: raw.source,
          externalId: raw.externalId ?? null,
          rawData: raw as object,
          imported: true,
          jobId: job.id,
        },
      });

      created.push(job.id);
    }

    return successResponse({ imported: created.length, jobIds: created });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * GET /api/jobs/import
 * List recent import history for the authenticated user.
 */
export async function GET() {
  try {
    const { userEmail } = await getAuthContext();
    const candidate = await prisma.candidate.findUniqueOrThrow({ where: { email: userEmail }, select: { id: true } });

    const imports = await prisma.jobImport.findMany({
      where: { candidateId: candidate.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return successResponse({ imports });
  } catch (error) {
    return errorResponse(error);
  }
}
