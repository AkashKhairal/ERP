export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string[]>
}

export interface AccountValidationData {
  firstName: string
  lastName: string
  phone?: string
  timezone?: string
  language?: string
  bio?: string
  location?: string
  dateOfBirth?: string
  position?: string
  department?: string
}

export interface SecurityValidationData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface NotificationValidationData {
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  marketingEmails: boolean
  securityAlerts: boolean
  projectUpdates: boolean
  teamMessages: boolean
  systemMaintenance: boolean
}

export interface AppearanceValidationData {
  theme: 'light' | 'dark' | 'system'
  compactMode: boolean
  showAnimations: boolean
  fontSize: 'small' | 'medium' | 'large' | 'xlarge'
  sidebarCollapsed: boolean
}

export const settingsValidation = {
  // Validate account settings
  validateAccount: (data: AccountValidationData): ValidationResult => {
    const errors: Record<string, string[]> = {}

    // First Name validation
    if (!data.firstName.trim()) {
      errors.firstName = ['First name is required']
    } else if (data.firstName.trim().length < 2) {
      errors.firstName = ['First name must be at least 2 characters long']
    } else if (data.firstName.trim().length > 50) {
      errors.firstName = ['First name cannot exceed 50 characters']
    } else if (!/^[a-zA-Z\s\-']+$/.test(data.firstName.trim())) {
      errors.firstName = ['First name can only contain letters, spaces, hyphens, and apostrophes']
    }

    // Last Name validation
    if (!data.lastName.trim()) {
      errors.lastName = ['Last name is required']
    } else if (data.lastName.trim().length < 2) {
      errors.lastName = ['Last name must be at least 2 characters long']
    } else if (data.lastName.trim().length > 50) {
      errors.lastName = ['Last name cannot exceed 50 characters']
    } else if (!/^[a-zA-Z\s\-']+$/.test(data.lastName.trim())) {
      errors.lastName = ['Last name can only contain letters, spaces, hyphens, and apostrophes']
    }

    // Phone validation
    if (data.phone && data.phone.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
      if (!phoneRegex.test(data.phone.trim())) {
        errors.phone = ['Please enter a valid phone number']
      }
    }

    // Bio validation
    if (data.bio && data.bio.trim().length > 500) {
      errors.bio = ['Bio cannot exceed 500 characters']
    }

    // Location validation
    if (data.location && data.location.trim().length > 100) {
      errors.location = ['Location cannot exceed 100 characters']
    }

    // Position validation
    if (data.position && data.position.trim().length > 100) {
      errors.position = ['Position cannot exceed 100 characters']
    }

    // Date of birth validation
    if (data.dateOfBirth) {
      const date = new Date(data.dateOfBirth)
      const now = new Date()
      const minDate = new Date(1900, 0, 1)
      
      if (isNaN(date.getTime())) {
        errors.dateOfBirth = ['Please enter a valid date']
      } else if (date > now) {
        errors.dateOfBirth = ['Date of birth cannot be in the future']
      } else if (date < minDate) {
        errors.dateOfBirth = ['Date of birth cannot be before 1900']
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  },

  // Validate security settings
  validateSecurity: (data: SecurityValidationData): ValidationResult => {
    const errors: Record<string, string[]> = {}

    // Current password validation
    if (!data.currentPassword.trim()) {
      errors.currentPassword = ['Current password is required']
    }

    // New password validation
    if (!data.newPassword.trim()) {
      errors.newPassword = ['New password is required']
    } else {
      const passwordErrors: string[] = []
      
      if (data.newPassword.length < 8) {
        passwordErrors.push('Password must be at least 8 characters long')
      }
      
      if (!/(?=.*[a-z])/.test(data.newPassword)) {
        passwordErrors.push('Password must contain at least one lowercase letter')
      }
      
      if (!/(?=.*[A-Z])/.test(data.newPassword)) {
        passwordErrors.push('Password must contain at least one uppercase letter')
      }
      
      if (!/(?=.*\d)/.test(data.newPassword)) {
        passwordErrors.push('Password must contain at least one number')
      }
      
      if (!/(?=.*[@$!%*?&])/.test(data.newPassword)) {
        passwordErrors.push('Password must contain at least one special character (@$!%*?&)')
      }
      
      if (passwordErrors.length > 0) {
        errors.newPassword = passwordErrors
      }
    }

    // Confirm password validation
    if (!data.confirmPassword.trim()) {
      errors.confirmPassword = ['Please confirm your new password']
    } else if (data.newPassword !== data.confirmPassword) {
      errors.confirmPassword = ['Passwords do not match']
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  },

  // Validate notification settings
  validateNotifications: (data: NotificationValidationData): ValidationResult => {
    const errors: Record<string, string[]> = {}

    // At least one notification method should be enabled
    if (!data.emailNotifications && !data.pushNotifications && !data.smsNotifications) {
      errors.notifications = ['At least one notification method must be enabled']
    }

    // If SMS notifications are enabled, validate that other methods are also available
    if (data.smsNotifications && !data.emailNotifications && !data.pushNotifications) {
      errors.smsNotifications = ['SMS notifications cannot be the only notification method']
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  },

  // Validate appearance settings
  validateAppearance: (data: AppearanceValidationData): ValidationResult => {
    const errors: Record<string, string[]> = {}

    // Theme validation
    if (!['light', 'dark', 'system'].includes(data.theme)) {
      errors.theme = ['Please select a valid theme']
    }

    // Font size validation
    if (!['small', 'medium', 'large', 'xlarge'].includes(data.fontSize)) {
      errors.fontSize = ['Please select a valid font size']
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  },

  // Get field error message
  getFieldError: (errors: Record<string, string[]>, fieldName: string): string | null => {
    return errors[fieldName]?.[0] || null
  },

  // Check if field has error
  hasFieldError: (errors: Record<string, string[]>, fieldName: string): boolean => {
    return !!errors[fieldName]?.length
  },

  // Clear field error
  clearFieldError: (errors: Record<string, string[]>, fieldName: string): Record<string, string[]> => {
    const newErrors = { ...errors }
    delete newErrors[fieldName]
    return newErrors
  },

  // Clear all errors
  clearAllErrors: (): Record<string, string[]> => {
    return {}
  }
}

// Password strength indicator
export const getPasswordStrength = (password: string): {
  score: number
  label: string
  color: string
  requirements: Array<{ met: boolean; text: string }>
} => {
  let score = 0
  const requirements = [
    { met: password.length >= 8, text: 'At least 8 characters' },
    { met: /(?=.*[a-z])/.test(password), text: 'One lowercase letter' },
    { met: /(?=.*[A-Z])/.test(password), text: 'One uppercase letter' },
    { met: /(?=.*\d)/.test(password), text: 'One number' },
    { met: /(?=.*[@$!%*?&])/.test(password), text: 'One special character' }
  ]

  requirements.forEach(req => {
    if (req.met) score++
  })

  let label = 'Very Weak'
  let color = 'bg-red-500'

  if (score >= 4) {
    label = 'Strong'
    color = 'bg-green-500'
  } else if (score >= 3) {
    label = 'Good'
    color = 'bg-yellow-500'
  } else if (score >= 2) {
    label = 'Fair'
    color = 'bg-orange-500'
  } else if (score >= 1) {
    label = 'Weak'
    color = 'bg-red-400'
  }

  return { score, label, color, requirements }
}

// Phone number formatting
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  } else if (cleaned.length > 10) {
    return `+${cleaned}`
  }
  
  return phone
}

// Date formatting
export const formatDate = (date: string): string => {
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return date
  }
}

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/&/g, '&amp;') // Escape ampersands
    .replace(/"/g, '&quot;') // Escape quotes
    .replace(/'/g, '&#x27;') // Escape apostrophes
}
