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
  matchScore: number; // 0-100
  appliedAt: Date | string;
  location: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  description?: string;
  url?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  recruiterPhone?: string;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId: string;
  tags?: string[];
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
