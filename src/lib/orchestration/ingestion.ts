import { callLLM } from '@/lib/llm/provider';
import { prisma } from '@/lib/db';
import { IngestionResult, DynamicDag } from './types';
import { log } from '@/lib/logging/logger';

export class IngestionEngine {
  /**
   * Expands minimal user input into a fully qualified execution context and dynamic DAG.
   */
  static async expandIntent(title: string, userId: string, customContext?: string): Promise<IngestionResult> {
    log.info({ title, userId }, 'Orchestration Ingestion: Expanding user intent');

    // Gather existing profile / portfolio context to inject into prompt
    let candidateSummary = '';
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { email: userId },
        include: { skills: true },
      });
      if (candidate) {
        candidateSummary = `Candidate: ${candidate.name}, Skills: ${candidate.skills.map(s => s.name).join(', ')}`;
      }
    } catch (err) {
      log.warn({ err }, 'Orchestration Ingestion: Failed to gather candidate profile data');
    }

    const systemPrompt = `You are the Ingestion & DAG Expansion Meta-Agent. Your role is to:
1. Translate vague human task inputs (e.g. "Fix telemetry latency", "Optimize resume for Fintech") into detailed executable plans.
2. Formulate a list of steps as a Directed Acyclic Graph (DAG) using stepType values: 'agent_call', 'approval', 'condition', 'notification', 'delay'.
3. Assign dependencies among steps to govern execution order (steps run in parallel unless blocked by prerequisite keys).
4. Predict complexity, cost, riskLevel ('low' | 'medium' | 'high' | 'critical'), and priority ranking parameters.

Return strictly a valid JSON object matching the exact structure:
{
  "expandedContext": "Detailed explanation of what this task requires...",
  "domain": "codebase | profile | research | interview | other",
  "predictedComplexity": "low | medium | high",
  "estimatedCostUsd": 0.05,
  "initialPriorityScore": 75.5,
  "governanceScore": 95.0,
  "riskLevel": "low | medium | high | critical",
  "dag": {
    "nodes": [
      {
        "key": "step_1_key",
        "name": "Human-friendly name",
        "type": "agent_call",
        "agentType": "research",
        "dependencies": [],
        "inputTemplate": {},
        "optional": false
      }
    ],
    "edges": [
      { "from": "step_1_key", "to": "step_2_key" }
    ]
  }
}`;

    const userPrompt = `Task Title: "${title}"
User Identity: ${userId}
Profile context: ${candidateSummary}
Additional Custom Context: ${customContext ?? 'None provided'}

Please analyze this request, retrieve relevant context, and output the expanded execution context, metadata parameters, and complete dynamic DAG.`;

    const result = await callLLM(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        temperature: 0.3,
        jsonMode: true,
      }
    );

    try {
      const jsonText = result.content
        .replace(/^```(?:json)?\n?/m, '')
        .replace(/\n?```$/m, '')
        .trim();

      const parsed = JSON.parse(jsonText);

      return {
        title,
        expandedContext: parsed.expandedContext ?? '',
        domain: parsed.domain ?? 'other',
        predictedComplexity: parsed.predictedComplexity ?? 'low',
        estimatedCostUsd: parsed.estimatedCostUsd ?? 0.02,
        initialPriorityScore: parsed.initialPriorityScore ?? 50.0,
        governanceScore: parsed.governanceScore ?? 100.0,
        riskLevel: parsed.riskLevel ?? 'low',
        dag: parsed.dag as DynamicDag,
      };
    } catch (err) {
      log.error({ err, rawResponse: result.content }, 'Orchestration Ingestion: Failed to parse meta-agent response');
      
      // Fallback simple single-step DAG if LLM call fails
      return {
        title,
        expandedContext: `Fallback execution context generated for: ${title}`,
        domain: 'other',
        predictedComplexity: 'low',
        estimatedCostUsd: 0.02,
        initialPriorityScore: 50.0,
        governanceScore: 100.0,
        riskLevel: 'low',
        dag: {
          nodes: [
            {
              key: 'default_action',
              name: `Execute default agent for ${title}`,
              type: 'agent_call',
              agentType: 'research',
              dependencies: [],
            },
          ],
          edges: [],
        },
      };
    }
  }
}
