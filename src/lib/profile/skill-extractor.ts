import { SemanticSkill } from '@/types/profile';
import { normalizeEntityName } from './normalizer';

/**
 * Skill Mapping and Extraction Engine
 * 
 * Inspects parsed resume/document text patterns to discover technical skill nodes,
 * estimates experience duration, and classifies current market demand indicators.
 */

const SKILL_CATALOG: Record<string, { category: SemanticSkill['category']; demand: SemanticSkill['marketDemand'] }> = {
  react: { category: 'technical', demand: 'high' },
  typescript: { category: 'technical', demand: 'high' },
  javascript: { category: 'technical', demand: 'high' },
  nextjs: { category: 'technical', demand: 'high' },
  node: { category: 'technical', demand: 'high' },
  postgresql: { category: 'technical', demand: 'medium' },
  graphql: { category: 'technical', demand: 'medium' },
  prisma: { category: 'technical', demand: 'medium' },
  agile: { category: 'domain', demand: 'medium' },
  scrum: { category: 'domain', demand: 'low' },
  mentorship: { category: 'soft', demand: 'medium' },
  leadership: { category: 'soft', demand: 'high' }
};

/**
 * Parses skill nodes out of raw parsed text
 */
export function extractSkillsFromText(text: string): SemanticSkill[] {
  const skills: SemanticSkill[] = [];
  const words = text.split(/\s+/).map((w) => w.replace(/[.,]/g, '').trim().toLowerCase());
  const uniqueWords = Array.from(new Set(words));

  uniqueWords.forEach((word) => {
    const catalogInfo = SKILL_CATALOG[word];
    if (catalogInfo) {
      const standardName = normalizeEntityName(word);
      
      // Prevent duplicate entries
      if (skills.some((s) => s.name === standardName)) return;

      // Estimate years of experience based on standard mock metrics
      const experienceYears = Math.floor(Math.random() * 5) + 1;
      
      // Map proficiency thresholds based on years
      const proficiency: SemanticSkill['proficiency'] = 
        experienceYears >= 5 ? 'expert' :
        experienceYears >= 3 ? 'proficient' :
        experienceYears >= 2 ? 'intermediate' : 'beginner';

      skills.push({
        name: standardName,
        category: catalogInfo.category,
        proficiency,
        yearsOfExperience: experienceYears,
        endorsements: Math.floor(Math.random() * 12) + 2,
        marketDemand: catalogInfo.demand,
        projects: ['Main Portfolio', 'Telemetry Dashboard']
      });
    }
  });

  return skills;
}
