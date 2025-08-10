'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface FormSwitchProps {
  label?: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  required?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  labelClassName?: string
  descriptionClassName?: string
  switchClassName?: string
  containerClassName?: string
}

const FormSwitch = forwardRef<HTMLButtonElement, FormSwitchProps>(
  (
    {
      label,
      description,
      checked,
      onCheckedChange,
      disabled = false,
      required = false,
      size = 'md',
      className,
      labelClassName,
      descriptionClassName,
      switchClassName,
      containerClassName,
    },
    ref
  ) => {
    const switchId = `switch-${Math.random().toString(36).substr(2, 9)}`

    const sizeClasses = {
      sm: {
        switch: 'w-9 h-5',
        thumb: 'w-3 h-3',
        thumbTranslate: 'translate-x-4',
        icon: 'w-2 h-2'
      },
      md: {
        switch: 'w-11 h-6',
        thumb: 'w-4 h-4',
        thumbTranslate: 'translate-x-5',
        icon: 'w-3 h-3'
      },
      lg: {
        switch: 'w-14 h-7',
        thumb: 'w-5 h-5',
        thumbTranslate: 'translate-x-7',
        icon: 'w-4 h-4'
      }
    }

    const currentSize = sizeClasses[size]

    const handleToggle = () => {
      if (!disabled) {
        onCheckedChange(!checked)
      }
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleToggle()
      }
    }

    return (
      <div className={cn("flex items-start space-x-3", containerClassName)}>
        {/* Switch */}
        <button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={label ? `${switchId}-label` : undefined}
          aria-describedby={description ? `${switchId}-description` : undefined}
          disabled={disabled}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className={cn(
            "relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            checked 
              ? "bg-blue-600 dark:bg-blue-500" 
              : "bg-gray-200 dark:bg-gray-700",
            currentSize.switch,
            switchClassName
          )}
          tabIndex={disabled ? -1 : 0}
        >
          {/* Thumb */}
          <span
            className={cn(
              "pointer-events-none inline-block transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
              checked ? currentSize.thumbTranslate : "translate-x-0",
              currentSize.thumb
            )}
          >
            {/* Check Icon */}
            {checked && (
              <Check className={cn(
                "text-blue-600 dark:text-blue-500 mx-auto mt-0.5",
                currentSize.icon
              )} />
            )}
          </span>
        </button>

        {/* Label and Description */}
        <div className="flex-1 min-w-0">
          {label && (
            <label
              id={`${switchId}-label`}
              htmlFor={switchId}
              className={cn(
                "text-sm font-medium text-gray-900 dark:text-white cursor-pointer",
                disabled && "cursor-not-allowed opacity-50",
                required && "after:content-['*'] after:ml-1 after:text-red-500",
                labelClassName
              )}
              onClick={() => !disabled && handleToggle()}
            >
              {label}
            </label>
          )}
          
          {description && (
            <p
              id={`${switchId}-description`}
              className={cn(
                "mt-1 text-sm text-gray-500 dark:text-gray-400",
                disabled && "opacity-50",
                descriptionClassName
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    )
  }
)

FormSwitch.displayName = 'FormSwitch'

export default FormSwitch
