import { prisma } from '@/lib/db';
import { RelationshipStrength } from '@prisma/client';
import { WarmPath } from '../types';

export class RelationshipRepository {
  async upsertWarmPath(params: {
    candidateId: string;
    sourceContactId: string;
    targetContactId: string;
    warmPath: WarmPath;
  }) {
    return prisma.relationshipGraph.upsert({
      where: {
        id: `${params.sourceContactId}_${params.targetContactId}_${params.warmPath.type}`,
      },
      create: {
        id: `${params.sourceContactId}_${params.targetContactId}_${params.warmPath.type}`,
        candidateId: params.candidateId,
        sourceContactId: params.sourceContactId,
        targetContactId: params.targetContactId,
        relationshipType: params.warmPath.type,
        strength: warmPathToStrength(params.warmPath.confidence),
        confidence: params.warmPath.confidence,
        metadata: { description: params.warmPath.description, verified: params.warmPath.verified },
      },
      update: {
        confidence: params.warmPath.confidence,
        strength: warmPathToStrength(params.warmPath.confidence),
        metadata: { description: params.warmPath.description, verified: params.warmPath.verified },
      },
    });
  }

  async findWarmPaths(candidateId: string, contactId: string) {
    return prisma.relationshipGraph.findMany({
      where: {
        candidateId,
        OR: [{ sourceContactId: contactId }, { targetContactId: contactId }],
        confidence: { gte: 0.5 },
      },
      orderBy: { confidence: 'desc' },
    });
  }

  async countWarmPaths(candidateId: string): Promise<number> {
    return prisma.relationshipGraph.count({
      where: { candidateId, confidence: { gte: 0.6 } },
    });
  }
}

function warmPathToStrength(confidence: number): RelationshipStrength {
  if (confidence >= 0.85) return 'STRONG';
  if (confidence >= 0.7) return 'HOT';
  if (confidence >= 0.5) return 'WARM';
  return 'COLD';
}

export const relationshipRepository = new RelationshipRepository();
