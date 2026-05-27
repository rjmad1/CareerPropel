/**
 * LLM Provider Abstraction Layer
 * Enables switching between Anthropic, Nvidia NIM, and other providers via environment configuration
 */

import { AnthropicProvider } from './anthropic';
import { NvidiaNimProvider } from './nvidia-nim';
import { runStreamWithProviderResilience, runWithProviderResilience } from './resilience';

export type LLMProviderName = 'anthropic' | 'nvidia-nim';

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

export interface LLMProviderClient {
  name: LLMProviderName;
  callLLM(messages: LLMMessage[], options?: LLMCallOptions): Promise<LLMCallResult>;
  streamLLM(
    messages: LLMMessage[],
    options?: LLMCallOptions
  ): AsyncIterable<string>;
  getDefaultModel(): string;
}

let providerInstance: LLMProviderClient | null = null;

export function initializeLLMProvider(): LLMProviderClient {
  if (providerInstance) return providerInstance;

  const provider = process.env.LLM_PROVIDER || 'anthropic';

  switch (provider) {
    case 'nvidia-nim':
      providerInstance = new NvidiaNimProvider();
      break;
    case 'anthropic':
    default:
      providerInstance = new AnthropicProvider();
      break;
  }

  console.log(`[LLM] Initialized provider: ${providerInstance.name}`);
  return providerInstance;
}

export function getLLMProvider(): LLMProviderClient {
  if (!providerInstance) {
    return initializeLLMProvider();
  }
  return providerInstance;
}

export async function callLLM(
  messages: LLMMessage[],
  options?: LLMCallOptions
): Promise<LLMCallResult> {
  const provider = getLLMProvider();
  return runWithProviderResilience(provider.name, () => provider.callLLM(messages, options));
}

export async function* streamLLM(
  messages: LLMMessage[],
  options?: LLMCallOptions
): AsyncIterable<string> {
  const provider = getLLMProvider();
  yield* runStreamWithProviderResilience(provider.name, () => provider.streamLLM(messages, options));
}
