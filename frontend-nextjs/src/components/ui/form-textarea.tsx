import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  onClearError?: () => void
  required?: boolean
  maxLength?: number
  showCharacterCount?: boolean
  className?: string
  labelClassName?: string
  errorClassName?: string
  helperTextClassName?: string
}

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      error,
      helperText,
      onClearError,
      required = false,
      maxLength,
      showCharacterCount = false,
      className,
      labelClassName,
      errorClassName,
      helperTextClassName,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    const currentLength = props.value?.toString().length || 0

    return (
      <div className="space-y-2">
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              "text-sm font-medium text-gray-700 dark:text-gray-200",
              required && "after:content-['*'] after:ml-1 after:text-red-500",
              labelClassName
            )}
          >
            {label}
          </label>
        )}

        {/* Textarea Container */}
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            className={cn(
              "flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400",
              error && "border-red-500 focus:ring-red-500 focus:border-transparent",
              className
            )}
            {...props}
          />

          {/* Error Icon */}
          {error && onClearError && (
            <button
              type="button"
              onClick={onClearError}
              className="absolute right-2 top-2 text-red-500 hover:text-red-700 transition-colors"
            >
              <AlertCircle className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Character Count */}
        {showCharacterCount && maxLength && (
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>{currentLength} characters</span>
            <span className={cn(
              currentLength > maxLength * 0.9 ? "text-yellow-600" : "",
              currentLength === maxLength ? "text-red-600 font-medium" : ""
            )}>
              {maxLength - currentLength} remaining
            </span>
          </div>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p className={cn(
            "text-xs text-gray-500 dark:text-gray-400",
            helperTextClassName
          )}>
            {helperText}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <div className={cn(
            "flex items-center space-x-1 text-xs text-red-600 dark:text-red-400",
            errorClassName
          )}>
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    )
  }
)

FormTextarea.displayName = 'FormTextarea'

export default FormTextarea
