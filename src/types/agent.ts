/**
 * Agent Types for CareerPropel Real-Time System
 * Types for agents, their status, and operations
 */

export type AgentType =
  | 'resume_tailor'
  | 'job_matching'
  | 'application'
  | 'research'
  | 'interview_prep'
  | 'networking'
  | 'follow_up'
  | 'analytics';

export type AgentStatus = 'idle' | 'running' | 'waiting' | 'completed' | 'error';

export interface AgentConfig {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  icon: string;
}

export interface AgentState {
  id: string;
  status: AgentStatus;
  currentTask?: string;
  progress: number; // 0-100
  queueDepth: number;
  lastActivity: Date;
  tokensUsed?: number;
  confidence?: number;
  errorMessage?: string;
  completedTasks?: number;
  failedTasks?: number;
}

export interface AgentMetrics {
  agentId: string;
  successRate: number; // 0-100
  averageProcessingTime: number; // milliseconds
  totalTasksCompleted: number;
  totalTasksFailed: number;
  lastRunTime: Date;
}

export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  resume_tailor: {
    id: 'agent-resume-tailor',
    name: 'Resume Tailor',
    type: 'resume_tailor',
    description: 'Customizes resume for each job application',
    icon: '📄',
  },
  job_matching: {
    id: 'agent-job-matching',
    name: 'Job Matcher',
    type: 'job_matching',
    description: 'Scores and ranks job opportunities',
    icon: '🎯',
  },
  application: {
    id: 'agent-application',
    name: 'Application',
    type: 'application',
    description: 'Submits job applications automatically',
    icon: '✉️',
  },
  research: {
    id: 'agent-research',
    name: 'Researcher',
    type: 'research',
    description: 'Gathers company and role information',
    icon: '🔍',
  },
  interview_prep: {
    id: 'agent-interview-prep',
    name: 'Interview Prep',
    type: 'interview_prep',
    description: 'Generates interview questions and tips',
    icon: '💬',
  },
  networking: {
    id: 'agent-networking',
    name: 'Networking',
    type: 'networking',
    description: 'Identifies and tracks referral contacts',
    icon: '🤝',
  },
  follow_up: {
    id: 'agent-follow-up',
    name: 'Follow-up',
    type: 'follow_up',
    description: 'Manages application follow-ups',
    icon: '📞',
  },
  analytics: {
    id: 'agent-analytics',
    name: 'Analytics',
    type: 'analytics',
    description: 'Analyzes application performance',
    icon: '📊',
  },
};

export function getAgentConfig(type: AgentType): AgentConfig {
  return AGENT_CONFIGS[type];
}

export function getAgentColor(status: AgentStatus): string {
  switch (status) {
    case 'idle':
      return '#9CA3AF'; // gray
    case 'running':
      return '#3B82F6'; // blue
    case 'waiting':
      return '#F59E0B'; // amber
    case 'completed':
      return '#10B981'; // green
    case 'error':
      return '#EF4444'; // red
    default:
      return '#6B7280'; // default gray
  }
}

export function getAgentStatusLabel(status: AgentStatus): string {
  switch (status) {
    case 'idle':
      return 'Idle';
    case 'running':
      return 'Running';
    case 'waiting':
      return 'Waiting';
    case 'completed':
      return 'Completed';
    case 'error':
      return 'Error';
    default:
      return 'Unknown';
  }
}
