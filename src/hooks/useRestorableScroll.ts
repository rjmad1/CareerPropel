/**
 * useRestorableScroll — scroll position save + restore.
 *
 * Call this hook on list pages (Jobs Kanban, Interview Prep list, etc.)
 * so that when the user navigates to a detail view and presses back,
 * the list scrolls back to exactly where they were.
 *
 * Usage:
 *   const { saveScroll } = useRestorableScroll('/jobs');
 *   // Call saveScroll() before navigating to a detail view
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  saveRestoration,
  restoreScroll,
  loadRestoration,
  RestorationEntry,
} from '@/lib/navigation/restoration';

interface UseRestorableScrollOptions {
  /** Custom restoration key (default: current pathname) */
  key?: string;
  /** Extra payload to save alongside scroll position (filters, page, etc.) */
  payload?: Record<string, unknown>;
  /** Scroll container ref — if null, uses window */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Debounce interval for the scroll listener in ms (default: 200) */
  debounceMs?: number;
}

export function useRestorableScroll(options: UseRestorableScrollOptions = {}) {
  const pathname = usePathname();
  const { key, containerRef, debounceMs = 200 } = options;
  const payloadRef = useRef(options.payload);

  useEffect(() => {
    payloadRef.current = options.payload;
  }, [options.payload]);

  const restorationKey = key ?? pathname ?? '/';
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-restore scroll when this route is entered
  useEffect(() => {
    restoreScroll(restorationKey);
  }, [restorationKey]);

  // Track scroll position in real-time with debounce
  useEffect(() => {
    const target = containerRef?.current ?? window;
    if (!target) return;

    const handleScroll = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const scrollY =
          containerRef?.current
            ? containerRef.current.scrollTop
            : window.scrollY;
        saveRestoration(restorationKey, { scrollY, payload: payloadRef.current });
      }, debounceMs);
    };

    target.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      target.removeEventListener('scroll', handleScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [restorationKey, containerRef, debounceMs]);

  /** Manually save current scroll + payload before navigating away. */
  const saveScroll = useCallback(
    (overridePayload?: Record<string, unknown>) => {
      const scrollY = containerRef?.current
        ? containerRef.current.scrollTop
        : typeof window !== 'undefined' ? window.scrollY : 0;
      saveRestoration(restorationKey, {
        scrollY,
        payload: overridePayload ?? payloadRef.current,
      });
    },
    [restorationKey, containerRef],
  );

  /** Read saved payload without restoring scroll. */
  const getSavedPayload = useCallback(
    (): RestorationEntry['payload'] => {
      return loadRestoration(restorationKey)?.payload;
    },
    [restorationKey],
  );

  return { saveScroll, getSavedPayload };
}
