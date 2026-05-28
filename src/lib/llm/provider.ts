/**
 * LLM Provider Abstraction Layer
 * Enables switching between Anthropic, Nvidia NIM, and other providers via environment configuration
 */

import { AnthropicProvider } from './anthropic';
import { NvidiaNimProvider } from './nvidia-nim';
import { runStreamWithProviderResilience, runWithProviderResilience } from './resilience';
import {
  LLMMessage,
  LLMCallOptions,
  LLMCallResult,
  LLMProviderClient,
} from './types';

export type {
  LLMProviderName,
  LLMMessage,
  LLMCallOptions,
  LLMCallResult,
  LLMProviderClient,
} from './types';

let providerInstance: LLMProviderClient | null = null;

export function initializeLLMProvider(): LLMProviderClient {
  if (providerInstance) return providerInstance;

  const provider = process.env.LLM_PROVIDER || 'anthropic';

  /**
   * GOVERNANCE: Mock LLM provider may only be activated in test environments.
   * Requires NODE_ENV === "test" AND ENABLE_TEST_LLM_MOCKS === "true".
   * Otherwise an explicit error is thrown to prevent production leakage.
   */
  // Guard against unsupported mock activation
  if (provider === 'mock') {
    if (process.env.NODE_ENV !== 'test' || process.env.ENABLE_TEST_LLM_MOCKS !== 'true') {
      throw new Error('Mock LLM provider can only be used when NODE_ENV="test" and ENABLE_TEST_LLM_MOCKS="true"');
    }
  }

  switch (provider) {
    case 'mock':
      providerInstance = {
        name: 'nvidia-nim',
        getDefaultModel() { return 'mock-model'; },
        async callLLM(_messages: LLMMessage[], _options?: LLMCallOptions) {
          return {
            content: JSON.stringify({
              summary: "This is a mock tailored summary.",
              skills: ["React", "TypeScript", "Node.js"],
              tailoredBullets: [
                "Achieved 15% improvement in load times by optimizing bundling.",
                "Redesigned data caching layer resulting in 30% reduction in database queries."
              ],
              confidence: 0.95,
              reasoning: "Candidate experience aligns well with the requirements."
            }),
            stopReason: 'end_turn',
            inputTokens: 100,
            outputTokens: 100,
            totalTokens: 200,
          };
        },
        async *streamLLM(_messages: LLMMessage[], _options?: LLMCallOptions) {
          yield 'This is a mock streamed response from the agent execution...';
        }
      } as any;
      break;
    case 'nvidia-nim':
      providerInstance = new NvidiaNimProvider();
      break;
    case 'anthropic':
    default:
      providerInstance = new AnthropicProvider();
      break;
  }

  console.log(`[LLM] Initialized provider: ${providerInstance!.name}`);
  return providerInstance!;
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
