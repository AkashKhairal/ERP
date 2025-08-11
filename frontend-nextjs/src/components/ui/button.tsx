import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium tracking-tight transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-target",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-orange-400 to-red-500 text-white px-5 py-2.5 shadow-sm hover:shadow-md",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 px-5 py-2.5 hover:bg-white border border-gray-200/50 shadow-sm",
        secondary:
          "rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 px-5 py-2.5 hover:bg-white border border-gray-200/50 shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        icon: "rounded-full bg-white/70 backdrop-blur-sm p-2 hover:bg-white/90 shadow-sm",
      },
      size: {
        default: "h-9 sm:h-10 px-3 sm:px-4 py-2 text-xs sm:text-sm",
        sm: "h-8 sm:h-9 rounded-md px-2 sm:px-3 text-xs",
        lg: "h-10 sm:h-11 rounded-md px-4 sm:px-8 text-sm sm:text-base",
        icon: "h-9 w-9 sm:h-10 sm:w-10",
        mobile: "h-11 px-4 py-2 text-sm w-full sm:w-auto",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants } 