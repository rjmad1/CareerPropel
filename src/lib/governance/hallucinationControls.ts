/**
 * Hallucination Controls
 * Semantic prompt inspection, context boundary enforcement,
 * unsafe instruction filtering, unsupported-claim detection.
 */

import { AgentType } from '@/lib/agents/prompts';
import { createLogger } from '@/lib/logging/logger';

const log = createLogger({ component: 'hallucination-controls' });

export type ClaimConfidence = 'verified' | 'inferred' | 'estimated' | 'unverified';

export interface HallucinationCheckResult {
  safe: boolean;
  suspicions: HallucinationSuspicion[];
  claimConfidences: Record<string, ClaimConfidence>;
  unsupportedClaimsDetected: boolean;
  promptInjectionDetected: boolean;
}

export interface HallucinationSuspicion {
  type: HallucinationSuspicionType;
  field?: string;
  evidence: string;
  severity: 'low' | 'medium' | 'high';
}

export type HallucinationSuspicionType =
  | 'fabricated_employer'
  | 'fabricated_salary'
  | 'fabricated_company_facts'
  | 'internal_knowledge_claim'
  | 'prompt_injection'
  | 'unsupported_statistic'
  | 'manipulative_language'
  | 'pii_exposure';

// ─── Patterns ─────────────────────────────────────────────────────────────────

const PROMPT_INJECTION_PATTERNS: RegExp[] = [
  /ignore (previous|all|prior) (instructions?|context|prompts?)/i,
  /\bact as\b.*\b(different|another|new)\b.*\b(ai|assistant|model)\b/i,
  /system\s*prompt\s*[:=]/i,
  /\bforget everything\b/i,
  /\[INST\]|\[\/INST\]|<\|system\|>|<\|user\|>/,
  /\/\*.*?override.*?\*\//is,
];

const FABRICATED_SALARY_PATTERNS: RegExp[] = [
  /\$\d{2,3}[,\s]?\d{3}\s*(–|-|to)\s*\$\d{2,3}[,\s]?\d{3}/,  // $180,000 - $220,000
  /\d{2,3}k\s*(–|-|to)\s*\d{2,3}k\b/i,  // 180k - 220k
];

const INTERNAL_KNOWLEDGE_PATTERNS: RegExp[] = [
  /\binternal\s+(roadmap|strategy|plan|document|memo|data)\b/i,
  /\bconfidential\s+(information|data|details|plans)\b/i,
  /\b(insider|non-public)\s+(information|data|knowledge)\b/i,
  /\bproprietary\s+(data|information|methodology)\b/i,
];

const MANIPULATIVE_LANGUAGE_PATTERNS: RegExp[] = [
  /\b(manipulate|deceive|trick|mislead|lie to|pressure|coerce|exploit)\s+(the|your|them|their)\b/i,
  /\bpsychological\s+(manipulation|pressure|tactics)\b/i,
  /\bfake\s+(urgency|scarcity|authority)\b/i,
];

const PII_PATTERNS: RegExp[] = [
  /\b\d{3}-\d{2}-\d{4}\b/,           // SSN
  /\b\d{4}[\s-]\d{4}[\s-]\d{4}[\s-]\d{4}\b/,  // credit card
  /\b[A-Z]{1,2}\d{6,9}\b/,           // passport-like
];

const UNSUPPORTED_STAT_PATTERNS: RegExp[] = [
  /\b(according to|based on|data shows?|studies show|research indicates?)\s+\d/i,
  /\b\d+\s*%\s+of\s+(companies?|employers?|candidates?|jobs?)\b/i,
];

// ─── Agent-specific additional checks ────────────────────────────────────────

const SALARY_SENSITIVE_AGENTS: AgentType[] = ['job-match', 'interview-prep', 'research'];
const COMPANY_FACT_SENSITIVE_AGENTS: AgentType[] = ['research', 'interview-prep'];

// ─── Main inspector ───────────────────────────────────────────────────────────

export function inspectForHallucinations(
  agentType: AgentType,
  output: Record<string, unknown>,
  inputContext?: Record<string, string>,
): HallucinationCheckResult {
  const suspicions: HallucinationSuspicion[] = [];
  const raw = JSON.stringify(output);

  // Prompt injection in output
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(raw)) {
      suspicions.push({
        type: 'prompt_injection',
        evidence: `Pattern matched: ${pattern.source}`,
        severity: 'high',
      });
    }
  }

  // PII exposure
  for (const pattern of PII_PATTERNS) {
    if (pattern.test(raw)) {
      suspicions.push({
        type: 'pii_exposure',
        evidence: `PII pattern detected in output`,
        severity: 'high',
      });
    }
  }

  // Manipulative language
  for (const pattern of MANIPULATIVE_LANGUAGE_PATTERNS) {
    if (pattern.test(raw)) {
      suspicions.push({
        type: 'manipulative_language',
        evidence: `Manipulative language pattern: ${pattern.source}`,
        severity: 'high',
      });
    }
  }

  // Salary fabrication: check if salary ranges appear in output but were NOT in input
  if (SALARY_SENSITIVE_AGENTS.includes(agentType)) {
    for (const pattern of FABRICATED_SALARY_PATTERNS) {
      const match = raw.match(pattern);
      if (match) {
        const salaryInInput = inputContext
          ? Object.values(inputContext).some((v) => pattern.test(v))
          : false;
        if (!salaryInInput) {
          suspicions.push({
            type: 'fabricated_salary',
            evidence: `Salary range '${match[0]}' in output not found in input context`,
            severity: 'medium',
          });
        }
      }
    }
  }

  // Internal knowledge claims
  if (COMPANY_FACT_SENSITIVE_AGENTS.includes(agentType)) {
    for (const pattern of INTERNAL_KNOWLEDGE_PATTERNS) {
      if (pattern.test(raw)) {
        suspicions.push({
          type: 'internal_knowledge_claim',
          evidence: `Output claims internal/proprietary knowledge: ${pattern.source}`,
          severity: 'medium',
        });
      }
    }
  }

  // Unsupported statistics (context-ungrounded numbers)
  for (const pattern of UNSUPPORTED_STAT_PATTERNS) {
    if (pattern.test(raw)) {
      suspicions.push({
        type: 'unsupported_statistic',
        evidence: `Potentially ungrounded statistic: ${pattern.source}`,
        severity: 'low',
      });
    }
  }

  // Compute claim confidence map for salary/company data fields
  const claimConfidences: Record<string, ClaimConfidence> = {};
  if (agentType === 'research') {
    claimConfidences['companySnapshot'] = inputContext?.companyInfo ? 'inferred' : 'estimated';
    claimConfidences['leadership'] = 'estimated';
    claimConfidences['redFlags'] = 'inferred';
  }
  if (agentType === 'job-match') {
    claimConfidences['scoreBreakdown'] = 'inferred';
    claimConfidences['overallScore'] = 'inferred';
  }

  const highSeverityCount = suspicions.filter((s) => s.severity === 'high').length;
  const safe = highSeverityCount === 0;

  if (!safe || suspicions.length > 0) {
    log.warn({ agentType, suspicions, safe }, 'Hallucination inspection flagged issues');
  }

  return {
    safe,
    suspicions,
    claimConfidences,
    unsupportedClaimsDetected: suspicions.some((s) =>
      s.type === 'unsupported_statistic' || s.type === 'internal_knowledge_claim'
    ),
    promptInjectionDetected: suspicions.some((s) => s.type === 'prompt_injection'),
  };
}

/** Inspect raw user input for prompt injection attempts before sending to LLM. */
export function inspectInputForInjection(userInput: string): { clean: boolean; patterns: string[] } {
  const matched: string[] = [];
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(userInput)) {
      matched.push(pattern.source);
    }
  }
  const clean = matched.length === 0;
  if (!clean) {
    log.warn({ patterns: matched }, 'Prompt injection detected in user input');
  }
  return { clean, patterns: matched };
}
