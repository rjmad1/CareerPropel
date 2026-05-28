import { Trace, Span, WorkflowDAG, AgentMetric, AuditLog, TelemetryStatus } from '../telemetry-sdk/types';

// Helper to generate a random ID
const uuid = () => Math.random().toString(36).substring(2, 11);

/** Internal extension that carries pre-computed span list alongside a Trace. */
interface TraceWithSpans extends Trace {
  _spans?: Span[];
}

// Standard mock data store
const MOCK_AGENTS = ['Support-Agent', 'Requirement-Agent', 'Repo-Explorer', 'Code-Optimizer', 'Deployer-Agent'];
const MOCK_MODELS = ['gemini-1.5-pro', 'gemini-1.5-flash', 'claude-3-5-sonnet', 'gpt-4o'];

export class TelemetryApiClient {
  private static subscribers: Set<(event: { type: string; payload: unknown }) => void> = new Set();
  private static simulationInterval: NodeJS.Timeout | null = null;
  private static traces: TraceWithSpans[] = [];

  constructor() {
    if (TelemetryApiClient.traces.length === 0) {
      TelemetryApiClient.generateInitialMockData();
    }
  }

  private static generateInitialMockData() {
    const environments = ['production', 'staging', 'development'] as const;
    const projectNames = ['CareerPropel-JobAuto', 'Resume-Scrubber-Worker', 'Interview-Feedback-Loop'];

    for (let i = 0; i < 24; i++) {
      const traceId = `tr-${uuid()}`;
      const projectName = projectNames[i % projectNames.length];
      const env = environments[i % environments.length];
      const isSuccess = Math.random() > 0.15;
      const status: TelemetryStatus = isSuccess ? 'SUCCESS' : 'FAILURE';

      const durationMs = 2000 + Math.floor(Math.random() * 8000);
      const totalTokens = 3000 + Math.floor(Math.random() * 25000);
      const totalCost = Number((totalTokens * 0.000015).toFixed(4));

      const startTime = new Date(Date.now() - i * 3600 * 1000).toISOString();
      const endTime = new Date(new Date(startTime).getTime() + durationMs).toISOString();

      // Setup Spans
      const spans: Span[] = [
        {
          id: `sp-root-${uuid()}`,
          traceId,
          name: `${projectName} Main Pipeline`,
          type: 'PIPELINE',
          status,
          input: JSON.stringify({ query: 'Execute pipeline optimization' }),
          output: isSuccess ? JSON.stringify({ success: true, processedItems: 8 }) : 'Failed to reach step 3: Timeout',
          startTime,
          endTime,
          durationMs,
          cost: totalCost,
        }
      ];

      // Add sub-spans (agents & tools)
      const numSpans = 2 + Math.floor(Math.random() * 4);
      let cumulativeMs = 0;
      for (let j = 0; j < numSpans; j++) {
        const spanId = `sp-sub-${uuid()}`;
        const agentName = MOCK_AGENTS[j % MOCK_AGENTS.length];
        const spanDur = Math.floor(durationMs / numSpans);
        const subCost = Number((totalCost / numSpans).toFixed(4));
        const subTokens = Math.floor(totalTokens / numSpans);

        spans.push({
          id: spanId,
          parentId: spans[0].id,
          traceId,
          name: `Execution Frame: ${agentName}`,
          type: 'AGENT',
          status: isSuccess || j < numSpans - 1 ? 'SUCCESS' : 'FAILURE',
          input: JSON.stringify({ step: j, role: agentName }),
          output: JSON.stringify({ success: true, message: `Completed node ${j}` }),
          startTime: new Date(new Date(startTime).getTime() + cumulativeMs).toISOString(),
          endTime: new Date(new Date(startTime).getTime() + cumulativeMs + spanDur).toISOString(),
          durationMs: spanDur,
          cost: subCost,
          agentName,
          generation: {
            spanId,
            modelName: MOCK_MODELS[j % MOCK_MODELS.length],
            modelProvider: j % 2 === 0 ? 'Google' : 'Anthropic',
            promptTokens: Math.floor(subTokens * 0.4),
            completionTokens: Math.floor(subTokens * 0.6),
            totalTokens: subTokens,
            cost: subCost,
            latencyMs: spanDur,
          }
        });
        cumulativeMs += spanDur;
      }

      const rootSpan = spans[0];
      TelemetryApiClient.traces.push({
        id: traceId,
        name: `${projectName} Orchestration`,
        projectName,
        tenantId: 'tenant-enterprise-ops',
        environment: env,
        status,
        totalTokens,
        totalCost,
        durationMs,
        startTime,
        endTime,
        spansCount: spans.length,
        metadata: {
          projectName,
          tenantId: 'tenant-enterprise-ops',
          environment: env,
          executorId: 'usr-admin-1',
          sessionTags: ['auto-apply', 'gpt-flow'],
        },
        rootSpan,
      });

      // Keep reference to individual spans if queried
      TelemetryApiClient.traces[TelemetryApiClient.traces.length - 1]._spans = spans;
    }
  }

  async getTraces(filters?: { status?: string; environment?: string; projectName?: string }): Promise<Trace[]> {
    let list = [...TelemetryApiClient.traces];
    if (filters) {
      if (filters.status) list = list.filter(t => t.status === filters.status);
      if (filters.environment) list = list.filter(t => t.environment === filters.environment);
      if (filters.projectName) list = list.filter(t => t.projectName === filters.projectName);
    }
    // Return ordered newest first
    return list.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }

  async getTraceDetails(traceId: string): Promise<{ trace: Trace; spans: Span[] } | null> {
    const trace = TelemetryApiClient.traces.find(t => t.id === traceId);
    if (!trace) return null;
    return {
      trace,
      spans: (trace as TraceWithSpans)._spans || [],
    };
  }

  async getWorkflowGraph(traceId: string): Promise<WorkflowDAG> {
    const details = await this.getTraceDetails(traceId);
    if (!details) {
      return { nodes: [], edges: [] };
    }

    const nodes = details.spans.map(s => ({
      id: s.id,
      label: s.name.replace('Execution Frame: ', ''),
      type: (s.type === 'PIPELINE' ? 'orchestrator' : 'agent') as 'orchestrator' | 'agent',
      status: s.status,
      durationMs: s.durationMs,
      cost: s.cost,
      agentName: s.agentName,
    }));

    const edges = details.spans
      .filter(s => s.parentId)
      .map(s => ({
        id: `ed-${s.parentId}-${s.id}`,
        source: s.parentId!,
        target: s.id,
      }));

    return { nodes, edges };
  }

  async getAgentMetrics(): Promise<AgentMetric[]> {
    const counts: Record<string, { count: number; success: number; latency: number; cost: number; tokens: number }> = {};
    
    TelemetryApiClient.traces.forEach(t => {
      const spans = (t as TraceWithSpans)._spans || [];
      spans.forEach(s => {
        if (s.agentName) {
          if (!counts[s.agentName]) {
            counts[s.agentName] = { count: 0, success: 0, latency: 0, cost: 0, tokens: 0 };
          }
          const item = counts[s.agentName];
          item.count++;
          if (s.status === 'SUCCESS') item.success++;
          item.latency += s.durationMs;
          item.cost += s.cost;
          item.tokens += s.generation?.totalTokens || 0;
        }
      });
    });

    return Object.entries(counts).map(([agentName, data]) => ({
      agentName,
      executionCount: data.count,
      successRate: Math.round((data.success / data.count) * 100),
      avgLatencyMs: Math.round(data.latency / data.count),
      totalCost: Number(data.cost.toFixed(4)),
      totalTokens: data.tokens,
    }));
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return [
      {
        id: 'aud-1',
        timestamp: new Date().toISOString(),
        userId: 'usr-admin-1',
        action: 'PII_REDACTION',
        details: 'Scrubbed social security numbers and candidate phone details from Trace: tr-72a19b',
        piiScrubbedFields: ['candidate_phone', 'ssn'],
      },
      {
        id: 'aud-2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        userId: 'usr-admin-1',
        action: 'POLICY_APPLIED',
        details: 'Enforced 30-day retention policies on logs in Sandbox scope.',
        piiScrubbedFields: [],
      }
    ];
  }

  // Real-time updates subscription
  subscribeToRealTimeEvents(callback: (event: { type: string; payload: unknown }) => void) {
    TelemetryApiClient.subscribers.add(callback);
    
    // Start active mock stream simulator if not already running
    if (!TelemetryApiClient.simulationInterval) {
      TelemetryApiClient.startMockTelemetryStream();
    }

    return () => {
      TelemetryApiClient.subscribers.delete(callback);
      if (TelemetryApiClient.subscribers.size === 0 && TelemetryApiClient.simulationInterval) {
        clearInterval(TelemetryApiClient.simulationInterval);
        TelemetryApiClient.simulationInterval = null;
      }
    };
  }

  private static startMockTelemetryStream() {
    TelemetryApiClient.simulationInterval = setInterval(() => {
      const activeAgent = MOCK_AGENTS[Math.floor(Math.random() * MOCK_AGENTS.length)];
      const activeModel = MOCK_MODELS[Math.floor(Math.random() * MOCK_MODELS.length)];
      const tokCount = 500 + Math.floor(Math.random() * 4500);
      const isSuccess = Math.random() > 0.1;
      
      const eventPayload = {
        traceId: `tr-live-${uuid()}`,
        spanId: `sp-live-${uuid()}`,
        agentName: activeAgent,
        modelName: activeModel,
        tokens: tokCount,
        cost: Number((tokCount * 0.000015).toFixed(5)),
        latencyMs: 1200 + Math.floor(Math.random() * 2000),
        status: (isSuccess ? 'SUCCESS' : 'FAILURE') as TelemetryStatus,
        timestamp: new Date().toISOString(),
      };

      // Push to in-memory store so it appears in history lists
      const mockTrace: Trace = {
        id: eventPayload.traceId,
        name: `Live: ${activeAgent} Task Execution`,
        projectName: 'CareerPropel-JobAuto',
        tenantId: 'tenant-enterprise-ops',
        environment: 'production',
        status: eventPayload.status,
        totalTokens: eventPayload.tokens,
        totalCost: eventPayload.cost,
        durationMs: eventPayload.latencyMs,
        startTime: eventPayload.timestamp,
        endTime: new Date(Date.now() + eventPayload.latencyMs).toISOString(),
        spansCount: 1,
        metadata: {
          projectName: 'CareerPropel-JobAuto',
          tenantId: 'tenant-enterprise-ops',
          environment: 'production',
        },
        rootSpan: {
          id: eventPayload.spanId,
          traceId: eventPayload.traceId,
          name: `Live: ${activeAgent}`,
          type: 'AGENT',
          status: eventPayload.status,
          input: '{"command": "streaming_update"}',
          output: isSuccess ? '{"status": "delivered"}' : '{"status": "failed"}',
          startTime: eventPayload.timestamp,
          durationMs: eventPayload.latencyMs,
          cost: eventPayload.cost,
          agentName: activeAgent,
        }
      };

      // Add to front of history list
      TelemetryApiClient.traces.unshift(mockTrace);
      if (TelemetryApiClient.traces.length > 50) {
        TelemetryApiClient.traces.pop(); // Cap history length to avoid memory leaks
      }

      // Notify subscribers
      TelemetryApiClient.subscribers.forEach(sub => {
        sub({ type: 'TELEMETRY_STREAM', payload: eventPayload });
      });
    }, 3500);
  }
}
