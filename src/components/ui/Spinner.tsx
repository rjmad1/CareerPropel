import React from 'react'
import { cn } from '@/lib/utils'

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Spinner Component
 * Loading indicator component.
 */
export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', className, ...props }, ref) => {
    const sizeStyles = {
      sm: 'w-8 h-8 border-2',
      md: 'w-12 h-12 border-2',
      lg: 'w-16 h-16 border-3',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'inline-block border-current border-t-transparent rounded-full animate-spin',
          sizeStyles[size],
          className
        )}
        role="status"
        aria-label="Loading"
        {...props}
      />
    )
  }
)

Spinner.displayName = 'Spinner'
