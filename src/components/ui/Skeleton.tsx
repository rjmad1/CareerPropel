import React from 'react'
import { cn } from "@/lib/utils"

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

function Skeleton({
  className,
  width,
  height,
  circle = false,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted",
        circle ? "rounded-full" : "rounded-lg",
        width || "w-full",
        height || "h-4",
        className
      )}
      aria-busy="true"
      aria-label="Loading..."
      {...props}
    />
  )
}

export { Skeleton }
