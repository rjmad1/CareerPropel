/**
 * Local LLM Auto-Detection & Scanner
 *
 * Implements:
 * - Scanning local network loopback interfaces for active LLM runtimes (Ollama & LM Studio)
 * - Enumeration of downloaded models
 * - VRAM hardware profiling guidelines
 */

import { log } from '@/lib/logging/logger';

export interface LocalRuntimeStatus {
  isActive: boolean;
  provider: 'ollama' | 'lmstudio' | null;
  endpoint: string;
  models: string[];
  vramCategory: 'low' | 'medium' | 'high';
  recommendations: string[];
}

const DEFAULT_OLLAMA_PORT = 11434;
const DEFAULT_LMSTUDIO_PORT = 1234;

/**
 * Scan standard local endpoints for running servers
 */
export async function detectLocalRuntimes(): Promise<LocalRuntimeStatus> {
  const result: LocalRuntimeStatus = {
    isActive: false,
    provider: null,
    endpoint: '',
    models: [],
    vramCategory: 'low',
    recommendations: [],
  };

  // 1. Scan for Ollama
  try {
    const ollamaCheck = await fetch(`http://127.0.0.1:${DEFAULT_OLLAMA_PORT}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(1500), // Fast 1.5s timeout for local check
    });

    if (ollamaCheck.ok) {
      const data = (await ollamaCheck.json()) as { models?: Array<{ name: string }> };
      const modelNames = (data.models || []).map((m) => m.name);

      result.isActive = true;
      result.provider = 'ollama';
      result.endpoint = `http://localhost:${DEFAULT_OLLAMA_PORT}`;
      result.models = modelNames;
      
      log.info({ modelCount: modelNames.length }, 'Ollama local runtime auto-detected successfully');
      populateRecommendations(result);
      return result;
    }
  } catch {
    // Ollama not active on default port
  }

  // 2. Scan for LM Studio
  try {
    const lmCheck = await fetch(`http://127.0.0.1:${DEFAULT_LMSTUDIO_PORT}/v1/models`, {
      method: 'GET',
      signal: AbortSignal.timeout(1500),
    });

    if (lmCheck.ok) {
      const data = (await lmCheck.json()) as { data?: Array<{ id: string }> };
      const modelNames = (data.data || []).map((m) => m.id);

      result.isActive = true;
      result.provider = 'lmstudio';
      result.endpoint = `http://localhost:${DEFAULT_LMSTUDIO_PORT}`;
      result.models = modelNames;

      log.info({ modelCount: modelNames.length }, 'LM Studio local runtime auto-detected successfully');
      populateRecommendations(result);
      return result;
    }
  } catch {
    // LM Studio not active on default port
  }

  return result;
}

/**
 * Map hardware capability suggestions based on scanning context
 */
function populateRecommendations(status: LocalRuntimeStatus) {
  // Let the user know the performance trade-offs
  if (status.models.length === 0) {
    status.recommendations.push(
      'No models found locally. Click "Pull Model" in Settings -> AI Providers to download llama3.'
    );
  }

  // Suggest models based on VRAM profiles
  status.recommendations.push(
    'Low Specs (<6GB VRAM): Use Qwen-2.5-1.5B or Llama-3.2-1B for fast, offline matching.',
    'Mid Specs (6GB - 12GB VRAM): Use Mistral-7B or Llama-3-8B for excellent resume optimization balance.',
    'High Specs (>12GB VRAM): Use Command-R-Plus or DeepSeek-Coder-7B for heavy coding preparation.'
  );
}
