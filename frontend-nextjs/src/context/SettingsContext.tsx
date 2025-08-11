'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'

interface SettingsContextType {
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  compactMode: boolean
  setCompactMode: (compact: boolean) => void
  showAnimations: boolean
  setShowAnimations: (show: boolean) => void
  fontSize: 'small' | 'medium' | 'large' | 'xlarge'
  setFontSize: (size: 'small' | 'medium' | 'large' | 'xlarge') => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    marketing: boolean
    security: boolean
    projects: boolean
    team: boolean
    system: boolean
  }
  updateNotificationSettings: (settings: Partial<SettingsContextType['notifications']>) => void
  resetToDefaults: () => void
}

const defaultSettings = {
  theme: 'light' as const,
  compactMode: false,
  showAnimations: true,
  fontSize: 'medium' as const,
  sidebarCollapsed: false,
  notifications: {
    email: true,
    push: true,
    sms: false,
    marketing: false,
    security: true,
    projects: true,
    team: true,
    system: false
  }
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  
  const [settings, setSettings] = useState<{
    theme: 'light' | 'dark' | 'system'
    compactMode: boolean
    showAnimations: boolean
    fontSize: 'small' | 'medium' | 'large' | 'xlarge'
    sidebarCollapsed: boolean
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
      marketing: boolean
      security: boolean
      projects: boolean
      team: boolean
      system: boolean
    }
  }>(defaultSettings)

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('app-settings')
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings)
          setSettings(prev => ({ ...prev, ...parsed }))
        } catch (error) {
          console.error('Failed to parse saved settings:', error)
        }
      }
    }
  }, [])

  // Load user preferences when user changes
  useEffect(() => {
    if (user?.preferences) {
      const userPrefs = user.preferences
      
      setSettings(prev => ({
        ...prev,
        theme: (userPrefs.theme || prev.theme) as 'light' | 'dark' | 'system',
        compactMode: userPrefs.appearance?.compactMode ?? prev.compactMode,
        showAnimations: userPrefs.appearance?.showAnimations ?? prev.showAnimations,
        fontSize: userPrefs.appearance?.fontSize || prev.fontSize,
        sidebarCollapsed: userPrefs.appearance?.sidebarCollapsed ?? prev.sidebarCollapsed,
        notifications: {
          ...prev.notifications,
          ...userPrefs.notifications
        }
      }))
    }
  }, [user])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-settings', JSON.stringify(settings))
    }
  }, [settings])

  // Apply theme to document
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement
      
      // Remove existing theme classes
      root.classList.remove('light', 'dark')
      
      let effectiveTheme = settings.theme
      
      if (settings.theme === 'system') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      
      root.classList.add(effectiveTheme)
      
      // Update meta theme-color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', effectiveTheme === 'dark' ? '#000000' : '#ffffff')
      }
    }
  }, [settings.theme])

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window !== 'undefined' && settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = () => {
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(mediaQuery.matches ? 'dark' : 'light')
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [settings.theme])

  // Apply font size to document
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement
      
      // Remove existing font size classes
      root.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl')
      
      // Add new font size class
      switch (settings.fontSize) {
        case 'small':
          root.classList.add('text-sm')
          break
        case 'large':
          root.classList.add('text-lg')
          break
        case 'xlarge':
          root.classList.add('text-xl')
          break
        default:
          root.classList.add('text-base')
      }
    }
  }, [settings.fontSize])

  // Apply compact mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement
      
      if (settings.compactMode) {
        root.classList.add('compact-mode')
      } else {
        root.classList.remove('compact-mode')
      }
    }
  }, [settings.compactMode])

  // Apply animations
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement
      
      if (settings.showAnimations) {
        root.classList.remove('no-animations')
      } else {
        root.classList.add('no-animations')
      }
    }
  }, [settings.showAnimations])

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    setSettings(prev => ({ ...prev, theme }))
  }

  const setCompactMode = (compact: boolean) => {
    setSettings(prev => ({ ...prev, compactMode: compact }))
  }

  const setShowAnimations = (show: boolean) => {
    setSettings(prev => ({ ...prev, showAnimations: show }))
  }

  const setFontSize = (size: 'small' | 'medium' | 'large' | 'xlarge') => {
    setSettings(prev => ({ ...prev, fontSize: size }))
  }

  const setSidebarCollapsed = (collapsed: boolean) => {
    setSettings(prev => ({ ...prev, sidebarCollapsed: collapsed }))
  }

  const updateNotificationSettings = (newSettings: Partial<SettingsContextType['notifications']>) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, ...newSettings }
    }))
  }

  const resetToDefaults = () => {
    setSettings(defaultSettings)
  }

  const value: SettingsContextType = {
    theme: settings.theme,
    setTheme,
    compactMode: settings.compactMode,
    setCompactMode,
    showAnimations: settings.showAnimations,
    setShowAnimations,
    fontSize: settings.fontSize,
    setFontSize,
    sidebarCollapsed: settings.sidebarCollapsed,
    setSidebarCollapsed,
    notifications: settings.notifications,
    updateNotificationSettings,
    resetToDefaults
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}
