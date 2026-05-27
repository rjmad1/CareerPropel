/**
 * Agent Execution and Monitoring Types
 *
 * Data structures for tracking agent status, tool execution,
 * and real-time operational visibility.
 */

/**
 * Agent execution record - tracks individual agent runs
 */
export interface AgentExecution {
  id: string;
  userId: string;
  agentType: AgentType;

  status: 'queued' | 'running' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  tokenCount?: number;
  durationMs?: number;

  progress: number; // 0-100
  output?: Record<string, any>;
  errorMessage?: string;

  toolCalls: ToolCall[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Agent types in the system
 */
export type AgentType =
  | 'resume-tailor'
  | 'job-match'
  | 'application'
  | 'research'
  | 'interview-prep'
  | 'networking'
  | 'follow-up'
  | 'analytics';

/**
 * Tool invocation within an agent execution
 */
export interface ToolCall {
  id: string;
  executionId: string;
  toolName: string;

  status: 'pending' | 'running' | 'success' | 'failed';
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;

  startedAt: Date;
  completedAt?: Date;
  duration?: number; // milliseconds

  tokens?: number;
  metadata?: Record<string, any>;
}

/**
 * Event log entry from agent execution
 */
export interface EventLog {
  id: string;
  executionId: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  data?: Record<string, any>;
  timestamp: Date;
}

/**
 * Agent configuration
 */
export interface AgentConfig {
  type: AgentType;
  name: string;
  description: string;
  icon: string; // emoji or icon name
  color: string; // hex or CSS color
  timeout: number; // milliseconds
  retryPolicy: {
    maxAttempts: number;
    backoffMultiplier: number;
    initialDelay: number; // milliseconds
  };
  queueDepth: number;
}

/**
 * Real-time agent status (WebSocket update)
 */
export interface AgentStatus {
  id: AgentType;
  name: string;
  status: 'idle' | 'running' | 'waiting' | 'error';
  progress: number; // 0-100
  currentTask?: string;
  eta?: number; // seconds
  queueDepth: number;
  lastActivity: Date;
  tokensUsed: number;
  confidence: number; // 0-1
  lastError?: string;
  uptime?: number; // milliseconds since last restart
}

/**
 * Agent performance metrics
 */
export interface AgentMetrics {
  type: AgentType;
  totalExecutions: number;
  successCount: number;
  failureCount: number;
  averageDuration: number; // milliseconds
  successRate: number; // 0-1
  averageTokensUsed: number;
  currentQueueDepth: number;
  lastRun?: Date;
}

/**
 * Agent execution timeline event
 */
export interface ExecutionTimelineEvent {
  type: 'started' | 'tool_executed' | 'progress_update' | 'completed' | 'failed' | 'paused' | 'resumed';
  timestamp: Date;
  agent: AgentType;
  jobId?: string;
  data: Record<string, any>;
}

/**
 * Execution summary
 */
export interface ExecutionSummary {
  executionId: string;
  agentType: AgentType;
  status: 'completed' | 'failed';
  duration: number; // milliseconds
  tokensUsed: number;
  toolsCalled: number;
  successfulTools: number;
  failedTools: number;
  errorMessage?: string;
  output?: Record<string, any>;
}

/**
 * Agent runtime state — used by AgentRail and real-time status views.
 * Mirrors the execution-level status surfaced through the queue worker.
 */
export type AgentRuntimeStatus = 'running' | 'waiting' | 'error' | 'completed' | 'idle' | 'paused' | 'failed';

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentRuntimeStatus;
  currentTask?: string;
  progress: number; // 0-100
  queueDepth: number;
  lastActivity: Date;
  tokensUsed?: number;
  confidence?: number;
  errorMessage?: string;
}

/**
 * Per-execution log line emitted by an agent worker.
 */
export interface AgentLog {
  id: string;
  agentId: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, any>;
}

/** Generic real-time message shape (SSE/WebSocket agnostic) */
export interface AnyWebSocketMessage {
  type: string;
  data?: unknown;
  [key: string]: unknown;
}
