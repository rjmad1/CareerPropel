/**
 * Core LLM Gateway & Provider Proxy
 *
 * Upgraded:
 * - Redirects legacy calls through the new AIProviderOrchestrator
 * - Dynamically maps prompts to outcome-based Capability Presets
 * - Automatically injects bidirectional PII Redaction middleware
 * - Backwards-compatible interface definitions
 */

import { AIProviderOrchestrator, CAPABILITY_PRESETS } from './orchestrator';
import { redactPii, restorePii } from './privacy';
import { log } from '@/lib/logging/logger';

export type LLMProviderName = 'anthropic' | 'nvidia-nim' | 'orchestrated';

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMCallOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  systemPrompt?: string;
  jsonMode?: boolean;
}

export interface LLMCallResult {
  content: string;
  stopReason: 'end_turn' | 'max_tokens' | 'stop_sequence';
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface LLMProvider {
  name: string;
  getDefaultModel(): string;
  callLLM(
    messages: LLMMessage[],
    options?: LLMCallOptions
  ): Promise<LLMCallResult>;
  streamLLM(
    messages: LLMMessage[],
    options?: LLMCallOptions
  ): AsyncIterable<string>;
}

/**
 * Heuristically map a prompt request to the optimal capability preset
 */
function resolvePreset(messages: LLMMessage[], options?: LLMCallOptions): keyof typeof CAPABILITY_PRESETS {
  const context = (options?.systemPrompt || '') + ' ' + messages.map((m) => m.content).join(' ');
  const lowercaseContext = context.toLowerCase();

  if (lowercaseContext.includes('ats') || lowercaseContext.includes('keyword') || lowercaseContext.includes('score')) {
    return 'ATS_OPTIMIZATION';
  }
  
  if (lowercaseContext.includes('interview') || lowercaseContext.includes('star story') || lowercaseContext.includes('question')) {
    return 'TECHNICAL_INTERVIEW';
  }

  if (lowercaseContext.includes('coach') || lowercaseContext.includes('career') || lowercaseContext.includes('trajectory')) {
    return 'CAREER_COACHING';
  }

  return 'RESUME_OPTIMIZATION'; // Safe default
}

/**
 * Execute call through the orchestrator with automated PII Redaction
 */
export async function callLLM(
  messages: LLMMessage[],
  options?: LLMCallOptions
): Promise<LLMCallResult> {
  const presetKey = resolvePreset(messages, options);
  
  // 1. Local PII Redaction Step
  const tokenMaps: Record<number, Record<string, string>> = {};
  const sanitizedMessages = messages.map((m, idx) => {
    const { redactedText, tokenMap } = redactPii(m.content);
    tokenMaps[idx] = tokenMap;
    return { ...m, content: redactedText };
  });

  // Inject system prompt into option-based message structure if provided
  if (options?.systemPrompt) {
    const { redactedText, tokenMap } = redactPii(options.systemPrompt);
    options.systemPrompt = redactedText;
    tokenMaps[-1] = tokenMap; // map system prompt
  }

  log.info({ presetKey }, 'Proxying callLLM invocation through unified orchestrator');

  // 2. Call the Orchestrator with fallback chains
  const result = await AIProviderOrchestrator.executeWithFallback(
    presetKey,
    sanitizedMessages
  );

  // 3. Restore PII local values in response content
  let finalContent = result.content;
  for (const tokenMap of Object.values(tokenMaps)) {
    finalContent = restorePii(finalContent, tokenMap);
  }

  return {
    content: finalContent,
    stopReason: result.stopReason,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    totalTokens: result.totalTokens,
  };
}

/**
 * Execute stream through the orchestrator with automated PII Redaction
 */
export async function* streamLLM(
  messages: LLMMessage[],
  options?: LLMCallOptions
): AsyncIterable<string> {
  const presetKey = resolvePreset(messages, options);
  
  // 1. Local PII Redaction Step
  const tokenMaps: Record<number, Record<string, string>> = {};
  const sanitizedMessages = messages.map((m, idx) => {
    const { redactedText, tokenMap } = redactPii(m.content);
    tokenMaps[idx] = tokenMap;
    return { ...m, content: redactedText };
  });

  if (options?.systemPrompt) {
    const { redactedText, tokenMap } = redactPii(options.systemPrompt);
    options.systemPrompt = redactedText;
    tokenMaps[-1] = tokenMap;
  }

  log.info({ presetKey }, 'Proxying streamLLM invocation through unified orchestrator');

  // 2. Stream from the Orchestrator
  const streamSource = AIProviderOrchestrator.streamWithFallback(
    presetKey,
    sanitizedMessages
  );

  for await (const chunk of streamSource) {
    // 3. Restore PII local values for each chunk safely
    let restoredChunk = chunk;
    for (const tokenMap of Object.values(tokenMaps)) {
      restoredChunk = restorePii(restoredChunk, tokenMap);
    }
    yield restoredChunk;
  }
}
