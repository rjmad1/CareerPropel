import { ProfileEntity } from '@/types/profile';

/**
 * Profile Entity Normalizer
 * 
 * Standardizes naming conventions, unifies similar concepts
 * (e.g., merging "ReactJS" and "React.js"), and extracts metric parameters.
 */

const SYNONYM_MAP: Record<string, string> = {
  reactjs: 'React',
  'react.js': 'React',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  nextjs: 'Next.js',
  'next.js': 'Next.js',
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  tailwind: 'Tailwind CSS',
  tailwindcss: 'Tailwind CSS',
  node: 'Node.js',
  nodejs: 'Node.js',
  graphql: 'GraphQL',
  prisma: 'Prisma'
};

/**
 * Standardize name concepts
 */
export function normalizeEntityName(name: string): string {
  const clean = name.trim().toLowerCase();
  return SYNONYM_MAP[clean] || name.trim();
}

/**
 * Parse and standardize metric structures from accomplishments/achievements
 */
export function extractMetricsFromText(text: string): { metric: string; value: string | number; unit: string }[] {
  const metrics: { metric: string; value: string | number; unit: string }[] = [];

  // Match pattern like: "reduced latency by 30%" or "grew page speed by 2.4x"
  const percentageRegex = /(\d+(?:\.\d+)?)\s*%/;
  const multiplierRegex = /(\d+(?:\.\d+)?)\s*x\b/i;
  const latencyRegex = /(\d+(?:\.\d+)?)\s*(?:ms|milliseconds|seconds)/i;

  if (percentageRegex.test(text)) {
    const match = text.match(percentageRegex);
    metrics.push({
      metric: 'Optimization',
      value: match ? match[1] : '0',
      unit: '%'
    });
  }

  if (multiplierRegex.test(text)) {
    const match = text.match(multiplierRegex);
    metrics.push({
      metric: 'Speedup',
      value: match ? match[1] : '1',
      unit: 'x'
    });
  }

  if (latencyRegex.test(text)) {
    const match = text.match(latencyRegex);
    metrics.push({
      metric: 'Latency reduction',
      value: match ? match[1] : '0',
      unit: 'ms'
    });
  }

  return metrics;
}

/**
 * Merge duplicates and map relationships
 */
export function mergeDuplicateEntities(entities: ProfileEntity[]): ProfileEntity[] {
  const seenNames = new Set<string>();
  const merged: ProfileEntity[] = [];

  entities.forEach((entity) => {
    if (entity.type === 'skill') {
      const standardName = normalizeEntityName(entity.content);
      if (seenNames.has(standardName.toLowerCase())) {
        return; // skip duplicate skill
      }
      seenNames.add(standardName.toLowerCase());
      merged.push({
        ...entity,
        content: standardName
      });
    } else {
      merged.push(entity);
    }
  });

  return merged;
}
