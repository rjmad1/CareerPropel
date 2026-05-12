import React from 'react'
import { cn } from '@/lib/utils'

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

const sizeMap = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
}

/**
 * Icon Component
 * SVG icon wrapper with size variants.
 * Use this as a placeholder - actual icons would be imported from icon libraries like lucide-react
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 'md', className, ...props }, ref) => {
    // Placeholder implementation - in production, use lucide-react or similar
    const iconPath = getIconPath(name)

    return (
      <svg
        ref={ref}
        className={cn('inline-block flex-shrink-0', sizeMap[size], className)}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
        {...props}
      >
        <path d={iconPath} />
      </svg>
    )
  }
)

Icon.displayName = 'Icon'

function getIconPath(name: string): string {
  const icons: Record<string, string> = {
    'check': 'M9 16.2L4.8 12m-1.4 1.4L9 19 21 7',
    'x': 'M6 18L18 6M6 6l12 12',
    'menu': 'M4 6h16M4 12h16M4 18h16',
    'search': 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    'plus': 'M12 4v16m8-8H4',
    'arrow-right': 'M13 7l5 5m0 0l-5 5m5-5H6',
    'arrow-down': 'M19 14l-7 7m0 0l-7-7m7 7V3',
  }

  return icons[name] || ''
}
