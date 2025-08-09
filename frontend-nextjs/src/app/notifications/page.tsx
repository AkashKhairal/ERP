'use client'

import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Settings, 
  Filter,
  Search,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  ExternalLink,
  Archive,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import notificationService, { type Notification, type NotificationStats } from '@/services/notificationService'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set())
  const { user, logActivity } = useAuth()
  const router = useRouter()

  // Load notifications and stats
  const loadData = async () => {
    setLoading(true)
    try {
      const [notificationsResponse, statsResponse] = await Promise.all([
        notificationService.getNotifications({
          read: filter === 'all' ? undefined : filter === 'read',
          category: categoryFilter === 'all' ? undefined : categoryFilter,
          limit: 50
        }),
        notificationService.getNotificationStats()
      ])

      if (notificationsResponse.success) {
        setNotifications(notificationsResponse.data)
      }

      if (statsResponse.success) {
        setStats(statsResponse.data)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    logActivity('Notifications Page Visit', 'User accessed notifications page')
  }, [filter, categoryFilter, logActivity])

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.read) return

    try {
      const response = await notificationService.markAsRead(notification._id!)
      if (response.success) {
        setNotifications(prev =>
          prev.map(n =>
            n._id === notification._id ? { ...n, read: true, readAt: new Date().toISOString() } : n
          )
        )
        logActivity('Notification Read', `Marked notification as read: ${notification.title}`)
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead()
      if (response.success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() }))
        )
        logActivity('All Notifications Read', 'Marked all notifications as read')
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const handleDeleteNotification = async (notification: Notification) => {
    try {
      const response = await notificationService.deleteNotification(notification._id!)
      if (response.success) {
        setNotifications(prev => prev.filter(n => n._id !== notification._id))
        setSelectedNotifications(prev => {
          const newSet = new Set(prev)
          newSet.delete(notification._id!)
          return newSet
        })
        logActivity('Notification Deleted', `Deleted notification: ${notification.title}`)
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const handleBulkMarkAsRead = async () => {
    const unreadSelected = notifications.filter(n => 
      selectedNotifications.has(n._id!) && !n.read
    )

    try {
      await Promise.all(
        unreadSelected.map(n => notificationService.markAsRead(n._id!))
      )
      
      setNotifications(prev =>
        prev.map(n =>
          selectedNotifications.has(n._id!) && !n.read
            ? { ...n, read: true, readAt: new Date().toISOString() }
            : n
        )
      )
      setSelectedNotifications(new Set())
      logActivity('Bulk Notifications Read', `Marked ${unreadSelected.length} notifications as read`)
    } catch (error) {
      console.error('Error bulk marking as read:', error)
    }
  }

  const handleBulkDelete = async () => {
    const selectedItems = notifications.filter(n => selectedNotifications.has(n._id!))
    
    try {
      await Promise.all(
        selectedItems.map(n => notificationService.deleteNotification(n._id!))
      )
      
      setNotifications(prev => 
        prev.filter(n => !selectedNotifications.has(n._id!))
      )
      setSelectedNotifications(new Set())
      logActivity('Bulk Notifications Deleted', `Deleted ${selectedItems.length} notifications`)
    } catch (error) {
      console.error('Error bulk deleting:', error)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    await handleMarkAsRead(notification)

    // Navigate to action URL if available
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  const handleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set())
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n._id!)))
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />
      case 'info': return <Info className="h-5 w-5 text-blue-500" />
      case 'task': return <CheckCircle className="h-5 w-5 text-purple-500" />
      case 'project': return <Info className="h-5 w-5 text-indigo-500" />
      case 'system': return <Settings className="h-5 w-5 text-gray-500" />
      default: return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50 dark:bg-red-950/20'
      case 'high': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/20'
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
      case 'low': return 'border-l-green-500 bg-green-50 dark:bg-green-950/20'
      default: return 'border-l-gray-300 bg-gray-50 dark:bg-gray-950/20'
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filter === 'all' || 
      (filter === 'read' && notification.read) ||
      (filter === 'unread' && !notification.read)
    
    const matchesCategory = categoryFilter === 'all' || notification.category === categoryFilter
    const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter
    
    return matchesSearch && matchesFilter && matchesCategory && matchesPriority
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading notifications...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Manage your notifications and stay updated
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => router.push('/profile?tab=notifications')}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Bell className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unread</p>
                  <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Read</p>
                  <p className="text-2xl font-bold text-green-600">{stats.total - stats.unread}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Priority</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.byPriority.find(p => p.priority === 'urgent')?.count || 0}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="task">Tasks</SelectItem>
              <SelectItem value="project">Projects</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedNotifications.size > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedNotifications.size} notification(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleBulkMarkAsRead}>
                  <Check className="h-4 w-4 mr-2" />
                  Mark as Read
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedNotifications(new Set())}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No notifications found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms or filters.' : 'All caught up! No new notifications.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Select All */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedNotifications.size === filteredNotifications.length}
                onChange={handleSelectAll}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-muted-foreground">
                {selectedNotifications.size === filteredNotifications.length ? 'Deselect all' : 'Select all'}
              </span>
              {notifications.filter(n => !n.read).length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark all as read
                </Button>
              )}
            </div>

            {/* Notification Items */}
            {filteredNotifications.map((notification) => (
              <Card 
                key={notification._id} 
                className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${getPriorityColor(notification.priority)} ${
                  !notification.read ? 'bg-muted/30' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.has(notification._id!)}
                      onChange={(e) => {
                        const newSet = new Set(selectedNotifications)
                        if (e.target.checked) {
                          newSet.add(notification._id!)
                        } else {
                          newSet.delete(notification._id!)
                        }
                        setSelectedNotifications(newSet)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 rounded border-gray-300"
                    />
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-2 mt-3">
                            <span className="text-xs text-muted-foreground">
                              {notificationService.formatTimeAgo(notification.createdAt!)}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {notification.category}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${notificationService.getPriorityColor(notification.priority)}`}
                            >
                              {notification.priority}
                            </Badge>
                            {notification.actionUrl && (
                              <Badge variant="outline" className="text-xs">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                {notification.actionText || 'View'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMarkAsRead(notification)
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteNotification(notification)
                            }}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage
