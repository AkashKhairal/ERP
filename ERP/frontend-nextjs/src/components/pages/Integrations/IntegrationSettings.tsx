'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  RefreshCw, 
  Bell, 
  Settings, 
  Database, 
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Save,
  Info
} from 'lucide-react'
import { integrationService, Integration, SyncResponse, ApiResponse } from '@/services/integrationService'
import { useAuth } from '@/context/AuthContext'

interface IntegrationSettingsProps {
  integration: Integration
  onClose: () => void
  onUpdate: (integration: Integration) => void
}

const IntegrationSettings = ({ integration, onClose, onUpdate }: IntegrationSettingsProps) => {
  const [settings, setSettings] = useState({
    autoSync: true,
    syncInterval: 'daily',
    notifications: true,
    dataRetention: '30',
    customSettings: {} as Record<string, any>
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    // Load current settings
    if (integration.data?.settings) {
      setSettings(prev => ({
        ...prev,
        ...integration.data?.settings
      }))
    }
  }, [integration])

  const handleSave = async () => {
    try {
      setSaving(true)
      const response: ApiResponse = await integrationService.updateIntegrationSettings(integration._id || '', settings)
      
      if (response.success) {
        // Update local integration
        const updatedIntegration = {
          ...integration,
          data: {
            ...integration.data,
            settings
          }
        }
        onUpdate(updatedIntegration)
        onClose()
      } else {
        alert(response.error || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      alert('Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    try {
      setLoading(true)
      const response: SyncResponse = await integrationService.syncIntegration(integration._id || '')
      
      if (response.success) {
        alert('Connection test successful!')
      } else {
        alert(response.error || 'Connection test failed')
      }
    } catch (error) {
      console.error('Error testing connection:', error)
      alert('Connection test failed')
    } finally {
      setLoading(false)
    }
  }

  const syncIntervals = [
    { value: 'hourly', label: 'Every Hour' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'manual', label: 'Manual Only' }
  ]

  const dataRetentionOptions = [
    { value: '7', label: '7 days' },
    { value: '30', label: '30 days' },
    { value: '90', label: '90 days' },
    { value: '365', label: '1 year' },
    { value: 'never', label: 'Never' }
  ]

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span className="text-2xl">{integration.icon}</span>
            <span>{integration.name} Settings</span>
          </DialogTitle>
          <DialogDescription>
            Configure how {integration.name} integrates with your system
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Connection Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className={integrationService.getStatusColor(integration.status)}>
                    {integrationService.getStatusIcon(integration.status)} {integration.status}
                  </Badge>
                  {integration.lastSync && (
                    <span className="text-sm text-muted-foreground">
                      Last sync: {integrationService.formatLastSync(integration.lastSync)}
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sync Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5" />
                <span>Sync Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-sync">Auto Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync data from {integration.name}
                  </p>
                </div>
                <Switch
                  id="auto-sync"
                  checked={settings.autoSync}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSync: checked }))}
                />
              </div>

              {settings.autoSync && (
                <div>
                  <Label htmlFor="sync-interval">Sync Interval</Label>
                  <Select
                    value={settings.syncInterval}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, syncInterval: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sync interval" />
                    </SelectTrigger>
                    <SelectContent>
                      {syncIntervals.map(interval => (
                        <SelectItem key={interval.value} value={interval.value}>
                          {interval.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for sync events
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifications: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Data Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="data-retention">Data Retention</Label>
                <Select
                  value={settings.dataRetention}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, dataRetention: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select retention period" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataRetentionOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  How long to keep synced data before automatic cleanup
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Advanced Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
              </Button>
              
              {showAdvanced && (
                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="custom-settings">Custom Settings (JSON)</Label>
                    <Textarea
                      id="custom-settings"
                      value={JSON.stringify(settings.customSettings, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value)
                          setSettings(prev => ({ ...prev, customSettings: parsed }))
                        } catch (error) {
                          // Invalid JSON, ignore
                        }
                      }}
                      placeholder="Enter custom settings in JSON format"
                      rows={4}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Integration Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5" />
                <span>Integration Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Category:</span>
                <span className="text-sm text-muted-foreground">{integration.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge className={integrationService.getStatusColor(integration.status)}>
                  {integration.status}
                </Badge>
              </div>
              {integration.data?.accountInfo && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Connected Account:</span>
                  <span className="text-sm text-muted-foreground">
                    {integration.data.accountInfo.name}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default IntegrationSettings 