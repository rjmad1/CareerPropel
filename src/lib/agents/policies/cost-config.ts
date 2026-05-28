// Per-agent cost ceilings (USD) and projection helpers.
// Ceilings are fail-fast: jobs that exceed them are rejected before any LLM call.

export const AGENT_COST_CEILINGS: Readonly<Record<string, number>> = {
  'resume-tailor':  0.5,
  'job-match':      0.3,
  'follow-up':      0.4,
  'interview-prep': 2,
  'research':       1.5,
  'networking':     1,
  'role-intelligence': 1,
  'fit-analysis':   1.5,
  'strength-mapper': 1.5,
  'gap-analyzer':   1,
  'conversion-scorer': 1,
  'pattern-miner':   1,
};

// Retries typically use cached/shorter prompts — apply a discount.
const RETRY_COST_MULTIPLIER = 0.5;

// Rough blended rate: ~$0.003 / 1K tokens across Anthropic/OpenAI mid-tier models.
const COST_PER_1K_TOKENS = 0.003;

export function getCostCeiling(agentType: string): number {
  const ceiling = AGENT_COST_CEILINGS[agentType];
  if (ceiling === undefined) {
    throw new Error(`No cost ceiling configured for agent type: ${agentType}`);
  }
  return ceiling;
}

export function getProjectedCost(
  _agentType: string,
  estimatedTokens: number,
  isRetry = false,
): number {
  const baseCost = (estimatedTokens / 1000) * COST_PER_1K_TOKENS;
  return isRetry ? baseCost * RETRY_COST_MULTIPLIER : baseCost;
}
