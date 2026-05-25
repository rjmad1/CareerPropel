/**
 * Unit tests for src/lib/navigation/breadcrumbs.ts
 */

import {
  buildBreadcrumbs,
  jobDetailBreadcrumbs,
  interviewPrepBreadcrumbs,
} from '../breadcrumbs';
import { ROUTES } from '../routes';

describe('buildBreadcrumbs', () => {
  it('returns single crumb for top-level route', () => {
    const crumbs = buildBreadcrumbs(ROUTES.DASHBOARD);
    expect(crumbs).toHaveLength(1);
    expect(crumbs[0].label).toBe('Dashboard');
    expect(crumbs[0].current).toBe(true);
  });

  it('returns two crumbs for jobs (child of dashboard)', () => {
    const crumbs = buildBreadcrumbs(ROUTES.JOBS);
    expect(crumbs).toHaveLength(2);
    expect(crumbs[0].label).toBe('Dashboard');
    expect(crumbs[0].current).toBe(false);
    expect(crumbs[1].label).toBe('Pipeline');
    expect(crumbs[1].current).toBe(true);
  });

  it('appends entityLabel as last current crumb', () => {
    const crumbs = buildBreadcrumbs(ROUTES.JOBS, { entityLabel: 'Google SWE' });
    const last = crumbs[crumbs.length - 1];
    expect(last.label).toBe('Google SWE');
    expect(last.current).toBe(true);
  });

  it('marks intermediate crumbs as not current', () => {
    const crumbs = buildBreadcrumbs(ROUTES.INTERVIEW_PREP);
    // Dashboard → Interviews → Interview Prep
    const nonCurrentCrumbs = crumbs.slice(0, -1);
    nonCurrentCrumbs.forEach((c) => expect(c.current).toBe(false));
  });

  it('returns extra segments when provided', () => {
    const crumbs = buildBreadcrumbs(ROUTES.JOBS, {
      entityLabel: 'Google SWE',
      extra: [{ label: 'Behavioral' }],
    });
    const labels = crumbs.map((c) => c.label);
    expect(labels).toContain('Google SWE');
    expect(labels).toContain('Behavioral');
    const last = crumbs[crumbs.length - 1];
    expect(last.label).toBe('Behavioral');
    expect(last.current).toBe(true);
  });

  it('handles unknown route gracefully', () => {
    // Should not throw
    expect(() => buildBreadcrumbs('/totally-unknown-route')).not.toThrow();
  });
});

describe('jobDetailBreadcrumbs', () => {
  it('includes Pipeline, Detail segments', () => {
    const crumbs = jobDetailBreadcrumbs('abc123', 'Google SWE');
    const labels = crumbs.map((c) => c.label);
    expect(labels).toContain('Pipeline');
    expect(labels).toContain('Google SWE');
  });

  it('uses fallback label when job title not provided', () => {
    const crumbs = jobDetailBreadcrumbs('abc123');
    const labels = crumbs.map((c) => c.label);
    expect(labels).toContain('Job Detail');
  });
});

describe('interviewPrepBreadcrumbs', () => {
  it('includes Interview Prep segment', () => {
    const crumbs = interviewPrepBreadcrumbs('Google SWE');
    const labels = crumbs.map((c) => c.label);
    expect(labels).toContain('Interview Prep');
    expect(labels).toContain('Google SWE');
  });

  it('includes tab label when tab provided', () => {
    const crumbs = interviewPrepBreadcrumbs('Google SWE', 'behavioral');
    const labels = crumbs.map((c) => c.label);
    expect(labels).toContain('Behavioral Stories');
  });

  it('works without job title', () => {
    expect(() => interviewPrepBreadcrumbs()).not.toThrow();
  });
});
