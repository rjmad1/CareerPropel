import React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'gray'
  size?: 'sm' | 'md'
  children: React.ReactNode
}

/**
 * Badge Component
 * Small label component for status, tags, or counts.
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'gray', size = 'sm', className, children, ...props }, ref) => {
    const variantStyles = {
      primary: 'bg-blue-100 text-blue-700',
      success: 'bg-green-100 text-green-700',
      warning: 'bg-orange-100 text-orange-700',
      error: 'bg-red-100 text-red-700',
      gray: 'bg-gray-100 text-gray-700',
    }

    const sizeStyles = {
      sm: 'px-2 py-1 text-xs font-medium rounded',
      md: 'px-3 py-1 text-sm font-medium rounded-md',
    }

    return (
      <span
        ref={ref}
        className={cn('inline-flex items-center gap-1 font-sans', variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
