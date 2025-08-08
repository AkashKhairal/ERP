'use client'

import React, { useState, useEffect } from 'react'
import { 
  Settings, 
  Plus, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  RefreshCw,
  Key,
  Globe,
  MessageSquare,
  CreditCard,
  Calendar,
  Loader2,
  AlertCircle,
  Info,
  Shield,
  Zap,
  Users,
  Database,
  BarChart3,
  Search
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/context/AuthContext'
import integrationService, { type Integration, type IntegrationStats } from '@/services/integrationService'

const Integrations = () => {
  const { logActivity } = useAuth()
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [integrationStats, setIntegrationStats] = useState<IntegrationStats>({
    totalIntegrations: 0,
    connectedIntegrations: 0,
    disconnectedIntegrations: 0,
    pendingIntegrations: 0,
    lastSyncCount: 0,
    syncSuccessRate: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  // Dialog states
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false)
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false)
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)

  // Connection states
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [authWindow, setAuthWindow] = useState<Window | null>(null)

  const categories = integrationService.getCategories()

  useEffect(() => {
    loadIntegrations()
    loadIntegrationStats()
    logActivity('Integrations Visit', 'User accessed integrations management')
  }, [logActivity])

  const loadIntegrations = async () => {
    try {
      setLoading(true)
      const response = await integrationService.getIntegrations()
      
      if (response.success) {
        setIntegrations(response.data)
      } else {
        // Use sample data if API fails
        const sampleIntegrations = integrationService.getAvailableIntegrations()
        // Simulate some connected integrations
        const connectedIntegrations = sampleIntegrations.map((integration, index) => {
          if (index < 3) {
            return {
              ...integration,
              status: 'connected' as const,
              lastSync: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
              data: {
                accessToken: 'sample_token',
                userId: 'sample_user',
                accountInfo: {
                  name: `Sample ${integration.name} Account`,
                  email: 'sample@example.com'
                }
              }
            }
          }
          return integration
        })
        setIntegrations(connectedIntegrations)
      }
    } catch (error) {
      console.error('Error loading integrations:', error)
      setIntegrations(integrationService.getAvailableIntegrations())
    } finally {
      setLoading(false)
    }
  }

  const loadIntegrationStats = async () => {
    try {
      const response = await integrationService.getIntegrationStats()
      if (response.success) {
        setIntegrationStats(response.data)
      } else {
        setIntegrationStats(integrationService.getSampleIntegrationStats())
      }
    } catch (error) {
      console.error('Error loading integration stats:', error)
      setIntegrationStats(integrationService.getSampleIntegrationStats())
    }
  }

  const handleConnect = async (integration: Integration) => {
    setSelectedIntegration(integration)
    setIsConnectDialogOpen(true)
  }

  const handleConnectConfirm = async () => {
    if (!selectedIntegration) return

    try {
      setConnecting(true)
      
      // For YouTube, use real OAuth flow
      if (selectedIntegration._id === 'youtube') {
        // Generate YouTube OAuth URL
        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
        authUrl.searchParams.append('client_id', process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID || 'demo-client-id')
        authUrl.searchParams.append('redirect_uri', `${window.location.origin}/app/integrations/callback/youtube`)
        authUrl.searchParams.append('response_type', 'code')
        authUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.force-ssl')
        authUrl.searchParams.append('access_type', 'offline')
        authUrl.searchParams.append('prompt', 'consent')
        authUrl.searchParams.append('state', 'youtube')
        
        // Open OAuth window
        const width = 500
        const height = 600
        const left = window.screenX + (window.outerWidth - width) / 2
        const top = window.screenY + (window.outerHeight - height) / 2
        
        const authWindow = window.open(
          authUrl.toString(),
          'youtube_oauth',
          `width=${width},height=${height},left=${left},top=${top}`
        )
        
        if (authWindow) {
          setAuthWindow(authWindow)
          
          // Listen for OAuth completion
          const checkClosed = setInterval(() => {
            if (authWindow.closed) {
              clearInterval(checkClosed)
              setAuthWindow(null)
              setConnecting(false)
              setIsConnectDialogOpen(false)
              
              // Check if we have tokens stored (indicating successful connection)
              const tokens = integrationService.getStoredTokens('youtube')
              if (tokens?.accessToken) {
                // Update the integration status to connected
                setIntegrations(prev => prev.map(integration => 
                  integration._id === selectedIntegration._id 
                    ? { 
                        ...integration, 
                        status: 'connected' as const,
                        lastSync: new Date().toISOString(),
                        data: {
                          accessToken: tokens.accessToken,
                          refreshToken: tokens.refreshToken,
                          userId: 'youtube_user',
                          accountInfo: {
                            name: 'YouTube Channel',
                            email: 'youtube@example.com',
                            channelId: 'youtube_channel'
                          }
                        }
                      }
                    : integration
                ))
                
                loadIntegrationStats()
                alert('YouTube integration connected successfully! You can now sync your YouTube data.')
                logActivity('Integration Connected', `Connected ${selectedIntegration.name}`)
              } else {
                alert('YouTube connection was cancelled or failed. Please try again.')
              }
            }
          }, 1000)
        } else {
          alert('Please allow pop-ups for this site to connect YouTube.')
          setConnecting(false)
        }
        
        return
      }
      
      // For other integrations, show OAuth flow
      const authUrl = new URL(selectedIntegration.config.authUrl)
      authUrl.searchParams.append('client_id', selectedIntegration.config.clientId)
      authUrl.searchParams.append('redirect_uri', selectedIntegration.config.redirectUri)
      authUrl.searchParams.append('response_type', 'code')
      authUrl.searchParams.append('scope', selectedIntegration.config.scopes.join(' '))
      authUrl.searchParams.append('state', selectedIntegration._id || '')
      
      // Open OAuth window
      const width = 500
      const height = 600
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2
      
      const authWindow = window.open(
        authUrl.toString(),
        'oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      )
      
      if (authWindow) {
        setAuthWindow(authWindow)
        
        // Listen for OAuth completion
        const checkClosed = setInterval(() => {
          if (authWindow.closed) {
            clearInterval(checkClosed)
            setAuthWindow(null)
            setConnecting(false)
            setIsConnectDialogOpen(false)
            
            // Reload integrations to check if connection was successful
            loadIntegrations()
            loadIntegrationStats()
          }
        }, 1000)
      }
      
      logActivity('Integration Connect Attempt', `Attempted to connect ${selectedIntegration.name}`)
    } catch (error) {
      console.error('Error connecting integration:', error)
      alert('Failed to connect integration. Please try again.')
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async (integration: Integration) => {
    setSelectedIntegration(integration)
    setIsDisconnectDialogOpen(true)
  }

  const handleDisconnectConfirm = async () => {
    if (!selectedIntegration) return

    try {
      setDisconnecting(true)
      const response = await integrationService.disconnectIntegration(selectedIntegration._id || '')
      
      if (response.success) {
        // Update local state
        setIntegrations(prev => prev.map(integration => 
          integration._id === selectedIntegration._id 
            ? { ...integration, status: 'disconnected', lastSync: undefined, data: undefined }
            : integration
        ))
        
        loadIntegrationStats()
        logActivity('Integration Disconnected', `Disconnected ${selectedIntegration.name}`)
      } else {
        alert(response.error || 'Failed to disconnect integration')
      }
    } catch (error) {
      console.error('Error disconnecting integration:', error)
      alert('Failed to disconnect integration. Please try again.')
    } finally {
      setDisconnecting(false)
      setIsDisconnectDialogOpen(false)
    }
  }

  const handleSync = async (integration: Integration) => {
    setSelectedIntegration(integration)
    setIsSyncDialogOpen(true)
  }

  const handleSyncConfirm = async () => {
    if (!selectedIntegration) return

    try {
      setSyncing(true)
      
      // Check if integration is connected
      if (selectedIntegration.status !== 'connected') {
        alert('Please connect the integration first before syncing.')
        setIsSyncDialogOpen(false)
        return
      }

      const response = await integrationService.syncIntegration(selectedIntegration._id || '')
      
      if (response.success) {
        // Update local state
        setIntegrations(prev => prev.map(integration => 
          integration._id === selectedIntegration._id 
            ? { ...integration, lastSync: new Date().toISOString() }
            : integration
        ))
        
        loadIntegrationStats()
        logActivity('Integration Synced', `Synced ${selectedIntegration.name}`)
        
        // Show success message with real data
        let itemsSynced = 0
        let successMessage = `Successfully synced ${selectedIntegration.name}!`
        
        if ('data' in response && response.data) {
          itemsSynced = response.data.itemsSynced || 0
          
          if (selectedIntegration._id === 'youtube' && response.data.youtubeData) {
            const youtubeData = response.data.youtubeData
            const videos = youtubeData.videos?.length || 0
            const playlists = youtubeData.playlists?.length || 0
            const subscribers = youtubeData.subscribers || 0
            const totalViews = youtubeData.totalViews || 0
            
            successMessage = `Successfully synced YouTube! 
            
📊 Channel Statistics:
• Subscribers: ${subscribers.toLocaleString()}
• Total Views: ${totalViews.toLocaleString()}
• Videos Synced: ${videos}
• Playlists Synced: ${playlists}

Total items synced: ${itemsSynced}`
          } else if (selectedIntegration._id === 'slack') {
            successMessage = `Successfully synced Slack! ${itemsSynced} messages, channels, and team data were synced.`
          } else if (selectedIntegration._id === 'stripe') {
            successMessage = `Successfully synced Stripe! ${itemsSynced} transactions, customers, and revenue data were synced.`
          } else {
            successMessage = `Successfully synced ${selectedIntegration.name}! ${itemsSynced} items were synced.`
          }
        }
        
        alert(successMessage)
      } else {
        let errorMessage = 'Failed to sync integration'
        if ('error' in response && response.error) {
          errorMessage = response.error
        }
        alert(errorMessage)
      }
    } catch (error) {
      console.error('Error syncing integration:', error)
      alert('Failed to sync integration. Please try again.')
    } finally {
      setSyncing(false)
      setIsSyncDialogOpen(false)
    }
  }

  const handleViewDetails = (integration: Integration) => {
    setSelectedIntegration(integration)
    setIsDetailsDialogOpen(true)
  }

  const handleOpenSettings = (integration: Integration) => {
    setSelectedIntegration(integration)
    setIsSettingsDialogOpen(true)
  }

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || integration.category === categoryFilter
    const matchesStatus = statusFilter === 'All' || integration.status === statusFilter
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    return integrationService.getStatusColor(status)
  }

  const getStatusIcon = (status: string) => {
    return integrationService.getStatusIcon(status)
  }

  const formatLastSync = (lastSync?: string) => {
    return integrationService.formatLastSync(lastSync)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Social Media': return '📱'
      case 'Communication': return '💬'
      case 'Payments': return '💳'
      case 'Productivity': return '⚡'
      case 'Development': return '🐙'
      case 'Analytics': return '📊'
      case 'Marketing': return '🎯'
      default: return '🔗'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">
            Connect and manage third-party services for seamless workflow automation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => loadIntegrations()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrationStats.totalIntegrations}</div>
            <p className="text-xs text-muted-foreground">
              Available integrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrationStats.connectedIntegrations}
            </div>
            <p className="text-xs text-muted-foreground">
              Active connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disconnected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrationStats.disconnectedIntegrations}
            </div>
            <p className="text-xs text-muted-foreground">
              Available to connect
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sync Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrationStats.syncSuccessRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Recent syncs successful
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="connected">Connected</SelectItem>
            <SelectItem value="disconnected">Disconnected</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Integrations Grid */}
      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">Loading integrations...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredIntegrations.map((integration) => (
            <Card key={integration._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{integration.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription className="flex items-center space-x-1">
                        <span>{getCategoryIcon(integration.category)}</span>
                        <span>{integration.category}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(integration.status)}>
                    {getStatusIcon(integration.status)} {integration.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {integration.description}
                </p>
                
                {integration.lastSync && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <span>Last synced</span>
                    <span>{formatLastSync(integration.lastSync)}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  {integration.status === 'connected' ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(integration)}
                        className="flex-1"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Sync
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(integration)}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(integration)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleConnect(integration)}
                        className="flex-1"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Connect
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(integration)}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredIntegrations.length === 0 && !loading && (
        <div className="text-center py-12">
          <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No integrations found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}

      {/* Connect Integration Dialog */}
      <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              You will be redirected to {selectedIntegration?.name} to authorize the connection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Secure Connection</p>
                <p className="text-xs text-blue-700">
                  Your data is encrypted and secure. We only access the permissions you approve.
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Required Permissions:</Label>
              <div className="space-y-1">
                {selectedIntegration?.config.scopes.map((scope, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{scope}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConnectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConnectConfirm} disabled={connecting}>
              {connecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Connect to {selectedIntegration?.name}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disconnect Integration Dialog */}
      <Dialog open={isDisconnectDialogOpen} onOpenChange={setIsDisconnectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect {selectedIntegration?.name}? This will remove all synced data and stop future syncs.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDisconnectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDisconnectConfirm} disabled={disconnecting}>
              {disconnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Disconnect
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sync Integration Dialog */}
      <Dialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sync {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              Sync the latest data from {selectedIntegration?.name}. This may take a few moments.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSyncDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSyncConfirm} disabled={syncing}>
              {syncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Now
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Integration Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedIntegration?.name} Integration Details</DialogTitle>
            <DialogDescription>
              Detailed information about the {selectedIntegration?.name} integration
            </DialogDescription>
          </DialogHeader>
          {selectedIntegration && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedIntegration.status)}>
                    {getStatusIcon(selectedIntegration.status)} {selectedIntegration.status}
                  </Badge>
                </div>
                <div>
                  <Label>Category</Label>
                  <p className="text-sm text-muted-foreground">
                    {getCategoryIcon(selectedIntegration.category)} {selectedIntegration.category}
                  </p>
                </div>
                <div>
                  <Label>Last Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatLastSync(selectedIntegration.lastSync)}
                  </p>
                </div>
                <div>
                  <Label>Connection Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedIntegration.status === 'connected' ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedIntegration.description}
                </p>
              </div>

              {selectedIntegration.data?.accountInfo && (
                <div>
                  <Label>Connected Account</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">{selectedIntegration.data.accountInfo.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedIntegration.data.accountInfo.email}</p>
                  </div>
                </div>
              )}

              <div>
                <Label>Required Permissions</Label>
                <div className="mt-1 space-y-1">
                  {selectedIntegration.config.scopes.map((scope, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{scope}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Integrations 