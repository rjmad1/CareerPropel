import { prisma } from '@/lib/db';
import { createLogger } from '@/lib/logging/logger';
import { MIN_WARM_PATH_CONFIDENCE } from '../constants';
import { relationshipRepository } from '../repositories/relationshipRepository';
import { WarmPath } from '../types';

const logger = createLogger({ component: 'warm-path' });

export class WarmPathService {
  /**
   * Detect warm paths between a candidate and a contact.
   * Only returns paths with confidence >= MIN_WARM_PATH_CONFIDENCE.
   * mutualConnections paths require verified=true; others are verified=false.
   */
  async detectWarmPaths(candidateId: string, contactId: string): Promise<WarmPath[]> {
    const [contact, candidate] = await Promise.all([
      prisma.contact.findUnique({
        where: { id: contactId },
        select: { company: true, discoveryMetadata: true, id: true },
      }),
      prisma.candidate.findUnique({
        where: { id: candidateId },
        select: {
          profileData: { select: { type: true, content: true } },
          skills: { select: { name: true } },
        },
      }),
    ]);

    if (!contact || !candidate) return [];

    const paths: WarmPath[] = [];

    // 1. Alumni overlap — check schools in candidate profile
    const alumniPath = await this.checkAlumniOverlap(candidate, contact);
    if (alumniPath) paths.push(alumniPath);

    // 2. Shared company — previous employers
    const sharedCompanyPath = await this.checkSharedCompany(candidate, contact);
    if (sharedCompanyPath) paths.push(sharedCompanyPath);

    // 3. Tech overlap — skills intersection
    const techPath = this.checkTechOverlap(candidate.skills.map((s) => s.name), contact);
    if (techPath) paths.push(techPath);

    // 4. Existing relationship graph edges (mutual connections)
    const existingEdges = await relationshipRepository.findWarmPaths(candidateId, contactId);
    for (const edge of existingEdges) {
      if (edge.confidence >= MIN_WARM_PATH_CONFIDENCE) {
        paths.push({
          type: edge.relationshipType as WarmPath['type'],
          description: (edge.metadata as Record<string, string>)?.description ?? edge.relationshipType,
          confidence: edge.confidence,
          verified: (edge.metadata as Record<string, boolean>)?.verified ?? false,
        });
      }
    }

    // Persist newly detected paths
    for (const path of paths) {
      if (path.confidence >= MIN_WARM_PATH_CONFIDENCE) {
        await relationshipRepository.upsertWarmPath({
          candidateId,
          sourceContactId: contactId,
          targetContactId: contactId,
          warmPath: path,
        });
      }
    }

    logger.info({ contactId, candidateId, count: paths.length }, 'Warm paths detected');
    return paths.filter((p) => p.confidence >= MIN_WARM_PATH_CONFIDENCE);
  }

  private async checkAlumniOverlap(
    candidate: { profileData: Array<{ type: string; content: unknown }> },
    contact: { discoveryMetadata: unknown },
  ): Promise<WarmPath | null> {
    const resumeData = candidate.profileData.find((p) => p.type === 'resume');
    if (!resumeData) return null;

    const content = resumeData.content as Record<string, unknown>;
    const education = content?.education as Array<Record<string, string>> | undefined;
    if (!education?.length) return null;

    const meta = contact.discoveryMetadata as Record<string, unknown> | null;
    const contactSchools = (meta?.education as string[]) ?? [];
    const candidateSchools = education.map((e) => e.school ?? e.institution ?? '').filter(Boolean);

    const overlap = candidateSchools.find((s) =>
      contactSchools.some((cs) => cs.toLowerCase().includes(s.toLowerCase())),
    );

    if (overlap) {
      return {
        type: 'ALUMNI',
        description: `Both attended ${overlap}`,
        confidence: 0.75,
        verified: false,
      };
    }
    return null;
  }

  private async checkSharedCompany(
    candidate: { profileData: Array<{ type: string; content: unknown }> },
    contact: { company: string | null },
  ): Promise<WarmPath | null> {
    if (!contact.company) return null;

    const resumeData = candidate.profileData.find((p) => p.type === 'resume');
    if (!resumeData) return null;

    const content = resumeData.content as Record<string, unknown>;
    const experience = content?.experience as Array<Record<string, string>> | undefined;
    if (!experience?.length) return null;

    const match = experience.find((e) =>
      (e.company ?? '').toLowerCase().includes(contact.company!.toLowerCase()),
    );

    if (match) {
      return {
        type: 'SHARED_COMPANY',
        description: `Previously worked at ${contact.company}`,
        confidence: 0.8,
        verified: false,
      };
    }
    return null;
  }

  private checkTechOverlap(
    candidateSkills: string[],
    contact: { discoveryMetadata: unknown },
  ): WarmPath | null {
    const meta = contact.discoveryMetadata as Record<string, unknown> | null;
    const contactSkills = (meta?.skills as string[]) ?? [];
    if (!contactSkills.length) return null;

    const overlap = candidateSkills.filter((s) =>
      contactSkills.some((cs) => cs.toLowerCase() === s.toLowerCase()),
    );

    if (overlap.length >= 3) {
      return {
        type: 'TECH_OVERLAP',
        description: `Shared skills: ${overlap.slice(0, 3).join(', ')}`,
        confidence: Math.min(0.5 + overlap.length * 0.05, 0.85),
        verified: false,
      };
    }
    return null;
  }
}

export const warmPathService = new WarmPathService();
