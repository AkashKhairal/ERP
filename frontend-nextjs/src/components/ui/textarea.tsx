import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-xl border border-gray-200/50 bg-white/60 backdrop-blur-sm px-4 py-3 text-sm font-medium text-gray-900 tracking-tight placeholder:text-gray-500 transition-all duration-200 ease-out resize-none focus:outline-none focus:bg-white/80 focus:border-orange-300 focus:ring-2 focus:ring-orange-200/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50/50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea } 