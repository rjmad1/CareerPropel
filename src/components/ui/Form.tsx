import React from 'react'
import { cn } from '@/lib/utils'

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode
}

/**
 * Form Component
 * Container for form fields with proper spacing.
 */
export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, children, ...props }, ref) => (
    <form ref={ref} className={cn('flex flex-col gap-4', className)} {...props}>
      {children}
    </form>
  )
)

Form.displayName = 'Form'

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

/**
 * FormField - Container for a single form field
 */
export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-1', className)} {...props}>
      {children}
    </div>
  )
)

FormField.displayName = 'FormField'

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
  required?: boolean
}

/**
 * FormLabel - Label for form inputs
 */
export const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, children, required, ...props }, ref) => (
    <label ref={ref} className={cn('text-sm font-medium text-gray-900', className)} {...props}>
      {children}
      {required && <span className="text-red-600 ml-1">*</span>}
    </label>
  )
)

FormLabel.displayName = 'FormLabel'

export interface FormErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

/**
 * FormError - Error message for form fields
 */
export const FormError = React.forwardRef<HTMLParagraphElement, FormErrorProps>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-red-600', className)} role="alert" {...props}>
      {children}
    </p>
  )
)

FormError.displayName = 'FormError'

export interface FormHintProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

/**
 * FormHint - Hint/helper text for form fields
 */
export const FormHint = React.forwardRef<HTMLParagraphElement, FormHintProps>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-gray-500', className)} {...props}>
      {children}
    </p>
  )
)

FormHint.displayName = 'FormHint'
