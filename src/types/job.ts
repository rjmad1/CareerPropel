/**
 * Job-related types for the Career Operations System
 */

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

export type InterviewStatus =
  | 'not_started'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'passed'
  | 'failed';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Job {
  id: string;
  role: string;
  company: string;
  stage: JobStage;
  matchScore: number; // 0-100
  applicationDate: Date;
  updatedAt: Date;
  interviewStatus: InterviewStatus;
  resumeVersion: string; // e.g., "v2", "company-specific"
  recruiterStatus: 'not_contacted' | 'in_touch' | 'interested' | 'rejected';
  compensationEstimate?: {
    min: number;
    max: number;
    currency: string;
  };
  priority: PriorityLevel;
  aiConfidence: number; // 0-1
  nextAction?: string;
  risks: string[];
  blockers: string[];
  jobUrl?: string;
  companyResearchId?: string; // Reference to research in Profile Intelligence
  notes: string;
  appliedVia: 'direct' | 'recruiter' | 'referral' | 'automated';
  referralContact?: string;
  hiringManagerName?: string;
  recruiterName?: string;
  lastInteractionDate?: Date;
  interviews: Interview[];
}

export interface Interview {
  id: string;
  type: InterviewType;
  scheduledDate?: Date;
  completedDate?: Date;
  interviewer?: string;
  feedback?: string;
  duration?: number; // minutes
  prepMateriels?: string[]; // Links to prep materials
  status: InterviewStatus;
  notes: string;
}

export type InterviewType =
  | 'phone_screen'
  | 'technical'
  | 'system_design'
  | 'behavioral'
  | 'culture_fit'
  | 'case_study'
  | 'presentation';

export interface JobListResponse {
  jobs: Job[];
  total: number;
  hasMore: boolean;
}

/**
 * Configuration for swimlane stages
 */
export const SWIMLANE_STAGES: Record<JobStage, SwimlaneConfig> = {
  sourced: {
    label: 'Sourced',
    description: 'Jobs found and saved',
    color: 'bg-gray-100',
    borderColor: 'border-gray-300',
    icon: '🔍',
    order: 0,
  },
  interested: {
    label: 'Interested',
    description: 'Reviewing job details',
    color: 'bg-blue-100',
    borderColor: 'border-blue-300',
    icon: '👀',
    order: 1,
  },
  resume_tailoring: {
    label: 'Resume Tailoring',
    description: 'Customizing resume',
    color: 'bg-purple-100',
    borderColor: 'border-purple-300',
    icon: '📝',
    order: 2,
  },
  applied: {
    label: 'Applied',
    description: 'Application submitted',
    color: 'bg-green-100',
    borderColor: 'border-green-300',
    icon: '✅',
    order: 3,
  },
  recruiter_screen: {
    label: 'Recruiter Screen',
    description: 'Screening call scheduled',
    color: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    icon: '📞',
    order: 4,
  },
  hiring_manager: {
    label: 'Hiring Manager',
    description: 'Manager round',
    color: 'bg-indigo-100',
    borderColor: 'border-indigo-300',
    icon: '👔',
    order: 5,
  },
  technical_interview: {
    label: 'Technical Interview',
    description: 'Technical assessment',
    color: 'bg-cyan-100',
    borderColor: 'border-cyan-300',
    icon: '💻',
    order: 6,
  },
  system_design: {
    label: 'System Design',
    description: 'Design interview',
    color: 'bg-pink-100',
    borderColor: 'border-pink-300',
    icon: '🏗️',
    order: 7,
  },
  behavioral: {
    label: 'Behavioral',
    description: 'Behavioral round',
    color: 'bg-orange-100',
    borderColor: 'border-orange-300',
    icon: '💬',
    order: 8,
  },
  final_round: {
    label: 'Final Round',
    description: 'Final interview',
    color: 'bg-red-100',
    borderColor: 'border-red-300',
    icon: '🎯',
    order: 9,
  },
  offer: {
    label: 'Offer',
    description: 'Offer received',
    color: 'bg-emerald-100',
    borderColor: 'border-emerald-300',
    icon: '🎉',
    order: 10,
  },
  negotiation: {
    label: 'Negotiation',
    description: 'Negotiating offer',
    color: 'bg-violet-100',
    borderColor: 'border-violet-300',
    icon: '💰',
    order: 11,
  },
  rejected: {
    label: 'Rejected',
    description: 'Not moving forward',
    color: 'bg-slate-100',
    borderColor: 'border-slate-300',
    icon: '❌',
    order: 12,
  },
  archived: {
    label: 'Archived',
    description: 'Closed',
    color: 'bg-gray-200',
    borderColor: 'border-gray-400',
    icon: '📦',
    order: 13,
  },
};

export interface SwimlaneConfig {
  label: string;
  description: string;
  color: string;
  borderColor: string;
  icon: string;
  order: number;
}

/**
 * Get swimlane config for a stage
 */
export function getSwimlaneConfig(stage: JobStage): SwimlaneConfig {
  return SWIMLANE_STAGES[stage];
}

/**
 * Get all swimlane stages sorted by order
 */
export function getAllSwimlaneStages(): [JobStage, SwimlaneConfig][] {
  return Object.entries(SWIMLANE_STAGES)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([stage, config]) => [stage as JobStage, config]);
}

/**
 * Check if a stage transition is valid
 */
export function isValidTransition(
  fromStage: JobStage,
  toStage: JobStage
): boolean {
  const stageOrder: Record<JobStage, number> = Object.fromEntries(
    Object.entries(SWIMLANE_STAGES).map(([stage, config]) => [stage, config.order])
  );

  const fromOrder = stageOrder[fromStage];
  const toOrder = stageOrder[toStage];

  // Can move forward, backward, or to archived
  if (toStage === 'archived') return true;
  if (toStage === 'rejected') return true;

  // Generally can only move forward in pipeline
  return toOrder >= fromOrder;
}
