import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm",
        secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 border border-slate-200",
        outline: "bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-50 active:bg-slate-100",
        danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200",
        link: "bg-transparent text-blue-600 hover:underline p-0 h-auto rounded-none",
      },
      size: {
        default: "h-9 px-4 text-sm gap-2",
        xs: "h-7 px-2.5 text-xs gap-1.5",
        sm: "h-8 px-3 text-xs gap-2",
        md: "h-9 px-4 text-sm gap-2",
        lg: "h-11 px-5 text-sm gap-2.5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={props.disabled || loading}
        {...props}
      >
        {loading && <Spinner size={size || "md"} />}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

interface SpinnerProps {
  size: "default" | "xs" | "sm" | "md" | "lg" | null | undefined
}

const Spinner: React.FC<SpinnerProps> = ({ size }) => {
  const sizeClasses = {
    default: 'w-4 h-4',
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4 h-4',
  }

  const currentSize = size || 'md'
  const sizeClass = sizeClasses[currentSize] || sizeClasses.md

  return (
    <div className={cn(sizeClass, 'border-2 border-current border-t-transparent rounded-full animate-spin mr-2')} />
  )
}

export { Button, buttonVariants }
