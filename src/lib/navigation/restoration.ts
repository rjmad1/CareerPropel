/**
 * Scroll + filter restoration registry.
 *
 * When a user navigates from a list to a detail view and back,
 * the list's scroll position, active filters, and page state
 * must be restored exactly.
 *
 * This module stores restoration data keyed by a route restoration key,
 * persisted to sessionStorage so it survives route transitions but not
 * browser close (intentional — stale scroll positions are worse than none).
 */

const STORAGE_PREFIX = 'cp_restore_';
const MAX_ENTRIES = 20;

export interface RestorationEntry {
  scrollY: number;
  timestamp: number;
  /** Arbitrary per-route payload (filters, page, tab, etc.) */
  payload?: Record<string, unknown>;
}

function storageKey(routeKey: string): string {
  return `${STORAGE_PREFIX}${routeKey.replace(/\//g, '_')}`;
}

function isAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
  } catch {
    return false;
  }
}

/** Persist scroll position and optional payload for a route. */
export function saveRestoration(routeKey: string, entry: Partial<RestorationEntry>): void {
  if (!isAvailable()) return;
  try {
    const full: RestorationEntry = {
      scrollY: entry.scrollY ?? 0,
      timestamp: Date.now(),
      payload: entry.payload,
    };
    sessionStorage.setItem(storageKey(routeKey), JSON.stringify(full));
    pruneOldEntries();
  } catch {
    // sessionStorage full or unavailable — ignore
  }
}

/** Retrieve saved restoration data for a route. */
export function loadRestoration(routeKey: string): RestorationEntry | null {
  if (!isAvailable()) return null;
  try {
    const raw = sessionStorage.getItem(storageKey(routeKey));
    if (!raw) return null;
    const entry = JSON.parse(raw) as RestorationEntry;
    // Discard entries older than 2 hours
    if (Date.now() - entry.timestamp > 2 * 60 * 60 * 1000) {
      sessionStorage.removeItem(storageKey(routeKey));
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

/** Clear restoration data for a route (e.g. after a hard reset). */
export function clearRestoration(routeKey: string): void {
  if (!isAvailable()) return;
  try {
    sessionStorage.removeItem(storageKey(routeKey));
  } catch {
    // ignore
  }
}

/** Restore scroll position from a stored entry. */
export function restoreScroll(routeKey: string): boolean {
  const entry = loadRestoration(routeKey);
  if (!entry || entry.scrollY === 0) return false;
  // Defer to next paint so layout is complete
  requestAnimationFrame(() => {
    window.scrollTo({ top: entry.scrollY, behavior: 'instant' });
  });
  return true;
}

/** Prune oldest entries if we have too many (keep MAX_ENTRIES most recent). */
function pruneOldEntries(): void {
  if (!isAvailable()) return;
  try {
    const keys: Array<{ key: string; ts: number }> = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (!k?.startsWith(STORAGE_PREFIX)) continue;
      try {
        const val = JSON.parse(sessionStorage.getItem(k) ?? '{}') as RestorationEntry;
        keys.push({ key: k, ts: val.timestamp ?? 0 });
      } catch {
        // skip malformed
      }
    }
    if (keys.length <= MAX_ENTRIES) return;
    keys.sort((a, b) => a.ts - b.ts);
    keys.slice(0, keys.length - MAX_ENTRIES).forEach(({ key }) => sessionStorage.removeItem(key));
  } catch {
    // ignore
  }
}
