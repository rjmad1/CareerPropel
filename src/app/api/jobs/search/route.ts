import { NextRequest } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { searchGreenhouse, normalizeGreenhouse } from '@/lib/scraping/greenhouse';
import { searchIndeed, normalizeIndeed } from '@/lib/scraping/indeed';
import { searchLinkedInJobs, normalizeLinkedIn } from '@/lib/scraping/linkedin';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const SearchSchema = z.object({
  source: z.enum(['greenhouse', 'indeed', 'linkedin']),
  query: z.string().min(1),
  location: z.string().optional(),
  // Greenhouse-specific: board token (e.g. "stripe")
  boardToken: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

/**
 * POST /api/jobs/search
 * Search a job board and return normalized results.
 * Results are NOT persisted — the client calls /api/jobs/import to save selected ones.
 */
export async function POST(request: NextRequest) {
  try {
    await getAuthContext();

    const body = await request.json();
    const parsed = SearchSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(new Error('Invalid request: ' + parsed.error.issues[0]?.message));
    }

    const { source, query, location, boardToken, limit } = parsed.data;

    let results: ReturnType<typeof normalizeGreenhouse | typeof normalizeIndeed | typeof normalizeLinkedIn>[] = [];

    if (source === 'greenhouse') {
      if (!boardToken) return errorResponse(new Error('boardToken is required for Greenhouse'));
      const jobs = await searchGreenhouse(boardToken, query, limit);
      results = jobs.map((j) => normalizeGreenhouse(j, boardToken));
    } else if (source === 'indeed') {
      const jobs = await searchIndeed(query, location ?? 'Remote', limit);
      results = jobs.map(normalizeIndeed);
    } else if (source === 'linkedin') {
      const jobs = await searchLinkedInJobs(query, location ?? 'United States', limit);
      results = jobs.map(normalizeLinkedIn);
    }

    return successResponse({ jobs: results, count: results.length });
  } catch (error) {
    return errorResponse(error);
  }
}
