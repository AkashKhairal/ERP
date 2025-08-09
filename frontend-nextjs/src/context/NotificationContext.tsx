'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import notificationService, { type Notification } from '@/services/notificationService'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  refreshNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  createNotification: (notification: Omit<Notification, '_id' | 'createdAt' | 'read' | 'readAt' | 'userId'>) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { user, isAuthenticated } = useAuth()

  // Load notifications
  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) return

    setIsLoading(true)
    try {
      const [notificationsResponse, countResponse] = await Promise.all([
        notificationService.getNotifications({ limit: 20 }),
        notificationService.getUnreadCount()
      ])

      if (notificationsResponse.success) {
        setNotifications(notificationsResponse.data)
      }

      if (countResponse.success) {
        setUnreadCount(countResponse.count)
      }
    } catch (error) {
      console.error('Error refreshing notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  // Initial load
  useEffect(() => {
    refreshNotifications()
  }, [refreshNotifications])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      refreshNotifications()
    }, 30000)

    return () => clearInterval(interval)
  }, [isAuthenticated, refreshNotifications])

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await notificationService.markAsRead(id)
      if (response.success) {
        setNotifications(prev =>
          prev.map(n =>
            n._id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('Failed to mark notification as read')
    }
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationService.markAllAsRead()
      if (response.success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() }))
        )
        setUnreadCount(0)
        toast.success('All notifications marked as read')
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      toast.error('Failed to mark all notifications as read')
    }
  }, [])

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      const response = await notificationService.deleteNotification(id)
      if (response.success) {
        const notification = notifications.find(n => n._id === id)
        setNotifications(prev => prev.filter(n => n._id !== id))
        
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
        
        toast.success('Notification deleted')
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Failed to delete notification')
    }
  }, [notifications])

  // Create notification (for system/admin use)
  const createNotification = useCallback(async (notificationData: Omit<Notification, '_id' | 'createdAt' | 'read' | 'readAt' | 'userId'>) => {
    if (!user) return

    try {
      const response = await notificationService.createNotification({
        ...notificationData,
        userId: user._id!
      })
      
      if (response.success) {
        setNotifications(prev => [response.data, ...prev])
        setUnreadCount(prev => prev + 1)
        
        // Show toast notification for important notifications
        if (notificationData.priority === 'urgent' || notificationData.priority === 'high') {
          toast(notificationData.message, {
            icon: notificationService.getNotificationIcon(notificationData.type),
            duration: 6000,
          })
        }
      }
    } catch (error) {
      console.error('Error creating notification:', error)
    }
  }, [user])

  // Listen for real-time notifications (WebSocket/SSE would go here)
  useEffect(() => {
    if (!isAuthenticated) return

    // This is where you would implement WebSocket connection
    // for real-time notifications in a production environment
    
    // Example:
    // const ws = new WebSocket(`ws://localhost:5000/notifications/${user._id}`)
    // ws.onmessage = (event) => {
    //   const notification = JSON.parse(event.data)
    //   setNotifications(prev => [notification, ...prev])
    //   setUnreadCount(prev => prev + 1)
    //   
    //   // Show toast for new notifications
    //   toast(notification.message, {
    //     icon: notificationService.getNotificationIcon(notification.type),
    //   })
    // }
    // 
    // return () => ws.close()
  }, [isAuthenticated, user])

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Helper hook for creating common notification types
export function useNotificationHelpers() {
  const { createNotification } = useNotifications()

  const notifyTaskAssigned = useCallback((taskTitle: string, assignee: string, taskId: string) => {
    createNotification({
      title: 'New Task Assigned',
      message: `You have been assigned to "${taskTitle}" task`,
      type: 'task',
      category: 'task',
      priority: 'medium',
      actionUrl: `/tasks/${taskId}`,
      actionText: 'View Task',
      metadata: { taskId }
    })
  }, [createNotification])

  const notifyTaskCompleted = useCallback((taskTitle: string, completedBy: string, taskId: string) => {
    createNotification({
      title: 'Task Completed',
      message: `Task "${taskTitle}" has been completed by ${completedBy}`,
      type: 'success',
      category: 'task',
      priority: 'low',
      actionUrl: `/tasks/${taskId}`,
      actionText: 'View Task',
      metadata: { taskId, completedBy }
    })
  }, [createNotification])

  const notifyProjectUpdate = useCallback((projectName: string, projectId: string) => {
    createNotification({
      title: 'Project Update',
      message: `Project "${projectName}" has been updated with new information`,
      type: 'project',
      category: 'project',
      priority: 'medium',
      actionUrl: `/projects/${projectId}`,
      actionText: 'View Project',
      metadata: { projectId }
    })
  }, [createNotification])

  const notifySecurityAlert = useCallback (message: string, actionUrl?: string) => {
    createNotification({
      title: 'Security Alert',
      message,
      type: 'warning',
      category: 'security',
      priority: 'urgent',
      actionUrl: actionUrl || '/profile?tab=security',
      actionText: 'Review Security'
    })
  }, [createNotification])

  const notifySystemMaintenance = useCallback((message: string, scheduledTime?: string) => {
    createNotification({
      title: 'System Maintenance',
      message,
      type: 'system',
      category: 'system',
      priority: 'medium',
      actionUrl: '/system/maintenance',
      actionText: 'Learn More',
      metadata: { scheduledTime }
    })
  }, [createNotification])

  return {
    notifyTaskAssigned,
    notifyTaskCompleted,
    notifyProjectUpdate,
    notifySecurityAlert,
    notifySystemMaintenance
  }
}
