/**
 * DemoDataBadge
 * =============
 * An inline badge component used to tag synthetic demo data records in the UI.
 * Renders a small amber pill with tooltip on hover.
 *
 * Usage:
 *   import { DemoDataBadge } from '@/components/ui/DemoDataBadge'
 *   <DemoDataBadge />
 *   <DemoDataBadge size="sm" />
 *   <DemoDataBadge size="xs" label="DEMO" />
 *
 * Features:
 * - Zero accessibility impact (aria-hidden)
 * - Tooltip on hover with explanation
 * - Two sizes: 'xs' and 'sm'
 * - Can be composed inline with text or labels
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface DemoDataBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 'xs' | 'sm';
  label?: string;
  showTooltip?: boolean;
}

export function DemoDataBadge({
  size = 'xs',
  label = 'DEMO',
  showTooltip = true,
  className,
  ...props
}: DemoDataBadgeProps) {
  return (
    <span
      aria-hidden="true"
      title={showTooltip ? 'This is synthetic demo data generated for demonstration purposes only.' : undefined}
      className={cn(
        'group inline-flex items-center select-none font-mono font-bold tracking-widest uppercase rounded',
        'bg-amber-100 text-amber-700 border border-amber-300/60',
        'transition-all duration-150 cursor-default',
        'hover:bg-amber-200 hover:border-amber-400',
        size === 'xs'
          ? 'px-1.5 py-0 text-[8px] leading-4'
          : 'px-2 py-0.5 text-[10px]',
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'shrink-0',
          size === 'xs' ? 'mr-0.5 text-[7px]' : 'mr-1 text-[9px]'
        )}
      >
        ⬡
      </span>
      {label}
    </span>
  );
}

DemoDataBadge.displayName = 'DemoDataBadge';

/**
 * DemoDataIndicator
 * A subtle fixed position watermark shown on pages with demo data.
 * Positioned bottom-right, low opacity, non-interactive.
 */
export function DemoDataIndicator() {
  return (
    <div
      aria-hidden="true"
      className="fixed bottom-4 right-4 z-10 pointer-events-none opacity-25 select-none"
    >
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase font-mono bg-amber-200 text-amber-800 border border-amber-400/50">
        ⬡ DEMO DATA
      </span>
    </div>
  );
}

DemoDataIndicator.displayName = 'DemoDataIndicator';
