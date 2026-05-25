/**
 * Unit tests for src/lib/navigation/state.ts
 */

import {
  getStringParam,
  getNumberParam,
  getBoolParam,
  buildUrl,
  parseJobsState,
  parseAnalyticsState,
  parseInterviewPrepState,
  parseResumeLabState,
  JOBS_URL_DEFAULTS,
  ANALYTICS_URL_DEFAULTS,
  INTERVIEW_PREP_URL_DEFAULTS,
} from '@/lib/navigation/state';

function makeParams(entries: Record<string, string>): URLSearchParams {
  return new URLSearchParams(entries);
}

// ─── Generic helpers ──────────────────────────────────────────────────────────

describe('getStringParam', () => {
  it('returns value when present', () => {
    const p = makeParams({ foo: 'bar' });
    expect(getStringParam(p, 'foo')).toBe('bar');
  });

  it('returns fallback when missing', () => {
    const p = makeParams({});
    expect(getStringParam(p, 'missing', 'default')).toBe('default');
  });

  it('returns empty string by default', () => {
    const p = makeParams({});
    expect(getStringParam(p, 'missing')).toBe('');
  });
});

describe('getNumberParam', () => {
  it('parses integer', () => {
    expect(getNumberParam(makeParams({ page: '3' }), 'page')).toBe(3);
  });

  it('returns fallback for NaN', () => {
    expect(getNumberParam(makeParams({ page: 'abc' }), 'page', 0)).toBe(0);
  });

  it('returns fallback when missing', () => {
    expect(getNumberParam(makeParams({}), 'page', 5)).toBe(5);
  });
});

describe('getBoolParam', () => {
  it('returns true for "1"', () => {
    expect(getBoolParam(makeParams({ compare: '1' }), 'compare')).toBe(true);
  });

  it('returns true for "true"', () => {
    expect(getBoolParam(makeParams({ compare: 'true' }), 'compare')).toBe(true);
  });

  it('returns false for "false"', () => {
    expect(getBoolParam(makeParams({ compare: 'false' }), 'compare')).toBe(false);
  });

  it('returns fallback when missing', () => {
    expect(getBoolParam(makeParams({}), 'compare', false)).toBe(false);
  });
});

// ─── buildUrl ─────────────────────────────────────────────────────────────────

describe('buildUrl', () => {
  it('builds simple URL with params', () => {
    expect(buildUrl('/analytics', { tab: 'roi' })).toBe('/analytics?tab=roi');
  });

  it('drops null/undefined values', () => {
    const url = buildUrl('/jobs', { stage: null, sort: undefined, q: 'test' });
    expect(url).toBe('/jobs?q=test');
  });

  it('drops empty string values', () => {
    const url = buildUrl('/jobs', { stage: '' });
    expect(url).toBe('/jobs');
  });

  it('drops false boolean values', () => {
    const url = buildUrl('/resume-lab', { compare: false });
    expect(url).toBe('/resume-lab');
  });

  it('includes true boolean values', () => {
    const url = buildUrl('/resume-lab', { compare: true });
    expect(url).toBe('/resume-lab?compare=true');
  });

  it('merges on top of existing base params', () => {
    const base = makeParams({ stage: 'applied', page: '2' });
    const url = buildUrl('/jobs', { sort: 'matchScore' }, base);
    expect(url).toContain('stage=applied');
    expect(url).toContain('page=2');
    expect(url).toContain('sort=matchScore');
  });

  it('overrides existing base param', () => {
    const base = makeParams({ tab: 'pipeline' });
    const url = buildUrl('/analytics', { tab: 'roi' }, base);
    expect(url).toContain('tab=roi');
    expect(url).not.toMatch(/tab=pipeline/);
  });

  it('returns pathname with no query string when all params dropped', () => {
    expect(buildUrl('/jobs', { stage: null })).toBe('/jobs');
  });
});

// ─── Page state parsers ───────────────────────────────────────────────────────

describe('parseJobsState', () => {
  it('returns defaults for empty params', () => {
    const state = parseJobsState(makeParams({}));
    expect(state.sort).toBe(JOBS_URL_DEFAULTS.sort);
    expect(state.tab).toBe(JOBS_URL_DEFAULTS.tab);
    expect(state.view).toBe(JOBS_URL_DEFAULTS.view);
    expect(state.page).toBe(0);
  });

  it('parses all fields', () => {
    const p = makeParams({ stage: 'applied', sort: 'matchScore', tab: 'timeline', job: 'j1', page: '3', q: 'google', view: 'list' });
    const state = parseJobsState(p);
    expect(state.stage).toBe('applied');
    expect(state.sort).toBe('matchScore');
    expect(state.tab).toBe('timeline');
    expect(state.job).toBe('j1');
    expect(state.page).toBe(3);
    expect(state.q).toBe('google');
    expect(state.view).toBe('list');
  });
});

describe('parseAnalyticsState', () => {
  it('returns defaults for empty params', () => {
    const state = parseAnalyticsState(makeParams({}));
    expect(state.tab).toBe(ANALYTICS_URL_DEFAULTS.tab);
    expect(state.timeframe).toBe(ANALYTICS_URL_DEFAULTS.timeframe);
  });

  it('parses tab and timeframe', () => {
    const state = parseAnalyticsState(makeParams({ tab: 'roi', timeframe: '30d' }));
    expect(state.tab).toBe('roi');
    expect(state.timeframe).toBe('30d');
  });
});

describe('parseInterviewPrepState', () => {
  it('returns defaults for empty params', () => {
    const state = parseInterviewPrepState(makeParams({}));
    expect(state.tab).toBe(INTERVIEW_PREP_URL_DEFAULTS.tab);
    expect(state.job).toBe('');
    expect(state.story).toBe('');
  });

  it('parses job and tab', () => {
    const state = parseInterviewPrepState(makeParams({ job: 'abc', tab: 'behavioral', story: 'st1' }));
    expect(state.job).toBe('abc');
    expect(state.tab).toBe('behavioral');
    expect(state.story).toBe('st1');
  });
});

describe('parseResumeLabState', () => {
  it('returns defaults for empty params', () => {
    const state = parseResumeLabState(makeParams({}));
    expect(state.variant).toBe('');
    expect(state.compare).toBe(false);
  });

  it('parses compare flag', () => {
    const state = parseResumeLabState(makeParams({ compare: '1', variant: 'v2' }));
    expect(state.compare).toBe(true);
    expect(state.variant).toBe('v2');
  });
});
