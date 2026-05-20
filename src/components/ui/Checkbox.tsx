import React from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string
  description?: string
  error?: string
  size?: 'sm' | 'md'
}

/**
 * Checkbox Component
 * Accessible styled checkbox with label, description, and error support.
 * WCAG 2.1 AA compliant: explicit htmlFor, aria-describedby, keyboard accessible, visible focus ring.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, size = 'md', className, id, checked, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`

    const boxSize = {
      sm: 'w-3.5 h-3.5',
      md: 'w-4 h-4',
    }
    const checkSize = {
      sm: 'h-2.5 w-2.5',
      md: 'h-3 w-3',
    }

    return (
      <div className={cn('flex items-start gap-2.5', className)}>
        <div className="relative flex items-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            checked={checked}
            className="sr-only peer"
            aria-invalid={!!error}
            aria-describedby={
              error ? `${checkboxId}-error` : description ? `${checkboxId}-desc` : undefined
            }
            {...props}
          />
          {/* Custom styled checkbox box */}
          <div
            className={cn(
              boxSize[size],
              'rounded border-2 border-slate-300 bg-white flex items-center justify-center',
              'transition-all duration-150',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-1',
              checked
                ? 'bg-blue-600 border-blue-600'
                : 'peer-hover:border-slate-400',
              error && 'border-red-500 peer-focus-visible:ring-red-500',
              props.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {checked && (
              <Check className={cn(checkSize[size], 'text-white stroke-[3]')} aria-hidden="true" />
            )}
          </div>
        </div>

        {(label || description || error) && (
          <div className="flex flex-col gap-0.5 min-w-0">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  'text-sm font-medium text-slate-700 leading-snug cursor-pointer',
                  props.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p id={`${checkboxId}-desc`} className="text-xs text-slate-500 leading-snug">
                {description}
              </p>
            )}
            {error && (
              <p id={`${checkboxId}-error`} role="alert" className="text-xs text-red-600 font-medium">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
