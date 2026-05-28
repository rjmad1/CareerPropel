export type SpanType = 'AGENT' | 'TOOL' | 'LLM' | 'PIPELINE' | 'CHAIN';
export type TelemetryStatus = 'SUCCESS' | 'FAILURE' | 'RUNNING' | 'PENDING';

export interface TelemetryMetadata {
  projectName: string;
  tenantId: string;
  environment: 'development' | 'staging' | 'production';
  executorId?: string;
  sessionTags?: string[];
  [key: string]: unknown;
}

export interface GenerationDetails {
  spanId: string;
  modelName: string;
  modelProvider: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number; // Approximate USD cost
  temperature?: number;
  latencyMs: number;
}

export interface Span {
  id: string;
  parentId?: string | null;
  traceId: string;
  name: string;
  type: SpanType;
  status: TelemetryStatus;
  input: string;
  output: string;
  errorMessage?: string;
  startTime: string; // ISO String
  endTime?: string;  // ISO String
  durationMs: number;
  cost: number;
  agentName?: string;
  metadata?: Record<string, unknown>;
  generation?: GenerationDetails;
}

export interface Trace {
  id: string;
  name: string;
  projectName: string;
  tenantId: string;
  environment: 'development' | 'staging' | 'production';
  status: TelemetryStatus;
  totalTokens: number;
  totalCost: number;
  durationMs: number;
  startTime: string; // ISO String
  endTime?: string;  // ISO String
  spansCount: number;
  metadata: TelemetryMetadata;
  rootSpan?: Span;
}

// Workflow Visualization Types
export interface WorkflowNode {
  id: string;
  label: string;
  type: 'agent' | 'tool' | 'orchestrator' | 'gateway';
  status: TelemetryStatus;
  durationMs: number;
  cost: number;
  agentName?: string;
  avatarUrl?: string;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: 'default' | 'error' | 'conditional';
  label?: string;
}

export interface WorkflowDAG {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface AgentMetric {
  agentName: string;
  executionCount: number;
  successRate: number;
  avgLatencyMs: number;
  totalCost: number;
  totalTokens: number;
}

export interface AuditLog {
  id: string;
  traceId?: string;
  timestamp: string;
  userId: string;
  action: string;
  details: string;
  piiScrubbedFields: string[];
}

export interface PluginWidget {
  id: string;
  name: string;
  version: string;
  description?: string;
  enabled: boolean;
  onRender: (container: HTMLElement, data: unknown) => void;
  onDestroy?: () => void;
}
