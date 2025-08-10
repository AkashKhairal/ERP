'use client'

import React, { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, AlertCircle, Check, Search } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  group?: string
}

interface FormSelectProps {
  label?: string
  options: SelectOption[]
  value?: string
  onChange: (value: string) => void
  error?: string
  helperText?: string
  onClearError?: () => void
  required?: boolean
  disabled?: boolean
  placeholder?: string
  searchable?: boolean
  multiple?: boolean
  className?: string
  labelClassName?: string
  errorClassName?: string
  helperTextClassName?: string
  containerClassName?: string
}

const FormSelect = forwardRef<HTMLDivElement, FormSelectProps>(
  (
    {
      label,
      options,
      value,
      onChange,
      error,
      helperText,
      onClearError,
      required = false,
      disabled = false,
      placeholder = "Select an option",
      searchable = false,
      multiple = false,
      className,
      labelClassName,
      errorClassName,
      helperTextClassName,
      containerClassName,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedValues, setSelectedValues] = useState<string[]>(multiple ? (value ? [value] : []) : [])

    const selectId = `select-${Math.random().toString(36).substr(2, 9)}`

    // Filter options based on search term
    const filteredOptions = searchable && searchTerm
      ? options.filter(option => 
          option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          option.value.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options

    // Group options if they have groups
    const groupedOptions = filteredOptions.reduce((acc, option) => {
      if (option.group) {
        if (!acc[option.group]) {
          acc[option.group] = []
        }
        acc[option.group].push(option)
      } else {
        if (!acc['default']) {
          acc['default'] = []
        }
        acc['default'].push(option)
      }
      return acc
    }, {} as Record<string, SelectOption[]>)

    // Get selected option label
    const getSelectedLabel = () => {
      if (multiple) {
        if (selectedValues.length === 0) return placeholder
        if (selectedValues.length === 1) {
          const option = options.find(opt => opt.value === selectedValues[0])
          return option?.label || placeholder
        }
        return `${selectedValues.length} items selected`
      }
      
      const option = options.find(opt => opt.value === value)
      return option?.label || placeholder
    }

    // Handle option selection
    const handleOptionSelect = (optionValue: string) => {
      if (multiple) {
        const newValues = selectedValues.includes(optionValue)
          ? selectedValues.filter(v => v !== optionValue)
          : [...selectedValues, optionValue]
        setSelectedValues(newValues)
        onChange(newValues.join(','))
      } else {
        onChange(optionValue)
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    // Handle multiple selection
    const handleMultipleChange = (newValues: string[]) => {
      setSelectedValues(newValues)
      onChange(newValues.join(','))
    }

    // Clear all selections
    const clearSelection = () => {
      if (multiple) {
        setSelectedValues([])
        onChange('')
      } else {
        onChange('')
      }
      setSearchTerm('')
    }

    // Check if option is selected
    const isOptionSelected = (optionValue: string) => {
      if (multiple) {
        return selectedValues.includes(optionValue)
      }
      return value === optionValue
    }

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              "text-sm font-medium text-gray-700 dark:text-gray-200",
              required && "after:content-['*'] after:ml-1 after:text-red-500",
              labelClassName
            )}
          >
            {label}
          </label>
        )}

        {/* Select Container */}
        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              "flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white",
              error && "border-red-500 focus:ring-red-500 focus:border-transparent",
              isOpen && "ring-2 ring-blue-500 border-transparent",
              className
            )}
          >
            <span className={cn(
              "truncate",
              !value && !selectedValues.length && "text-gray-400"
            )}>
              {getSelectedLabel()}
            </span>
            <ChevronDown className={cn(
              "h-4 w-4 text-gray-400 transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          </button>

          {/* Error Icon */}
          {error && onClearError && (
            <button
              type="button"
              onClick={onClearError}
              className="absolute right-8 top-2 text-red-500 hover:text-red-700 transition-colors"
            >
              <AlertCircle className="h-4 w-4" />
            </button>
          )}

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto dark:bg-gray-800 dark:border-gray-600">
              {/* Search Input */}
              {searchable && (
                <div className="sticky top-0 bg-white dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-600">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search options..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {/* Clear Selection Button */}
              {multiple && selectedValues.length > 0 && (
                <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Clear selection
                  </button>
                </div>
              )}

              {/* Options */}
              <div className="py-1">
                {Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                  <div key={groupName}>
                    {/* Group Header */}
                    {groupName !== 'default' && (
                      <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        {groupName}
                      </div>
                    )}
                    
                    {/* Group Options */}
                    {groupOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleOptionSelect(option.value)}
                        disabled={option.disabled}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed",
                          isOptionSelected(option.value) && "bg-blue-50 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option.label}</span>
                          {isOptionSelected(option.value) && (
                            <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
                
                {/* No options message */}
                {filteredOptions.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                    {searchTerm ? 'No options match your search' : 'No options available'}
                  </div>
                )}
              </div>
            </div>
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

FormSelect.displayName = 'FormSelect'

export default FormSelect
