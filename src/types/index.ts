// Core Domain Types

export interface Candidate {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  stage: JobStage;
  description: string;
  url?: string;
  appliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type JobStage =
  | 'sourced'
  | 'interested'
  | 'resume_tailoring'
  | 'applied'
  | 'recruiter_screen'
  | 'hiring_manager'
  | 'technical_interview'
  | 'system_design'
  | 'behavioral'
  | 'final_round'
  | 'offer'
  | 'negotiation'
  | 'rejected'
  | 'archived';

export interface AgentStatus {
  agentId: string;
  name: string;
  state: 'idle' | 'running' | 'waiting' | 'error';
  queueDepth: number;
  lastActivity: Date;
  confidence: number;
}

export interface InterviewFeedback {
  id: string;
  jobId: string;
  type: 'behavioral' | 'technical' | 'system_design' | 'other';
  selfRating: number;
  notes: string;
  timestamp: Date;
}
