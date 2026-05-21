/**
 * Competency Mapping & Semantic Tagging Engine
 * 
 * Maps candidate achievements, experiences, and projects to core
 * corporate behavioral competencies with relevance weights.
 */

export type GlobalCompetency = 
  | 'Leadership & Initiative'
  | 'Problem-Solving'
  | 'Teamwork & Collaboration'
  | 'Adaptability'
  | 'Impact & Results'
  | 'Communication';

interface TaggingRule {
  competency: GlobalCompetency;
  keywords: RegExp;
  description: string;
}

const COMPETENCY_RULES: TaggingRule[] = [
  {
    competency: 'Leadership & Initiative',
    keywords: /mentor|lead|led|manage|guided|director|championed|initiative|spearheaded/i,
    description: 'Demonstrated capability to guide teams, set direction, and act proactively.'
  },
  {
    competency: 'Problem-Solving',
    keywords: /solved|debugged|architected|designed|resolved|analyzed|troubleshoot|bottleneck/i,
    description: 'Evaluated complex challenges and delivered robust structural solutions.'
  },
  {
    competency: 'Teamwork & Collaboration',
    keywords: /team|collaborated|partnered|shared|cross-functional|code-review|pair-programmed/i,
    description: 'Worked effectively within internal or external groups to achieve common outcomes.'
  },
  {
    competency: 'Adaptability',
    keywords: /learned|adapted|migrated|refactored|agile|scrum|pivot|flexible/i,
    description: 'Responsive to changes in project requirements, architectures, or timelines.'
  },
  {
    competency: 'Impact & Results',
    keywords: /reduced|saved|grew|increased|optimized|percent|%|speedup|telemetry|revenue|latency/i,
    description: 'Delivered measurable, quantifiable value to business metrics or performance indicators.'
  },
  {
    competency: 'Communication',
    keywords: /presented|documented|wrote|spoke|communicated|client|stakeholder|training/i,
    description: 'Shared technical ideas, specs, or training plans clearly and concisely.'
  }
];

/**
 * Semantically tag accomplishments with corporate competencies
 */
export function tagContentWithCompetencies(
  text: string
): { competency: GlobalCompetency; confidence: number; reason: string }[] {
  const matches: { competency: GlobalCompetency; confidence: number; reason: string }[] = [];

  COMPETENCY_RULES.forEach((rule) => {
    if (rule.keywords.test(text)) {
      // Calculate basic confidence score depending on number of occurrences
      const occurrenceCount = (text.match(new RegExp(rule.keywords, 'gi')) || []).length;
      const confidence = Math.min(0.7 + occurrenceCount * 0.1, 0.98);

      matches.push({
        competency: rule.competency,
        confidence: Math.round(confidence * 100) / 100,
        reason: `Found keyword patterns matching standard indicators for ${rule.competency.toLowerCase()}.`
      });
    }
  });

  // If no patterns match, default to general Problem-Solving competency
  if (matches.length === 0) {
    matches.push({
      competency: 'Problem-Solving',
      confidence: 0.65,
      reason: 'General candidate action item related to technical delivery.'
    });
  }

  return matches.sort((a, b) => b.confidence - a.confidence);
}
