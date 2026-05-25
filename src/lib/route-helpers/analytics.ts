import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { prisma } from '@/lib/db';

/**
 * Shared helper for simple analytics GET routes.
 * Handles authenticate → find candidate → compute → respond,
 * preserving the same 404 / 500 error format used across all analytics routes.
 *
 * Usage:
 *   export async function GET(_req: NextRequest) {
 *     return withCandidateAnalytics(computeXxx, 'analytics/xxx');
 *   }
 *
 * For routes that need request params, pass a closure:
 *   return withCandidateAnalytics(
 *     (id) => computeXxx(id, { skipLLM }),
 *     'analytics/xxx',
 *   );
 */
export async function withCandidateAnalytics<T>(
  computeFn: (candidateId: string) => Promise<T>,
  routeName: string,
): Promise<NextResponse> {
  try {
    const { userEmail } = await getAuthContext();

    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const result = await computeFn(candidate.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error(`[${routeName}]`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 },
    );
  }
}
