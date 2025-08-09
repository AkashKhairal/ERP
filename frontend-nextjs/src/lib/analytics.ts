import { track } from '@vercel/analytics'

// Custom analytics events for the ERP system
export const analytics = {
  // Authentication events
  login: (method: 'email' | 'google') => {
    track('user_login', { method })
  },
  
  register: (method: 'email' | 'google') => {
    track('user_register', { method })
  },
  
  logout: () => {
    track('user_logout')
  },

  // Project events
  projectCreated: (projectType?: string) => {
    track('project_created', projectType ? { type: projectType } : {})
  },
  
  projectDeleted: (projectId: string) => {
    track('project_deleted', { project_id: projectId })
  },
  
  projectCompleted: (projectId: string, duration?: number) => {
    const properties: Record<string, any> = { project_id: projectId }
    if (duration !== undefined) properties.duration_days = duration
    track('project_completed', properties)
  },

  // Task events
  taskCreated: (taskType?: string, priority?: string) => {
    const properties: Record<string, any> = {}
    if (taskType) properties.type = taskType
    if (priority) properties.priority = priority
    track('task_created', properties)
  },
  
  taskCompleted: (taskId: string, timeSpent?: number) => {
    const properties: Record<string, any> = { task_id: taskId }
    if (timeSpent !== undefined) properties.time_spent_minutes = timeSpent
    track('task_completed', properties)
  },
  
  taskAssigned: (taskId: string, assigneeCount: number) => {
    track('task_assigned', { 
      task_id: taskId,
      assignee_count: assigneeCount 
    })
  },

  // Team events
  teamCreated: (teamSize: number) => {
    track('team_created', { team_size: teamSize })
  },
  
  teamMemberAdded: (teamId: string, role?: string) => {
    const properties: Record<string, any> = { team_id: teamId }
    if (role) properties.role = role
    track('team_member_added', properties)
  },
  
  teamMemberRemoved: (teamId: string) => {
    track('team_member_removed', { team_id: teamId })
  },

  // Content events
  contentCreated: (contentType: string, category?: string) => {
    const properties: Record<string, any> = { type: contentType }
    if (category) properties.category = category
    track('content_created', properties)
  },
  
  contentPublished: (contentId: string, platform?: string) => {
    const properties: Record<string, any> = { content_id: contentId }
    if (platform) properties.platform = platform
    track('content_published', properties)
  },
  
  contentViewed: (contentId: string, viewDuration?: number) => {
    const properties: Record<string, any> = { content_id: contentId }
    if (viewDuration !== undefined) properties.view_duration_seconds = viewDuration
    track('content_viewed', properties)
  },

  // User engagement events
  dashboardViewed: (section?: string) => {
    track('dashboard_viewed', section ? { section } : {})
  },
  
  featureUsed: (featureName: string, context?: string) => {
    const properties: Record<string, any> = { feature: featureName }
    if (context) properties.context = context
    track('feature_used', properties)
  },
  
  searchPerformed: (query: string, resultsCount: number) => {
    track('search_performed', { 
      query_length: query.length,
      results_count: resultsCount 
    })
  },
  
  settingsChanged: (settingType: string, newValue?: string) => {
    const properties: Record<string, any> = { setting_type: settingType }
    if (newValue) properties.new_value = newValue
    track('settings_changed', properties)
  },

  // Error events
  errorOccurred: (errorType: string, errorMessage?: string, context?: string) => {
    const properties: Record<string, any> = { error_type: errorType }
    if (errorMessage) properties.error_message = errorMessage.substring(0, 100)
    if (context) properties.context = context
    track('error_occurred', properties)
  },

  // Performance events
  pageLoadTime: (pageName: string, loadTime: number) => {
    track('page_load_time', { 
      page: pageName,
      load_time_ms: loadTime 
    })
  },
  
  apiCallTime: (endpoint: string, duration: number, status: number) => {
    track('api_call_time', { 
      endpoint: endpoint,
      duration_ms: duration,
      status_code: status 
    })
  },

  // Business metrics
  subscriptionUpgrade: (fromPlan: string, toPlan: string) => {
    track('subscription_upgrade', { 
      from_plan: fromPlan,
      to_plan: toPlan 
    })
  },
  
  subscriptionCancel: (plan: string, reason?: string) => {
    const properties: Record<string, any> = { plan: plan }
    if (reason) properties.reason = reason
    track('subscription_cancel', properties)
  },
  
  paymentCompleted: (amount: number, currency: string, plan?: string) => {
    const properties: Record<string, any> = { 
      amount: amount,
      currency: currency
    }
    if (plan) properties.plan = plan
    track('payment_completed', properties)
  },

  // Custom event wrapper for any additional tracking needs
  custom: (eventName: string, properties?: Record<string, any>) => {
    track(eventName, properties || {})
  }
}

// Helper function to track page views with additional context
export const trackPageView = (pageName: string, additionalProps?: Record<string, any>) => {
  const properties: Record<string, any> = {
    page: pageName,
    timestamp: new Date().toISOString()
  }
  if (additionalProps) {
    Object.assign(properties, additionalProps)
  }
  track('page_view', properties)
}

// Helper function to track user actions with timing
export const trackUserAction = (action: string, startTime: number, additionalProps?: Record<string, any>) => {
  const duration = Date.now() - startTime
  const properties: Record<string, any> = {
    action: action,
    duration_ms: duration,
    timestamp: new Date().toISOString()
  }
  if (additionalProps) {
    Object.assign(properties, additionalProps)
  }
  track('user_action', properties)
}

// Helper function to track conversion events
export const trackConversion = (conversionType: string, value?: number, additionalProps?: Record<string, any>) => {
  const properties: Record<string, any> = {
    type: conversionType,
    timestamp: new Date().toISOString()
  }
  if (value !== undefined) properties.value = value
  if (additionalProps) {
    Object.assign(properties, additionalProps)
  }
  track('conversion', properties)
}
