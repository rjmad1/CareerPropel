/**
 * Centralized navigation functions.
 *
 * ALL programmatic navigation must go through this module.
 * Never call router.push() / router.replace() directly in components —
 * use navigate() / navigateReplace() from here so guards, analytics,
 * and transition indicators all fire consistently.
 */

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { checkGuards } from './guards';
import { emitNavigationEvent, trackRouteEnter } from './analytics';
import { startTransition, endTransition } from './transitions';
import { pushHistoryEntry, updateCurrentScroll } from './history';
import { buildUrl, ParamRecord } from './state';
import { ROUTES } from './routes';

// ─── Module-level router reference ───────────────────────────────────────────
// The router is registered once when the app shell mounts.

let _router: AppRouterInstance | null = null;

export function registerRouter(router: AppRouterInstance): void {
  _router = router;
}

function getRouter(): AppRouterInstance {
  if (!_router) {
    throw new Error(
      '[navigation] Router not registered. ' +
      'Ensure NavigationProvider is mounted at the app root.',
    );
  }
  return _router;
}

// ─── Core navigation functions ────────────────────────────────────────────────

export interface NavigateOptions {
  /** If true, replace the current history entry (no new entry). */
  replace?: boolean;
  /** If true, bypass dirty-state guards (use with caution). */
  force?: boolean;
  /** Human-readable label for this entry in the in-process history. */
  label?: string;
  /** Additional URL params to merge. */
  params?: ParamRecord;
}

/**
 * Navigate to a pathname, running guards and analytics.
 * Returns true if navigation proceeded, false if blocked by a guard.
 */
export function navigate(
  href: string,
  options: NavigateOptions = {},
): boolean {
  const { replace = false, force = false, label, params } = options;
  const router = getRouter();

  // Guard check
  if (!force) {
    const blockMessage = checkGuards();
    if (blockMessage) {
      emitNavigationEvent('unsaved_changes_warned', { to: href });
      // In-app guard handling is done in the hook; here we just block.
      return false;
    }
  }

  const finalHref = params ? buildUrl(href, params) : href;
  const fromPath = typeof window !== 'undefined' ? window.location.pathname : '';

  startTransition();

  emitNavigationEvent('route_exit', { from: fromPath, to: finalHref });
  trackRouteEnter(finalHref);

  // Snapshot scroll before leaving
  const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
  updateCurrentScroll(scrollY);

  pushHistoryEntry({
    pathname: finalHref.split('?')[0],
    search: finalHref.includes('?') ? '?' + finalHref.split('?')[1] : '',
    label,
    scrollY: 0,
  });

  if (replace) {
    router.replace(finalHref);
  } else {
    router.push(finalHref);
  }

  endTransition();
  emitNavigationEvent('route_enter', { from: fromPath, to: finalHref });

  return true;
}

/** Convenience: replace current history entry. */
export function navigateReplace(href: string, options: Omit<NavigateOptions, 'replace'> = {}): boolean {
  return navigate(href, { ...options, replace: true });
}

/** Convenience: navigate to home/dashboard. */
export function navigateHome(): void {
  navigate(ROUTES.DASHBOARD, { force: true });
}

/** Convenience: navigate to login (force — must work even during dirty state). */
export function navigateToLogin(callbackUrl?: string): void {
  const href = callbackUrl
    ? buildUrl(ROUTES.LOGIN, { callbackUrl })
    : ROUTES.LOGIN;
  navigate(href, { force: true });
}

/** Prefetch a route for faster navigation. */
export function prefetchRoute(href: string): void {
  try {
    getRouter().prefetch(href);
  } catch {
    // Router might not be available; silently ignore
  }
}
