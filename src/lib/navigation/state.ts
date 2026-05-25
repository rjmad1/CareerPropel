/**
 * URL state helpers — typed read/write for query params.
 *
 * URL state is canonical for navigation-critical context.
 * Zustand may mirror it for performance, but the URL wins on reload.
 */

import { ReadonlyURLSearchParams } from 'next/navigation';

// ─── Generic param helpers ────────────────────────────────────────────────────

export function getStringParam(
  params: ReadonlyURLSearchParams | URLSearchParams,
  key: string,
  fallback: string = '',
): string {
  return params.get(key) ?? fallback;
}

export function getNumberParam(
  params: ReadonlyURLSearchParams | URLSearchParams,
  key: string,
  fallback: number = 0,
): number {
  const raw = params.get(key);
  if (raw === null) return fallback;
  const n = Number(raw);
  return isNaN(n) ? fallback : n;
}

export function getBoolParam(
  params: ReadonlyURLSearchParams | URLSearchParams,
  key: string,
  fallback: boolean = false,
): boolean {
  const raw = params.get(key);
  if (raw === null) return fallback;
  return raw === '1' || raw === 'true';
}

export function getArrayParam(
  params: ReadonlyURLSearchParams | URLSearchParams,
  key: string,
): string[] {
  return params.getAll(key);
}

// ─── URL builder ──────────────────────────────────────────────────────────────

export type ParamRecord = Record<string, string | number | boolean | string[] | null | undefined>;

/**
 * Build a URL with typed params merged on top of an optional base.
 * Null / undefined values are dropped.
 */
export function buildUrl(
  pathname: string,
  params: ParamRecord = {},
  baseParams?: ReadonlyURLSearchParams | URLSearchParams,
): string {
  const sp = new URLSearchParams(baseParams?.toString() ?? '');

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      sp.delete(key);
    } else if (Array.isArray(value)) {
      sp.delete(key);
      value.forEach((v) => sp.append(key, v));
    } else {
      const str = String(value);
      if (str === '' || str === 'false' || str === '0') {
        sp.delete(key);
      } else {
        sp.set(key, str);
      }
    }
  }

  const qs = sp.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

// ─── Per-route state schemas ──────────────────────────────────────────────────

/** Jobs page URL state */
export interface JobsUrlState {
  stage: string;       // pipeline stage filter
  sort: string;        // matchScore | date | company
  tab: string;         // overview | timeline | interviews | prep | offers
  job: string;         // selected job id
  page: number;        // pagination (0-indexed)
  q: string;           // search query
  view: string;        // kanban | list
}

export const JOBS_URL_DEFAULTS: JobsUrlState = {
  stage: '',
  sort: 'date',
  tab: 'overview',
  job: '',
  page: 0,
  q: '',
  view: 'kanban',
};

export function parseJobsState(params: ReadonlyURLSearchParams | URLSearchParams): JobsUrlState {
  return {
    stage: getStringParam(params, 'stage'),
    sort:  getStringParam(params, 'sort', JOBS_URL_DEFAULTS.sort),
    tab:   getStringParam(params, 'tab',  JOBS_URL_DEFAULTS.tab),
    job:   getStringParam(params, 'job'),
    page:  getNumberParam(params, 'page', 0),
    q:     getStringParam(params, 'q'),
    view:  getStringParam(params, 'view', JOBS_URL_DEFAULTS.view),
  };
}

/** Interview Prep page URL state */
export interface InterviewPrepUrlState {
  job: string;    // selected job id
  tab: string;    // company | behavioral | technical | system-design | mock | resume
  story: string;  // active STAR story id
  session: string;// active mock session id
}

export const INTERVIEW_PREP_URL_DEFAULTS: InterviewPrepUrlState = {
  job: '',
  tab: 'company',
  story: '',
  session: '',
};

export function parseInterviewPrepState(params: ReadonlyURLSearchParams | URLSearchParams): InterviewPrepUrlState {
  return {
    job:     getStringParam(params, 'job'),
    tab:     getStringParam(params, 'tab',     INTERVIEW_PREP_URL_DEFAULTS.tab),
    story:   getStringParam(params, 'story'),
    session: getStringParam(params, 'session'),
  };
}

/** Analytics page URL state */
export interface AnalyticsUrlState {
  tab: string;       // pipeline | roi | trajectory | market
  timeframe: string; // 7d | 30d | 90d | all
}

export const ANALYTICS_URL_DEFAULTS: AnalyticsUrlState = {
  tab: 'pipeline',
  timeframe: '90d',
};

export function parseAnalyticsState(params: ReadonlyURLSearchParams | URLSearchParams): AnalyticsUrlState {
  return {
    tab:       getStringParam(params, 'tab',       ANALYTICS_URL_DEFAULTS.tab),
    timeframe: getStringParam(params, 'timeframe', ANALYTICS_URL_DEFAULTS.timeframe),
  };
}

/** Resume Lab URL state */
export interface ResumeLabUrlState {
  variant: string;   // active variant id
  doc: string;       // active document id
  compare: boolean;  // compare mode
}

export const RESUME_LAB_URL_DEFAULTS: ResumeLabUrlState = {
  variant: '',
  doc: '',
  compare: false,
};

export function parseResumeLabState(params: ReadonlyURLSearchParams | URLSearchParams): ResumeLabUrlState {
  return {
    variant: getStringParam(params, 'variant'),
    doc:     getStringParam(params, 'doc'),
    compare: getBoolParam(params, 'compare'),
  };
}
