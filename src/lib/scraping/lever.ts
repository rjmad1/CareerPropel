/**
 * Lever public job board API
 * No auth needed — each company exposes jobs at:
 *   https://api.lever.co/v0/postings/{company}
 *
 * Usage: searchLever('spotify', 'software engineer')
 */

import axios from 'axios';
import { ImportedJob } from './provider';

export interface LeverJob {
  id: string;
  text: string; // Job Title
  createdAt: number; // Timestamp
  description: string; // HTML description intro
  descriptionPlain: string; // Plaintext description intro
  lists?: Array<{
    text: string; // List Title (e.g. "What You'll Do")
    content: string; // HTML list items <li>...</li>
  }>;
  additional?: string; // HTML additional info
  additionalPlain?: string; // Plaintext additional info
  categories?: {
    commitment?: string;
    department?: string;
    location?: string;
    team?: string;
  };
  hostedUrl: string;
  applyUrl: string;
}

/**
 * Fetch all open jobs from a company's Lever board.
 * @param company — the company's Lever board handle (e.g. "spotify")
 */
export async function fetchLeverJobs(company: string): Promise<LeverJob[]> {
  const url = `https://api.lever.co/v0/postings/${company}?mode=json`;
  const { data } = await axios.get<LeverJob[]>(url, {
    timeout: 15_000,
  });
  return data ?? [];
}

/**
 * Search Lever jobs for a given company and keyword.
 * Filters client-side since the public API doesn't support search.
 */
export async function searchLever(
  company: string,
  keyword: string,
  limit = 20
): Promise<LeverJob[]> {
  const all = await fetchLeverJobs(company);
  const q = keyword.toLowerCase();
  return all
    .filter(
      (j) =>
        j.text.toLowerCase().includes(q) ||
        (j.descriptionPlain && j.descriptionPlain.toLowerCase().includes(q)) ||
        (j.categories?.department && j.categories.department.toLowerCase().includes(q)) ||
        (j.categories?.team && j.categories.team.toLowerCase().includes(q))
    )
    .slice(0, limit);
}

/** Normalize a Lever job into the common ImportedJob shape. */
export function normalizeLever(job: LeverJob, company: string): ImportedJob {
  // Combine all parts of the job description to get a full plaintext version
  const htmlContent = [
    job.description ?? '',
    ...(job.lists ?? []).map((l) => `<h3>${l.text ?? ''}</h3>${l.content ?? ''}`),
    job.additional ?? '',
  ].join('\n');

  const descriptionCleaned = htmlContent
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    source: 'lever',
    externalId: job.id,
    title: job.text,
    company,
    location: job.categories?.location ?? '',
    description: descriptionCleaned,
    url: job.hostedUrl,
    postedAt: job.createdAt ? new Date(job.createdAt).toISOString() : new Date().toISOString(),
    salary: null, // Public API doesn't provide structured salary
    department: job.categories?.department ?? job.categories?.team ?? null,
  };
}
