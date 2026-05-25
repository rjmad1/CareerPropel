/**
 * Deep-link reconstruction helpers.
 *
 * Every important screen must be independently reconstructable from its URL alone.
 * This module provides utilities to hydrate route state from URL params
 * and verify that a given URL carries enough information to restore the view.
 */

import {
  parseJobsState,
  parseInterviewPrepState,
  parseAnalyticsState,
  parseResumeLabState,
  JobsUrlState,
  InterviewPrepUrlState,
  AnalyticsUrlState,
  ResumeLabUrlState,
} from './state';

export type DeepLinkRoute =
  | { type: 'jobs'; state: JobsUrlState }
  | { type: 'interview-prep'; state: InterviewPrepUrlState }
  | { type: 'analytics'; state: AnalyticsUrlState }
  | { type: 'resume-lab'; state: ResumeLabUrlState }
  | { type: 'unknown' };

/**
 * Parse the current URL into a typed deep-link state object.
 * Can be called on the server (with a URL object) or client (with location).
 */
export function parseDeepLink(url: URL | string): DeepLinkRoute {
  const u = typeof url === 'string' ? new URL(url, 'http://localhost') : url;
  const { pathname, searchParams } = u;

  if (pathname === '/jobs' || pathname.startsWith('/jobs/')) {
    return { type: 'jobs', state: parseJobsState(searchParams) };
  }
  if (pathname === '/interview-prep' || pathname.startsWith('/interview-prep/')) {
    return { type: 'interview-prep', state: parseInterviewPrepState(searchParams) };
  }
  if (pathname === '/analytics') {
    return { type: 'analytics', state: parseAnalyticsState(searchParams) };
  }
  if (pathname === '/resume-lab') {
    return { type: 'resume-lab', state: parseResumeLabState(searchParams) };
  }
  return { type: 'unknown' };
}

/**
 * Verify that a deep link URL carries the minimum state to reconstruct the view.
 * Returns an array of missing fields (empty = valid).
 */
export function validateDeepLink(url: URL | string): string[] {
  const link = parseDeepLink(url);
  const missing: string[] = [];

  switch (link.type) {
    case 'jobs':
      // Jobs page is valid with no params (shows all jobs in kanban)
      break;
    case 'interview-prep':
      // If tab is set, a job must also be set for the workspace to open
      if (link.state.tab !== 'company' && !link.state.job) {
        missing.push('job');
      }
      break;
    case 'analytics':
      break;
    case 'resume-lab':
      break;
    case 'unknown':
      // Not a deep-linkable route
      break;
  }

  return missing;
}

/**
 * Build a shareable deep-link URL for the current route + params.
 * Strips transient/non-essential params that should not be shared.
 */
export function buildShareableUrl(
  baseUrl: string,
  pathname: string,
  params: URLSearchParams,
): string {
  // Params that are transient and should NOT be in a shared URL
  const transient = new Set(['session', '_rsc', '_next']);
  const filtered = new URLSearchParams();
  params.forEach((value, key) => {
    if (!transient.has(key)) filtered.append(key, value);
  });
  const qs = filtered.toString();
  return `${baseUrl}${pathname}${qs ? `?${qs}` : ''}`;
}
