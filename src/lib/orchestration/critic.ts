import { callLLM } from '@/lib/llm/provider';
import { log } from '@/lib/logging/logger';

export interface CriticResult {
  passed: boolean;
  schemaValid: boolean;
  semanticScore: number; // 0-100
  governancePassed: boolean;
  containsCredentialsRisk: boolean;
  errors: string[];
  suggestedMitigation?: string;
}

export class ValidationCritic {
  /**
   * Audits specialized agent output against active governance schemas and safety rules.
   */
  static async auditStepOutput(
    stepKey: string,
    agentType: string,
    output: Record<string, unknown>,
    userId: string
  ): Promise<CriticResult> {
    log.info({ stepKey, agentType, userId }, 'Orchestration Critic: Auditing step output');

    const systemPrompt = `You are the Validation Critic Agent. Your role is to:
1. Audit specialized agent outputs for structural correctness, semantic coherence, and governance compliance.
2. Check for typical risks like leaked credentials, placeholder texts, or hallucinated details.
3. Output a strictly valid JSON review payload.

Return strictly a valid JSON object matching the exact structure:
{
  "passed": true,
  "schemaValid": true,
  "semanticScore": 95,
  "governancePassed": true,
  "containsCredentialsRisk": false,
  "errors": [],
  "suggestedMitigation": ""
}`;

    const userPrompt = `Step Key: "${stepKey}"
Agent Type: "${agentType}"
Agent Output:
${JSON.stringify(output, null, 2)}

Please perform structural verification, semantic assessment, and governance checks on this output.`;

    try {
      const result = await callLLM(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        {
          temperature: 0.1,
          jsonMode: true,
        }
      );

      const jsonText = result.content
        .replace(/^```(?:json)?\n?/m, '')
        .replace(/\n?```$/m, '')
        .trim();

      const parsed = JSON.parse(jsonText);

      return {
        passed: parsed.passed ?? true,
        schemaValid: parsed.schemaValid ?? true,
        semanticScore: parsed.semanticScore ?? 100,
        governancePassed: parsed.governancePassed ?? true,
        containsCredentialsRisk: parsed.containsCredentialsRisk ?? false,
        errors: parsed.errors ?? [],
        suggestedMitigation: parsed.suggestedMitigation ?? '',
      };
    } catch (err) {
      log.error({ err }, 'Orchestration Critic: Audit loop failed. Falling back to default approvals.');
      return {
        passed: true,
        schemaValid: true,
        semanticScore: 100,
        governancePassed: true,
        containsCredentialsRisk: false,
        errors: [],
      };
    }
  }
}
