import React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

/**
 * Button Component
 * Primary action button with multiple variants and sizes.
 *
 * @param variant - Visual style (primary: blue, secondary: gray, danger: red, ghost: transparent)
 * @param size - Button size (sm: 32px, md: 40px, lg: 48px)
 * @param loading - Show loading spinner and disable interactions
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, className, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg font-sans'

    const variantStyles = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 disabled:bg-gray-100',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-gray-300',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 disabled:text-gray-400',
    }

    const sizeStyles = {
      sm: 'h-8 px-3 text-sm gap-2',
      md: 'h-10 px-4 text-base gap-2',
      lg: 'h-12 px-6 text-base gap-3',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
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
  size: 'sm' | 'md' | 'lg'
}

const Spinner: React.FC<SpinnerProps> = ({ size }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <div className={cn(sizeClasses[size], 'border-2 border-current border-t-transparent rounded-full animate-spin')} />
  )
}
