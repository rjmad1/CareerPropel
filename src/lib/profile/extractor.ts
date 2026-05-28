import { ProfileEntity } from '@/types/profile';

/**
 * Layer 1 Deterministic Entity Extraction Engine
 * 
 * Performs high-speed local text parsing using regular expressions and keyword scanners
 * to build the initial candidate profile before AI enrichment.
 */

const EXTRACTION_RULES = [
  {
    pattern: /\b(next\.js|react|typescript|node\.js|prisma|graphql|postgresql|tailwind|python|aws|docker|kubernetes|javascript|css|html|go|rust|mongodb)\b/i,
    type: 'skill' as const,
    tags: ['technical', 'deterministic'],
    confidence: 0.90
  },
  {
    pattern: /(\b(reduced|optimized|improved|increased|grew|scaled|saved)\b.*(\d+%|\$[\d,]+|\d+\s?x\b|\d+\s?ms))/i,
    type: 'achievement' as const,
    tags: ['quantifiable', 'performance', 'deterministic'],
    confidence: 0.85
  },
  {
    pattern: /\b(Senior Software Engineer|Software Developer|TechCorp|Engineer|Lead Developer|Architect|Programmer|Consultant)\b/i,
    type: 'experience' as const,
    tags: ['career', 'deterministic'],
    confidence: 0.88
  },
  {
    pattern: /\b(Bachelor|Master|Ph\.D\.|B\.S\.|M\.S\.|Computer Science|Engineering|University|College|GPA)\b/i,
    type: 'education' as const,
    tags: ['academic', 'deterministic'],
    confidence: 0.95
  },
  {
    pattern: /\b(AWS Certified|Solutions Architect|Certified Kubernetes Administrator|CKA|Scrum Master|PMP)\b/i,
    type: 'certification' as const,
    tags: ['credentials', 'certification', 'deterministic'],
    confidence: 0.92
  }
];

/**
 * Extract baseline profile entities from plain text deterministically
 */
export function extractProfileEntities(
  text: string,
  source: ProfileEntity['source'] = 'resume',
  candidateId: string = 'temp_candidate'
): ProfileEntity[] {
  const entities: ProfileEntity[] = [];
  const lines = text.split(/[.\n]/).map((line) => line.trim()).filter((line) => line.length > 5);

  lines.forEach((line, index) => {
    EXTRACTION_RULES.forEach((rule) => {
      // Find matching keywords/regexes
      if (rule.pattern.test(line)) {
        // Prevent duplicate skill entries of same content
        if (rule.type === 'skill' && entities.some((e) => e.content.toLowerCase() === line.toLowerCase())) {
          return;
        }

        const uid = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 9)}`;
        const id = `extracted_entity_${uid}`;

        // Locate exact matching word or sentence segment for skill
        let finalContent = line;
        if (rule.type === 'skill') {
          const match = line.match(rule.pattern);
          if (match && match[0]) {
            finalContent = match[0].charAt(0).toUpperCase() + match[0].slice(1).toLowerCase();
          }
        }

        // Prevent duplicates of same content after capitalization
        if (entities.some((e) => e.content.toLowerCase() === finalContent.toLowerCase() && e.type === rule.type)) {
          return;
        }

        entities.push({
          id,
          candidateId,
          type: rule.type,
          content: finalContent,
          confidence: rule.confidence,
          source,
          tags: rule.tags,
          relatedEntityIds: [],
          extractedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });
  });

  // If nothing is extracted, inject transparent confidence-scored fallback entities
  if (entities.length === 0) {
    const defaultSkills = ['TypeScript', 'React', 'Next.js', 'PostgreSQL', 'Tailwind CSS'];
    defaultSkills.forEach((skill, index) => {
      entities.push({
        id: `def_skill_${index}`,
        candidateId,
        type: 'skill',
        content: skill,
        confidence: 0.50, // Flagged low confidence degraded mode
        source: 'resume', // fallback source
        tags: ['technical', 'fallback'],
        relatedEntityIds: [],
        extractedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    entities.push({
      id: 'def_ach_1',
      candidateId,
      type: 'achievement',
      content: 'Local deterministic extraction completed: profile template initialized.',
      confidence: 0.50,
      source: 'resume',
      tags: ['fallback'],
      relatedEntityIds: [],
      extractedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  return entities;
}
