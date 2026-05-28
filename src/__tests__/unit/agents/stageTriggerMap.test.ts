/**
 * Unit tests for stageTriggerMap
 *
 * Pure-function coverage — no I/O, no mocks.
 */

import { getAgentForStage, STAGE_TRIGGER_MAP } from '@/lib/agents/orchestration/stageTriggerMap';
import { PIPELINE_STAGES, JobStage } from '@/types/job';

describe('STAGE_TRIGGER_MAP', () => {
  test('covers every value in PIPELINE_STAGES', () => {
    for (const stage of PIPELINE_STAGES) {
      expect(STAGE_TRIGGER_MAP).toHaveProperty(stage);
    }
  });

  test('has no extra keys beyond PIPELINE_STAGES', () => {
    const mapKeys = Object.keys(STAGE_TRIGGER_MAP) as JobStage[];
    expect(mapKeys.sort()).toEqual([...PIPELINE_STAGES].sort());
  });
});

describe('getAgentForStage', () => {
  // Stages that should trigger a specific agent
  const expectedTriggers: [JobStage, string][] = [
    ['interested',          'job-match'],
    ['resume_tailoring',    'resume-tailor'],
    ['recruiter_screen',    'research'],
    ['hiring_manager',      'research'],
    ['technical_interview', 'interview-prep'],
    ['system_design',       'interview-prep'],
    ['behavioral',          'interview-prep'],
    ['final_round',         'interview-prep'],
  ];

  test.each(expectedTriggers)(
    'stage "%s" triggers agent "%s"',
    (stage, expectedAgent) => {
      expect(getAgentForStage(stage)).toBe(expectedAgent);
    },
  );

  // Stages that should NOT trigger any agent
  const noTriggerStages: JobStage[] = [
    'sourced',
    'applied',
    'offer',
    'negotiation',
    'rejected',
    'archived',
  ];

  test.each(noTriggerStages)(
    'stage "%s" returns null (no auto-trigger)',
    (stage) => {
      expect(getAgentForStage(stage)).toBeNull();
    },
  );

  test('returns null for an unknown stage gracefully', () => {
    // Cast to bypass TS so runtime fallback is exercised
    expect(getAgentForStage('unknown_stage' as JobStage)).toBeNull();
  });
});
