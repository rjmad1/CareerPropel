import React from 'react'
import { cn } from '@/lib/utils'

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  initials?: string
  size?: 'sm' | 'md' | 'lg'
  fallbackColor?: string
}

/**
 * Avatar Component
 * Circular user avatar with image or initials fallback.
 */
export const Avatar = React.forwardRef<HTMLImageElement, AvatarProps>(
  ({ initials, size = 'md', fallbackColor = 'bg-blue-600', className, src, alt, ...props }, ref) => {
    const sizeStyles = {
      sm: 'w-16 h-16 text-xs',
      md: 'w-20 h-20 text-sm',
      lg: 'w-24 h-24 text-base',
    }

    if (!src && initials) {
      return (
        <div
          className={cn(
            'rounded-full flex items-center justify-center text-white font-semibold font-sans',
            sizeStyles[size],
            fallbackColor,
            className
          )}
          role="img"
          aria-label={alt || initials}
        >
          {initials}
        </div>
      )
    }

    return (
      <img
        ref={ref}
        src={src}
        alt={alt || 'Avatar'}
        className={cn('rounded-full object-cover', sizeStyles[size], className)}
        {...props}
      />
    )
  }
)

Avatar.displayName = 'Avatar'
