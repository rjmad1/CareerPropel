/**
 * Ashby public job board API
 * No auth needed — each company exposes jobs at:
 *   https://api.ashbyhq.com/posting-api/job-board/{company}
 *
 * Usage: searchAshby('sentry', 'software engineer')
 */

import axios from 'axios';
import { ImportedJob } from './provider';

export interface AshbyJob {
  id: string;
  title: string;
  department?: string;
  team?: string;
  employmentType?: string;
  location: string;
  publishedAt: string;
  jobUrl: string;
  applyUrl: string;
  descriptionHtml?: string;
  descriptionPlain?: string;
}

interface AshbyResponse {
  jobs: AshbyJob[];
  apiVersion?: string;
}

/**
 * Fetch all open jobs from a company's Ashby board.
 * @param company — the company's Ashby board handle (e.g. "sentry")
 */
export async function fetchAshbyJobs(company: string): Promise<AshbyJob[]> {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${company}`;
  const { data } = await axios.get<AshbyResponse>(url, {
    timeout: 15_000,
  });
  return data.jobs ?? [];
}

/**
 * Search Ashby jobs for a given company and keyword.
 * Filters client-side since the public API doesn't support search.
 */
export async function searchAshby(
  company: string,
  keyword: string,
  limit = 20
): Promise<AshbyJob[]> {
  const all = await fetchAshbyJobs(company);
  const q = keyword.toLowerCase();
  return all
    .filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        (j.descriptionPlain && j.descriptionPlain.toLowerCase().includes(q)) ||
        (j.descriptionHtml && j.descriptionHtml.toLowerCase().includes(q)) ||
        (j.department && j.department.toLowerCase().includes(q)) ||
        (j.team && j.team.toLowerCase().includes(q))
    )
    .slice(0, limit);
}

/** Normalize an Ashby job into the common ImportedJob shape. */
export function normalizeAshby(job: AshbyJob, company: string): ImportedJob {
  const descriptionCleaned = job.descriptionPlain
    ? job.descriptionPlain.trim()
    : job.descriptionHtml
    ? job.descriptionHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    : '';

  return {
    source: 'ashby',
    externalId: job.id,
    title: job.title,
    company,
    location: job.location ?? '',
    description: descriptionCleaned,
    url: job.jobUrl,
    postedAt: job.publishedAt ?? new Date().toISOString(),
    salary: null, // Public API doesn't provide structured salary
    department: job.department ?? job.team ?? null,
  };
}
