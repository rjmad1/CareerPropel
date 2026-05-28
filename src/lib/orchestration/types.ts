/**
 * TypeScript definitions for the Autonomous Multi-Agent Orchestration Engine.
 * Decoupled and reusable across next-generation workflows.
 */

import { WorkflowStatus } from '@prisma/client';

export interface DynamicDagNode {
  key: string;
  name: string;
  type: 'agent_call' | 'approval' | 'condition' | 'notification' | 'delay';
  agentType?: string;
  dependencies: string[]; // stepKeys this step depends on
  inputTemplate?: Record<string, unknown>;
  approvalActionType?: string;
  approvalRationale?: string;
  conditionField?: string;
  trueBranch?: string;
  falseBranch?: string;
  notificationMessage?: string;
  delayMs?: number;
  optional?: boolean;
}

export interface DynamicDag {
  nodes: DynamicDagNode[];
  edges: Array<{ from: string; to: string }>;
}

export interface IngestionResult {
  title: string;
  expandedContext: string;
  domain: 'codebase' | 'profile' | 'research' | 'interview' | 'other';
  predictedComplexity: 'low' | 'medium' | 'high';
  estimatedCostUsd: number;
  initialPriorityScore: number;
  governanceScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  dag: DynamicDag;
}

export interface ExecutionState {
  workflowExecutionId: string;
  status: WorkflowStatus;
  currentStepIndex: number;
  progress: number;
  totalCostUsd: number;
  completedSteps: Set<string>;
}
