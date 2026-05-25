/**
 * Navigation guards — protect unsaved work from accidental loss.
 *
 * Guards intercept:
 *  - Route transitions (via shouldBlock callback)
 *  - Browser refresh / tab close (beforeunload)
 *  - Browser back-button (popstate)
 *
 * Use `beforeunload` sparingly — only when dirty state actually exists.
 * Chrome supresses the native dialog on many interactions; always provide
 * an in-app confirmation flow as the primary safety net.
 */

type UnregisterFn = () => void;

export interface GuardOptions {
  /** Message shown in the in-app confirmation dialog */
  message?: string;
  /** If true, also attach a beforeunload handler for browser-level protection */
  guardBrowserClose?: boolean;
}

const DEFAULT_MESSAGE =
  'You have unsaved changes. Are you sure you want to leave? Your changes will be lost.';

// ─── Active guard registry ────────────────────────────────────────────────────

interface ActiveGuard {
  id: string;
  isDirty: () => boolean;
  message: string;
}

let guards: ActiveGuard[] = [];
let beforeUnloadRegistered = false;

function globalBeforeUnload(e: BeforeUnloadEvent): string | undefined {
  if (!guards.some((g) => g.isDirty())) return;
  e.preventDefault();
  e.returnValue = '';
  return '';
}

function ensureBeforeUnload(): void {
  if (beforeUnloadRegistered || typeof window === 'undefined') return;
  window.addEventListener('beforeunload', globalBeforeUnload);
  beforeUnloadRegistered = true;
}

function maybeRemoveBeforeUnload(): void {
  if (!beforeUnloadRegistered || guards.length > 0) return;
  window.removeEventListener('beforeunload', globalBeforeUnload);
  beforeUnloadRegistered = false;
}

// ─── Public API ───────────────────────────────────────────────────────────────

let counter = 0;

/**
 * Register a navigation guard.
 *
 * `isDirty` — called before navigation; if true, the guard fires.
 * Returns an unregister function; call it in a useEffect cleanup.
 */
export function registerGuard(
  isDirty: () => boolean,
  options: GuardOptions = {},
): UnregisterFn {
  const id = `guard_${++counter}`;
  const { message = DEFAULT_MESSAGE, guardBrowserClose = true } = options;

  guards.push({ id, isDirty, message });

  if (guardBrowserClose) ensureBeforeUnload();

  return () => {
    guards = guards.filter((g) => g.id !== id);
    maybeRemoveBeforeUnload();
  };
}

/**
 * Check if any active guard is dirty.
 * Returns the first dirty guard's message, or null if clean.
 */
export function checkGuards(): string | null {
  for (const guard of guards) {
    if (guard.isDirty()) return guard.message;
  }
  return null;
}

/**
 * Ask the user to confirm navigation when guards are dirty.
 * Uses native `window.confirm` as a fallback; prefer the in-app
 * UnsavedChangesModal from useUnsavedChangesGuard hook for better UX.
 */
export function confirmNavigation(message?: string): boolean {
  const blockMessage = message ?? checkGuards();
  if (!blockMessage) return true;
  return window.confirm(blockMessage);
}
