import React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'link'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

/**
 * Button Component
 * Primary action button with multiple variants and sizes.
 *
 * @param variant - Visual style (primary: blue, secondary: gray, outline: bordered, danger: red, ghost: transparent, link: text-only)
 * @param size - Button size (xs: 28px, sm: 32px, md: 36px, lg: 44px)
 * @param loading - Show loading spinner and disable interactions
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, className, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed select-none'

    const variantStyles = {
      primary:   'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm',
      secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 border border-slate-200',
      outline:   'bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-50 active:bg-slate-100',
      danger:    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
      ghost:     'bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200',
      link:      'bg-transparent text-blue-600 hover:underline p-0 h-auto rounded-none',
    }

    const sizeStyles = {
      xs: 'h-7 px-2.5 text-xs gap-1.5',
      sm: 'h-8 px-3 text-xs gap-2',
      md: 'h-9 px-4 text-sm gap-2',
      lg: 'h-11 px-5 text-sm gap-2.5',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variantStyles[variant], variant !== 'link' && sizeStyles[size], className)}
        {...props}
      >
        {loading && <Spinner size={size} />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

/**
 * Spinner Component - Internal use within Button
 */
interface SpinnerProps {
  size: 'xs' | 'sm' | 'md' | 'lg'
}

const Spinner: React.FC<SpinnerProps> = ({ size }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4 h-4',
  }

  return (
    <div className={cn(sizeClasses[size], 'border-2 border-current border-t-transparent rounded-full animate-spin')} />
  )
}
