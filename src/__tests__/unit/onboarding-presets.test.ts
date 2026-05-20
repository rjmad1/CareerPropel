/**
 * Unit Test Suite for AI Onboarding and Preset Mapping
 * Verifies:
 * - Outcome configurations correctly align with privacy preferences.
 * - Compute tiers accurately route to budget-appropriate providers.
 * - Local-only constraints correctly override cloud presets to loopbacks.
 */

interface OnboardingParams {
  privacyMode: 'local' | 'zero_retention' | 'enterprise';
  computeTier: 'free' | 'managed' | 'byo';
  presetKey: string;
}

function resolvePresetMapping(params: OnboardingParams) {
  const { privacyMode, computeTier, presetKey } = params;
  
  let providerName = 'gemini';
  let modelName = 'gemini-2.5-flash';
  let maxCostLimit = 0.05;

  // Apply Compute choices
  if (computeTier === 'free') {
    providerName = 'groq';
    modelName = 'llama-3.1-8b-instant';
    maxCostLimit = 0.01;
  } else if (computeTier === 'byo') {
    providerName = 'openai';
    modelName = 'gpt-4o-mini';
    maxCostLimit = 0.03;
  }

  // Apply Privacy overrides
  if (privacyMode === 'local') {
    providerName = 'ollama';
    modelName = 'llama3';
    maxCostLimit = 0.0;
  }

  // Specific preset adjustments
  if (presetKey === 'TECHNICAL_INTERVIEW') {
    if (privacyMode !== 'local') {
      providerName = 'anthropic';
      modelName = 'claude-3-5-sonnet-20241022';
      maxCostLimit = 0.15;
    } else {
      modelName = 'codegemma';
    }
  }

  return { providerName, modelName, maxCostLimit };
}

describe('AI Onboarding Presets Tailoring Rules', () => {
  test('Should map default managed enterprise mode to high-performance cloud providers', () => {
    const result = resolvePresetMapping({
      privacyMode: 'enterprise',
      computeTier: 'managed',
      presetKey: 'RESUME_OPTIMIZATION',
    });

    expect(result.providerName).toBe('gemini');
    expect(result.modelName).toBe('gemini-2.5-flash');
    expect(result.maxCostLimit).toBe(0.05);
  });

  test('Should route technical interview prep to Sonnet when not in local-only mode', () => {
    const result = resolvePresetMapping({
      privacyMode: 'enterprise',
      computeTier: 'managed',
      presetKey: 'TECHNICAL_INTERVIEW',
    });

    expect(result.providerName).toBe('anthropic');
    expect(result.modelName).toBe('claude-3-5-sonnet-20241022');
    expect(result.maxCostLimit).toBe(0.15);
  });

  test('Should force all presets to local loopback (Ollama) when privacy mode is local', () => {
    const resultNormal = resolvePresetMapping({
      privacyMode: 'local',
      computeTier: 'managed',
      presetKey: 'RESUME_OPTIMIZATION',
    });

    expect(resultNormal.providerName).toBe('ollama');
    expect(resultNormal.modelName).toBe('llama3');
    expect(resultNormal.maxCostLimit).toBe(0.0);

    const resultInterview = resolvePresetMapping({
      privacyMode: 'local',
      computeTier: 'managed',
      presetKey: 'TECHNICAL_INTERVIEW',
    });

    expect(resultInterview.providerName).toBe('ollama');
    expect(resultInterview.modelName).toBe('codegemma');
    expect(resultInterview.maxCostLimit).toBe(0.0);
  });

  test('Should enforce low-budget constraints on free tier compute selections', () => {
    const result = resolvePresetMapping({
      privacyMode: 'enterprise',
      computeTier: 'free',
      presetKey: 'RESUME_OPTIMIZATION',
    });

    expect(result.providerName).toBe('groq');
    expect(result.modelName).toBe('llama-3.1-8b-instant');
    expect(result.maxCostLimit).toBe(0.01);
  });
});
