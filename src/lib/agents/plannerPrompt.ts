/**
 * plannerPrompt
 *
 * A meta-agent that analyses a job's current state and decides which
 * action to take next.  Called by the planner API endpoint; result is
 * used to enqueue the recommended agent or surface a UI suggestion.
 */

import { callLLM } from '@/lib/llm/provider';
import { AgentType, VALID_AGENT_TYPES } from './prompts';
import { JobStage } from '@/types/job';
import { getAgentForStage } from './stageTriggerMap';

export interface PlannerInput {
  jobTitle: string;
  company: string;
  stage: JobStage;
  matchScore: number;
  hasResume: boolean;
  hasResearch: boolean;
  hasInterviewPrep: boolean;
  daysSinceLastActivity: number;
  upcomingInterviewDays: number | null;
}

export interface PlannerDecision {
  recommendedAgent: AgentType | null;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  rationale: string;
  suggestedAction: string;
}

export async function planNextAction(input: PlannerInput): Promise<PlannerDecision> {
  // Fast path: honour the deterministic stage trigger first
  const stageTrigger = getAgentForStage(input.stage);

  const result = await callLLM(
    [
      {
        role: 'user',
        content: `You are a career strategy AI deciding the next best action for a job application.

## Job Context
- Role: ${input.jobTitle} at ${input.company}
- Stage: ${input.stage.replace(/_/g, ' ')}
- Match Score: ${input.matchScore}%
- Has resume tailored: ${input.hasResume}
- Has company research: ${input.hasResearch}
- Has interview prep: ${input.hasInterviewPrep}
- Days since last activity: ${input.daysSinceLastActivity}
- Days until next interview: ${input.upcomingInterviewDays ?? 'none scheduled'}
- Stage-default agent: ${stageTrigger ?? 'none'}

## Available agents
- job-match: score alignment, identify gaps
- resume-tailor: tailor resume to job description
- research: company intel, culture, red flags
- interview-prep: generate STAR stories, technical prep, company talking points
- follow-up: draft personalised follow-up email
- networking: identify warm contacts at target company

Return ONLY valid JSON:
{
  "recommendedAgent": "resume-tailor",
  "priority": "high",
  "rationale": "One sentence explaining the recommendation",
  "suggestedAction": "Human-readable action description (shown in UI)"
}

priority: urgent (interview < 48h), high, medium, low.
recommendedAgent must be one of the available agents or null.`,
      },
    ],
    {
      systemPrompt:
        'You are a pragmatic career strategist. Recommend the single highest-value action. Return valid JSON only.',
      maxTokens: 300,
      temperature: 0.3,
    }
  );

  try {
    const jsonText = result.content
      .replace(/^```(?:json)?\n?/m, '')
      .replace(/\n?```$/m, '')
      .trim();

    const parsed = JSON.parse(jsonText);
    return {
      recommendedAgent: VALID_AGENT_TYPES.includes(parsed.recommendedAgent)
        ? parsed.recommendedAgent
        : stageTrigger,
      priority: ['urgent', 'high', 'medium', 'low'].includes(parsed.priority)
        ? parsed.priority
        : 'medium',
      rationale: parsed.rationale ?? '',
      suggestedAction: parsed.suggestedAction ?? '',
    };
  } catch {
    // Fall back to deterministic stage trigger on parse failure
    return {
      recommendedAgent: stageTrigger,
      priority: 'medium',
      rationale: 'Using default stage action',
      suggestedAction: stageTrigger ? `Run ${stageTrigger} agent` : 'No action needed',
    };
  }
}
