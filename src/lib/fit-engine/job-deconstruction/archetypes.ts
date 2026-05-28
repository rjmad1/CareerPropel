/**
 * Role archetype definitions for job deconstruction.
 * Used in prompts and classification logic.
 */

export const ROLE_ARCHETYPES = `
Archetype definitions:
- BUILDER: Builds new systems, products, or capabilities from scratch. Greenfield work.
- OPERATOR: Runs and maintains existing operations efficiently. Keep the lights on.
- STRATEGIST: Defines direction, strategy, and long-term vision. Thinks in quarters/years.
- MAINTAINER: Sustains and incrementally improves existing systems. Low novelty, high reliability.
- OPTIMIZER: Finds efficiency gains and performance improvements. 2x impact with same resources.
- RESEARCHER: Investigates, experiments, and discovers new approaches. High ambiguity.
- EXECUTOR: Delivers defined outcomes reliably and consistently. Known path, clear targets.
- PROCESS_SCALER: Takes processes from ad-hoc to repeatable at scale. Builds the playbook.
- SYSTEMS_INTEGRATOR: Connects disparate systems and creates coherent platforms.
- CUSTOMER_FACING_TRANSLATOR: Bridges technical and business domains effectively.
- TECHNICAL_LEAD: Guides technical direction and develops teams. Multiplier effect.
- TRANSFORMATION_DRIVER: Leads organizational or technical transformation efforts.

Key insight: Most roles are NOT single archetype — they're a blend. Provide weights across multiple archetypes that sum to 1.0.
`;

/**
 * Map common role patterns to primary archetype hints.
 * These are starting points, not rules — the LLM should override.
 */
export const TITLE_TO_ARCHETYPE_HINTS: Record<string, string[]> = {
  'software engineer':       ['BUILDER', 'EXECUTOR', 'OPTIMIZER'],
  'senior software engineer': ['BUILDER', 'OPTIMIZER', 'TECHNICAL_LEAD'],
  'staff engineer':          ['TECHNICAL_LEAD', 'STRATEGIST', 'SYSTEMS_INTEGRATOR'],
  'principal engineer':      ['STRATEGIST', 'TRANSFORMATION_DRIVER', 'ARCHITECT'],
  'engineering manager':     ['TECHNICAL_LEAD', 'EXECUTOR', 'PROCESS_SCALER'],
  'product manager':         ['CUSTOMER_FACING_TRANSLATOR', 'STRATEGIST', 'EXECUTOR'],
  'data scientist':          ['RESEARCHER', 'BUILDER', 'OPTIMIZER'],
  'designer':                ['BUILDER', 'CUSTOMER_FACING_TRANSLATOR', 'RESEARCHER'],
  'sre':                     ['OPERATOR', 'OPTIMIZER', 'SYSTEMS_INTEGRATOR'],
  'devops':                  ['OPERATOR', 'PROCESS_SCALER', 'BUILDER'],
  'architect':               ['STRATEGIST', 'SYSTEMS_INTEGRATOR', 'TECHNICAL_LEAD'],
  'director':                ['STRATEGIST', 'TRANSFORMATION_DRIVER', 'PROCESS_SCALER'],
  'vp':                      ['STRATEGIST', 'TRANSFORMATION_DRIVER', 'CUSTOMER_FACING_TRANSLATOR'],
  'cto':                     ['STRATEGIST', 'TRANSFORMATION_DRIVER', 'TECHNICAL_LEAD'],
  'analyst':                 ['RESEARCHER', 'OPTIMIZER', 'EXECUTOR'],
};
