/**
 * WebSocket Message Types for Real-Time Career Propel
 * Defines all message types exchanged between client and server
 */

// Agent-related types
export type AgentStatus = 'running' | 'waiting' | 'error' | 'completed' | 'idle' | 'paused' | 'failed';

export interface Agent {
  id: string;
  name: string;
  type: 'resume_tailor' | 'job_matching' | 'application' | 'research' | 'interview_prep' | 'networking' | 'follow_up' | 'analytics';
  status: AgentStatus;
  currentTask?: string;
  progress: number; // 0-100
  queueDepth: number;
  lastActivity: Date;
  tokensUsed?: number;
  confidence?: number;
  errorMessage?: string;
}

export interface AgentLog {
  id: string;
  agentId: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, any>;
}

// Job-related real-time types
export interface RealtimeJobUpdate {
  jobId: string;
  stage: string;
  timestamp: Date;
  changeType: 'stage_change' | 'resume_updated' | 'match_score_updated' | 'status_changed';
  changes?: Record<string, unknown>;
  oldValue?: unknown;
  newValue?: unknown;
  agentId?: string;
}

export interface RealtimeJobCreated {
  job: Record<string, unknown>;
}

export interface RealtimeJobDeleted {
  jobId: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  duration?: number; // milliseconds
  actionUrl?: string;
  actionLabel?: string;
}

// WebSocket event types
export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: Date;
  messageId: string;
}

// Specific message types
export interface AgentStatusMessage extends WebSocketMessage<Agent> {
  type: 'agent:status';
}

export interface AgentLogMessage extends WebSocketMessage<AgentLog> {
  type: 'agent:log';
}

export interface JobUpdateMessage extends WebSocketMessage<RealtimeJobUpdate> {
  type: 'job:update';
}

export interface JobCreatedMessage extends WebSocketMessage<RealtimeJobCreated> {
  type: 'job:created';
}

export interface JobDeletedMessage extends WebSocketMessage<RealtimeJobDeleted> {
  type: 'job:deleted';
}

export interface NotificationMessage extends WebSocketMessage<Notification> {
  type: 'notification';
}

export interface ConnectionMessage extends WebSocketMessage<{ status: 'connected' | 'disconnected' }> {
  type: 'connection';
}

export interface BatchUpdateMessage extends WebSocketMessage<{
  updates: Array<RealtimeJobUpdate | AgentStatusMessage | AgentLogMessage>;
  batchId: string;
}> {
  type: 'batch:update';
}

// Union type for all possible messages
export type AnyWebSocketMessage =
  | AgentStatusMessage
  | AgentLogMessage
  | JobUpdateMessage
  | JobCreatedMessage
  | JobDeletedMessage
  | NotificationMessage
  | ConnectionMessage
  | BatchUpdateMessage;

// Client-to-server subscription messages
export interface SubscriptionMessage {
  type: 'subscribe' | 'unsubscribe';
  channels: string[]; // e.g., ['agent:all', 'job:123', 'notifications']
}

// Acknowledgment message
export interface AckMessage extends WebSocketMessage<{ success: boolean }> {
  type: 'ack';
}

// Error message
export interface ErrorMessage extends WebSocketMessage<{ code: string; reason: string }> {
  type: 'error';
}

// Heartbeat for connection keep-alive
export interface HeartbeatMessage extends WebSocketMessage<null> {
  type: 'heartbeat';
}
