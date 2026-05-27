/**
 * AI Regression Testing Harness
 * Golden test cases, regression scoring, hallucination checks, latency/cost baselines.
 */

import { AgentType } from '@/lib/agents/prompts';
import { validateAgentOutput } from './outputValidator';
import { createLogger } from '@/lib/logging/logger';

const log = createLogger({ component: 'regression-harness' });

export interface GoldenTestCase {
  id: string;
  agentType: AgentType;
  name: string;
  input: Record<string, string>;
  /** Expected structural keys that must be present in output */
  requiredKeys: string[];
  /** Minimum confidence/score fields and their expected ranges */
  scoreAssertions: Array<{ field: string; min: number; max: number }>;
  /** Strings that must NOT appear in the output (hallucination guards) */
  forbiddenPhrases: string[];
  /** Strings that MUST appear in the output */
  requiredPhrases: string[];
  /** Baseline latency budget in ms; regression if exceeded by >50% */
  latencyBaselineMs: number;
  /** Baseline token count; regression if exceeded by >30% */
  tokenBaseline: number;
}

export interface RegressionRunResult {
  caseId: string;
  agentType: AgentType;
  passed: boolean;
  schemaScore: number;      // 0–100
  structuralScore: number;  // 0–100
  hallucinationScore: number; // 0–100 (100 = no hallucination detected)
  costScore: number;        // 0–100 (100 = under budget)
  latencyScore: number;     // 0–100 (100 = under baseline)
  overallScore: number;     // weighted average
  failures: string[];
  latencyMs?: number;
  tokenCount?: number;
}

// ─── Golden Test Cases ────────────────────────────────────────────────────────

export const GOLDEN_TEST_CASES: GoldenTestCase[] = [
  {
    id: 'resume-tailor-001',
    agentType: 'resume-tailor',
    name: 'Senior engineer resume tailoring',
    input: {
      jobDescription: 'Senior Software Engineer at Acme Corp. Requirements: 5+ years TypeScript, React, Node.js, system design. Responsibilities: build and scale microservices.',
      resume: 'John Doe. 6 years experience. Built distributed payment processing system handling $2M/day. Led team of 5 engineers. TypeScript, Node.js, React, PostgreSQL.',
      companyName: 'Acme Corp',
    },
    requiredKeys: ['summary', 'skills', 'tailoredBullets', 'confidence', 'reasoning'],
    scoreAssertions: [
      { field: 'confidence', min: 50, max: 99 },
    ],
    forbiddenPhrases: ['invented', 'fabricated', 'made up', 'Acme Corp is a fake'],
    requiredPhrases: [],
    latencyBaselineMs: 15000,
    tokenBaseline: 800,
  },
  {
    id: 'job-match-001',
    agentType: 'job-match',
    name: 'Strong match candidate',
    input: {
      userProfile: 'Senior TypeScript engineer, 7 years experience, open to $180–220K, prefers startup culture',
      jobDescription: 'Senior TypeScript engineer, Series B startup, $180–220K, remote-first, fast growth culture',
      companyName: 'StartupCo',
    },
    requiredKeys: ['overallScore', 'scoreBreakdown', 'strengths', 'gaps', 'recommendation', 'reasoning'],
    scoreAssertions: [
      { field: 'overallScore', min: 0, max: 100 },
    ],
    forbiddenPhrases: ['invented', 'hallucinated salary'],
    requiredPhrases: ['TypeScript'],
    latencyBaselineMs: 10000,
    tokenBaseline: 600,
  },
  {
    id: 'interview-prep-001',
    agentType: 'interview-prep',
    name: 'Standard interview prep',
    input: {
      userProfile: 'Senior engineer with distributed systems background',
      jobDescription: 'Staff Engineer at large tech company. Focus on infrastructure, reliability, and cross-team coordination.',
      companyName: 'BigTech Inc',
    },
    requiredKeys: ['companyOverview', 'roleBreakdown', 'likelyQuestions', 'starStories', 'negotiationTalkingPoints'],
    scoreAssertions: [],
    forbiddenPhrases: ['confidential internal', 'internal only', 'proprietary roadmap'],
    requiredPhrases: [],
    latencyBaselineMs: 20000,
    tokenBaseline: 1500,
  },
  {
    id: 'networking-001',
    agentType: 'networking',
    name: 'Networking strategy — no manipulation',
    input: {
      userProfile: 'Mid-level PM looking to transition to senior PM role at a Series A startup',
      jobDescription: 'Senior Product Manager',
      companyName: '',
    },
    requiredKeys: ['networkAnalysis', 'outreachStrategy', 'conversationStarters', 'followUpSequence'],
    scoreAssertions: [],
    forbiddenPhrases: ['manipulate', 'deceive', 'trick', 'pressure into'],
    requiredPhrases: [],
    latencyBaselineMs: 12000,
    tokenBaseline: 700,
  },
  {
    id: 'follow-up-001',
    agentType: 'follow-up',
    name: 'Post-interview follow-up',
    input: {
      companyName: 'ExampleCorp',
      jobDescription: 'Had a great conversation about React architecture and performance optimization',
      userProfile: 'Frontend engineer with 4 years experience',
    },
    requiredKeys: ['subject', 'body', 'sendAfterDays', 'cta'],
    scoreAssertions: [
      { field: 'sendAfterDays', min: 1, max: 14 },
    ],
    forbiddenPhrases: ['manipulate', 'trick'],
    requiredPhrases: ['ExampleCorp'],
    latencyBaselineMs: 8000,
    tokenBaseline: 500,
  },
];

// ─── Scoring ──────────────────────────────────────────────────────────────────

export function scoreRegressionCase(
  testCase: GoldenTestCase,
  output: Record<string, unknown>,
  latencyMs: number,
  tokenCount: number,
): RegressionRunResult {
  const failures: string[] = [];

  // Schema score: use the validator
  const validation = validateAgentOutput(testCase.agentType, output);
  const schemaScore = validation.schemaValid ? 100 : 0;
  if (!validation.schemaValid) {
    failures.push(...validation.errors.filter((e) => e.layer === 'schema').map((e) => `Schema: ${e.field} — ${e.message}`));
  }

  // Structural score: required keys present
  let structuralHits = 0;
  for (const key of testCase.requiredKeys) {
    if (key in output && output[key] !== null && output[key] !== undefined) {
      structuralHits++;
    } else {
      failures.push(`Missing required key: ${key}`);
    }
  }
  const structuralScore = testCase.requiredKeys.length > 0
    ? Math.round((structuralHits / testCase.requiredKeys.length) * 100)
    : 100;

  // Score assertions
  for (const assertion of testCase.scoreAssertions) {
    const value = (output as Record<string, number>)[assertion.field];
    if (typeof value === 'number') {
      if (value < assertion.min || value > assertion.max) {
        failures.push(`${assertion.field} = ${value} outside expected range [${assertion.min}, ${assertion.max}]`);
      }
    }
  }

  // Hallucination score: forbidden phrases
  const rawString = JSON.stringify(output).toLowerCase();
  let hallucinationPenalty = 0;
  for (const phrase of testCase.forbiddenPhrases) {
    if (rawString.includes(phrase.toLowerCase())) {
      failures.push(`Forbidden phrase detected: "${phrase}"`);
      hallucinationPenalty += 25;
    }
  }
  const hallucinationScore = Math.max(0, 100 - hallucinationPenalty);

  // Required phrases
  for (const phrase of testCase.requiredPhrases) {
    if (!rawString.includes(phrase.toLowerCase())) {
      failures.push(`Required phrase missing: "${phrase}"`);
    }
  }

  // Cost score: token regression
  const tokenRatio = tokenCount / testCase.tokenBaseline;
  const costScore = tokenRatio <= 1.3 ? 100 : tokenRatio <= 2.0 ? 50 : 0;
  if (tokenRatio > 1.3) {
    failures.push(`Token regression: ${tokenCount} tokens vs baseline ${testCase.tokenBaseline} (${Math.round(tokenRatio * 100)}%)`);
  }

  // Latency score
  const latencyRatio = latencyMs / testCase.latencyBaselineMs;
  const latencyScore = latencyRatio <= 1.5 ? 100 : latencyRatio <= 3.0 ? 50 : 0;
  if (latencyRatio > 1.5) {
    failures.push(`Latency regression: ${latencyMs}ms vs baseline ${testCase.latencyBaselineMs}ms (${Math.round(latencyRatio * 100)}%)`);
  }

  // Weighted overall
  const overallScore = Math.round(
    schemaScore * 0.3 +
    structuralScore * 0.2 +
    hallucinationScore * 0.25 +
    costScore * 0.1 +
    latencyScore * 0.15
  );

  const passed = schemaScore === 100 && structuralScore === 100 && hallucinationScore >= 75 && failures.length === 0;

  if (!passed) {
    log.warn({ caseId: testCase.id, agentType: testCase.agentType, failures, overallScore }, 'Regression case failed');
  }

  return {
    caseId: testCase.id,
    agentType: testCase.agentType,
    passed,
    schemaScore,
    structuralScore,
    hallucinationScore,
    costScore,
    latencyScore,
    overallScore,
    failures,
    latencyMs,
    tokenCount,
  };
}

/** Run all golden cases against a provided executor function. */
export async function runRegressionSuite(
  executor: (agentType: AgentType, input: Record<string, string>) => Promise<{
    output: Record<string, unknown>;
    latencyMs: number;
    tokenCount: number;
  }>,
  filterAgentType?: AgentType,
): Promise<{ results: RegressionRunResult[]; passRate: number; overallScore: number }> {
  const cases = filterAgentType
    ? GOLDEN_TEST_CASES.filter((c) => c.agentType === filterAgentType)
    : GOLDEN_TEST_CASES;

  const results: RegressionRunResult[] = [];

  for (const testCase of cases) {
    try {
      const { output, latencyMs, tokenCount } = await executor(testCase.agentType, testCase.input);
      results.push(scoreRegressionCase(testCase, output, latencyMs, tokenCount));
    } catch (err) {
      results.push({
        caseId: testCase.id,
        agentType: testCase.agentType,
        passed: false,
        schemaScore: 0,
        structuralScore: 0,
        hallucinationScore: 0,
        costScore: 0,
        latencyScore: 0,
        overallScore: 0,
        failures: [`Execution threw: ${err instanceof Error ? err.message : String(err)}`],
      });
    }
  }

  const passCount = results.filter((r) => r.passed).length;
  const passRate = results.length > 0 ? passCount / results.length : 0;
  const overallScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.overallScore, 0) / results.length)
    : 0;

  log.info({ passRate, overallScore, total: results.length, passed: passCount }, 'Regression suite completed');

  return { results, passRate, overallScore };
}
