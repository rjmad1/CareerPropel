import { useQuery } from '@tanstack/react-query';
import { getAgentClient } from '@/lib/api/agent-client';
import { Job } from '@/types/job';

export interface PrepData {
  starStories: Array<{
    title: string;
    situation: string;
    task: string;
    action: string;
    result: string;
  }>;
  technicalConcepts: Array<{
    topic: string;
    keyPoints: string[];
  }>;
  companyIntelligence: {
    mission: string;
    recentNews: string[];
    culture: string;
  };
  likelyQuestions: string[];
  confidence?: number;
  reasoning?: string;
}

/**
 * Fetch interview preparation data by triggering the interview-prep agent
 * Requires the job object with role and company information
 */
export function useInterviewPrep(jobId: string, job?: Job) {
  return useQuery<PrepData, Error>({
    queryKey: ['interview-prep', jobId],
    queryFn: async () => {
      if (!job) {
        throw new Error('Job data is required for interview prep');
      }

      const client = getAgentClient();

      // Trigger the interview-prep agent with available job context
      const execution = await client.executeAgent({
        agentType: 'interview-prep',
        context: {
          role: job.role,
          company: job.company,
          jobId,
          stage: job.stage,
          matchScore: job.matchScore?.toString(),
          jobUrl: job.jobUrl || '',
          // Include other relevant context
          interviewStatus: job.interviewStatus,
          hiringManager: job.hiringManagerName || '',
          recruiter: job.recruiterName || '',
          notes: job.notes || '',
        },
      });

      // Wait for completion with polling
      const result = await client.waitForCompletion(execution.executionId, 120000);

      if (result.status === 'failed') {
        throw new Error(result.errorMessage || 'Interview prep generation failed');
      }

      // Parse the output
      const output = result.output || {};
      return {
        starStories: output.starStories || [],
        technicalConcepts: output.technicalConcepts || [],
        companyIntelligence: output.companyIntelligence || {
          mission: '',
          recentNews: [],
          culture: '',
        },
        likelyQuestions: output.likelyQuestions || [],
        confidence: output.confidence,
        reasoning: output.reasoning,
      } as PrepData;
    },
    enabled: !!jobId && !!job,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });
}
