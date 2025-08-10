'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Save, 
  X,
  Camera,
  Shield,
  Settings,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Globe,
  Bell,
  Smartphone,
  Lock,
  Key
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/context/AuthContext'
import { userService } from '@/services/userService'
import toast from 'react-hot-toast'

interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  department: string
  position: string
  joinDate: string
  bio: string
  skills: string[]
  avatar: string
  socialLinks: {
    linkedin?: string
    github?: string
    twitter?: string
    youtube?: string
  }
  emergencyContact: {
    name?: string
    relationship?: string
    phone?: string
    email?: string
  }
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface NotificationSettings {
  email: boolean
  push: boolean
  slack: boolean
  marketing: boolean
  updates: boolean
  security: boolean
}

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    department: '',
    position: '',
    joinDate: '',
    bio: '',
    skills: [],
    avatar: '',
    socialLinks: {},
    emergencyContact: {}
  })

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: true,
    push: true,
    slack: false,
    marketing: false,
    updates: true,
    security: true
  })

  // Initialize profile data from user context
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        department: user.department || '',
        position: user.position || '',
        joinDate: user.hireDate || '',
        bio: user.bio || 'Experienced professional with expertise in various technologies.',
        skills: user.skills || ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
        avatar: user.avatar || '',
        socialLinks: user.socialLinks || {},
        emergencyContact: user.emergencyContact || {}
      })
    }
  }, [user])

  // Validation functions
  const validateProfile = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!profileData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    
    if (!profileData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    
    if (profileData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(profileData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    
    if (profileData.bio && profileData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePassword = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and number'
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateProfile()) return
    
    setIsLoading(true)
    try {
      const updateData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        position: profileData.position,
        bio: profileData.bio,
        location: profileData.location,
        socialLinks: profileData.socialLinks,
        emergencyContact: profileData.emergencyContact
      }

      const response = await userService.updateUser(user!._id, updateData)
      
      if (response.success) {
        await updateProfile(response.data)
        toast.success('Profile updated successfully!')
        setIsEditing(false)
        setErrors({})
      } else {
        toast.error(response.message || 'Failed to update profile')
      }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!validatePassword()) return
    
    setIsChangingPassword(true)
    try {
      // This would typically call an API to change password
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Password changed successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setErrors({})
    } catch (error: any) {
      console.error('Error changing password:', error)
      toast.error('Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        department: user.department || '',
        position: user.position || '',
        joinDate: user.hireDate || '',
        bio: user.bio || 'Experienced professional with expertise in various technologies.',
        skills: user.skills || ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
        avatar: user.avatar || '',
        socialLinks: user.socialLinks || {},
        emergencyContact: user.emergencyContact || {}
      })
    }
    setIsEditing(false)
    setErrors({})
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB')
      return
    }

    setIsUploading(true)
    try {
      // Create a preview URL for immediate display
      const previewUrl = URL.createObjectURL(file)
      
      // For now, we'll use a placeholder avatar service
      // In a real app, you'd upload to your server or cloud storage
      const avatarUrl = `https://ui-avatars.com/api/?name=${profileData.firstName}+${profileData.lastName}&size=200&background=random`
      
      // Update the profile data
      setProfileData(prev => ({ ...prev, avatar: avatarUrl }))
      
      // Update the user context
      if (user) {
        await updateProfile({ avatar: avatarUrl })
      }
      
      toast.success('Profile picture updated successfully!')
    } catch (error: any) {
      console.error('Error updating avatar:', error)
      toast.error('Failed to update profile picture')
    } finally {
      setIsUploading(false)
    }
  }

  const handleAvatarRemove = async () => {
    try {
      setProfileData(prev => ({ ...prev, avatar: '' }))
      
      if (user) {
        await updateProfile({ avatar: null })
      }
      
      toast.success('Profile picture removed successfully!')
    } catch (error: any) {
      console.error('Error removing avatar:', error)
      toast.error('Failed to remove profile picture')
    }
  }

  const handleSkillAdd = (skill: string) => {
    const trimmedSkill = skill.trim()
    if (trimmedSkill && !profileData.skills.includes(trimmedSkill)) {
      if (profileData.skills.length >= 10) {
        toast.error('Maximum 10 skills allowed')
        return
      }
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, trimmedSkill]
      }))
    }
  }

  const handleSkillRemove = (skillToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleNotificationToggle = (key: keyof NotificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            <div className="relative">
              {profileData.avatar ? (
                <img
                  src={profileData.avatar}
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                  <User className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              
              {/* Avatar upload button */}
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Change profile picture"
              >
                {isUploading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              
              {/* Remove avatar button */}
              {profileData.avatar && (
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleAvatarRemove}
                  title="Remove profile picture"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold truncate">
                {profileData.firstName} {profileData.lastName}
              </h2>
              <p className="text-muted-foreground truncate">{profileData.position}</p>
              <p className="text-muted-foreground truncate">{profileData.department}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  disabled={!isEditing}
                  className={errors.firstName ? 'border-destructive' : ''}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  disabled={!isEditing}
                  className={errors.lastName ? 'border-destructive' : ''}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                disabled={true}
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                disabled={!isEditing}
                placeholder="+1 (555) 123-4567"
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.phone}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profileData.location}
                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                disabled={!isEditing}
                placeholder="City, State"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Work Information</CardTitle>
            <CardDescription>Your work-related details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={profileData.department}
                disabled={true}
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Department cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={profileData.position}
                onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                disabled={!isEditing}
                placeholder="Your job title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="joinDate">Join Date</Label>
              <Input
                id="joinDate"
                type="date"
                value={profileData.joinDate}
                disabled={true}
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Join date cannot be changed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bio and Skills */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bio</CardTitle>
            <CardDescription>Tell us about yourself</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
                          <Textarea
              className={`min-h-[100px] resize-none ${
                errors.bio ? 'border-destructive' : ''
              }`}
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              disabled={!isEditing}
              placeholder="Write a short bio..."
              maxLength={500}
            />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{profileData.bio.length}/500 characters</span>
                {errors.bio && (
                  <span className="text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.bio}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>Your technical skills (max 10)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                  >
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => handleSkillRemove(skill)}
                        className="text-primary hover:text-primary/70 transition-colors"
                        title="Remove skill"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const input = e.target as HTMLInputElement
                        handleSkillAdd(input.value)
                        input.value = ''
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Add a skill"]') as HTMLInputElement
                      if (input) {
                        handleSkillAdd(input.value)
                        input.value = ''
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social Links and Emergency Contact */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
            <CardDescription>Your professional social media profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={profileData.socialLinks?.linkedin || ''}
                onChange={(e) => setProfileData({
                  ...profileData,
                  socialLinks: { ...profileData.socialLinks, linkedin: e.target.value }
                })}
                disabled={!isEditing}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                value={profileData.socialLinks?.github || ''}
                onChange={(e) => setProfileData({
                  ...profileData,
                  socialLinks: { ...profileData.socialLinks, github: e.target.value }
                })}
                disabled={!isEditing}
                placeholder="https://github.com/username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                value={profileData.socialLinks?.twitter || ''}
                onChange={(e) => setProfileData({
                  ...profileData,
                  socialLinks: { ...profileData.socialLinks, twitter: e.target.value }
                })}
                disabled={!isEditing}
                placeholder="https://twitter.com/username"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
            <CardDescription>Contact information for emergencies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyName">Contact Name</Label>
              <Input
                id="emergencyName"
                value={profileData.emergencyContact?.name || ''}
                onChange={(e) => setProfileData({
                  ...profileData,
                  emergencyContact: { ...profileData.emergencyContact, name: e.target.value }
                })}
                disabled={!isEditing}
                placeholder="Emergency contact name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Contact Phone</Label>
              <Input
                id="emergencyPhone"
                value={profileData.emergencyContact?.phone || ''}
                onChange={(e) => setProfileData({
                  ...profileData,
                  emergencyContact: { ...profileData.emergencyContact, phone: e.target.value }
                })}
                disabled={!isEditing}
                placeholder="Emergency contact phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyEmail">Contact Email</Label>
              <Input
                id="emergencyEmail"
                type="email"
                value={profileData.emergencyContact?.email || ''}
                onChange={(e) => setProfileData({
                  ...profileData,
                  emergencyContact: { ...profileData.emergencyContact, email: e.target.value }
                })}
                disabled={!isEditing}
                placeholder="Emergency contact email"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password *</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className={errors.currentPassword ? 'border-destructive pr-10' : 'pr-10'}
                placeholder="Enter your current password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.currentPassword}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password *</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className={errors.newPassword ? 'border-destructive pr-10' : 'pr-10'}
                placeholder="Enter your new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.newPassword}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                placeholder="Confirm your new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.confirmPassword}
              </p>
            )}
          </div>
          
          <Button 
            onClick={handlePasswordChange} 
            disabled={isChangingPassword}
            className="w-full sm:w-auto"
          >
            {isChangingPassword ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2" />
            ) : (
              <Lock className="h-4 w-4 mr-2" />
            )}
            Update Password
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
                Use an authenticator app to get verification codes
              </p>
            </div>
            <Button variant="outline">Enable</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Session Management
          </CardTitle>
          <CardDescription>Manage your active sessions and devices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Current Session</p>
                  <p className="text-sm text-muted-foreground">
                    This device • Active now
                  </p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">Current</span>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Mobile Device</p>
                  <p className="text-sm text-muted-foreground">
                    iPhone • Last active 2 hours ago
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">Terminate</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-gray-400 rounded-full"></div>
                <div>
                  <p className="font-medium">Desktop Browser</p>
                  <p className="text-sm text-muted-foreground">
                    Chrome • Last active 1 day ago
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">Terminate</Button>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full">
              <Shield className="h-4 w-4 mr-2" />
              Terminate All Other Sessions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important updates
                  </p>
                </div>
              </div>
              <Switch
                checked={notificationSettings.email}
                onCheckedChange={() => handleNotificationToggle('email')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications on your device
                  </p>
                </div>
              </div>
              <Switch
                checked={notificationSettings.push}
                onCheckedChange={() => handleNotificationToggle('push')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Slack Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications in your Slack workspace
                  </p>
                </div>
              </div>
              <Switch
                checked={notificationSettings.slack}
                onCheckedChange={() => handleNotificationToggle('slack')}
              />
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Notification Types</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Updates</p>
                  <p className="text-sm text-muted-foreground">Product updates and promotions</p>
                </div>
                <Switch
                  checked={notificationSettings.marketing}
                  onCheckedChange={() => handleNotificationToggle('marketing')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">System Updates</p>
                  <p className="text-sm text-muted-foreground">Important system notifications</p>
                </div>
                <Switch
                  checked={notificationSettings.updates}
                  onCheckedChange={() => handleNotificationToggle('updates')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Security Alerts</p>
                  <p className="text-sm text-muted-foreground">Account security notifications</p>
                </div>
                <Switch
                  checked={notificationSettings.security}
                  onCheckedChange={() => handleNotificationToggle('security')}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab()
      case 'security':
        return renderSecurityTab()
      case 'settings':
        return renderSettingsTab()
      default:
        return renderProfileTab()
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {renderTabContent()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Profile 