/**
 * useRouteState — typed URL state management hook.
 *
 * Reads state from URL search params and provides a setter that
 * uses router.replace() to update params without a full page reload.
 *
 * URL state is canonical — it survives refresh, deep links, and sharing.
 * Zustand may shadow it for performance but must defer to URL on mount.
 *
 * Usage (jobs page):
 *   const [state, setState] = useRouteState(parseJobsState, JOBS_URL_DEFAULTS);
 *   setState({ stage: 'applied', sort: 'matchScore' });
 *   // → /jobs?stage=applied&sort=matchScore (replace, no new history entry)
 */

'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { buildUrl, ParamRecord } from '@/lib/navigation/state';

type StateParser<T> = (params: URLSearchParams | ReturnType<typeof useSearchParams>) => T;

/**
 * Read URL state with typed parsing, write changes back via router.replace().
 *
 * @param parse  - Function that converts URLSearchParams → typed state object
 * @param defaults - Default values (used as fallback, not written to URL)
 * @returns [state, setState] tuple
 */
export function useRouteState<T extends Record<string, unknown>>(
  parse: StateParser<T>,
  _defaults: T,
): [T, (partial: Partial<Record<keyof T, string | number | boolean | null>>) => void] {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const state = parse(searchParams);

  const setState = useCallback(
    (partial: Partial<Record<keyof T, string | number | boolean | null>>) => {
      const next = buildUrl(pathname, partial as ParamRecord, searchParams);
      router.replace(next, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return [state, setState];
}

/**
 * Read a single URL param with type coercion.
 */
export function useUrlParam(key: string, fallback?: string): [string, (val: string | null) => void] {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const value = searchParams.get(key) ?? fallback ?? '';

  const setValue = useCallback(
    (val: string | null) => {
      const next = buildUrl(pathname, { [key]: val }, searchParams);
      router.replace(next, { scroll: false });
    },
    [router, pathname, searchParams, key],
  );

  return [value, setValue];
}
