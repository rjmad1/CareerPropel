import type { AgentType } from '@/lib/agents/prompts/prompts';

export type WorkflowStatus =
  | 'queued' | 'running' | 'waiting_for_approval'
  | 'blocked' | 'failed' | 'completed' | 'cancelled';

export const VALID_WORKFLOW_STATUSES: WorkflowStatus[] = [
  'queued', 'running', 'waiting_for_approval', 'blocked', 'failed', 'completed', 'cancelled',
];

export type StepStatus =
  | 'pending' | 'running' | 'waiting_for_approval'
  | 'completed' | 'failed' | 'skipped';

export type StepType = 'agent_call' | 'approval' | 'condition' | 'notification' | 'delay';

export type ApprovalDecision = 'approved' | 'rejected' | 'modified';

export type ApprovalActionType =
  | 'send_outreach' | 'send_followup' | 'submit_document'
  | 'compensation_comm' | 'networking_comm';

export type ActionPriority = 'urgent' | 'high' | 'medium' | 'low';

// ─── Workflow Definition ──────────────────────────────────────────────────────

export interface WorkflowStepDefinition {
  key: string;
  name: string;
  type: StepType;
  // agent_call
  agentType?: AgentType;
  contextOverrides?: Record<string, unknown>;
  contextFromSteps?: Record<string, string>; // { contextKey: 'stepKey.outputPath' }
  // approval
  approvalActionType?: ApprovalActionType;
  approvalPayloadSource?: string; // 'stepKey.outputPath'
  approvalRationale?: string;
  // condition
  conditionField?: string; // context key to evaluate (truthy/falsy)
  trueBranch?: string;     // stepKey to jump to if true
  falseBranch?: string;    // stepKey to jump to if false
  // notification
  notificationMessage?: string;
  // delay
  delayMs?: number;
  // general
  optional?: boolean;
  description?: string;
}

export interface WorkflowTemplate {
  id: string;              // matches WorkflowDefinition.name
  displayName: string;
  description: string;
  version: number;
  steps: WorkflowStepDefinition[];
  metadata?: {
    category: string;
    estimatedMinutes: number;
    tags: string[];
  };
}

// ─── Execution context ────────────────────────────────────────────────────────

export interface WorkflowContext {
  userId: string;
  candidateId: string;
  jobId?: string;
  companyName?: string;
  jobTitle?: string;
  jobStage?: string;
  // step outputs indexed by step key
  [key: string]: unknown;
}

export interface StepResult {
  success: boolean;
  output?: Record<string, unknown>;
  agentExecutionId?: string;
  approvalRequestId?: string;
  nextStepKey?: string; // for condition steps
  error?: string;
  skipped?: boolean;
}

// ─── Health scoring ───────────────────────────────────────────────────────────

export interface HealthScoreBreakdown {
  recruiterResponsiveness: number;
  interviewProgression: number;
  inactivityPenalty: number;
  matchQuality: number;
  networkingEngagement: number;
  followUpCadence: number;
  overall: number;
}

export interface OpportunityHealthInput {
  jobId: string;
  candidateId: string;
  matchScore: number;
  stage: string;
  daysSinceLastActivity: number;
  hasRecruiterContact: boolean;
  recruiterResponseCount: number;
  interviewCount: number;
  pendingFollowUp: boolean;
  contactCount: number;
  activeWorkflowCount: number;
}

// ─── Opportunity plan ─────────────────────────────────────────────────────────

export interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  priority: ActionPriority;
  actionType: 'run_workflow' | 'run_agent' | 'manual_task';
  workflowTemplateId?: string;
  agentType?: AgentType;
  rationale: string;
  dueInDays?: number;
}

export interface OpportunityPlanResult {
  jobId: string;
  urgencyScore: number;
  readinessScore: number;
  momentumScore: number;
  actions: RecommendedAction[];
  healthBreakdown: HealthScoreBreakdown;
  suggestedWorkflow?: string;
}

// ─── Approval ─────────────────────────────────────────────────────────────────

export interface ApprovalPayload {
  actionType: ApprovalActionType;
  subject?: string;
  body?: string;
  recipientEmail?: string;
  recipientName?: string;
  documentId?: string;
  metadata?: Record<string, unknown>;
}

export interface ApprovalDecisionInput {
  decision: ApprovalDecision;
  note?: string;
  modifiedPayload?: ApprovalPayload;
}

// ─── BullMQ ───────────────────────────────────────────────────────────────────

export interface WorkflowJobData {
  workflowExecutionId: string;
  stepIndex: number;
  userId: string;
  schemaVersion: number;
}

// ─── Create params ────────────────────────────────────────────────────────────

export interface CreateWorkflowParams {
  templateId: string;
  candidateId: string;
  userId: string;
  jobId?: string;
  triggeredBy?: string;
  contextOverrides?: Record<string, unknown>;
}
