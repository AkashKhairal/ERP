'use client'

import React, { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, Eye, EyeOff, Search, X } from 'lucide-react'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  onClearError?: () => void
  required?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showClearButton?: boolean
  onClear?: () => void
  searchable?: boolean
  className?: string
  labelClassName?: string
  errorClassName?: string
  helperTextClassName?: string
  containerClassName?: string
  inputClassName?: string
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      helperText,
      onClearError,
      required = false,
      leftIcon,
      rightIcon,
      showClearButton = false,
      onClear,
      searchable = false,
      className,
      labelClassName,
      errorClassName,
      helperTextClassName,
      containerClassName,
      inputClassName,
      type = 'text',
      value,
      onChange,
      onFocus,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    
    const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`
    const isPassword = type === 'password'
    const inputType = isPassword && showPassword ? 'text' : type

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      if (onClearError && error) {
        onClearError()
      }
      if (onFocus) {
        onFocus(e)
      }
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      if (props.onBlur) {
        props.onBlur(e)
      }
    }

    const handleClear = () => {
      if (onClear) {
        onClear()
      } else if (onChange) {
        // Create a synthetic event to clear the input
        const syntheticEvent = {
          target: { value: '' }
        } as React.ChangeEvent<HTMLInputElement>
        onChange(syntheticEvent)
      }
    }

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword)
    }

    const hasValue = value !== undefined && value !== null && value !== ''

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium text-gray-700 dark:text-gray-200",
              required && "after:content-['*'] after:ml-1 after:text-red-500",
              labelClassName
            )}
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              "flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400 transition-colors duration-200",
              leftIcon && "pl-10",
              (rightIcon || showClearButton || isPassword) && "pr-10",
              error && "border-red-500 focus:ring-red-500 focus:border-transparent",
              isFocused && !error && "border-blue-500",
              inputClassName,
              className
            )}
            {...props}
          />

          {/* Right Icons Container */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {/* Password Toggle */}
            {isPassword && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}

            {/* Clear Button */}
            {showClearButton && hasValue && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                tabIndex={-1}
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Custom Right Icon */}
            {rightIcon && !isPassword && !showClearButton && (
              <div className="text-gray-400">
                {rightIcon}
              </div>
            )}

            {/* Search Icon for Searchable Inputs */}
            {searchable && !rightIcon && !isPassword && !showClearButton && (
              <Search className="h-4 w-4 text-gray-400" />
            )}
          </div>

          {/* Error Icon */}
          {error && onClearError && (
            <button
              type="button"
              onClick={onClearError}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700 transition-colors p-1"
              tabIndex={-1}
            >
              <AlertCircle className="h-4 w-4" />
            </button>
          )}
        </div>

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

FormInput.displayName = 'FormInput'

export default FormInput
