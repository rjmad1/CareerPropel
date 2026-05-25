/**
 * Unit tests for src/lib/navigation/deep-link.ts
 */

import { parseDeepLink, validateDeepLink, buildShareableUrl } from '../deep-link';

describe('parseDeepLink', () => {
  it('parses jobs URL', () => {
    const result = parseDeepLink('http://localhost/jobs?stage=applied&sort=matchScore&job=abc');
    expect(result.type).toBe('jobs');
    if (result.type === 'jobs') {
      expect(result.state.stage).toBe('applied');
      expect(result.state.sort).toBe('matchScore');
      expect(result.state.job).toBe('abc');
    }
  });

  it('parses interview-prep URL', () => {
    const result = parseDeepLink('http://localhost/interview-prep?job=xyz&tab=behavioral');
    expect(result.type).toBe('interview-prep');
    if (result.type === 'interview-prep') {
      expect(result.state.job).toBe('xyz');
      expect(result.state.tab).toBe('behavioral');
    }
  });

  it('parses analytics URL', () => {
    const result = parseDeepLink('http://localhost/analytics?tab=roi&timeframe=30d');
    expect(result.type).toBe('analytics');
    if (result.type === 'analytics') {
      expect(result.state.tab).toBe('roi');
      expect(result.state.timeframe).toBe('30d');
    }
  });

  it('parses resume-lab URL', () => {
    const result = parseDeepLink('http://localhost/resume-lab?variant=v1&compare=1');
    expect(result.type).toBe('resume-lab');
    if (result.type === 'resume-lab') {
      expect(result.state.variant).toBe('v1');
      expect(result.state.compare).toBe(true);
    }
  });

  it('returns unknown for unrecognized route', () => {
    const result = parseDeepLink('http://localhost/dashboard');
    expect(result.type).toBe('unknown');
  });

  it('accepts URL object', () => {
    const url = new URL('http://localhost/analytics?tab=market');
    const result = parseDeepLink(url);
    expect(result.type).toBe('analytics');
  });

  it('handles /jobs/abc123 subpath', () => {
    const result = parseDeepLink('http://localhost/jobs/abc123');
    expect(result.type).toBe('jobs');
  });
});

describe('validateDeepLink', () => {
  it('returns empty array for valid jobs URL', () => {
    expect(validateDeepLink('http://localhost/jobs')).toHaveLength(0);
  });

  it('returns empty array for jobs with filters', () => {
    expect(validateDeepLink('http://localhost/jobs?stage=applied')).toHaveLength(0);
  });

  it('returns empty array for interview-prep with just job (default tab)', () => {
    expect(validateDeepLink('http://localhost/interview-prep?job=abc')).toHaveLength(0);
  });

  it('returns missing field when non-default tab set without job', () => {
    const missing = validateDeepLink('http://localhost/interview-prep?tab=behavioral');
    expect(missing).toContain('job');
  });

  it('returns empty for valid interview-prep with job + tab', () => {
    expect(validateDeepLink('http://localhost/interview-prep?job=abc&tab=behavioral')).toHaveLength(0);
  });
});

describe('buildShareableUrl', () => {
  it('strips transient params', () => {
    const params = new URLSearchParams({ tab: 'roi', session: 'sess1', _rsc: 'abc' });
    const url = buildShareableUrl('https://app.example.com', '/analytics', params);
    expect(url).toContain('tab=roi');
    expect(url).not.toContain('session=');
    expect(url).not.toContain('_rsc=');
  });

  it('returns clean URL when no non-transient params', () => {
    const params = new URLSearchParams({ session: 'sess1' });
    const url = buildShareableUrl('https://app.example.com', '/interview-prep', params);
    expect(url).toBe('https://app.example.com/interview-prep');
  });

  it('builds correct URL with base + pathname + query', () => {
    const params = new URLSearchParams({ stage: 'applied' });
    const url = buildShareableUrl('https://app.example.com', '/jobs', params);
    expect(url).toBe('https://app.example.com/jobs?stage=applied');
  });
});
