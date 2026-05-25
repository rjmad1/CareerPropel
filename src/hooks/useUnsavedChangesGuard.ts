/**
 * useUnsavedChangesGuard — protect unsaved work from accidental navigation.
 *
 * Registers a guard that fires when:
 *  1. User tries to navigate away while dirty (in-app confirmation modal)
 *  2. User tries to close/refresh the browser tab (beforeunload native dialog)
 *
 * Usage:
 *   const { isDirty, setDirty, confirmAndNavigate, UnsavedModal } =
 *     useUnsavedChangesGuard({ message: 'Discard resume changes?' });
 *
 *   // Mark dirty when form changes
 *   <input onChange={() => setDirty(true)} />
 *
 *   // Use confirmAndNavigate instead of router.push for guarded routes
 *   <button onClick={() => confirmAndNavigate('/resume-lab')}>Cancel</button>
 *
 *   // Render the confirmation modal
 *   <UnsavedModal />
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { registerGuard } from '@/lib/navigation/guards';
import { emitNavigationEvent } from '@/lib/navigation/analytics';
import { useNavigation } from './useNavigation';

interface UseUnsavedChangesGuardOptions {
  message?: string;
  /** If supplied, isDirty is derived from this value rather than internal state. */
  isDirtyExternal?: boolean;
}

interface UseUnsavedChangesGuardReturn {
  isDirty: boolean;
  setDirty: (dirty: boolean) => void;
  /** Call this to navigate away, showing the guard if dirty. */
  confirmAndNavigate: (href: string) => void;
  /** Manually reset dirty state (e.g. after save). */
  clearDirty: () => void;
  /** Whether the guard modal is currently shown. */
  showConfirm: boolean;
  /** Confirm navigation (discard changes). */
  onConfirmDiscard: () => void;
  /** Cancel the navigation attempt. */
  onCancelDiscard: () => void;
}

export function useUnsavedChangesGuard(
  options: UseUnsavedChangesGuardOptions = {},
): UseUnsavedChangesGuardReturn {
  const { message = 'You have unsaved changes. Discard them?', isDirtyExternal } = options;
  const [internalDirty, setInternalDirty] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const pendingHref = useRef<string | null>(null);
  const { navigate } = useNavigation();

  const isDirty = isDirtyExternal !== undefined ? isDirtyExternal : internalDirty;

  // Register/unregister the guard when dirty state changes
  useEffect(() => {
    if (!isDirty) return;
    const unregister = registerGuard(() => isDirty, { message });
    return unregister;
  }, [isDirty, message]);

  const setDirty = useCallback((dirty: boolean) => setInternalDirty(dirty), []);
  const clearDirty = useCallback(() => setInternalDirty(false), []);

  const confirmAndNavigate = useCallback(
    (href: string) => {
      if (!isDirty) {
        navigate(href, { force: true });
        return;
      }
      pendingHref.current = href;
      setShowConfirm(true);
    },
    [isDirty, navigate],
  );

  const onConfirmDiscard = useCallback(() => {
    emitNavigationEvent('unsaved_changes_discarded', { to: pendingHref.current ?? undefined });
    setInternalDirty(false);
    setShowConfirm(false);
    if (pendingHref.current) {
      navigate(pendingHref.current, { force: true });
      pendingHref.current = null;
    }
  }, [navigate]);

  const onCancelDiscard = useCallback(() => {
    setShowConfirm(false);
    pendingHref.current = null;
  }, []);

  return {
    isDirty,
    setDirty,
    confirmAndNavigate,
    clearDirty,
    showConfirm,
    onConfirmDiscard,
    onCancelDiscard,
  };
}
