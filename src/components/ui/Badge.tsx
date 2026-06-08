import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        outline: "text-foreground rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        // Legacy support
        primary: 'border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        success: 'border-transparent bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        warning: 'border-transparent bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        error: 'border-transparent bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        gray: 'border-transparent bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: 'px-2 py-0.5 text-xs font-medium rounded',
        md: 'px-2.5 py-1 text-sm font-medium rounded-md',
      }
    },
    defaultVariants: {
      variant: "gray",
      size: "default"
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
