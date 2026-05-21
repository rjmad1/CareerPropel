/**
 * Scraping Provider Abstraction Layer & Contracts
 *
 * Implements Phase 2: Decoupled capability contracts allowing the platform
 * to transition seamlessly from CSS-based Playwright scraping to official
 * OAuth APIs (such as LinkedIn Partner APIs) in the future.
 */

export interface ImportedJob {
  source: 'linkedin' | 'indeed' | 'greenhouse';
  externalId: string | null;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  postedAt: string;
  salary: string | null;
  department: string | null;
}

export interface ImportedProfile {
  name: string;
  headline: string;
  location: string;
  about: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    field: string;
    years: string;
  }>;
  skills: string[];
}

export interface ScrapingProvider {
  searchJobs(query: string, location?: string, limit?: number): Promise<ImportedJob[]>;
  importProfile?(profileUrl: string): Promise<ImportedProfile>;
}

/**
 * Helper to check if a global kill switch is enabled for the scraping subsystem.
 */
export function isScrapingDisabled(): boolean {
  return process.env.SCRAPING_GLOBAL_KILL_SWITCH === 'true';
}

/**
 * Asserts that scraping is allowed based on global feature flags and kill switch.
 */
export function assertScrapingAllowed(providerName: 'linkedin' | 'indeed'): void {
  if (isScrapingDisabled()) {
    throw new Error('The job scraping subsystem has been disabled globally by administrators.');
  }

  if (providerName === 'linkedin' && process.env.LINKEDIN_SCRAPING_ENABLED !== 'true') {
    throw new Error('LinkedIn scraping is currently disabled via feature flags.');
  }

  if (providerName === 'indeed' && process.env.INDEED_SCRAPING_ENABLED !== 'true') {
    throw new Error('Indeed scraping is currently disabled via feature flags.');
  }
}
