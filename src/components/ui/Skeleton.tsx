import React from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Width of the skeleton. Supports Tailwind width classes or custom CSS
   */
  width?: string
  /**
   * Height of the skeleton. Supports Tailwind height classes or custom CSS
   */
  height?: string
  /**
   * Make skeleton circular (for avatars)
   */
  circle?: boolean
}

/**
 * Skeleton Component
 * Placeholder component for loading states.
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ width = 'w-full', height = 'h-8', circle = false, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-gray-200 animate-pulse',
        circle && 'rounded-full',
        !circle && 'rounded',
        width,
        height,
        className
      )}
      aria-busy="true"
      aria-label="Loading..."
      {...props}
    />
  )
)

Skeleton.displayName = 'Skeleton'
