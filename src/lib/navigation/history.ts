/**
 * In-process navigation history tracker.
 *
 * Supplements the browser history API with application-level metadata:
 * labels, entity names, scroll positions, filter snapshots.
 *
 * This does NOT replace the browser history stack — it only annotates it.
 * Native back/forward navigation is always left to the browser.
 */

export interface HistoryEntry {
  pathname: string;
  search: string;
  label?: string;
  scrollY: number;
  enteredAt: number;
}

const MAX_STACK = 50;
let stack: HistoryEntry[] = [];
let currentIdx = -1;

/** Record a new navigation entry. Called by useNavigation on every route change. */
export function pushHistoryEntry(entry: Omit<HistoryEntry, 'enteredAt'>): void {
  // Truncate forward history when navigating from a mid-stack position
  if (currentIdx < stack.length - 1) {
    stack = stack.slice(0, currentIdx + 1);
  }
  stack.push({ ...entry, enteredAt: Date.now() });
  if (stack.length > MAX_STACK) stack.shift();
  currentIdx = stack.length - 1;
}

/** Update the scroll position for the current entry (call on scroll). */
export function updateCurrentScroll(scrollY: number): void {
  if (currentIdx >= 0 && currentIdx < stack.length) {
    stack[currentIdx].scrollY = scrollY;
  }
}

/** Get the entry immediately before the current one (for back-navigation metadata). */
export function getPreviousEntry(): HistoryEntry | null {
  return currentIdx > 0 ? stack[currentIdx - 1] : null;
}

/** Get the full in-process history stack (read-only). */
export function getHistoryStack(): ReadonlyArray<HistoryEntry> {
  return stack;
}

/** Reset history (e.g. on sign-out). */
export function resetHistory(): void {
  stack = [];
  currentIdx = -1;
}
