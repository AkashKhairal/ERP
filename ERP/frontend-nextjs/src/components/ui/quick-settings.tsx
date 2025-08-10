'use client'

import React, { useState } from 'react'
import { Button } from './button'
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from './popover'
import { Switch } from './switch'
import { Label } from './label'
import { Separator } from './separator'
import { 
  Settings, 
  Sun, 
  Moon, 
  Monitor, 
  Bell, 
  BellOff,
  Type,
  Eye,
  EyeOff,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react'
import { useSettings } from '@/context/SettingsContext'
import { cn } from '@/lib/utils'

export const QuickSettings: React.FC = () => {
  const {
    theme,
    setTheme,
    compactMode,
    setCompactMode,
    showAnimations,
    setShowAnimations,
    fontSize,
    setFontSize,
    sidebarCollapsed,
    setSidebarCollapsed,
    notifications,
    updateNotificationSettings
  } = useSettings()

  const [isOpen, setIsOpen] = useState(false)

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'auto', label: 'Auto', icon: Monitor }
  ]

  const fontSizeOptions = [
    { value: 'small', label: 'S' },
    { value: 'medium', label: 'M' },
    { value: 'large', label: 'L' },
    { value: 'xlarge', label: 'XL' }
  ]

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Quick Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Quick Settings</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>

          <Separator />

          {/* Theme Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Theme</Label>
            <div className="flex space-x-2">
              {themeOptions.map((option) => {
                const Icon = option.icon
                return (
                  <Button
                    key={option.value}
                    variant={theme === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
                    className="flex-1"
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {option.label}
                  </Button>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Font Size */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Font Size</Label>
            <div className="flex space-x-2">
              {fontSizeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={fontSize === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFontSize(option.value as 'small' | 'medium' | 'large' | 'xlarge')}
                  className="flex-1"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Layout Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Layout</Label>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Compact Mode</Label>
                <p className="text-xs text-muted-foreground">Reduce spacing</p>
              </div>
              <Switch
                checked={compactMode}
                onCheckedChange={setCompactMode}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Show Animations</Label>
                <p className="text-xs text-muted-foreground">Smooth transitions</p>
              </div>
              <Switch
                checked={showAnimations}
                onCheckedChange={setShowAnimations}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Collapsed Sidebar</Label>
                <p className="text-xs text-muted-foreground">Start minimized</p>
              </div>
              <Switch
                checked={sidebarCollapsed}
                onCheckedChange={setSidebarCollapsed}
              />
            </div>
          </div>

          <Separator />

          {/* Quick Notification Toggles */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Quick Notifications</Label>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">All Notifications</Label>
                <p className="text-xs text-muted-foreground">Toggle all on/off</p>
              </div>
              <Switch
                checked={notifications.email || notifications.push}
                onCheckedChange={(checked) => {
                  updateNotificationSettings({
                    email: checked,
                    push: checked,
                    sms: checked,
                    security: checked,
                    projects: checked,
                    team: checked,
                    system: checked
                  })
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Security Alerts</Label>
                <p className="text-xs text-muted-foreground">Important security updates</p>
              </div>
              <Switch
                checked={notifications.security}
                onCheckedChange={(checked) => updateNotificationSettings({ security: checked })}
              />
            </div>
          </div>

          <Separator />

          {/* Quick Actions */}
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setIsOpen(false)
                // Navigate to full settings page
                window.location.href = '/settings'
              }}
            >
              <Settings className="h-3 w-3 mr-2" />
              Full Settings
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default QuickSettings
