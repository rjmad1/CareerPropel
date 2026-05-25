/**
 * Unit tests for src/lib/navigation/routes.ts
 */

import { ROUTES, ROUTE_METADATA, resolveRouteKey, routeRequiresAuth } from '../routes';

describe('ROUTES constants', () => {
  it('has a DASHBOARD route', () => {
    expect(ROUTES.DASHBOARD).toBe('/dashboard');
  });

  it('builds dynamic job route', () => {
    expect(ROUTES.JOB_DETAIL('abc123')).toBe('/jobs/abc123');
  });

  it('builds dynamic interview prep route', () => {
    expect(ROUTES.INTERVIEW_PREP_JOB('xyz')).toBe('/interview-prep/xyz');
  });

  it('builds dynamic offer route', () => {
    expect(ROUTES.OFFER_DETAIL('o1')).toBe('/offers/o1');
  });
});

describe('ROUTE_METADATA', () => {
  it('has metadata for dashboard', () => {
    expect(ROUTE_METADATA[ROUTES.DASHBOARD]).toMatchObject({
      label: 'Dashboard',
      requiresAuth: true,
      inSidebar: true,
    });
  });

  it('marks login as not requiring auth', () => {
    expect(ROUTE_METADATA[ROUTES.LOGIN].requiresAuth).toBe(false);
  });

  it('marks jobs as requiring auth', () => {
    expect(ROUTE_METADATA[ROUTES.JOBS].requiresAuth).toBe(true);
  });

  it('login has no sidebar entry', () => {
    expect(ROUTE_METADATA[ROUTES.LOGIN].inSidebar).toBe(false);
  });
});

describe('resolveRouteKey', () => {
  it('returns exact match for static route', () => {
    expect(resolveRouteKey('/dashboard')).toBe('/dashboard');
  });

  it('returns parent for dynamic segment /jobs/abc123', () => {
    expect(resolveRouteKey('/jobs/abc123')).toBe('/jobs');
  });

  it('returns parent for nested /settings/security', () => {
    expect(resolveRouteKey('/settings/security')).toBe('/settings/security');
  });

  it('falls back to dashboard for unknown route', () => {
    expect(resolveRouteKey('/completely-unknown-route')).toBe('/dashboard');
  });

  it('resolves /profile/accomplishments exactly', () => {
    expect(resolveRouteKey('/profile/accomplishments')).toBe('/profile/accomplishments');
  });
});

describe('routeRequiresAuth', () => {
  it('returns false for /login', () => {
    expect(routeRequiresAuth('/login')).toBe(false);
  });

  it('returns true for /dashboard', () => {
    expect(routeRequiresAuth('/dashboard')).toBe(true);
  });

  it('returns true for dynamic job route', () => {
    expect(routeRequiresAuth('/jobs/abc123')).toBe(true);
  });
});
