import { AgentType } from '../prompts/prompts';
import { executeAgent } from '../execution/executor';
import { getCostCeiling } from '../policies/cost-config';
import { prisma } from '@/lib/db';
import { createLogger } from '@/lib/logging/logger';
import { z } from 'zod';

const log = createLogger({ component: 'agent-orchestration' });

// Explicit pipeline registry to prevent hidden flows
export const ORCHESTRATION_PIPELINES = {
  RESEARCH_TO_RESUME: {
    from: 'research' as AgentType,
    to: 'resume-tailor' as AgentType,
    contract: z.object({
      companyName: z.string(),
      companyInfo: z.string(),
      resume: z.string(),
      jobDescription: z.string(),
    }),
  },
  RESUME_TO_ATS: {
    from: 'resume-tailor' as AgentType,
    to: 'job-match' as AgentType,
    contract: z.object({
      resume: z.string(),
      jobDescription: z.string(),
    }),
  },
  ATS_TO_INTERVIEW: {
    from: 'job-match' as AgentType,
    to: 'interview-prep' as AgentType,
    contract: z.object({
      userProfile: z.string(),
      jobDescription: z.string(),
      companyName: z.string(),
    }),
  },
  INTERVIEW_TO_FOLLOWUP: {
    from: 'interview-prep' as AgentType,
    to: 'follow-up' as AgentType,
    contract: z.object({
      userProfile: z.string(),
      jobDescription: z.string(),
      companyName: z.string(),
    }),
  },
  JOB_INGESTION_TO_MATCH: {
    from: 'role-intelligence' as AgentType,
    to: 'job-match' as AgentType,
    contract: z.object({
      userProfile: z.string(),
      jobDescription: z.string(),
    }),
  },
  ACCOMPLISHMENTS_TO_APPRAISAL: {
    from: 'strength-mapper' as AgentType,
    to: 'pattern-miner' as AgentType,
    contract: z.object({
      userProfile: z.string(),
    }),
  },
};

export interface OrchestrationResult {
  pipeline: keyof typeof ORCHESTRATION_PIPELINES;
  success: boolean;
  executionIds: string[];
  error?: string;
}

export class AgentOrchestrator {
  /**
   * Chains two agents sequentially, validating inputs and enforcing policies.
   */
  public static async executePipeline(
    pipelineKey: keyof typeof ORCHESTRATION_PIPELINES,
    userId: string,
    initialPayload: Record<string, string>,
    jobId?: string
  ): Promise<OrchestrationResult> {
    const pipeline = ORCHESTRATION_PIPELINES[pipelineKey];
    if (!pipeline) {
      throw new Error(`Pipeline ${pipelineKey} is not registered.`);
    }

    log.info({ pipelineKey, userId }, 'AgentOrchestrator: Initializing pipeline execution');

    // 1. Contract validation
    const validation = pipeline.contract.safeParse(initialPayload);
    if (!validation.success) {
      return {
        pipeline: pipelineKey,
        success: false,
        executionIds: [],
        error: `Payload failed pipeline contract validation: ${validation.error.message}`,
      };
    }

    const executionIds: string[] = [];

    try {
      // 2. Policy pre-flight check: cost ceilings
      const sourceCeiling = getCostCeiling(pipeline.from);
      const targetCeiling = getCostCeiling(pipeline.to);
      log.info({ pipelineKey, sourceCeiling, targetCeiling }, 'Orchestration Policy pre-flight passed');

      // 3. Create execution record for First Agent
      const firstExecution = await prisma.agentExecution.create({
        data: {
          candidateId: userId,
          jobId: jobId ?? null,
          agentType: pipeline.from,
          status: 'queued',
          input: JSON.stringify(initialPayload),
          userId,
        },
      });
      executionIds.push(firstExecution.id);

      // Execute First Agent
      await executeAgent({
        executionId: firstExecution.id,
        agentType: pipeline.from,
        promptContext: initialPayload,
        userId,
      });

      // Fetch output from First Agent
      const firstResult = await prisma.agentExecution.findUnique({
        where: { id: firstExecution.id },
      });

      if (firstResult?.status !== 'completed' || !firstResult.output) {
        throw new Error(`First step '${pipeline.from}' in pipeline failed or produced no output.`);
      }

      const firstOutput = JSON.parse(firstResult.output) as Record<string, unknown>;

      // 4. Construct payload for Second Agent using outputs from First Agent combined with initial inputs
      const secondPayload: Record<string, string> = {
        ...initialPayload,
      };

      if (pipelineKey === 'RESEARCH_TO_RESUME') {
        // Feed company news / summary as company info to tailer
        secondPayload.companyInfo = JSON.stringify(firstOutput.companySnapshot || firstOutput);
      } else if (pipelineKey === 'RESUME_TO_ATS') {
        // Feed tailored resume output
        secondPayload.resume = JSON.stringify(firstOutput.tailoredBullets || firstOutput);
      } else if (pipelineKey === 'ATS_TO_INTERVIEW') {
        // Feed match analysis results
        secondPayload.userProfile = JSON.stringify(firstOutput.strengths || firstOutput);
      } else if (pipelineKey === 'INTERVIEW_TO_FOLLOWUP') {
        // Feed interview preparation points
        secondPayload.jobDescription = JSON.stringify(firstOutput.likelyQuestions || firstOutput);
      } else if (pipelineKey === 'JOB_INGESTION_TO_MATCH') {
        // Feed deconstructed role archetypes
        secondPayload.jobDescription = JSON.stringify(firstOutput.requirements || firstOutput);
      } else if (pipelineKey === 'ACCOMPLISHMENTS_TO_APPRAISAL') {
        // Feed mapped strengths
        secondPayload.userProfile = JSON.stringify(firstOutput.strengths || firstOutput);
      }

      // 5. Create execution record for Second Agent
      const secondExecution = await prisma.agentExecution.create({
        data: {
          candidateId: userId,
          jobId: jobId ?? null,
          agentType: pipeline.to,
          status: 'queued',
          input: JSON.stringify(secondPayload),
          userId,
        },
      });
      executionIds.push(secondExecution.id);

      // Execute Second Agent
      await executeAgent({
        executionId: secondExecution.id,
        agentType: pipeline.to,
        promptContext: secondPayload,
        userId,
      });

      const secondResult = await prisma.agentExecution.findUnique({
        where: { id: secondExecution.id },
      });

      if (secondResult?.status !== 'completed') {
        throw new Error(`Second step '${pipeline.to}' in pipeline failed.`);
      }

      log.info({ pipelineKey }, 'AgentOrchestrator: Pipeline execution completed successfully');
      return {
        pipeline: pipelineKey,
        success: true,
        executionIds,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      log.error({ pipelineKey, error: errorMsg }, 'AgentOrchestrator: Pipeline execution failed');
      return {
        pipeline: pipelineKey,
        success: false,
        executionIds,
        error: errorMsg,
      };
    }
  }
}
