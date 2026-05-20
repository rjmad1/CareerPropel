/**
 * Unified AI Provider Orchestrator
 *
 * Implements:
 * - Decoupled Capability Registry (presets map to models/parameters)
 * - Dynamic routing engine with deterministic fallbacks
 * - Automatic exponential retries
 * - Generic OpenAI-compatible adapter for Groq, OpenRouter, DeepSeek, Ollama, LM Studio, etc.
 * - Centralized token cost accounting
 */

import { prisma } from '@/lib/db';
import { log } from '@/lib/logging/logger';

// ─── Interfaces ──────────────────────────────────────────────────────────────

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
  costUsd: number;
}

export interface IAIProviderAdapter {
  name: string;
  call(messages: LLMMessage[], options: LLMCallOptions): Promise<LLMCallResult>;
  stream(messages: LLMMessage[], options: LLMCallOptions): AsyncIterable<string>;
}

// ─── Capability Preset Definitions ───────────────────────────────────────────

export interface CapabilityPreset {
  name: string;
  description: string;
  primaryProvider: string;
  primaryModel: string;
  fallbackChain: string[]; // E.g. ["gemini:gemini-2.5-flash", "openai:gpt-4o-mini", "local:llama3"]
  maxTokens: number;
  temperature: number;
  systemPromptName: string;
  costWeight: 'free' | 'low' | 'medium' | 'high';
}

export const CAPABILITY_PRESETS: Record<string, CapabilityPreset> = {
  RESUME_OPTIMIZATION: {
    name: 'Resume Optimization',
    description: 'ATS alignment and dynamic formatting of achievement headers',
    primaryProvider: 'gemini',
    primaryModel: 'gemini-2.5-flash',
    fallbackChain: ['openai:gpt-4o-mini', 'groq:llama-3.1-8b-instant', 'local:llama3'],
    maxTokens: 4096,
    temperature: 0.2,
    systemPromptName: 'resume_tailor',
    costWeight: 'medium',
  },
  ATS_OPTIMIZATION: {
    name: 'ATS Optimization',
    description: 'Identify missing keywords and adjust resume metadata',
    primaryProvider: 'groq',
    primaryModel: 'llama-3.1-8b-instant',
    fallbackChain: ['gemini:gemini-2.5-flash', 'openai:gpt-4o-mini', 'local:mistral'],
    maxTokens: 2048,
    temperature: 0.1,
    systemPromptName: 'ats_optimizer',
    costWeight: 'low',
  },
  TECHNICAL_INTERVIEW: {
    name: 'Technical Interview Prep',
    description: 'Simulate whiteboarding and coding logic reviews',
    primaryProvider: 'anthropic',
    primaryModel: 'claude-3-5-sonnet-20241022',
    fallbackChain: ['openai:gpt-4o', 'deepseek:deepseek-coder', 'local:codegemma'],
    maxTokens: 8192,
    temperature: 0.5,
    systemPromptName: 'tech_interview',
    costWeight: 'high',
  },
  CAREER_COACHING: {
    name: 'Strategic Career Coaching',
    description: 'Provide personalized trajectory and salary suggestions',
    primaryProvider: 'anthropic',
    primaryModel: 'claude-3-5-sonnet-20241022',
    fallbackChain: ['gemini:gemini-2.5-pro', 'openai:gpt-4o', 'local:llama3'],
    maxTokens: 4096,
    temperature: 0.7,
    systemPromptName: 'career_coach',
    costWeight: 'high',
  }
};

// ─── Cost Registry ───────────────────────────────────────────────────────────

export interface CostRate {
  inputPerMillion: number;
  outputPerMillion: number;
}

export const MODEL_COSTS: Record<string, CostRate> = {
  'claude-3-5-sonnet-20241022': { inputPerMillion: 3.0, outputPerMillion: 15.0 },
  'gemini-2.5-flash': { inputPerMillion: 0.075, outputPerMillion: 0.3 },
  'gemini-2.5-pro': { inputPerMillion: 1.25, outputPerMillion: 5.0 },
  'gpt-4o': { inputPerMillion: 2.5, outputPerMillion: 10.0 },
  'gpt-4o-mini': { inputPerMillion: 0.15, outputPerMillion: 0.6 },
  'llama-3.1-8b-instant': { inputPerMillion: 0.05, outputPerMillion: 0.08 },
  'deepseek-coder': { inputPerMillion: 0.14, outputPerMillion: 0.28 },
};

export function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const rate = MODEL_COSTS[model];
  if (!rate) return 0.0; // Assume local or free tier
  const inputCost = (inputTokens / 1_000_000) * rate.inputPerMillion;
  const outputCost = (outputTokens / 1_000_000) * rate.outputPerMillion;
  return inputCost + outputCost;
}

// ─── Generic OpenAI-Compatible Adapter ────────────────────────────────────────
// Serves: Groq, OpenRouter, TogetherAI, Fireworks, DeepSeek, Ollama, LM Studio

export class OpenAiCompatibleAdapter implements IAIProviderAdapter {
  constructor(
    public name: string,
    private defaultBaseUrl: string,
    private apiKeyEnvName: string
  ) {}

  private getUrlAndKey(): { url: string; key: string } {
    const key = process.env[this.apiKeyEnvName] || '';
    const url = process.env[`${this.name.toUpperCase()}_BASE_URL`] || this.defaultBaseUrl;
    return { url, key };
  }

  async call(messages: LLMMessage[], options: LLMCallOptions): Promise<LLMCallResult> {
    const { url, key } = this.getUrlAndKey();
    const model = options.model || 'default';
    const systemPrompt = options.systemPrompt || 'You are an AI career assistant.';

    const payload = {
      model,
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature ?? 0.7,
      top_p: options.topP ?? 1.0,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    };

    const response = await fetch(`${url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: key ? `Bearer ${key}` : '',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`[${this.name}] HTTP API Error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as any;
    const content = data.choices?.[0]?.message?.content || '';
    const inputTokens = data.usage?.prompt_tokens || 0;
    const outputTokens = data.usage?.completion_tokens || 0;

    return {
      content,
      stopReason: data.choices?.[0]?.finish_reason === 'length' ? 'max_tokens' : 'end_turn',
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      costUsd: estimateCost(model, inputTokens, outputTokens),
    };
  }

  async* stream(messages: LLMMessage[], options: LLMCallOptions): AsyncIterable<string> {
    const { url, key } = this.getUrlAndKey();
    const model = options.model || 'default';
    const systemPrompt = options.systemPrompt || 'You are an AI career assistant.';

    const payload = {
      model,
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature ?? 0.7,
      top_p: options.topP ?? 1.0,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    };

    const response = await fetch(`${url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: key ? `Bearer ${key}` : '',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`[${this.name}] Stream HTTP API Error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response stream is not readable');

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
          const cleanLine = line.trim();
          if (cleanLine.startsWith('data: ')) {
            const dataStr = cleanLine.slice(6).trim();
            if (dataStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(dataStr);
              const textToken = parsed.choices?.[0]?.delta?.content || '';
              if (textToken) yield textToken;
            } catch {
              // Ignore partial JSON stream errors
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

// ─── Concrete Provider Adapters ──────────────────────────────────────────────

export const ADAPTERS: Record<string, IAIProviderAdapter> = {
  openai: new OpenAiCompatibleAdapter('openai', 'https://api.openai.com/v1', 'OPENAI_API_KEY'),
  groq: new OpenAiCompatibleAdapter('groq', 'https://api.groq.com/openai/v1', 'GROQ_API_KEY'),
  openrouter: new OpenAiCompatibleAdapter('openrouter', 'https://openrouter.ai/api/v1', 'OPENROUTER_API_KEY'),
  together: new OpenAiCompatibleAdapter('together', 'https://api.together.xyz/v1', 'TOGETHER_API_KEY'),
  fireworks: new OpenAiCompatibleAdapter('fireworks', 'https://api.fireworks.ai/inference/v1', 'FIREWORKS_API_KEY'),
  deepseek: new OpenAiCompatibleAdapter('deepseek', 'https://api.deepseek.com', 'DEEPSEEK_API_KEY'),
  ollama: new OpenAiCompatibleAdapter('ollama', 'http://localhost:11434/v1', 'OLLAMA_API_KEY'),
  lmstudio: new OpenAiCompatibleAdapter('lmstudio', 'http://localhost:1234/v1', 'LMSTUDIO_API_KEY'),
};

// ─── Orchestrator Core ────────────────────────────────────────────────────────

export class AIProviderOrchestrator {
  private static activeCircuitBreakers: Record<string, { failedCount: number; cooldownUntil: number }> = {};
  private static CONSECUTIVE_FAILURE_LIMIT = 5;
  private static COOLDOWN_DURATION_MS = 3 * 60 * 1000; // 3 minutes

  /**
   * Determine if a provider is marked offline due to circuit breaker trip
   */
  private static isProviderHealthy(providerName: string): boolean {
    const breaker = this.activeCircuitBreakers[providerName];
    if (!breaker) return true;
    if (Date.now() > breaker.cooldownUntil) {
      // Cooldown expired, let canary request pass
      log.info({ providerName }, 'Circuit breaker entering half-open test state');
      return true;
    }
    return false;
  }

  /**
   * Trip a circuit breaker on execution failure
   */
  private static recordFailure(providerName: string, _err: unknown) {
    const breaker = this.activeCircuitBreakers[providerName] || { failedCount: 0, cooldownUntil: 0 };
    breaker.failedCount++;
    if (breaker.failedCount >= this.CONSECUTIVE_FAILURE_LIMIT) {
      breaker.cooldownUntil = Date.now() + this.COOLDOWN_DURATION_MS;
      log.error(
        { providerName, failedCount: breaker.failedCount, cooldownMin: 3 },
        `Circuit breaker TRIPPED for provider due to repeated errors. Cool-off initiated.`
      );
    }
    this.activeCircuitBreakers[providerName] = breaker;
  }

  /**
   * Reset circuit breaker status on success
   */
  private static recordSuccess(providerName: string) {
    const breaker = this.activeCircuitBreakers[providerName];
    if (breaker) {
      log.info({ providerName }, 'Circuit breaker RESET to healthy state');
      delete this.activeCircuitBreakers[providerName];
    }
  }

  /**
   * Core routing executor with exponential retries and multi-tier failover chains
   */
  public static async executeWithFallback(
    presetKey: keyof typeof CAPABILITY_PRESETS,
    messages: LLMMessage[],
    candidateId?: string
  ): Promise<LLMCallResult> {
    const preset = CAPABILITY_PRESETS[presetKey];
    if (!preset) {
      throw new Error(`Capability preset '${presetKey}' is not registered`);
    }

    // Assemble the complete execution chain (primary + fallbacks)
    const primaryTarget = `${preset.primaryProvider}:${preset.primaryModel}`;
    const fullChain = [primaryTarget, ...preset.fallbackChain];

    let lastError: unknown = null;

    for (const routingTarget of fullChain) {
      const [providerName, modelName] = routingTarget.split(':');
      
      if (!this.isProviderHealthy(providerName)) {
        log.warn({ providerName, modelName }, 'Skipping tripped/unhealthy provider in fallback chain');
        continue;
      }

      const adapter = ADAPTERS[providerName];
      if (!adapter) {
        log.warn({ providerName }, 'Adapter for fallback provider is not loaded');
        continue;
      }

      // Retry mechanism: 3 attempts with exponential backoff
      const maxRetries = 3;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          log.info(
            { providerName, modelName, presetKey, attempt },
            `Routing preset invocation to provider adapter`
          );

          const start = Date.now();
          const result = await adapter.call(messages, {
            model: modelName,
            maxTokens: preset.maxTokens,
            temperature: preset.temperature,
          });
          const elapsed = Date.now() - start;

          // Track telemetry details
          this.recordSuccess(providerName);
          await this.logTelemetry(
            candidateId,
            presetKey,
            providerName,
            modelName,
            result.inputTokens,
            result.outputTokens,
            result.costUsd,
            elapsed,
            true
          );

          return result;
        } catch (err) {
          lastError = err;
          log.warn({ providerName, modelName, attempt, err }, `Attempt failed during LLM execution`);
          
          if (attempt < maxRetries) {
            const backoffMs = Math.pow(2, attempt) * 1000;
            await new Promise((res) => setTimeout(res, backoffMs));
          }
        }
      }

      // If we depleted all retries, trip circuit breaker and move to next fallback
      this.recordFailure(providerName, lastError);
      await this.logTelemetry(
        candidateId,
        presetKey,
        providerName,
        modelName,
        0,
        0,
        0.0,
        0,
        false,
        lastError instanceof Error ? lastError.message : String(lastError)
      );
    }

    throw new Error(
      `All providers in the fallback chain for preset '${presetKey}' failed. Last error: ${
        lastError instanceof Error ? lastError.message : String(lastError)
      }`
    );
  }

  /**
   * Core routing streaming executor with multi-tier failover chains
   */
  public static async *streamWithFallback(
    presetKey: keyof typeof CAPABILITY_PRESETS,
    messages: LLMMessage[]
  ): AsyncIterable<string> {
    const preset = CAPABILITY_PRESETS[presetKey];
    if (!preset) {
      throw new Error(`Capability preset '${presetKey}' is not registered`);
    }

    const primaryTarget = `${preset.primaryProvider}:${preset.primaryModel}`;
    const fullChain = [primaryTarget, ...preset.fallbackChain];

    let lastError: unknown = null;

    for (const routingTarget of fullChain) {
      const [providerName, modelName] = routingTarget.split(':');
      
      if (!this.isProviderHealthy(providerName)) {
        log.warn({ providerName, modelName }, 'Skipping unhealthy provider in fallback chain for stream');
        continue;
      }

      const adapter = ADAPTERS[providerName];
      if (!adapter) {
        log.warn({ providerName }, 'Adapter for fallback provider is not loaded');
        continue;
      }

      try {
        log.info({ providerName, modelName, presetKey }, `Streaming preset invocation`);
        yield* adapter.stream(messages, {
          model: modelName,
          maxTokens: preset.maxTokens,
          temperature: preset.temperature,
        });
        
        this.recordSuccess(providerName);
        return; // Success
      } catch (err) {
        lastError = err;
        log.warn({ providerName, modelName, err }, `Streaming attempt failed; moving to fallback`);
        this.recordFailure(providerName, err);
      }
    }

    throw new Error(
      `All providers in the fallback chain for preset '${presetKey}' failed to stream. Last error: ${
        lastError instanceof Error ? lastError.message : String(lastError)
      }`
    );
  }

  /**
   * Log telemetry usage data to the database
   */
  private static async logTelemetry(
    candidateId: string | undefined,
    presetKey: string,
    providerName: string,
    modelName: string,
    inputTokens: number,
    outputTokens: number,
    costUsd: number,
    latencyMs: number,
    isSuccess: boolean,
    errorMsg?: string
  ): Promise<void> {
    try {
      // 1. Log cost usage if candidate session is linked
      if (candidateId) {
        await prisma.tokenUsageLog.create({
          data: {
            candidateId,
            presetName: presetKey,
            providerName,
            modelName,
            inputTokens,
            outputTokens,
            costUsd,
          },
        }).catch((e) => log.error({ err: e }, 'Deferred token usage log db failure'));
      }

      // 2. Log health statistics
      await prisma.modelHealthLog.create({
        data: {
          providerName,
          modelName,
          latencyMs,
          isSuccess,
          errorMessage: errorMsg || null,
        },
      }).catch((e) => log.error({ err: e }, 'Deferred health log db failure'));

    } catch (telemetryErr) {
      log.error({ err: telemetryErr }, 'Failed to record execution telemetry logs');
    }
  }
}
