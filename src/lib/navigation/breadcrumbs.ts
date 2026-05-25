/**
 * Breadcrumb generation from centralized route metadata.
 *
 * Breadcrumbs reflect the user's mental model of where they are,
 * not the internal folder structure of the application.
 *
 * Bad:  Dashboard > CareerOS > Agent > Execution
 * Good: Jobs > Google SWE Role > Interview Prep
 */

import { ROUTES, ROUTE_METADATA, resolveRouteKey } from './routes';

export interface Breadcrumb {
  label: string;
  href: string;
  /** If true, this is the current (final) segment — not a link */
  current: boolean;
}

/**
 * Generate breadcrumbs for a given pathname.
 *
 * Optionally supply `entityLabel` to override the label for the deepest
 * dynamic segment (e.g. job title, company name, document name).
 */
export function buildBreadcrumbs(
  pathname: string,
  options: {
    /** Override label for the last dynamic segment, e.g. "Google SWE Role" */
    entityLabel?: string;
    /** Additional dynamic segments appended after the main breadcrumb chain */
    extra?: Array<{ label: string; href?: string }>;
  } = {},
): Breadcrumb[] {
  const { entityLabel, extra } = options;

  const routeKey = resolveRouteKey(pathname);
  const chain: string[] = [];

  // Walk up the parent chain
  let current: string | null = routeKey;
  while (current !== null) {
    chain.unshift(current);
    current = ROUTE_METADATA[current]?.parent ?? null;
  }

  const crumbs: Breadcrumb[] = chain.map((route, idx) => {
    const isLast = idx === chain.length - 1 && !entityLabel && !extra?.length;
    return {
      label: ROUTE_METADATA[route]?.label ?? route,
      href: route,
      current: isLast,
    };
  });

  // If we have a dynamic entity label (e.g. job title), add it
  if (entityLabel) {
    crumbs.push({
      label: entityLabel,
      href: pathname,
      current: !extra?.length,
    });
  }

  // Extra segments (e.g. sub-sections within a detail view)
  if (extra?.length) {
    extra.forEach((segment, idx) => {
      crumbs.push({
        label: segment.label,
        href: segment.href ?? pathname,
        current: idx === extra.length - 1,
      });
    });
  }

  return crumbs;
}

/**
 * Build breadcrumbs for a job detail view.
 * Returns: Pipeline > <Job Title>
 */
export function jobDetailBreadcrumbs(jobId: string, jobTitle?: string): Breadcrumb[] {
  return buildBreadcrumbs(ROUTES.JOBS, {
    entityLabel: jobTitle ?? 'Job Detail',
    extra: [{ label: 'Detail', href: ROUTES.JOB_DETAIL(jobId) }],
  });
}

/**
 * Build breadcrumbs for interview prep for a specific job.
 * Returns: Interviews > Interview Prep > <Job Title>
 */
export function interviewPrepBreadcrumbs(jobTitle?: string, tab?: string): Breadcrumb[] {
  const crumbs = buildBreadcrumbs(ROUTES.INTERVIEW_PREP, {
    entityLabel: jobTitle,
    extra: tab ? [{ label: tabLabel(tab) }] : undefined,
  });
  return crumbs;
}

function tabLabel(tab: string): string {
  const labels: Record<string, string> = {
    company:      'Company Intel',
    behavioral:   'Behavioral Stories',
    technical:    'Technical Prep',
    'system-design': 'System Design',
    mock:         'Mock Interview',
    resume:       'Resume Alignment',
  };
  return labels[tab] ?? tab;
}
