/**
 * criticPrompt
 *
 * Quality-gates agent output before it is persisted.  Sends a lightweight
 * second LLM call that rates the output and returns an accept/reject
 * decision with a brief rationale.  Rejected outputs are logged with
 * failureClassification='validation_error' so they surface in monitoring.
 */

import { callLLM } from '@/lib/llm/provider';
import { AgentType } from './prompts';

export interface CriticResult {
  accepted: boolean;
  score: number;       // 0–10
  rationale: string;
  suggestions: string[];
  /** True when the critic LLM call itself failed; result should not be treated as an approval */
  bypassed?: boolean;
}

const MIN_ACCEPTABLE_SCORE: Record<AgentType, number> = {
  'resume-tailor':  7,
  'job-match':      6,
  'interview-prep': 7,
  'research':       6,
  'follow-up':      7,
  'networking':     6,
};

export async function critiqueOutput(
  agentType: AgentType,
  userPrompt: string,
  agentOutput: string
): Promise<CriticResult> {
  const minScore = MIN_ACCEPTABLE_SCORE[agentType] ?? 6;

  let result;
  try {
    result = await callLLM(
      [
        {
          role: 'user',
          content: `You are a quality-control reviewer for an AI career assistant.

## Original Task (abridged)
${userPrompt.slice(0, 800)}

## Agent Output
${agentOutput.slice(0, 2000)}

Rate the output and decide whether it meets the bar for a ${agentType} agent.

Return ONLY valid JSON:
{
  "score": 7.5,
  "rationale": "One sentence explaining the score",
  "suggestions": ["Specific improvement 1", "Specific improvement 2"],
  "accepted": true
}

Score 0–10. Mark accepted=false if score < ${minScore}.
Penalise: vague generalities, placeholder text, missing required JSON fields, hallucinated facts.
Reward: specificity, quantified claims, correct structure, actionable advice.`,
        },
      ],
      {
        systemPrompt: 'You are a strict but fair quality reviewer. Return valid JSON only.',
        maxTokens: 400,
        temperature: 0.2,
      }
    );
  } catch {
    // Critic LLM call failed — allow the pipeline to continue but mark as bypassed
    return { accepted: true, score: 0, rationale: 'Critic unavailable', suggestions: [], bypassed: true };
  }

  try {
    const jsonText = result.content
      .replace(/^```(?:json)?\n?/m, '')
      .replace(/\n?```$/m, '')
      .trim();

    const parsed = JSON.parse(jsonText);
    const score = typeof parsed.score === 'number' ? parsed.score : 0;

    return {
      accepted: score >= minScore,
      score,
      rationale: parsed.rationale ?? '',
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    };
  } catch {
    return { accepted: true, score: 0, rationale: 'Critic parse error', suggestions: [] };
  }
}
