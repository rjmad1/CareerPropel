import { createLogger } from '@/lib/logging/logger';
import { contactRepository } from '../repositories/contactRepository';
import { campaignRepository } from '../repositories/campaignRepository';
import { outreachRepository } from '../repositories/outreachRepository';
import { recruiterDiscoveryService } from '../services/recruiterDiscoveryService';
import { contactIntelligenceService } from '../services/contactIntelligenceService';
import { warmPathService } from '../services/warmPathService';
import { outreachGenerationService } from '../services/outreachGenerationService';
import { engagementTrackingService } from '../services/engagementTrackingService';
import { RecruiterDiscoveryRequest } from '../types';

const logger = createLogger({ component: 'networking-agent' });

export interface NetworkOrchestrationInput {
  candidateId: string;
  jobId?: string;
  company: string;
  jobTitle: string;
  location?: string;
  description?: string;
  maxOutreachDrafts?: number;
}

export interface NetworkOrchestrationResult {
  discovered: number;
  enriched: number;
  warmPathsFound: number;
  outreachDraftsCreated: number;
  campaignId: string;
  topContacts: Array<{ id: string; name: string; company: string; score: number }>;
  nextSteps: string[];
  stats: Record<string, number>;
}

/**
 * NETWORK_ORCHESTRATION agent: end-to-end networking workflow for a job opportunity.
 * 1. Discover recruiters for the job
 * 2. Enrich & score top contacts
 * 3. Detect warm paths
 * 4. Generate outreach drafts for top 3 contacts (always requires human approval)
 * 5. Return ranked contacts + next-step recommendations
 */
export class NetworkingAgent {
  async orchestrate(input: NetworkOrchestrationInput): Promise<NetworkOrchestrationResult> {
    logger.info({ company: input.company, jobTitle: input.jobTitle }, 'Network orchestration started');

    const maxDrafts = input.maxOutreachDrafts ?? 3;

    // Step 1: Create campaign
    const campaign = await campaignRepository.create({
      candidateId: input.candidateId,
      jobId: input.jobId,
      company: input.company,
      objective: `Outreach for ${input.jobTitle} at ${input.company}`,
    });

    await campaignRepository.updateStatus(campaign.id, 'ACTIVE');

    // Step 2: Discover recruiters
    const discoveryReq: RecruiterDiscoveryRequest = {
      jobId: input.jobId ?? '',
      company: input.company,
      jobTitle: input.jobTitle,
      location: input.location,
      description: input.description,
    };
    const discovered = await recruiterDiscoveryService.discoverRecruiters(discoveryReq);

    // Upsert discovered contacts
    const contactIds: string[] = [];
    for (const recruiter of discovered) {
      try {
        const contact = await contactRepository.upsertDiscovered(input.candidateId, recruiter);
        contactIds.push(contact.id);
      } catch (err) {
        logger.warn({ err, name: recruiter.name }, 'Failed to upsert contact');
      }
    }

    // Step 3: Enrich & detect warm paths
    let enriched = 0;
    let warmPathsFound = 0;

    for (const contactId of contactIds) {
      try {
        await contactIntelligenceService.enrichContact(contactId);
        const paths = await warmPathService.detectWarmPaths(input.candidateId, contactId);
        warmPathsFound += paths.length;
        enriched++;
      } catch (err) {
        logger.warn({ err, contactId }, 'Enrichment failed for contact');
      }
    }

    // Step 4: Get top contacts by score
    const topContacts = await contactRepository.findTopByScore(input.candidateId, maxDrafts);

    // Step 5: Generate outreach drafts for top contacts (safety-gated, requires approval)
    let outreachDraftsCreated = 0;
    for (const contact of topContacts.slice(0, maxDrafts)) {
      try {
        const warmPaths = await warmPathService.detectWarmPaths(input.candidateId, contact.id);
        const primaryWarmPath = warmPaths[0];

        const generated = await outreachGenerationService.generateOutreach({
          contactId: contact.id,
          campaignId: campaign.id,
          channel: 'LINKEDIN',
          sequenceStep: 0,
          context: {
            jobTitle: input.jobTitle,
            company: input.company,
            contactName: contact.name,
            contactRole: contact.role ?? undefined,
            warmPath: primaryWarmPath,
          },
        });

        // Only create draft if hard safety checks pass
        const hardFailures = generated.safetyChecks.filter(
          (c) => !c.passed && c.rule !== 'REQUIRE_HUMAN_APPROVAL',
        );

        if (hardFailures.length === 0) {
          await outreachRepository.create({
            campaignId: campaign.id,
            contactId: contact.id,
            channel: 'LINKEDIN',
            message: generated.message,
            personalizedMessage: generated.personalizedMessage,
            sequenceStep: 0,
          });
          outreachDraftsCreated++;
        }
      } catch (err) {
        logger.warn({ err, contactId: contact.id }, 'Outreach generation failed');
      }
    }

    const stats = await engagementTrackingService.getDashboardStats(input.candidateId);

    const nextSteps = buildNextSteps(topContacts.length, outreachDraftsCreated, warmPathsFound);

    logger.info(
      { campaignId: campaign.id, discovered: discovered.length, outreachDraftsCreated },
      'Network orchestration complete',
    );

    return {
      discovered: discovered.length,
      enriched,
      warmPathsFound,
      outreachDraftsCreated,
      campaignId: campaign.id,
      topContacts: topContacts.map((c) => ({
        id: c.id,
        name: c.name,
        company: c.company ?? input.company,
        score: c.influenceScore,
      })),
      nextSteps,
      stats: {
        totalContacts: stats.totalContacts,
        activeOutreaches: stats.activeOutreaches,
        warmPaths: stats.warmPaths,
      },
    };
  }
}

function buildNextSteps(
  contactsFound: number,
  draftsCreated: number,
  warmPaths: number,
): string[] {
  const steps: string[] = [];

  if (draftsCreated > 0) {
    steps.push(`Review and approve ${draftsCreated} outreach draft${draftsCreated > 1 ? 's' : ''} before sending`);
  }
  if (warmPaths > 0) {
    steps.push(`Leverage ${warmPaths} warm path${warmPaths > 1 ? 's' : ''} for higher response rates`);
  }
  if (contactsFound === 0) {
    steps.push('Manually add contacts from LinkedIn for this company');
  } else {
    steps.push(`Monitor replies from ${contactsFound} discovered contacts`);
  }
  steps.push('Set follow-up reminders: Day 3, Day 7, Day 14 after initial outreach');

  return steps;
}

export const networkingAgent = new NetworkingAgent();
