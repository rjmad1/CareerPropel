/**
 * Indeed job search via Playwright headless browser.
 * Indeed blocks simple axios/fetch requests, so we use a real browser.
 *
 * Requires: playwright (already installed) + chromium
 *   npx playwright install chromium
 */

import { chromium } from 'playwright';

export interface IndeedJob {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  postedAt: string;
  salary?: string;
}

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

/**
 * Search Indeed for jobs matching a query and location.
 * Returns up to `limit` results.
 */
export async function searchIndeed(
  query: string,
  location = 'Remote',
  limit = 20
): Promise<IndeedJob[]> {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      userAgent: USER_AGENT,
      locale: 'en-US',
      viewport: { width: 1280, height: 800 },
      extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' },
    });

    const page = await context.newPage();

    const searchUrl = `https://www.indeed.com/jobs?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}&sort=date`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });

    // Wait for job cards to appear
    await page.waitForSelector('[class*="job_seen_beacon"], [data-jk]', { timeout: 15_000 }).catch(() => null);

    const jobs: IndeedJob[] = await page.evaluate((maxResults: number) => {
      const cards = Array.from(document.querySelectorAll('[data-jk]')).slice(0, maxResults);
      return cards.map((card) => {
        const title = card.querySelector('[class*="jobTitle"] a, h2 a')?.textContent?.trim() ?? '';
        const company = card.querySelector('[class*="companyName"], [data-testid="company-name"]')?.textContent?.trim() ?? '';
        const location = card.querySelector('[class*="companyLocation"], [data-testid="text-location"]')?.textContent?.trim() ?? '';
        const description = card.querySelector('[class*="summary"]')?.textContent?.trim() ?? '';
        const salary = card.querySelector('[class*="salary-snippet"], [id*="salaryOnly"]')?.textContent?.trim();
        const href = (card.querySelector('[data-jk]') as HTMLElement)?.closest('a')?.href ??
          `https://www.indeed.com/viewjob?jk=${card.getAttribute('data-jk')}`;
        const posted = card.querySelector('[class*="date"]')?.textContent?.trim() ?? '';
        return { title, company, location, description, url: href, postedAt: posted, salary };
      }).filter((j) => j.title);
    }, limit);

    return jobs;
  } finally {
    await browser.close();
  }
}

/** Normalize an Indeed job into the common ImportedJob shape. */
export function normalizeIndeed(job: IndeedJob) {
  return {
    source: 'indeed' as const,
    externalId: null,
    title: job.title,
    company: job.company,
    location: job.location,
    description: job.description,
    url: job.url,
    postedAt: job.postedAt,
    salary: job.salary ?? null,
    department: null,
  };
}
