/**
 * useNavigationAnalytics — subscribe to navigation events in components.
 *
 * Usage:
 *   useNavigationAnalytics((event) => {
 *     if (event.type === 'oscillation_detected') showHelpTip();
 *   });
 */

'use client';

import { useEffect } from 'react';
import {
  onNavigationEvent,
  NavigationEvent,
} from '@/lib/navigation/analytics';

export function useNavigationAnalytics(
  handler: (event: NavigationEvent) => void,
  deps: React.DependencyList = [],
): void {
  useEffect(() => {
    const unsubscribe = onNavigationEvent(handler);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
