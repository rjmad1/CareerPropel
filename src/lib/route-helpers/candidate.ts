import { prisma } from '@/lib/db';
import { NotFoundError } from '@/lib/errors';

/**
 * Shared helper: look up the Candidate row for an authenticated user email.
 * Throws a NotFoundError (status 404) when the profile does not exist.
 */
export async function getCandidate(email: string): Promise<{ id: string }> {
  const candidate = await prisma.candidate.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!candidate) throw new NotFoundError('Profile not found');
  return candidate;
}
