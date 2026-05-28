import { prisma } from '@/lib/db';
import { createLogger } from '@/lib/logging/logger';
import { HIRING_SIGNAL_KEYWORDS } from '../constants';
import { contactRepository } from '../repositories/contactRepository';
import { scoreRelationship, seniorityFromTitle } from '../scoring/relationshipScorer';
import { ContactIntelligence, LinkedInSignals, SeniorityLevel } from '../types';

const logger = createLogger({ component: 'contact-intelligence' });

export class ContactIntelligenceService {
  async enrichContact(contactId: string): Promise<ContactIntelligence> {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: { sourceRelationships: true },
    });
    if (!contact) throw new Error(`Contact ${contactId} not found`);

    const title = contact.role ?? '';
    const seniority = inferSeniority(title);
    const hiringSignals = detectHiringSignals(title);
    const isSpecialized = isSpecializedRecruiter(title);

    const linkedinSignals: LinkedInSignals = {
      jobTitle: title,
      seniority,
      hiringSignals,
      sharedBackground: [],
      skillOverlap: [],
      connectionDegree: contact.linkedinConnectionDegree as 1 | 2 | 3 | undefined,
    };

    const relationshipScore = scoreRelationship({
      hiringAuthorityLevel: seniority,
      roleAlignmentPercent: 60, // baseline — will improve with real profile comparison
      mutualConnectionCount: contact.mutualConnections,
      isSpecializedRecruiter: isSpecialized,
      historicalResponseRate: 0.25,
      companySize: 'MID',
      lastActivityDaysAgo: contact.lastInteractionAt
        ? Math.floor((Date.now() - contact.lastInteractionAt.getTime()) / 86_400_000)
        : 30,
    });

    const intelligence: ContactIntelligence = {
      influenceScore: relationshipScore.companyInfluence,
      hiringAuthorityScore: relationshipScore.hiringAuthority,
      responseProbability: relationshipScore.responseProbability,
      outreachPriority: Math.round(relationshipScore.total * 100),
      recruiterType: isSpecialized ? 'INTERNAL_RECRUITER' : undefined,
      warmPaths: [],
      linkedinSignals,
    };

    // Persist scores
    await contactRepository.updateIntelligenceScores(contactId, {
      influenceScore: intelligence.influenceScore,
      hiringAuthorityScore: intelligence.hiringAuthorityScore,
      responseProbability: intelligence.responseProbability,
      outreachPriority: intelligence.outreachPriority,
      contactType: 'RECRUITER',
      recruiterType: intelligence.recruiterType as never,
    });

    logger.info({ contactId, score: relationshipScore.total }, 'Contact enriched');
    return intelligence;
  }
}

function inferSeniority(title: string): SeniorityLevel {
  const seniority = seniorityFromTitle(title);
  return seniority as SeniorityLevel;
}

function detectHiringSignals(title: string): string[] {
  const lower = title.toLowerCase();
  return HIRING_SIGNAL_KEYWORDS.filter((kw) => lower.includes(kw));
}

function isSpecializedRecruiter(title: string): boolean {
  const lower = title.toLowerCase();
  return HIRING_SIGNAL_KEYWORDS.some((kw) => lower.includes(kw));
}

export const contactIntelligenceService = new ContactIntelligenceService();
