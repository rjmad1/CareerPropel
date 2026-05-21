/**
 * LinkedIn job search via Playwright.
 *
 * ⚠️  RASUI-008 RISK NOTICE:
 * LinkedIn's Terms of Service (Section 8.2) prohibit automated scraping of their
 * platform without explicit written permission.
 *
 * This feature is Feature-Flagged and controlled via Centralized Governance.
 */

import { log } from '@/lib/logging/logger';
import { assertScrapingAllowed, ImportedJob } from './provider';

// ── Browser pool ──────────────────────────────────────────────────────────────

// Maximum concurrent Chromium instances to prevent OOM crashes.
const MAX_CONCURRENT_BROWSERS = 2;
let activeBrowserCount = 0;

async function acquireBrowserSlot(): Promise<void> {
  if (activeBrowserCount >= MAX_CONCURRENT_BROWSERS) {
    throw new Error(
      `LinkedIn scraping browser pool exhausted (max ${MAX_CONCURRENT_BROWSERS} concurrent browsers). ` +
      'Try again later.'
    );
  }
  activeBrowserCount++;
}

function releaseBrowserSlot(): void {
  activeBrowserCount = Math.max(0, activeBrowserCount - 1);
}

// ── Selector health check ─────────────────────────────────────────────────────

function assertSelectorsHealthy(
  results: unknown[],
  selectorName: string,
  pageUrl: string
): void {
  if (results.length === 0) {
    log.error(
      { selectorName, pageUrl },
      '[LinkedIn Scraper] CSS selector returned empty results — LinkedIn DOM may have changed.'
    );
    throw new Error(
      `LinkedIn scraper: selector "${selectorName}" returned no results on ${pageUrl}. ` +
      'LinkedIn DOM may have changed. Update CSS selectors or migrate to LinkedIn API.'
    );
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LinkedInJob {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  postedAt: string;
  employmentType?: string;
  seniorityLevel?: string;
}

export interface LinkedInProfile {
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

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ── Public functions ──────────────────────────────────────────────────────────

/**
 * Search LinkedIn public job listings.
 */
export async function searchLinkedInJobs(
  keywords: string,
  location = 'United States',
  limit = 20
): Promise<LinkedInJob[]> {
  assertScrapingAllowed('linkedin');
  await acquireBrowserSlot();

  // Dynamic import to avoid Playwright being loaded when scraping is disabled
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });

  log.info({ keywords, location, limit }, '[LinkedIn Scraper] Starting job search');

  try {
    const context = await browser.newContext({
      userAgent: USER_AGENT,
      locale: 'en-US',
      viewport: { width: 1440, height: 900 },
    });

    const page = await context.newPage();
    const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}&sortBy=DD`;

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });

    // Dismiss cookie banner if present
    await page.locator('button:has-text("Accept")').click({ timeout: 3_000 }).catch(() => null);

    await page.waitForSelector('.jobs-search__results-list li, [data-occludable-job-id]', {
      timeout: 15_000,
    }).catch(() => null);

    const jobs: LinkedInJob[] = await page.evaluate((maxResults: number) => {
      const cards = Array.from(
        document.querySelectorAll('.jobs-search__results-list li, [data-occludable-job-id]')
      ).slice(0, maxResults);

      return cards.map((card) => {
        const title = card.querySelector('.base-search-card__title, h3')?.textContent?.trim() ?? '';
        const company = card.querySelector('.base-search-card__subtitle a, h4')?.textContent?.trim() ?? '';
        const location = card.querySelector('.job-search-card__location, [class*="location"]')?.textContent?.trim() ?? '';
        const posted = card.querySelector('time')?.getAttribute('datetime') ??
          card.querySelector('[class*="listdate"]')?.textContent?.trim() ?? '';
        const link = (card.querySelector('a.base-card__full-link, a[href*="/jobs/view/"]') as HTMLAnchorElement)?.href ?? '';
        return { title, company, location, description: '', url: link, postedAt: posted };
      }).filter((j) => j.title && j.url);
    }, limit);

    // Selector health check — surface DOM changes immediately
    assertSelectorsHealthy(jobs, '.jobs-search__results-list', url);

    // Fetch description for first 5 to avoid rate limiting
    for (let i = 0; i < Math.min(5, jobs.length); i++) {
      try {
        await page.goto(jobs[i].url, { waitUntil: 'domcontentloaded', timeout: 20_000 });
        const desc = await page
          .locator('.description__text, .show-more-less-html__markup')
          .first()
          .textContent({ timeout: 5_000 })
          .catch(() => '');
        jobs[i].description = desc?.trim() ?? '';
        const empType = await page.locator('[class*="employment-type"] span').textContent({ timeout: 3_000 }).catch(() => '');
        jobs[i].employmentType = empType?.trim();
      } catch {
        // skip if individual job page fails
      }
    }

    log.info({ jobCount: jobs.length }, '[LinkedIn Scraper] Job search completed');
    return jobs;
  } finally {
    await browser.close();
    releaseBrowserSlot();
  }
}

/**
 * Import a LinkedIn public profile by URL.
 */
export async function importLinkedInProfile(profileUrl: string): Promise<LinkedInProfile> {
  assertScrapingAllowed('linkedin');
  await acquireBrowserSlot();

  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });

  log.info({ profileUrl }, '[LinkedIn Scraper] Starting profile import');

  try {
    const context = await browser.newContext({
      userAgent: USER_AGENT,
      locale: 'en-US',
      viewport: { width: 1440, height: 900 },
    });

    const page = await context.newPage();
    await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });

    // Dismiss sign-in modal if it appears
    await page.locator('[data-tracking-control-name="public_jobs_nav-header-signin"]').click({ timeout: 3_000 }).catch(() => null);
    await page.locator('button[aria-label="Dismiss"]').click({ timeout: 3_000 }).catch(() => null);

    const profile = await page.evaluate((): LinkedInProfile => {
      const text = (sel: string) =>
        document.querySelector(sel)?.textContent?.trim() ?? '';

      const name = text('h1.top-card-layout__title, h1[class*="name"]');
      const headline = text('.top-card-layout__headline, [class*="headline"]');
      const location = text('.top-card__subline-item, [class*="location"]');
      const about = text('.core-section-container__content p, section[id="about"] p');

      const experience = Array.from(
        document.querySelectorAll('section[id*="experience"] li, .experience-section li')
      ).map((el) => ({
        title: el.querySelector('h3, .t-bold')?.textContent?.trim() ?? '',
        company: el.querySelector('h4, .t-14')?.textContent?.trim() ?? '',
        duration: el.querySelector('.date-range, [class*="date"]')?.textContent?.trim() ?? '',
        description: el.querySelector('p, .pv-entity__description')?.textContent?.trim() ?? '',
      })).filter((e) => e.title);

      const education = Array.from(
        document.querySelectorAll('section[id*="education"] li, .education-section li')
      ).map((el) => ({
        school: el.querySelector('h3, .pv-entity__school-name')?.textContent?.trim() ?? '',
        degree: el.querySelector('.pv-entity__degree-name span:last-child')?.textContent?.trim() ?? '',
        field: el.querySelector('.pv-entity__fos span:last-child')?.textContent?.trim() ?? '',
        years: el.querySelector('.pv-entity__dates span:last-child')?.textContent?.trim() ?? '',
      })).filter((e) => e.school);

      const skills = Array.from(
        document.querySelectorAll('.pv-skill-category-entity__name span, [class*="skill"] span')
      ).map((el) => el.textContent?.trim() ?? '').filter(Boolean).slice(0, 30);

      return { name, headline, location, about, experience, education, skills };
    });

    // Selector health check for profile name
    if (!profile.name) {
      log.warn({ profileUrl }, '[LinkedIn Scraper] Profile name not extracted — DOM may have changed or profile is private');
    }

    log.info('[LinkedIn Scraper] Profile import completed');
    return profile;
  } finally {
    await browser.close();
    releaseBrowserSlot();
  }
}

/** Normalize a LinkedIn job into the common ImportedJob shape. */
export function normalizeLinkedIn(job: LinkedInJob): ImportedJob {
  return {
    source: 'linkedin',
    externalId: null,
    title: job.title,
    company: job.company,
    location: job.location,
    description: job.description,
    url: job.url,
    postedAt: job.postedAt,
    salary: null,
    department: null,
  };
}
