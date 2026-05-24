/**
 * stageTriggerMap
 *
 * Defines which agent (if any) fires automatically when a job card moves
 * into a given pipeline stage.  `null` means no automatic trigger.
 */

import { JobStage } from '@/types/job';
import { AgentType } from './prompts';

export const STAGE_TRIGGER_MAP: Record<JobStage, AgentType | null> = {
  sourced:               null,
  interested:            'job-match',      // score alignment before you decide to apply
  resume_tailoring:      'resume-tailor',  // auto-tailor resume to job description
  applied:               null,
  recruiter_screen:      'research',       // company intel before the call
  hiring_manager:        'research',       // deeper research for HM screen
  technical_interview:   'interview-prep', // generate technical prep kit
  system_design:         'interview-prep', // generate system-design prep
  behavioral:            'interview-prep', // generate behavioural STAR stories
  final_round:           'interview-prep', // final-round comprehensive prep
  offer:                 null,
  negotiation:           null,
  rejected:              null,
  archived:              null,
};

export function getAgentForStage(stage: JobStage): AgentType | null {
  return STAGE_TRIGGER_MAP[stage] ?? null;
}
