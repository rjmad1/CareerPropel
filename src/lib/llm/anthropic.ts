/**
 * Anthropic API Provider Implementation
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  LLMMessage,
  LLMCallOptions,
  LLMCallResult,
  LLMProviderClient,
} from './types';

/**
 * Splits message content into blocks, adding cache_control headers to large sections.
 */
function splitContentIntoCachedBlocks(
  content: string
): Array<{ type: 'text'; text: string; cache_control?: { type: 'ephemeral' } }> {
  if (!content) {
    return [{ type: 'text', text: '' }];
  }

  // We want to detect sections like "Job Description:", "Current Resume:", "Candidate Profile:", "Candidate Background:", "Company Info:"
  const sections = [
    { header: 'Job Description:', key: 'jobDescription' },
    { header: 'Current Resume:', key: 'resume' },
    { header: 'Candidate Profile:', key: 'profile' },
    { header: 'Candidate Background:', key: 'background' },
    { header: 'Available Information:', key: 'info' },
  ];

  // Find all indices of these headers
  const matches: { index: number; header: string; key: string }[] = [];
  for (const sec of sections) {
    let pos = 0;
    while ((pos = content.indexOf(sec.header, pos)) !== -1) {
      matches.push({ index: pos, header: sec.header, key: sec.key });
      pos += sec.header.length;
    }
  }

  // Sort matches by index
  matches.sort((a, b) => a.index - b.index);

  if (matches.length === 0) {
    return [{ type: 'text', text: content }];
  }

  const blocks: Array<{ type: 'text'; text: string; cache_control?: { type: 'ephemeral' } }> = [];

  // Add the text before the first header if any
  if (matches[0].index > 0) {
    const textBefore = content.substring(0, matches[0].index);
    blocks.push({
      type: 'text',
      text: textBefore,
      ...(textBefore.length > 1000 ? { cache_control: { type: 'ephemeral' } } : {}),
    });
  }

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const nextIndex = i + 1 < matches.length ? matches[i + 1].index : content.length;
    const sectionText = content.substring(current.index, nextIndex);
    
    // Check if the section text is large enough to warrant caching (e.g. > 1000 characters)
    const shouldCache = sectionText.length > 1000;
    
    blocks.push({
      type: 'text',
      text: sectionText,
      ...(shouldCache ? { cache_control: { type: 'ephemeral' } } : {}),
    });
  }

  return blocks;
}

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
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages: messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: splitContentIntoCachedBlocks(m.content),
        })),
    }, {
      headers: {
        'anthropic-beta': 'prompt-caching-2024-07-31'
      }
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
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages: messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: splitContentIntoCachedBlocks(m.content),
        })),
      stream: true as const,
    }, {
      headers: {
        'anthropic-beta': 'prompt-caching-2024-07-31'
      }
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
