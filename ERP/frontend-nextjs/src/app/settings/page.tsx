'use client'

import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useSettings } from '@/hooks/useSettings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Save, 
  Edit, 
  X,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Globe,
  MapPin,
  Calendar,
  Briefcase,
  Building,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Download,
  Trash2,
  Key,
  QrCode,
  Lock,
  Unlock,
  Settings as SettingsIcon,
  Info,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { toast } from 'react-hot-toast'

// Import form components
import FormInput from '@/components/ui/form-input'
import FormTextarea from '@/components/ui/form-textarea'
import FormSelect from '@/components/ui/form-select'
import FormSwitch from '@/components/ui/form-switch'
import PasswordStrength from '@/components/ui/password-strength'

// Error Boundary Component
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
          <p className="text-gray-600 max-w-md">
            {error?.message || 'An unexpected error occurred while loading the settings page.'}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload Page
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundaryWrapper onError={(error) => {
      setHasError(true)
      setError(error)
    }}>
      {children}
    </ErrorBoundaryWrapper>
  )
}

// Error Boundary Wrapper
class ErrorBoundaryWrapper extends React.Component<
  { children: React.ReactNode; onError: (error: Error) => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: (error: Error) => void }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Settings page error:', error, errorInfo)
    this.props.onError(error)
  }

  render() {
    if (this.state.hasError) {
      return null
    }
    return this.props.children
  }
}

// Loading Skeleton Component
const SettingsSkeleton = () => (
  <div className="container mx-auto py-6 space-y-6 max-w-6xl animate-pulse">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded w-32"></div>
        <div className="h-4 bg-gray-200 rounded w-64"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded w-32"></div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 rounded"></div>
      ))}
    </div>
    
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default function SettingsPage() {
  const {
    accountData,
    setAccountData,
    securityData,
    setSecurityData,
    notificationSettings,
    setNotificationSettings,
    appearanceSettings,
    setAppearanceSettings,
    isLoading,
    isEditing,
    setIsEditing,
    validationErrors,
    showPasswordStrength,
    setShowPasswordStrength,
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
    timezones,
    languages
  } = useSettings()

  // Local state for better UX
  const [activeTab, setActiveTab] = useState('account')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [isVerifyingTwoFactor, setIsVerifyingTwoFactor] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isOffline, setIsOffline] = useState(false)

  // Refs for auto-save functionality
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const lastChangeRef = useRef<Date>(new Date())

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOffline(!navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  // Track changes for unsaved changes warning
  useEffect(() => {
    if (isEditing) {
      setHasUnsavedChanges(true)
      lastChangeRef.current = new Date()
      
      // Auto-save after 5 seconds of inactivity
      if (autoSaveEnabled && !isOffline) {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current)
        }
        
        autoSaveTimeoutRef.current = setTimeout(() => {
          handleAutoSave()
        }, 5000)
      }
    }
  }, [accountData, isEditing, autoSaveEnabled, isOffline])

  // Cleanup auto-save timeout
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])

  // Handle unsaved changes warning
  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault()
      e.returnValue = ''
    }
  }, [hasUnsavedChanges])

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [handleBeforeUnload])

  // Auto-save functionality with retry logic
  const handleAutoSave = async () => {
    if (hasUnsavedChanges && isEditing && !isOffline) {
      try {
        const success = await updateAccountSettings()
        if (success) {
          setHasUnsavedChanges(false)
          setLastAutoSave(new Date())
          setRetryCount(0)
          toast.success('Changes auto-saved!', { duration: 2000 })
        }
      } catch (error) {
        console.error('Auto-save failed:', error)
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1)
          // Retry after 10 seconds
          setTimeout(() => handleAutoSave(), 10000)
        } else {
          toast.error('Auto-save failed after multiple attempts')
        }
      }
    }
  }

  const handleAccountUpdate = async () => {
    if (isOffline) {
      toast.error('Cannot save changes while offline')
      return
    }

    const success = await updateAccountSettings()
    if (success) {
      setHasUnsavedChanges(false)
      toast.success('Account settings updated successfully!')
    }
  }

  const handleSecurityUpdate = async () => {
    if (isOffline) {
      toast.error('Cannot update security settings while offline')
      return
    }

    const success = await updateSecuritySettings()
    if (success) {
      setShowPasswordFields(false)
      toast.success('Security settings updated successfully!')
    }
  }

  const handleNotificationUpdate = async () => {
    if (isOffline) {
      toast.error('Cannot update notification settings while offline')
      return
    }

    const success = await updateNotificationSettings()
    if (success) {
      toast.success('Notification settings updated successfully!')
    }
  }

  const handleAppearanceUpdate = async () => {
    if (isOffline) {
      toast.error('Cannot update appearance settings while offline')
      return
    }

    const success = await updateAppearanceSettings()
    if (success) {
      toast.success('Appearance settings updated successfully!')
    }
  }

  const handleCancelEditing = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        cancelEditing()
        setHasUnsavedChanges(false)
      }
    } else {
      cancelEditing()
    }
  }

  const handleExportData = async () => {
    if (isOffline) {
      toast.error('Cannot export data while offline')
      return
    }

    setIsExporting(true)
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Data export completed! Check your email for the download link.')
    } catch (error) {
      toast.error('Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (isOffline) {
      toast.error('Cannot delete account while offline')
      return
    }

    if (window.confirm('This action cannot be undone. Are you sure you want to delete your account?')) {
      toast.success('Account deletion request submitted. You will receive a confirmation email.')
      setShowDeleteConfirm(false)
    }
  }

  const handleTwoFactorToggle = async (enabled: boolean) => {
    if (isOffline) {
      toast.error('Cannot update two-factor authentication while offline')
      return
    }

    if (enabled) {
      setShowTwoFactorSetup(true)
    } else {
      // Disable 2FA
      const success = await toggleTwoFactor(false)
      if (success) {
        toast.success('Two-factor authentication disabled')
      }
    }
  }

  const handleTwoFactorSetup = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }

    setIsVerifyingTwoFactor(true)
    try {
      // Simulate 2FA setup verification
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Enable 2FA
      const success = await toggleTwoFactor(true)
      if (success) {
        setShowTwoFactorSetup(false)
        setTwoFactorCode('')
        toast.success('Two-factor authentication enabled successfully!')
      }
    } catch (error) {
      toast.error('Failed to setup two-factor authentication')
    } finally {
      setIsVerifyingTwoFactor(false)
    }
  }

  const departments = [
    { value: 'engineering', label: 'Engineering' },
    { value: 'content', label: 'Content' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'finance', label: 'Finance' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'operations', label: 'Operations' },
    { value: 'sales', label: 'Sales' },
    { value: 'support', label: 'Customer Support' },
    { value: 'design', label: 'Design' },
    { value: 'product', label: 'Product Management' }
  ]

  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' }
  ]

  const fontSizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'xlarge', label: 'Extra Large' }
  ]

  // Show loading skeleton while loading
  if (isLoading && !accountData.firstName) {
    return <SettingsSkeleton />
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto py-6 space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {isEditing && (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancelEditing}
                  disabled={isLoading || isOffline}
                  className="w-full sm:w-auto"
                  aria-label="Cancel editing"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleAccountUpdate}
                  disabled={isLoading || isOffline}
                  className="w-full sm:w-auto"
                  aria-label="Save changes"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                disabled={isLoading || isOffline}
                className="w-full sm:w-auto"
                aria-label="Edit profile"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Offline Warning */}
        {isOffline && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                You are currently offline. Some features may be unavailable.
              </span>
            </div>
          </div>
        )}

        {/* Auto-save indicator */}
        {autoSaveEnabled && lastAutoSave && !isOffline && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">
                Last auto-saved: {lastAutoSave.toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}

        {/* Unsaved Changes Warning */}
        {hasUnsavedChanges && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                You have unsaved changes. Don't forget to save your work!
              </span>
            </div>
          </div>
        )}

        {/* Main Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="account" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Settings Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription>
                  Update your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="First Name"
                    value={accountData.firstName}
                    onChange={(e) => setAccountData(prev => ({ ...prev, firstName: e.target.value }))}
                    error={getFieldError('firstName')}
                    onClearError={() => clearFieldError('firstName')}
                    required
                    disabled={!isEditing || isOffline}
                    placeholder="Enter your first name"
                    aria-label="First name"
                  />
                  
                  <FormInput
                    label="Last Name"
                    value={accountData.lastName}
                    onChange={(e) => setAccountData(prev => ({ ...prev, lastName: e.target.value }))}
                    error={getFieldError('lastName')}
                    onClearError={() => clearFieldError('lastName')}
                    required
                    disabled={!isEditing || isOffline}
                    placeholder="Enter your last name"
                    aria-label="Last name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="Email"
                    type="email"
                    value={accountData.email}
                    disabled
                    helperText="Email cannot be changed. Contact support if needed."
                    aria-label="Email address (read-only)"
                  />
                  
                  <FormInput
                    label="Phone Number"
                    type="tel"
                    value={accountData.phone || ''}
                    onChange={(e) => setAccountData(prev => ({ ...prev, phone: e.target.value }))}
                    error={getFieldError('phone')}
                    onClearError={() => clearFieldError('phone')}
                    placeholder="+1 (555) 123-4567"
                    disabled={!isEditing || isOffline}
                    aria-label="Phone number"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormSelect
                    label="Department"
                    options={departments}
                    value={accountData.department}
                    onChange={(value) => setAccountData(prev => ({ ...prev, department: value }))}
                    error={getFieldError('department')}
                    onClearError={() => clearFieldError('department')}
                    disabled={!isEditing || isOffline}
                    aria-label="Department selection"
                  />
                  
                  <FormInput
                    label="Position"
                    value={accountData.position || ''}
                    onChange={(e) => setAccountData(prev => ({ ...prev, position: e.target.value }))}
                    error={getFieldError('position')}
                    onClearError={() => clearFieldError('position')}
                    placeholder="e.g., Senior Developer"
                    disabled={!isEditing || isOffline}
                    aria-label="Job position"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="Location"
                    value={accountData.location || ''}
                    onChange={(e) => setAccountData(prev => ({ ...prev, location: e.target.value }))}
                    error={getFieldError('location')}
                    onClearError={() => clearFieldError('location')}
                    placeholder="e.g., New York, NY"
                    disabled={!isEditing || isOffline}
                    aria-label="Location"
                  />
                  
                  <FormInput
                    label="Date of Birth"
                    type="date"
                    value={accountData.dateOfBirth || ''}
                    onChange={(e) => setAccountData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    error={getFieldError('dateOfBirth')}
                    onClearError={() => clearFieldError('dateOfBirth')}
                    disabled={!isEditing || isOffline}
                    aria-label="Date of birth"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormSelect
                    label="Timezone"
                    options={timezones}
                    value={accountData.timezone}
                    onChange={(value) => setAccountData(prev => ({ ...prev, timezone: value }))}
                    error={getFieldError('timezone')}
                    onClearError={() => clearFieldError('timezone')}
                    disabled={!isEditing || isOffline}
                    aria-label="Timezone selection"
                  />
                  
                  <FormSelect
                    label="Language"
                    options={languages}
                    value={accountData.language}
                    onChange={(value) => setAccountData(prev => ({ ...prev, language: value }))}
                    error={getFieldError('language')}
                    onClearError={() => clearFieldError('language')}
                    disabled={!isEditing || isOffline}
                    aria-label="Language selection"
                  />
                </div>

                <FormTextarea
                  label="Bio"
                  value={accountData.bio || ''}
                  onChange={(e) => setAccountData(prev => ({ ...prev, bio: e.target.value }))}
                  error={getFieldError('bio')}
                  onClearError={() => clearFieldError('bio')}
                  placeholder="Tell us a bit about yourself..."
                  maxLength={500}
                  disabled={!isEditing || isOffline}
                  helperText={`${(accountData.bio || '').length}/500 characters`}
                  aria-label="Biography"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Password & Security</span>
                </CardTitle>
                <CardDescription>
                  Update your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Password Change Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Change Password</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPasswordFields(!showPasswordFields)}
                      disabled={isOffline}
                      aria-label="Toggle password change form"
                    >
                      {showPasswordFields ? 'Cancel' : 'Change Password'}
                    </Button>
                  </div>
                  
                  {showPasswordFields && (
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                          label="Current Password"
                          type="password"
                          value={securityData.currentPassword}
                          onChange={(e) => setSecurityData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          error={getFieldError('currentPassword')}
                          onClearError={() => clearFieldError('currentPassword')}
                          required
                          placeholder="Enter your current password"
                          aria-label="Current password"
                        />
                        
                        <FormInput
                          label="New Password"
                          type="password"
                          value={securityData.newPassword}
                          onChange={(e) => setSecurityData(prev => ({ ...prev, newPassword: e.target.value }))}
                          error={getFieldError('newPassword')}
                          onClearError={() => clearFieldError('newPassword')}
                          required
                          onFocus={() => setShowPasswordStrength(true)}
                          placeholder="Enter your new password"
                          aria-label="New password"
                        />
                      </div>

                      {showPasswordStrength && securityData.newPassword && (
                        <PasswordStrength password={securityData.newPassword} />
                      )}

                      <FormInput
                        label="Confirm New Password"
                        type="password"
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        error={getFieldError('confirmPassword')}
                        onClearError={() => clearFieldError('confirmPassword')}
                        required
                        placeholder="Confirm your new password"
                        aria-label="Confirm new password"
                      />

                      <div className="flex justify-end">
                        <Button
                          onClick={handleSecurityUpdate}
                          disabled={isLoading || isOffline}
                          aria-label="Update password"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          {isLoading ? 'Updating...' : 'Update Password'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Security Features Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Security Features</h4>
                  
                  <FormSwitch
                    label="Two-Factor Authentication"
                    description="Add an extra layer of security to your account"
                    checked={securityData.twoFactorEnabled}
                    onCheckedChange={handleTwoFactorToggle}
                    disabled={isLoading || isOffline}
                    aria-label="Enable two-factor authentication"
                  />

                  {/* Two-Factor Setup Modal */}
                  {showTwoFactorSetup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center space-x-2 mb-4">
                          <QrCode className="h-5 w-5 text-blue-600" />
                          <h3 className="text-lg font-medium">Setup Two-Factor Authentication</h3>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="bg-gray-100 p-4 rounded-lg text-center">
                            <div className="w-32 h-32 bg-white mx-auto mb-2 flex items-center justify-center">
                              <QrCode className="h-16 w-16 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-600">
                              Scan this QR code with your authenticator app
                            </p>
                          </div>
                          
                          <FormInput
                            label="Verification Code"
                            value={twoFactorCode}
                            onChange={(e) => setTwoFactorCode(e.target.value)}
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                            aria-label="Two-factor verification code"
                          />
                          
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => setShowTwoFactorSetup(false)}
                              className="flex-1"
                              aria-label="Cancel two-factor setup"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleTwoFactorSetup}
                              disabled={isVerifyingTwoFactor || !twoFactorCode}
                              className="flex-1"
                              aria-label="Verify and enable two-factor authentication"
                            >
                              {isVerifyingTwoFactor ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              {isVerifyingTwoFactor ? 'Verifying...' : 'Verify & Enable'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Security Recommendations */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Security Recommendations:</p>
                      <ul className="mt-2 space-y-1 list-disc list-inside">
                        <li>Use a strong, unique password</li>
                        <li>Enable two-factor authentication</li>
                        <li>Keep your recovery information up to date</li>
                        <li>Review your login activity regularly</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
                <CardDescription>
                  Choose how and when you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Notification Methods</h4>
                  
                  <FormSwitch
                    label="Email Notifications"
                    description="Receive notifications via email"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                    disabled={isOffline}
                    aria-label="Enable email notifications"
                  />
                  
                  <FormSwitch
                    label="Push Notifications"
                    description="Receive push notifications in the browser"
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
                    disabled={isOffline}
                    aria-label="Enable push notifications"
                  />
                  
                  <FormSwitch
                    label="SMS Notifications"
                    description="Receive notifications via SMS (requires phone number)"
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))}
                    disabled={!accountData.phone || isOffline}
                    aria-label="Enable SMS notifications"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Notification Types</h4>
                  
                  <FormSwitch
                    label="Security Alerts"
                    description="Important security-related notifications"
                    checked={notificationSettings.securityAlerts}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, securityAlerts: checked }))}
                    disabled={isOffline}
                    aria-label="Enable security alerts"
                  />
                  
                  <FormSwitch
                    label="Project Updates"
                    description="Updates about your projects and tasks"
                    checked={notificationSettings.projectUpdates}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, projectUpdates: checked }))}
                    disabled={isOffline}
                    aria-label="Enable project updates"
                  />
                  
                  <FormSwitch
                    label="Team Messages"
                    description="Messages from your team members"
                    checked={notificationSettings.teamMessages}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, teamMessages: checked }))}
                    disabled={isOffline}
                    aria-label="Enable team messages"
                  />
                  
                  <FormSwitch
                    label="Marketing Emails"
                    description="Newsletters and promotional content"
                    checked={notificationSettings.marketingEmails}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, marketingEmails: checked }))}
                    disabled={isOffline}
                    aria-label="Enable marketing emails"
                  />
                  
                  <FormSwitch
                    label="System Maintenance"
                    description="System updates and maintenance notifications"
                    checked={notificationSettings.systemMaintenance}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, systemMaintenance: checked }))}
                    disabled={isOffline}
                    aria-label="Enable system maintenance notifications"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleNotificationUpdate}
                    disabled={isLoading || isOffline}
                    aria-label="Update notification settings"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? 'Updating...' : 'Update Notification Settings'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Appearance & Layout</span>
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormSelect
                    label="Theme"
                    options={themes}
                    value={appearanceSettings.theme}
                    onChange={(value) => setAppearanceSettings(prev => ({ ...prev, theme: value as 'light' | 'dark' | 'system' }))}
                    error={getFieldError('theme')}
                    onClearError={() => clearFieldError('theme')}
                    disabled={isOffline}
                    aria-label="Theme selection"
                  />
                  
                  <FormSelect
                    label="Font Size"
                    options={fontSizes}
                    value={appearanceSettings.fontSize}
                    onChange={(value) => setAppearanceSettings(prev => ({ ...prev, fontSize: value as 'small' | 'medium' | 'large' | 'xlarge' }))}
                    error={getFieldError('fontSize')}
                    onClearError={() => clearFieldError('fontSize')}
                    disabled={isOffline}
                    aria-label="Font size selection"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Layout Options</h4>
                  
                  <FormSwitch
                    label="Compact Mode"
                    description="Reduce spacing for a more compact layout"
                    checked={appearanceSettings.compactMode}
                    onCheckedChange={(checked) => setAppearanceSettings(prev => ({ ...prev, compactMode: checked }))}
                    disabled={isOffline}
                    aria-label="Enable compact mode"
                  />
                  
                  <FormSwitch
                    label="Show Animations"
                    description="Enable smooth animations and transitions"
                    checked={appearanceSettings.showAnimations}
                    onCheckedChange={(checked) => setAppearanceSettings(prev => ({ ...prev, showAnimations: checked }))}
                    disabled={isOffline}
                    aria-label="Enable animations"
                  />
                  
                  <FormSwitch
                    label="Collapsed Sidebar"
                    description="Start with the sidebar collapsed"
                    checked={appearanceSettings.sidebarCollapsed}
                    onCheckedChange={(checked) => setAppearanceSettings(prev => ({ ...prev, sidebarCollapsed: checked }))}
                    disabled={isOffline}
                    aria-label="Enable collapsed sidebar"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleAppearanceUpdate}
                    disabled={isLoading || isOffline}
                    aria-label="Update appearance settings"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? 'Updating...' : 'Update Appearance Settings'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Additional Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Data Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Data Export</span>
              </CardTitle>
              <CardDescription>
                Export your data for backup or transfer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleExportData}
                disabled={isExporting || isOffline}
                variant="outline"
                className="w-full"
                aria-label="Export user data"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isExporting ? 'Exporting...' : 'Export My Data'}
              </Button>
            </CardContent>
          </Card>

          {/* Account Deletion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trash2 className="h-5 w-5" />
                <span>Danger Zone</span>
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="destructive"
                className="w-full"
                disabled={isOffline}
                aria-label="Delete account"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Success/Error Messages */}
        <div className="fixed bottom-4 right-4 z-50">
          {/* This will be handled by react-hot-toast */}
        </div>
      </div>
    </ErrorBoundary>
  )
}
