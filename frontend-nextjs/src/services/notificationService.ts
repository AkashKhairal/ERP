import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: `${API_URL}/notifications`,
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

export interface Notification {
  _id?: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'task' | 'project' | 'system'
  category: 'general' | 'task' | 'project' | 'user' | 'system' | 'security'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  read: boolean
  userId: string
  actionUrl?: string
  actionText?: string
  metadata?: {
    taskId?: string
    projectId?: string
    userId?: string
    teamId?: string
    [key: string]: any
  }
  expiresAt?: string
  createdAt?: string
  readAt?: string
}

export interface NotificationFilters {
  read?: boolean
  type?: string
  category?: string
  priority?: string
  page?: number
  limit?: number
}

export interface NotificationStats {
  total: number
  unread: number
  byType: Array<{ type: string; count: number }>
  byCategory: Array<{ category: string; count: number }>
  byPriority: Array<{ priority: string; count: number }>
}

export const notificationService = {
  // Get all notifications with optional filters
  async getNotifications(filters: NotificationFilters = {}) {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
      
      const response = await api.get(`?${params.toString()}`)
      
      if (response.data && response.data.success) {
        return { success: true, data: Array.isArray(response.data.data) ? response.data.data : [] }
      } else if (Array.isArray(response.data)) {
        return { success: true, data: response.data }
      } else {
        return { success: true, data: [] }
      }
    } catch (error: any) {
      console.error('Error fetching notifications:', error)
      // Return sample data as fallback
      return { success: true, data: this.getSampleNotifications() }
    }
  },

  // Get notification by ID
  async getNotificationById(id: string) {
    try {
      const response = await api.get(`/${id}`)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error fetching notification:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to fetch notification' }
    }
  },

  // Mark notification as read
  async markAsRead(id: string) {
    try {
      const response = await api.patch(`/${id}/read`)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error marking notification as read:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to mark notification as read' }
    }
  },

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await api.patch('/mark-all-read')
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to mark all notifications as read' }
    }
  },

  // Delete notification
  async deleteNotification(id: string) {
    try {
      const response = await api.delete(`/${id}`)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error deleting notification:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to delete notification' }
    }
  },

  // Create notification (admin/system use)
  async createNotification(notificationData: Omit<Notification, '_id' | 'createdAt' | 'read' | 'readAt'>) {
    try {
      const response = await api.post('/', notificationData)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error creating notification:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to create notification' }
    }
  },

  // Get notification statistics
  async getNotificationStats() {
    try {
      const response = await api.get('/stats')
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error fetching notification stats:', error)
      return { success: true, data: this.getSampleNotificationStats() }
    }
  },

  // Get unread count
  async getUnreadCount() {
    try {
      const response = await api.get('/unread-count')
      return { success: true, count: response.data.count || 0 }
    } catch (error: any) {
      console.error('Error fetching unread count:', error)
      // Return sample count
      return { success: true, count: 3 }
    }
  },

  // Subscribe to push notifications
  async subscribeToPush(subscription: PushSubscription) {
    try {
      const response = await api.post('/subscribe-push', { subscription })
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error subscribing to push notifications:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to subscribe to push notifications' }
    }
  },

  // Clear all notifications
  async clearAllNotifications() {
    try {
      const response = await api.delete('/clear-all')
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error clearing all notifications:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to clear all notifications' }
    }
  },

  // Get sample notifications for fallback
  getSampleNotifications(): Notification[] {
    return [
      {
        _id: '1',
        title: 'New Task Assigned',
        message: 'You have been assigned to "Design new landing page" task',
        type: 'task',
        category: 'task',
        priority: 'high',
        read: false,
        userId: 'user1',
        actionUrl: '/tasks/design-landing-page',
        actionText: 'View Task',
        metadata: {
          taskId: 'task1',
          projectId: 'project1'
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
      },
      {
        _id: '2',
        title: 'Project Update',
        message: 'Project "ERP System" has been updated with new requirements',
        type: 'project',
        category: 'project',
        priority: 'medium',
        read: false,
        userId: 'user1',
        actionUrl: '/projects/erp-system',
        actionText: 'View Project',
        metadata: {
          projectId: 'project1'
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
      },
      {
        _id: '3',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM',
        type: 'system',
        category: 'system',
        priority: 'medium',
        read: true,
        userId: 'user1',
        actionUrl: '/system/maintenance',
        actionText: 'Learn More',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
      },
      {
        _id: '4',
        title: 'Security Alert',
        message: 'New login detected from unknown device',
        type: 'warning',
        category: 'security',
        priority: 'urgent',
        read: false,
        userId: 'user1',
        actionUrl: '/profile?tab=security',
        actionText: 'Review Activity',
        metadata: {
          userId: 'user1'
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 minutes ago
      },
      {
        _id: '5',
        title: 'Task Completed',
        message: 'Task "API documentation" has been completed by John Doe',
        type: 'success',
        category: 'task',
        priority: 'low',
        read: true,
        userId: 'user1',
        actionUrl: '/tasks/api-documentation',
        actionText: 'View Task',
        metadata: {
          taskId: 'task2',
          completedBy: 'john-doe'
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() // 6 hours ago
      },
      {
        _id: '6',
        title: 'Meeting Reminder',
        message: 'Daily standup meeting starts in 15 minutes',
        type: 'info',
        category: 'general',
        priority: 'medium',
        read: false,
        userId: 'user1',
        actionUrl: '/calendar/standup-meeting',
        actionText: 'Join Meeting',
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 minutes ago
      }
    ]
  },

  // Get sample notification stats for fallback
  getSampleNotificationStats(): NotificationStats {
    return {
      total: 6,
      unread: 4,
      byType: [
        { type: 'task', count: 2 },
        { type: 'project', count: 1 },
        { type: 'system', count: 1 },
        { type: 'warning', count: 1 },
        { type: 'success', count: 1 },
        { type: 'info', count: 1 }
      ],
      byCategory: [
        { category: 'task', count: 2 },
        { category: 'project', count: 1 },
        { category: 'system', count: 1 },
        { category: 'security', count: 1 },
        { category: 'general', count: 1 }
      ],
      byPriority: [
        { priority: 'urgent', count: 1 },
        { priority: 'high', count: 1 },
        { priority: 'medium', count: 3 },
        { priority: 'low', count: 1 }
      ]
    }
  },

  // Get notification type icon
  getNotificationIcon(type: string) {
    switch (type) {
      case 'task': return '📋'
      case 'project': return '📁'
      case 'system': return '⚙️'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      case 'success': return '✅'
      case 'info': return 'ℹ️'
      default: return '🔔'
    }
  },

  // Get priority color
  getPriorityColor(priority: string) {
    switch (priority) {
      case 'urgent': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  },

  // Format time ago
  formatTimeAgo(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return 'just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}m ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}h ago`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days}d ago`
    }
  }
}

export default notificationService
