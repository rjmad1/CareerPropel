/**
 * Ownership evaluator — determines if an actor owns the resource being accessed.
 * Used in the policy engine for self-scoped resources (JOB_SEEKER pattern).
 */

import { prisma } from '@/lib/db'

export interface OwnershipContext {
  actorId: string
  resource: string
  resourceId: string
}

/** Returns true if the actor is the owner of the given resource. */
export async function isResourceOwner({ actorId, resource, resourceId }: OwnershipContext): Promise<boolean> {
  try {
    switch (resource) {
      case 'jobs': {
        const job = await prisma.job.findFirst({ where: { id: resourceId, candidateId: actorId } })
        return !!job
      }
      case 'documents': {
        const doc = await prisma.document.findFirst({ where: { id: resourceId, candidateId: actorId } })
        return !!doc
      }
      case 'interviews': {
        const iv = await prisma.interview.findFirst({ where: { id: resourceId, candidateId: actorId } })
        return !!iv
      }
      case 'offers': {
        const offer = await prisma.offer.findFirst({ where: { id: resourceId, candidateId: actorId } })
        return !!offer
      }
      case 'agents': {
        const exec = await prisma.agentExecution.findFirst({ where: { id: resourceId, userId: actorId } })
        return !!exec
      }
      case 'profile': {
        // Profile is always self-owned
        const profile = await prisma.candidate.findFirst({ where: { id: actorId } })
        return !!profile
      }
      default:
        return false
    }
  } catch {
    return false
  }
}
