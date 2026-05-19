/**
 * Greenhouse public job board API
 * No auth needed — each company exposes jobs at:
 *   https://boards.greenhouse.io/v1/boards/{board_token}/jobs
 *
 * Usage: searchGreenhouse('stripe', 'software engineer')
 */

import axios from 'axios';

export interface GreenhouseJob {
  id: number;
  title: string;
  location: { name: string };
  content: string; // HTML job description
  updated_at: string;
  absolute_url: string;
  departments?: Array<{ name: string }>;
  offices?: Array<{ name: string }>;
}

interface GreenhouseResponse {
  jobs: GreenhouseJob[];
  meta?: { total: number };
}

/**
 * Fetch all open jobs from a company's Greenhouse board.
 * @param boardToken — the company's Greenhouse board token (e.g. "stripe", "airbnb")
 */
export async function fetchGreenhouseJobs(boardToken: string): Promise<GreenhouseJob[]> {
  const url = `https://boards.greenhouse.io/v1/boards/${boardToken}/jobs`;
  const { data } = await axios.get<GreenhouseResponse>(url, {
    params: { content: true },
    timeout: 15_000,
  });
  return data.jobs ?? [];
}

/**
 * Search Greenhouse jobs for a given board token and keyword.
 * Filters client-side since the public API doesn't support search.
 */
export async function searchGreenhouse(
  boardToken: string,
  keyword: string,
  limit = 20
): Promise<GreenhouseJob[]> {
  const all = await fetchGreenhouseJobs(boardToken);
  const q = keyword.toLowerCase();
  return all
    .filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.content.toLowerCase().includes(q)
    )
    .slice(0, limit);
}

/** Normalize a Greenhouse job into the common ImportedJob shape. */
export function normalizeGreenhouse(job: GreenhouseJob, company: string) {
  return {
    source: 'greenhouse' as const,
    externalId: String(job.id),
    title: job.title,
    company,
    location: job.location?.name ?? '',
    description: job.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    url: job.absolute_url,
    postedAt: job.updated_at,
    department: job.departments?.[0]?.name ?? null,
  };
}
