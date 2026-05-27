/**
 * Anthropic API Provider Implementation
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  LLMMessage,
  LLMCallOptions,
  LLMCallResult,
  LLMProviderClient,
} from './provider';

export class AnthropicProvider implements LLMProviderClient {
  name = 'anthropic' as const;
  private client: Anthropic;
  private defaultModel = 'claude-3-5-sonnet-20241022';

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        'ANTHROPIC_API_KEY environment variable is not set'
      );
    }
    this.client = new Anthropic({ apiKey });
  }

  getDefaultModel(): string {
    return this.defaultModel;
  }

  async callLLM(
    messages: LLMMessage[],
    options?: LLMCallOptions
  ): Promise<LLMCallResult> {
    const model = options?.model || this.getDefaultModel();
    const maxTokens = options?.maxTokens || 4096;
    const temperature = options?.temperature ?? 0.7;
    const topP = options?.topP ?? 1.0;

    const systemPrompt =
      options?.systemPrompt ||
      'You are a helpful AI assistant. Respond concisely and accurately.';

    const response = await this.client.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      system: systemPrompt,
      messages: messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
    });

    const content =
      response.content[0].type === 'text'
        ? response.content[0].text
        : '';

    return {
      content,
      stopReason:
        response.stop_reason === 'end_turn'
          ? 'end_turn'
          : response.stop_reason === 'max_tokens'
          ? 'max_tokens'
          : 'stop_sequence',
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
    };
  }

  async* streamLLM(
    messages: LLMMessage[],
    options?: LLMCallOptions
  ): AsyncIterable<string> {
    const model = options?.model || this.getDefaultModel();
    const maxTokens = options?.maxTokens || 4096;
    const temperature = options?.temperature ?? 0.7;
    const topP = options?.topP ?? 1.0;

    const systemPrompt =
      options?.systemPrompt ||
      'You are a helpful AI assistant. Respond concisely and accurately.';

    const stream = this.client.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      system: systemPrompt,
      messages: messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      stream: true as const,
    });

    for await (const event of await stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta?.type === 'text_delta'
      ) {
        yield event.delta.text;
      }
    }
  }
}
