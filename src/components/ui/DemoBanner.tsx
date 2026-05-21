'use client';

/**
 * DemoBanner
 * ==========
 * A dismissible alert banner shown at the top of the layout when the active
 * session belongs to a demo account (email starts with "demo+").
 *
 * Features:
 * - Amber gradient banner with clear DEMO ENVIRONMENT label
 * - Dismissible per browser session (localStorage)
 * - Accessible: role="alert", aria-live="polite"
 * - Zero impact on production users
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

const DISMISS_KEY = 'careerpropel_demo_banner_dismissed';

export function DemoBanner() {
  const { data: session } = useSession();
  const [dismissed, setDismissed] = useState(true); // Start hidden to avoid flash

  useEffect(() => {
    // Only show for demo accounts
    const email = session?.user?.email ?? '';
    if (!email.startsWith('demo+')) {
      setDismissed(true);
      return;
    }
    // Check localStorage dismiss state
    try {
      const saved = sessionStorage.getItem(DISMISS_KEY);
      setDismissed(saved === 'true');
    } catch {
      setDismissed(false);
    }
  }, [session]);

  if (dismissed) return null;

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, 'true');
    } catch {
      // sessionStorage unavailable in some environments
    }
    setDismissed(true);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className="relative z-50 flex items-center justify-between gap-4 px-4 py-2 text-xs font-medium bg-amber-500 text-amber-950 border-b border-amber-600"
      style={{
        background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 50%, #f59e0b 100%)',
      }}
    >
      {/* Left: Icon + Message */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span
          className="text-sm shrink-0"
          aria-hidden="true"
        >
          🧪
        </span>
        <span className="font-bold tracking-wide uppercase text-[10px] shrink-0">
          DEMO ENVIRONMENT
        </span>
        <span
          className="hidden sm:inline text-amber-900 truncate"
          aria-label="This is a synthetic demo environment. All data is generated for demonstration purposes only and is not real."
        >
          — Synthetic data only. Not a production environment. All records are safe to explore.
        </span>
        <span
          className="sm:hidden text-amber-900"
          aria-hidden="true"
        >
          — Synthetic data
        </span>
      </div>

      {/* Right: DEMO badge + dismiss */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 tracking-widest">
          DEMO DATA
        </span>
        <button
          onClick={handleDismiss}
          className="p-1 rounded hover:bg-amber-600/50 transition-colors duration-150 text-amber-900 hover:text-amber-950"
          aria-label="Dismiss demo environment banner"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

DemoBanner.displayName = 'DemoBanner';
