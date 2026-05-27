/**
 * Job Application Data Types
 * Defines the core Job model and related interfaces
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

export const PIPELINE_STAGES: JobStage[] = [
  'sourced',
  'interested',
  'resume_tailoring',
  'applied',
  'recruiter_screen',
  'hiring_manager',
  'technical_interview',
  'system_design',
  'behavioral',
  'final_round',
  'offer',
  'negotiation',
  'rejected',
  'archived',
];

export interface Job {
  id: string;
  title: string;
  company: string;
  stage: JobStage;
  matchScore: number;
  appliedAt: Date | string | null;
  location?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  priority?: 'low' | 'medium' | 'high' | 'critical' | string;
  description?: string;
  url?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  recruiterPhone?: string;
  recruiterStatus?: string;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId: string;
  tags?: string[];
  aiConfidence?: number;
  resumeVersion?: string;
  risks?: string[];
  blockers?: string[];
  nextAction?: string;
}

export interface JobActivity {
  id: string;
  jobId: string;
  action: string;
  previousStage?: JobStage;
  newStage?: JobStage;
  timestamp: Date | string;
  userId: string;
  details?: Record<string, unknown>;
}

export interface JobFilter {
  company?: string;
  roleType?: string;
  salaryMin?: number;
  salaryMax?: number;
  dateFrom?: Date;
  dateTo?: Date;
  stages?: JobStage[];
  searchText?: string;
}

export interface JobSort {
  field: 'matchScore' | 'appliedAt' | 'salary' | 'company' | 'title';
  direction: 'asc' | 'desc';
}

export interface CreateJobInput {
  title: string;
  company: string;
  location: string;
  description?: string;
  url?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
}

export interface UpdateJobInput {
  title?: string;
  company?: string;
  stage?: JobStage;
  matchScore?: number;
  location?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  recruiterPhone?: string;
  notes?: string;
  tags?: string[];
}

export interface SwimlaneConfig {
  label: string;
  description: string;
  color: string;
  borderColor: string;
  bgColor: string;
  icon?: string;
}

const SWIMLANE_CONFIGS: Record<JobStage, SwimlaneConfig> = {
  sourced:              { label: 'Sourced',             description: 'Jobs you have found',            color: '#6B7280', borderColor: 'border-gray-400',   bgColor: 'bg-gray-50' },
  interested:           { label: 'Interested',          description: 'Jobs you want to pursue',        color: '#3B82F6', borderColor: 'border-blue-400',   bgColor: 'bg-blue-50' },
  resume_tailoring:     { label: 'Resume Tailoring',    description: 'Tailoring resume for role',      color: '#F97316', borderColor: 'border-orange-400', bgColor: 'bg-orange-50' },
  applied:              { label: 'Applied',             description: 'Application submitted',          color: '#22C55E', borderColor: 'border-green-400',  bgColor: 'bg-green-50' },
  recruiter_screen:     { label: 'Recruiter Screen',    description: 'Initial recruiter conversation', color: '#06B6D4', borderColor: 'border-cyan-400',   bgColor: 'bg-cyan-50' },
  hiring_manager:       { label: 'Hiring Manager',      description: 'Hiring manager interview',       color: '#6366F1', borderColor: 'border-indigo-400', bgColor: 'bg-indigo-50' },
  technical_interview:  { label: 'Technical Interview', description: 'Technical assessment',           color: '#A855F7', borderColor: 'border-purple-400', bgColor: 'bg-purple-50' },
  system_design:        { label: 'System Design',       description: 'System design interview',        color: '#8B5CF6', borderColor: 'border-violet-400', bgColor: 'bg-violet-50' },
  behavioral:           { label: 'Behavioral',          description: 'Behavioral interview round',     color: '#06B6D4', borderColor: 'border-cyan-400',   bgColor: 'bg-cyan-50' },
  final_round:          { label: 'Final Round',         description: 'Final interview loop',           color: '#14B8A6', borderColor: 'border-teal-400',   bgColor: 'bg-teal-50' },
  offer:                { label: 'Offer',               description: 'Offer received',                 color: '#EAB308', borderColor: 'border-yellow-400', bgColor: 'bg-yellow-50' },
  negotiation:          { label: 'Negotiation',         description: 'Negotiating terms',              color: '#F59E0B', borderColor: 'border-amber-400',  bgColor: 'bg-amber-50' },
  rejected:             { label: 'Rejected',            description: 'Application rejected',           color: '#EF4444', borderColor: 'border-red-400',    bgColor: 'bg-red-50' },
  archived:             { label: 'Archived',            description: 'Archived jobs',                  color: '#64748B', borderColor: 'border-slate-400',  bgColor: 'bg-slate-50' },
};

export function getSwimlaneConfig(stage: string): SwimlaneConfig {
  return SWIMLANE_CONFIGS[stage as JobStage] ?? SWIMLANE_CONFIGS.sourced;
}

export function getAllSwimlaneStages(): [JobStage, SwimlaneConfig][] {
  return PIPELINE_STAGES.map((stage) => [stage, SWIMLANE_CONFIGS[stage]]);
}

const VALID_TRANSITIONS: Partial<Record<JobStage, JobStage[]>> = {
  sourced:             ['interested', 'archived'],
  interested:          ['resume_tailoring', 'rejected', 'archived'],
  resume_tailoring:    ['applied', 'interested', 'archived'],
  applied:             ['recruiter_screen', 'rejected', 'archived'],
  recruiter_screen:    ['hiring_manager', 'technical_interview', 'rejected', 'archived'],
  hiring_manager:      ['technical_interview', 'behavioral', 'rejected', 'archived'],
  technical_interview: ['system_design', 'behavioral', 'final_round', 'rejected', 'archived'],
  system_design:       ['behavioral', 'final_round', 'rejected', 'archived'],
  behavioral:          ['final_round', 'rejected', 'archived'],
  final_round:         ['offer', 'rejected', 'archived'],
  offer:               ['negotiation', 'rejected'],
  negotiation:         ['offer', 'rejected'],
  rejected:            ['archived'],
  archived:            [],
};

export function isValidTransition(from: JobStage, to: JobStage): boolean {
  const allowed = VALID_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

/**
 * Stage color mappings for UI display
 */
export const STAGE_COLORS: Record<JobStage, { bg: string; text: string; border: string }> = {
  sourced: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  interested: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  resume_tailoring: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  applied: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  recruiter_screen: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-300' },
  hiring_manager: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
  technical_interview: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  system_design: { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-300' },
  behavioral: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-300' },
  final_round: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-300' },
  offer: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  negotiation: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  archived: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
};

/**
 * Stage display labels
 */
export const STAGE_LABELS: Record<JobStage, string> = {
  sourced: 'Sourced',
  interested: 'Interested',
  resume_tailoring: 'Resume Tailoring',
  applied: 'Applied',
  recruiter_screen: 'Recruiter Screen',
  hiring_manager: 'Hiring Manager',
  technical_interview: 'Technical Interview',
  system_design: 'System Design',
  behavioral: 'Behavioral',
  final_round: 'Final Round',
  offer: 'Offer',
  negotiation: 'Negotiation',
  rejected: 'Rejected',
  archived: 'Archived',
};
