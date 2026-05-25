/**
 * Transition semantics — shared loading state + transition lifecycle.
 *
 * Provides a lightweight publish/subscribe model that components
 * can use to show transition indicators without coupling to router internals.
 */

type TransitionHandler = (isPending: boolean) => void;

const handlers = new Set<TransitionHandler>();
let _isPending = false;
let _startedAt = 0;

/** Subscribe to transition state changes. Returns an unsubscribe fn. */
export function onTransitionChange(handler: TransitionHandler): () => void {
  handlers.add(handler);
  return () => handlers.delete(handler);
}

/** Mark a navigation as started. */
export function startTransition(): void {
  _isPending = true;
  _startedAt = performance.now();
  handlers.forEach((h) => h(true));
}

/** Mark a navigation as complete. */
export function endTransition(): void {
  const durationMs = performance.now() - _startedAt;
  _isPending = false;
  handlers.forEach((h) => h(false));

  // Emit latency event (imported lazily to avoid circular dep)
  if (durationMs > 0) {
    import('./analytics').then(({ emitNavigationEvent }) => {
      emitNavigationEvent('navigation_latency', { durationMs });
    }).catch(() => undefined);
  }
}

/** Current transition state (synchronous read). */
export function isTransitionPending(): boolean {
  return _isPending;
}
