/**
 * Canonical route registry for CareerPropel.
 *
 * ALL route construction MUST go through this file.
 * Never build path strings inline in components.
 */

// ─── Route constants ──────────────────────────────────────────────────────────

export const ROUTES = {
  // Root
  HOME: '/',

  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  ONBOARDING: '/onboarding',

  // Core app
  DASHBOARD: '/dashboard',
  JOBS: '/jobs',
  JOB_DETAIL: (jobId: string) => `/jobs/${jobId}` as const,
  JOB_SEARCH: '/job-search',
  NETWORKING: '/networking',
  INTERVIEWS: '/interviews',
  INTERVIEW_DETAIL: (id: string) => `/interviews/${id}` as const,
  INTERVIEW_PREP: '/interview-prep',
  INTERVIEW_PREP_JOB: (jobId: string) => `/interview-prep/${jobId}` as const,
  OFFERS: '/offers',
  OFFER_DETAIL: (id: string) => `/offers/${id}` as const,
  DOCUMENTS: '/documents',
  DOCUMENT_DETAIL: (id: string) => `/documents/${id}` as const,
  RESUME_LAB: '/resume-lab',
  EMAILS: '/emails',
  CALENDAR: '/calendar',
  ANALYTICS: '/analytics',
  PROFILE: '/profile',
  PROFILE_ACCOMPLISHMENTS: '/profile/accomplishments',
  PROFILE_APPRAISALS: '/profile/appraisals',

  // Settings
  SETTINGS: {
    ACCOUNT: '/settings/account',
    SECURITY: '/settings/security',
    INTEGRATIONS: '/settings/integrations',
    AI_PROVIDERS: '/settings/ai-providers',
  },

  // Admin / ops
  AUDIT_LOGS: '/audit-logs',
  API_KEYS: '/api-keys',
} as const;

// ─── Route metadata ───────────────────────────────────────────────────────────

export interface RouteMetadata {
  /** Human-readable title used in breadcrumbs + page headers */
  label: string;
  /** Parent route for breadcrumb chain (null = top-level) */
  parent: string | null;
  /** Whether this route requires authentication */
  requiresAuth: boolean;
  /** Whether this route appears in the main sidebar nav */
  inSidebar: boolean;
}

export const ROUTE_METADATA: Record<string, RouteMetadata> = {
  [ROUTES.HOME]:                     { label: 'Home',          parent: null,               requiresAuth: false, inSidebar: false },
  [ROUTES.LOGIN]:                    { label: 'Sign In',       parent: null,               requiresAuth: false, inSidebar: false },
  [ROUTES.REGISTER]:                 { label: 'Register',      parent: null,               requiresAuth: false, inSidebar: false },
  [ROUTES.ONBOARDING]:               { label: 'Onboarding',    parent: null,               requiresAuth: true,  inSidebar: false },
  [ROUTES.DASHBOARD]:                { label: 'Dashboard',     parent: null,               requiresAuth: true,  inSidebar: true  },
  [ROUTES.JOBS]:                     { label: 'Pipeline',      parent: ROUTES.DASHBOARD,   requiresAuth: true,  inSidebar: true  },
  [ROUTES.JOB_SEARCH]:               { label: 'Job Search',    parent: ROUTES.JOBS,        requiresAuth: true,  inSidebar: true  },
  [ROUTES.NETWORKING]:               { label: 'Networking',    parent: ROUTES.DASHBOARD,   requiresAuth: true,  inSidebar: true  },
  [ROUTES.INTERVIEW_PREP]:           { label: 'Interview Prep',parent: ROUTES.INTERVIEWS,  requiresAuth: true,  inSidebar: true  },
  [ROUTES.INTERVIEWS]:               { label: 'Interviews',    parent: ROUTES.DASHBOARD,   requiresAuth: true,  inSidebar: true  },
  [ROUTES.OFFERS]:                   { label: 'Offers',        parent: ROUTES.DASHBOARD,   requiresAuth: true,  inSidebar: true  },
  [ROUTES.DOCUMENTS]:                { label: 'Documents',     parent: ROUTES.DASHBOARD,   requiresAuth: true,  inSidebar: true  },
  [ROUTES.RESUME_LAB]:               { label: 'Resume Lab',    parent: ROUTES.DOCUMENTS,   requiresAuth: true,  inSidebar: true  },
  [ROUTES.EMAILS]:                   { label: 'Emails',        parent: ROUTES.DASHBOARD,   requiresAuth: true,  inSidebar: true  },
  [ROUTES.PROFILE]:                  { label: 'Profile',       parent: ROUTES.DASHBOARD,   requiresAuth: true,  inSidebar: true  },
  [ROUTES.PROFILE_ACCOMPLISHMENTS]:  { label: 'Accomplishments',parent: ROUTES.PROFILE,    requiresAuth: true,  inSidebar: false },
  [ROUTES.CALENDAR]:                 { label: 'Calendar',      parent: ROUTES.DASHBOARD,   requiresAuth: true,  inSidebar: true  },
  [ROUTES.ANALYTICS]:                { label: 'Analytics',     parent: ROUTES.DASHBOARD,   requiresAuth: true,  inSidebar: true  },
  [ROUTES.AUDIT_LOGS]:               { label: 'Audit Logs',    parent: ROUTES.SETTINGS.ACCOUNT, requiresAuth: true, inSidebar: true },
  [ROUTES.API_KEYS]:                 { label: 'API Keys',      parent: ROUTES.SETTINGS.ACCOUNT, requiresAuth: true, inSidebar: true },
  [ROUTES.SETTINGS.ACCOUNT]:        { label: 'Account',        parent: ROUTES.DASHBOARD,   requiresAuth: true,  inSidebar: true  },
  [ROUTES.SETTINGS.SECURITY]:       { label: 'Security',       parent: ROUTES.SETTINGS.ACCOUNT, requiresAuth: true, inSidebar: true },
  [ROUTES.SETTINGS.INTEGRATIONS]:   { label: 'Integrations',   parent: ROUTES.SETTINGS.ACCOUNT, requiresAuth: true, inSidebar: true },
  [ROUTES.SETTINGS.AI_PROVIDERS]:   { label: 'AI Providers',   parent: ROUTES.SETTINGS.ACCOUNT, requiresAuth: true, inSidebar: true },
};

// ─── Route matchers ───────────────────────────────────────────────────────────

/**
 * Resolve the closest static route key for a given pathname.
 * Dynamic segments (e.g. /jobs/abc123) are normalised to their parent.
 */
export function resolveRouteKey(pathname: string): string {
  // Exact match first
  if (ROUTE_METADATA[pathname]) return pathname;

  // Try progressively stripping the last segment until we find a match.
  // Skip '/' — it's a redirect target, not a navigable app route.
  const segments = pathname.split('/').filter(Boolean);
  while (segments.length > 0) {
    segments.pop();
    const candidate = '/' + segments.join('/');
    if (candidate !== '/' && ROUTE_METADATA[candidate]) return candidate;
  }

  return ROUTES.DASHBOARD;
}

/**
 * Return true if the given route requires authentication.
 */
export function routeRequiresAuth(pathname: string): boolean {
  const key = resolveRouteKey(pathname);
  return ROUTE_METADATA[key]?.requiresAuth ?? true;
}
