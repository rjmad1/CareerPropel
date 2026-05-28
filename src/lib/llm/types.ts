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
