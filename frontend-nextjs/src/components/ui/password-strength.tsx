'use client'

import React from 'react'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface PasswordStrengthProps {
  password: string
  className?: string
}

interface StrengthCriteria {
  label: string
  test: (password: string) => boolean
  icon: React.ReactNode
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password, className = '' }) => {
  const criteria: StrengthCriteria[] = [
    {
      label: 'At least 8 characters',
      test: (pwd) => pwd.length >= 8,
      icon: <CheckCircle className="h-4 w-4" />
    },
    {
      label: 'Contains uppercase letter',
      test: (pwd) => /[A-Z]/.test(pwd),
      icon: <CheckCircle className="h-4 w-4" />
    },
    {
      label: 'Contains lowercase letter',
      test: (pwd) => /[a-z]/.test(pwd),
      icon: <CheckCircle className="h-4 w-4" />
    },
    {
      label: 'Contains number',
      test: (pwd) => /\d/.test(pwd),
      icon: <CheckCircle className="h-4 w-4" />
    },
    {
      label: 'Contains special character',
      test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      icon: <CheckCircle className="h-4 w-4" />
    }
  ]

  const calculateStrength = (password: string): number => {
    if (!password) return 0
    
    let score = 0
    
    // Length bonus
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (password.length >= 16) score += 1
    
    // Character variety bonus
    if (/[A-Z]/.test(password)) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1
    
    // Additional complexity
    if (password.length > 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password)) {
      score += 1
    }
    
    return Math.min(score, 5)
  }

  const getStrengthLabel = (strength: number): string => {
    if (strength === 0) return 'Very Weak'
    if (strength <= 2) return 'Weak'
    if (strength <= 3) return 'Fair'
    if (strength <= 4) return 'Good'
    return 'Strong'
  }

  const getStrengthColor = (strength: number): string => {
    if (strength === 0) return 'bg-gray-200'
    if (strength <= 2) return 'bg-red-500'
    if (strength <= 3) return 'bg-yellow-500'
    if (strength <= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const strength = calculateStrength(password)
  const strengthLabel = getStrengthLabel(strength)
  const strengthColor = getStrengthColor(strength)

  if (!password) return null

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Password Strength:</span>
          <span className={`font-semibold ${
            strength <= 2 ? 'text-red-600' :
            strength <= 3 ? 'text-yellow-600' :
            strength <= 4 ? 'text-blue-600' :
            'text-green-600'
          }`}>
            {strengthLabel}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${strengthColor}`}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
        
        <div className="text-xs text-gray-500">
          {strength === 0 && 'Enter a password to see strength'}
          {strength > 0 && strength <= 2 && 'Your password is too weak. Please add more complexity.'}
          {strength > 2 && strength <= 3 && 'Your password could be stronger. Consider adding more variety.'}
          {strength > 3 && strength <= 4 && 'Good password! Consider adding a special character for extra security.'}
          {strength === 5 && 'Excellent! Your password is very strong.'}
        </div>
      </div>

      {/* Criteria Checklist */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Requirements:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {criteria.map((criterion, index) => {
            const isMet = criterion.test(password)
            return (
              <div
                key={index}
                className={`flex items-center space-x-2 text-sm ${
                  isMet ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                <span className={`${
                  isMet ? 'text-green-500' : 'text-gray-400'
                }`}>
                  {isMet ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                </span>
                <span className={isMet ? 'line-through' : ''}>
                  {criterion.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Security Tips */}
      {strength <= 3 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Security Tips:</p>
              <ul className="mt-1 space-y-1 list-disc list-inside">
                <li>Use a mix of letters, numbers, and symbols</li>
                <li>Avoid common words or patterns</li>
                <li>Consider using a passphrase instead</li>
                <li>Don't reuse passwords from other accounts</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Strong Password Celebration */}
      {strength === 5 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              🎉 Excellent! Your password meets all security requirements.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default PasswordStrength
