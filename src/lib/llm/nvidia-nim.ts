/**
 * Nvidia NIM API Provider Implementation
 *
 * NIM (Nvidia Inference Microservices) provides economical/free access to models
 * Configuration:
 * - NIM_API_KEY: Your Nvidia API key
 * - NIM_BASE_URL: NIM endpoint (default: https://integrate.api.nvidia.com/v1)
 * - NIM_MODEL: Model to use (default: meta/llama2-70b-chat)
 */

import {
  LLMMessage,
  LLMCallOptions,
  LLMCallResult,
  LLMProviderClient,
} from './provider';

export class NvidiaNimProvider implements LLMProviderClient {
  name = 'nvidia-nim' as const;
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    this.apiKey = process.env.NIM_API_KEY || '';
    this.baseUrl =
      process.env.NIM_BASE_URL || 'https://integrate.api.nvidia.com/v1';
    this.defaultModel = process.env.NIM_MODEL || 'meta/llama2-70b-chat';

    if (!this.apiKey) {
      console.warn(
        '[NIM] NIM_API_KEY not set. NIM provider will not work until configured.'
      );
    }
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

    const payload = {
      model,
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `NIM API error: ${response.status} ${response.statusText}`
      );
    }

    interface NimChatResponse {
      choices?: Array<{
        message?: { content?: string };
        finish_reason?: string;
      }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    }

    const data = (await response.json()) as NimChatResponse;
    const content = data.choices?.[0]?.message?.content || '';

    return {
      content,
      stopReason:
        data.choices?.[0]?.finish_reason === 'length'
          ? 'max_tokens'
          : 'end_turn',
      inputTokens: data.usage?.prompt_tokens || 0,
      outputTokens: data.usage?.completion_tokens || 0,
      totalTokens:
        (data.usage?.prompt_tokens || 0) +
        (data.usage?.completion_tokens || 0),
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

    const payload = {
      model,
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `NIM API error: ${response.status} ${response.statusText}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response body is not readable');

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const token = parsed.choices?.[0]?.delta?.content || '';
              if (token) yield token;
            } catch {
              // Ignore JSON parse errors in streaming
            }
          }
        }
      }

      // Process remaining buffer
      if (buffer.startsWith('data: ')) {
        const data = buffer.slice(6).trim();
        if (data !== '[DONE]') {
          try {
            const parsed = JSON.parse(data);
            const token = parsed.choices?.[0]?.delta?.content || '';
            if (token) yield token;
          } catch {
            // Ignore JSON parse errors
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
