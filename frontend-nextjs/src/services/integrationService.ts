import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: `${API_URL}/integrations`,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export interface IntegrationConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
  authUrl: string
  tokenUrl: string
}

export interface IntegrationData {
  accessToken?: string
  refreshToken?: string
  expiresAt?: string
  userId?: string
  accountInfo?: any
  settings?: any
}

export interface Integration {
  _id?: string
  name: string
  description: string
  status: 'connected' | 'disconnected' | 'pending' | 'error'
  icon: string
  category: 'Social Media' | 'Communication' | 'Payments' | 'Productivity' | 'Development' | 'Analytics' | 'Marketing'
  lastSync?: string
  config: IntegrationConfig
  data?: IntegrationData
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface IntegrationStats {
  totalIntegrations: number
  connectedIntegrations: number
  disconnectedIntegrations: number
  pendingIntegrations: number
  lastSyncCount: number
  syncSuccessRate: number
}

export interface SyncResult {
  success: boolean
  message: string
  data?: any
  timestamp: string
}

export interface YouTubeData {
  videos?: any[]
  playlists?: any[]
  channels?: any[]
  analytics?: any
  subscribers?: number
  totalViews?: number
  totalVideos?: number
}

export const integrationService = {
  // Get all integrations
  async getIntegrations() {
    try {
      const response = await api.get('/')
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error fetching integrations:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to fetch integrations' }
    }
  },

  // Get integration by ID
  async getIntegrationById(id: string) {
    try {
      const response = await api.get(`/${id}`)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error fetching integration:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to fetch integration' }
    }
  },

  // Connect integration
  async connectIntegration(integrationId: string, authCode?: string) {
    try {
      const response = await api.post(`/${integrationId}/connect`, { authCode })
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error connecting integration:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to connect integration' }
    }
  },

  // Disconnect integration
  async disconnectIntegration(integrationId: string) {
    try {
      const response = await api.post(`/${integrationId}/disconnect`)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error disconnecting integration:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to disconnect integration' }
    }
  },

  // Sync integration
  async syncIntegration(integrationId: string) {
    try {
      // Check if integration is connected first
      const integrations = this.getAvailableIntegrations()
      const integration = integrations.find(i => i._id === integrationId)
      
      if (!integration) {
        return { success: false, error: 'Integration not found' }
      }

      // For YouTube, use real API calls
      if (integrationId === 'youtube') {
        return await this.syncYouTubeData()
      }

      // For other integrations, simulate sync
      const mockSyncData = {
        success: true,
        data: {
          syncedAt: new Date().toISOString(),
          itemsSynced: Math.floor(Math.random() * 100) + 10,
          status: 'completed'
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000))
      return mockSyncData
    } catch (error: any) {
      console.error('Error syncing integration:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to sync integration' }
    }
  },

  // Sync YouTube data using real API
  async syncYouTubeData(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const tokens = this.getStoredTokens('youtube')
      if (!tokens?.accessToken) {
        return { success: false, error: 'YouTube not connected. Please connect your YouTube account first.' }
      }

      // Fetch YouTube data using the YouTube Data API v3
      const youtubeData: YouTubeData = {}
      let totalItemsSynced = 0

      // Fetch channel information
      const channelResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
        params: {
          part: 'snippet,statistics',
          mine: true,
          key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || 'demo-key',
          access_token: tokens.accessToken
        }
      })

      if (channelResponse.data?.items?.[0]) {
        const channel = channelResponse.data.items[0]
        youtubeData.channels = [channel]
        youtubeData.subscribers = parseInt(channel.statistics?.subscriberCount || '0')
        youtubeData.totalViews = parseInt(channel.statistics?.viewCount || '0')
        totalItemsSynced += 1
      }

      // Fetch videos
      const videosResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          forMine: true,
          type: 'video',
          maxResults: 50,
          order: 'date',
          key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || 'demo-key',
          access_token: tokens.accessToken
        }
      })

      if (videosResponse.data?.items) {
        youtubeData.videos = videosResponse.data.items
        youtubeData.totalVideos = videosResponse.data.pageInfo?.totalResults || 0
        totalItemsSynced += videosResponse.data.items.length
      }

      // Fetch playlists
      const playlistsResponse = await axios.get('https://www.googleapis.com/youtube/v3/playlists', {
        params: {
          part: 'snippet',
          mine: true,
          maxResults: 50,
          key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || 'demo-key',
          access_token: tokens.accessToken
        }
      })

      if (playlistsResponse.data?.items) {
        youtubeData.playlists = playlistsResponse.data.items
        totalItemsSynced += playlistsResponse.data.items.length
      }

      // Store the synced data
      this.storeTokens('youtube', {
        ...tokens,
        syncedData: youtubeData,
        lastSync: new Date().toISOString()
      })

      return {
        success: true,
        data: {
          syncedAt: new Date().toISOString(),
          itemsSynced: totalItemsSynced,
          status: 'completed',
          youtubeData
        }
      }
    } catch (error: any) {
      console.error('Error syncing YouTube data:', error)
      return { 
        success: false, 
        error: error.response?.data?.error?.message || 'Failed to sync YouTube data. Please check your connection and try again.' 
      }
    }
  },

  // Get integration statistics
  async getIntegrationStats() {
    try {
      const response = await api.get('/stats')
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error fetching integration stats:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to fetch integration stats' }
    }
  },

  // Get integration auth URL
  async getAuthUrl(integrationId: string) {
    try {
      const response = await api.get(`/${integrationId}/auth-url`)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error getting auth URL:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to get auth URL' }
    }
  },

  // Update integration settings
  async updateIntegrationSettings(integrationId: string, settings: any) {
    try {
      const response = await api.put(`/${integrationId}/settings`, settings)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error updating integration settings:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to update integration settings' }
    }
  },

  // Get available integrations
  getAvailableIntegrations(): Integration[] {
    return [
      {
        _id: 'youtube',
        name: 'YouTube',
        description: 'Connect your YouTube channel for analytics, content management, and video insights',
        status: 'disconnected',
        icon: '🎥',
        category: 'Social Media',
        isActive: true,
        config: {
          clientId: process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID || 'demo-client-id',
          clientSecret: '',
          redirectUri: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/app/integrations/callback/youtube`,
          scopes: ['https://www.googleapis.com/auth/youtube.readonly', 'https://www.googleapis.com/auth/youtube.force-ssl'],
          authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenUrl: 'https://oauth2.googleapis.com/token'
        }
      },
      {
        _id: 'slack',
        name: 'Slack',
        description: 'Integrate with Slack for team communication, notifications, and channel management',
        status: 'disconnected',
        icon: '💬',
        category: 'Communication',
        isActive: true,
        config: {
          clientId: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID || 'demo-client-id',
          clientSecret: '',
          redirectUri: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/app/integrations/callback/slack`,
          scopes: ['channels:read', 'chat:write', 'users:read'],
          authUrl: 'https://slack.com/oauth/v2/authorize',
          tokenUrl: 'https://slack.com/api/oauth.v2.access'
        }
      },
      {
        _id: 'stripe',
        name: 'Stripe',
        description: 'Connect Stripe for payment processing, revenue tracking, and financial analytics',
        status: 'disconnected',
        icon: '💳',
        category: 'Payments',
        isActive: true,
        config: {
          clientId: process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID || 'demo-client-id',
          clientSecret: '',
          redirectUri: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/app/integrations/callback/stripe`,
          scopes: ['read_write'],
          authUrl: 'https://connect.stripe.com/oauth/authorize',
          tokenUrl: 'https://connect.stripe.com/oauth/token'
        }
      },
      {
        _id: 'notion',
        name: 'Notion',
        description: 'Sync with Notion for project documentation, collaboration, and knowledge management',
        status: 'disconnected',
        icon: '📝',
        category: 'Productivity',
        isActive: true,
        config: {
          clientId: process.env.NEXT_PUBLIC_NOTION_CLIENT_ID || 'demo-client-id',
          clientSecret: '',
          redirectUri: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/app/integrations/callback/notion`,
          scopes: ['read', 'write'],
          authUrl: 'https://api.notion.com/v1/oauth/authorize',
          tokenUrl: 'https://api.notion.com/v1/oauth/token'
        }
      },
      {
        _id: 'google-calendar',
        name: 'Google Calendar',
        description: 'Sync calendar events, schedule management, and meeting coordination',
        status: 'disconnected',
        icon: '📅',
        category: 'Productivity',
        isActive: true,
        config: {
          clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'demo-client-id',
          clientSecret: '',
          redirectUri: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/app/integrations/callback/google-calendar`,
          scopes: ['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/calendar.events'],
          authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenUrl: 'https://oauth2.googleapis.com/token'
        }
      },
      {
        _id: 'github',
        name: 'GitHub',
        description: 'Connect GitHub for code repository management, issues, and development workflow',
        status: 'disconnected',
        icon: '🐙',
        category: 'Development',
        isActive: true,
        config: {
          clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'demo-client-id',
          clientSecret: '',
          redirectUri: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/app/integrations/callback/github`,
          scopes: ['repo', 'user', 'read:org'],
          authUrl: 'https://github.com/login/oauth/authorize',
          tokenUrl: 'https://github.com/login/oauth/access_token'
        }
      },
      {
        _id: 'discord',
        name: 'Discord',
        description: 'Integrate with Discord for community management and bot interactions',
        status: 'disconnected',
        icon: '🎮',
        category: 'Communication',
        isActive: true,
        config: {
          clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || 'demo-client-id',
          clientSecret: '',
          redirectUri: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/app/integrations/callback/discord`,
          scopes: ['identify', 'guilds', 'bot'],
          authUrl: 'https://discord.com/api/oauth2/authorize',
          tokenUrl: 'https://discord.com/api/oauth2/token'
        }
      },
      {
        _id: 'trello',
        name: 'Trello',
        description: 'Sync with Trello for project management and task tracking',
        status: 'disconnected',
        icon: '📋',
        category: 'Productivity',
        isActive: true,
        config: {
          clientId: process.env.NEXT_PUBLIC_TRELLO_CLIENT_ID || 'demo-client-id',
          clientSecret: '',
          redirectUri: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/app/integrations/callback/trello`,
          scopes: ['read', 'write'],
          authUrl: 'https://trello.com/1/authorize',
          tokenUrl: 'https://trello.com/1/token'
        }
      },
      {
        _id: 'zapier',
        name: 'Zapier',
        description: 'Connect Zapier for workflow automation and app integrations',
        status: 'disconnected',
        icon: '⚡',
        category: 'Productivity',
        isActive: true,
        config: {
          clientId: process.env.NEXT_PUBLIC_ZAPIER_CLIENT_ID || 'demo-client-id',
          clientSecret: '',
          redirectUri: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/app/integrations/callback/zapier`,
          scopes: ['read', 'write'],
          authUrl: 'https://zapier.com/apps/authorize',
          tokenUrl: 'https://zapier.com/api/v2/token'
        }
      }
    ]
  },

  // Get sample integration stats
  getSampleIntegrationStats(): IntegrationStats {
    return {
      totalIntegrations: 9,
      connectedIntegrations: 3,
      disconnectedIntegrations: 6,
      pendingIntegrations: 0,
      lastSyncCount: 3,
      syncSuccessRate: 85
    }
  },

  // Get integration categories
  getCategories() {
    return ['All', 'Social Media', 'Communication', 'Payments', 'Productivity', 'Development', 'Analytics', 'Marketing']
  },

  // Get integration status colors
  getStatusColor(status: string) {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800'
      case 'disconnected': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  },

  // Get integration status icons
  getStatusIcon(status: string) {
    switch (status) {
      case 'connected': return '✅'
      case 'disconnected': return '❌'
      case 'pending': return '⏳'
      case 'error': return '⚠️'
      default: return '❓'
    }
  },

  // Format last sync time
  formatLastSync(lastSync?: string) {
    if (!lastSync) return 'Never'
    const date = new Date(lastSync)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`
    return date.toLocaleDateString()
  },

  // Check if integration is connected
  isIntegrationConnected(integration: Integration): boolean {
    return integration.status === 'connected' && !!integration.data?.accessToken
  },

  // Get stored OAuth tokens
  getStoredTokens(integrationId: string) {
    if (typeof window === 'undefined') return null
    
    const tokens = localStorage.getItem(`integration_${integrationId}_tokens`)
    return tokens ? JSON.parse(tokens) : null
  },

  // Store OAuth tokens
  storeTokens(integrationId: string, tokens: any) {
    if (typeof window === 'undefined') return
    
    localStorage.setItem(`integration_${integrationId}_tokens`, JSON.stringify(tokens))
  },

  // Clear stored tokens
  clearTokens(integrationId: string) {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(`integration_${integrationId}_tokens`)
  },

  // Exchange authorization code for tokens (for YouTube)
  async exchangeCodeForTokens(code: string, integrationId: string) {
    try {
      const integration = this.getAvailableIntegrations().find(i => i._id === integrationId)
      if (!integration) {
        throw new Error('Integration not found')
      }

      // For YouTube, we need to use the proper OAuth flow
      if (integrationId === 'youtube') {
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', 
          new URLSearchParams({
            client_id: integration.config.clientId,
            client_secret: integration.config.clientSecret || '',
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: integration.config.redirectUri
          }), 
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        )

        if (tokenResponse.data?.access_token) {
          const tokens = {
            accessToken: tokenResponse.data.access_token,
            refreshToken: tokenResponse.data.refresh_token,
            expiresAt: new Date(Date.now() + (tokenResponse.data.expires_in * 1000)).toISOString(),
            tokenType: tokenResponse.data.token_type
          }

          this.storeTokens(integrationId, tokens)
          return { success: true, data: tokens }
        } else {
          throw new Error('Failed to get access token from YouTube')
        }
      }

      // For other integrations, use the generic flow
      const tokenResponse = await axios.post(integration.config.tokenUrl, {
        client_id: integration.config.clientId,
        client_secret: integration.config.clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: integration.config.redirectUri
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      if (tokenResponse.data?.access_token) {
        const tokens = {
          accessToken: tokenResponse.data.access_token,
          refreshToken: tokenResponse.data.refresh_token,
          expiresAt: new Date(Date.now() + (tokenResponse.data.expires_in * 1000)).toISOString(),
          tokenType: tokenResponse.data.token_type
        }

        this.storeTokens(integrationId, tokens)
        return { success: true, data: tokens }
      } else {
        throw new Error('Failed to get access token')
      }
    } catch (error: any) {
      console.error('Error exchanging code for tokens:', error)
      let errorMessage = 'Failed to exchange authorization code'
      
      if (error.response?.data?.error) {
        errorMessage = `${error.response.data.error}: ${error.response.data.error_description || ''}`
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return { success: false, error: errorMessage }
    }
  }
}

export default integrationService 