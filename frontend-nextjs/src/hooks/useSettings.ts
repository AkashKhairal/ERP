'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { settingsService, AccountSettings, SecuritySettings, NotificationSettings, AppearanceSettings } from '@/services/settingsService'
import { settingsValidation } from '@/utils/settingsValidation'
import { toast } from 'react-hot-toast'

export const useSettings = () => {
  const { user } = useAuth()
  
  // State for different settings sections
  const [accountData, setAccountData] = useState<AccountSettings>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    timezone: 'UTC',
    language: 'en',
    bio: '',
    dateOfBirth: '',
    position: '',
    department: 'engineering'
  })

  const [securityData, setSecurityData] = useState<SecuritySettings>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    sessionTimeout: 30
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    securityAlerts: true,
    projectUpdates: true,
    teamMessages: true,
    systemMaintenance: false
  })

  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    theme: 'system',
    compactMode: false,
    showAnimations: true,
    fontSize: 'medium',
    sidebarCollapsed: false
  })

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})
  const [showPasswordStrength, setShowPasswordStrength] = useState(false)

  // Load user profile data
  const loadProfile = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const profileResponse = await settingsService.getProfile()
      if (profileResponse.success && profileResponse.data) {
        setAccountData(profileResponse.data)
      }

      const preferencesResponse = await settingsService.getUserPreferences()
      if (preferencesResponse.success && preferencesResponse.data) {
        const { notifications, appearance } = preferencesResponse.data
        setNotificationSettings(notifications)
        setAppearanceSettings(appearance)
        const data = preferencesResponse.data
        if (data?.timezone) {
          setAccountData(prev => ({ ...prev, timezone: data.timezone }))
        }
        if (data?.language) {
          setAccountData(prev => ({ ...prev, language: data.language }))
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
      toast.error('Failed to load profile data')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Update account settings
  const updateAccountSettings = useCallback(async (): Promise<boolean> => {
    if (!user) return false

    // Validate account data
    const validation = settingsValidation.validateAccount(accountData)
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      toast.error('Please fix the validation errors')
      return false
    }

    setIsLoading(true)
    try {
      const response = await settingsService.updateProfile(accountData)
      if (response.success) {
        setValidationErrors({})
        toast.success('Account settings updated successfully!')
        return true
      } else {
        toast.error(response.message || 'Failed to update account settings')
        return false
      }
    } catch (error) {
      console.error('Failed to update account settings:', error)
      toast.error('Failed to update account settings')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [accountData, user])

  // Update security settings
  const updateSecuritySettings = useCallback(async (): Promise<boolean> => {
    if (!user) return false

    // Validate security data
    const validation = settingsValidation.validateSecurity(securityData)
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      toast.error('Please fix the validation errors')
      return false
    }

    setIsLoading(true)
    try {
      const response = await settingsService.changePassword(securityData)
      if (response.success) {
        setSecurityData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
        setValidationErrors({})
        toast.success('Security settings updated successfully!')
        return true
      } else {
        toast.error(response.message || 'Failed to update security settings')
        return false
      }
    } catch (error) {
      console.error('Failed to update security settings:', error)
      toast.error('Failed to update security settings')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [securityData, user])

  // Update notification settings
  const updateNotificationSettings = useCallback(async (): Promise<boolean> => {
    if (!user) return false

    setIsLoading(true)
    try {
      const response = await settingsService.updateNotificationPreferences(notificationSettings)
      if (response.success) {
        toast.success('Notification settings updated successfully!')
        return true
      } else {
        toast.error(response.message || 'Failed to update notification settings')
        return false
      }
    } catch (error) {
      console.error('Failed to update notification settings:', error)
      toast.error('Failed to update notification settings')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [notificationSettings, user])

  // Update appearance settings
  const updateAppearanceSettings = useCallback(async (): Promise<boolean> => {
    if (!user) return false

    setIsLoading(true)
    try {
      const response = await settingsService.updateAppearancePreferences(appearanceSettings)
      if (response.success) {
        toast.success('Appearance settings updated successfully!')
        return true
      } else {
        toast.error(response.message || 'Failed to update appearance settings')
        return false
      }
    } catch (error) {
      console.error('Failed to update appearance settings:', error)
      toast.error('Failed to update appearance settings')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [appearanceSettings, user])

  // Toggle two-factor authentication
  const toggleTwoFactor = useCallback(async (enabled: boolean): Promise<boolean> => {
    if (!user) return false

    setIsLoading(true)
    try {
      const response = await settingsService.toggleTwoFactor(enabled)
      if (response.success) {
        setSecurityData(prev => ({ ...prev, twoFactorEnabled: enabled }))
        toast.success(`Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully!`)
        return true
      } else {
        toast.error(response.message || `Failed to ${enabled ? 'enable' : 'disable'} two-factor authentication`)
        return false
      }
    } catch (error) {
      console.error('Failed to toggle two-factor authentication:', error)
      toast.error(`Failed to ${enabled ? 'enable' : 'disable'} two-factor authentication`)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Cancel editing and reset to original values
  const cancelEditing = useCallback(() => {
    setIsEditing(false)
    setValidationErrors({})
    // Reload profile to reset any unsaved changes
    loadProfile()
  }, [loadProfile])

  // Clear field-specific validation errors
  const clearFieldError = useCallback((field: string) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  // Get field-specific validation errors
  const getFieldError = useCallback((field: string): string | undefined => {
    return validationErrors[field]?.[0]
  }, [validationErrors])

  // Check if field has validation errors
  const hasFieldError = useCallback((field: string): boolean => {
    return !!validationErrors[field]
  }, [validationErrors])

  // Timezone and language options
  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' }
  ]

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ru', label: 'Russian' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' }
  ]

  // Load profile when user changes
  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user, loadProfile])

  return {
    // Data
    accountData,
    setAccountData,
    securityData,
    setSecurityData,
    notificationSettings,
    setNotificationSettings,
    appearanceSettings,
    setAppearanceSettings,
    
    // UI state
    isLoading,
    isEditing,
    setIsEditing,
    validationErrors,
    showPasswordStrength,
    setShowPasswordStrength,
    
    // Functions
    loadProfile,
    updateAccountSettings,
    updateSecuritySettings,
    updateNotificationSettings,
    updateAppearanceSettings,
    toggleTwoFactor,
    cancelEditing,
    clearFieldError,
    getFieldError,
    hasFieldError,
    
    // Options
    timezones,
    languages
  }
}
