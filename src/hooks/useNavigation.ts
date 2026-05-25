/**
 * useNavigation — centralized navigation hook.
 *
 * Wraps the navigation module functions and registers the router instance
 * so all calls to navigate() / navigateReplace() / prefetchRoute() are
 * guard-aware, analytics-instrumented, and transition-tracked.
 *
 * Usage:
 *   const { navigate, navigateReplace, prefetch } = useNavigation();
 *   navigate('/jobs', { params: { stage: 'applied' } });
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  registerRouter,
  navigate as libNavigate,
  navigateReplace as libNavigateReplace,
  prefetchRoute,
  NavigateOptions,
} from '@/lib/navigation/navigation';
import { trackRouteEnter, emitNavigationEvent } from '@/lib/navigation/analytics';
import { pushHistoryEntry } from '@/lib/navigation/history';
import { ROUTES } from '@/lib/navigation/routes';

export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  // Register the router instance so module-level navigate() calls work
  useEffect(() => {
    registerRouter(router);
  }, [router]);

  // Track route entry on pathname change
  useEffect(() => {
    if (!pathname) return;
    trackRouteEnter(pathname);
    emitNavigationEvent('route_enter', { to: pathname });
    pushHistoryEntry({ pathname, search: '', scrollY: 0 });
  }, [pathname]);

  const navigate = useCallback(
    (href: string, options?: NavigateOptions) => libNavigate(href, options),
    [],
  );

  const navigateReplace = useCallback(
    (href: string, options?: Omit<NavigateOptions, 'replace'>) =>
      libNavigateReplace(href, options),
    [],
  );

  const prefetch = useCallback((href: string) => prefetchRoute(href), []);

  const goBack = useCallback(() => {
    emitNavigationEvent('back_navigate');
    router.back();
  }, [router]);

  const goHome = useCallback(() => navigate(ROUTES.DASHBOARD, { force: true }), [navigate]);

  return { navigate, navigateReplace, prefetch, goBack, goHome };
}
