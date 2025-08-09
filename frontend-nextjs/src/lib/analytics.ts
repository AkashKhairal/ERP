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
    track('project_created', { type: projectType })
  },
  
  projectDeleted: (projectId: string) => {
    track('project_deleted', { project_id: projectId })
  },
  
  projectCompleted: (projectId: string, duration?: number) => {
    track('project_completed', { 
      project_id: projectId,
      duration_days: duration 
    })
  },

  // Task events
  taskCreated: (taskType?: string, priority?: string) => {
    track('task_created', { 
      type: taskType,
      priority: priority 
    })
  },
  
  taskCompleted: (taskId: string, timeSpent?: number) => {
    track('task_completed', { 
      task_id: taskId,
      time_spent_minutes: timeSpent 
    })
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
    track('team_member_added', { 
      team_id: teamId,
      role: role 
    })
  },
  
  teamMemberRemoved: (teamId: string) => {
    track('team_member_removed', { team_id: teamId })
  },

  // Content events
  contentCreated: (contentType: string, category?: string) => {
    track('content_created', { 
      type: contentType,
      category: category 
    })
  },
  
  contentPublished: (contentId: string, platform?: string) => {
    track('content_published', { 
      content_id: contentId,
      platform: platform 
    })
  },
  
  contentViewed: (contentId: string, viewDuration?: number) => {
    track('content_viewed', { 
      content_id: contentId,
      view_duration_seconds: viewDuration 
    })
  },

  // User engagement events
  dashboardViewed: (section?: string) => {
    track('dashboard_viewed', { section })
  },
  
  featureUsed: (featureName: string, context?: string) => {
    track('feature_used', { 
      feature: featureName,
      context: context 
    })
  },
  
  searchPerformed: (query: string, resultsCount: number) => {
    track('search_performed', { 
      query_length: query.length,
      results_count: resultsCount 
    })
  },
  
  settingsChanged: (settingType: string, newValue?: string) => {
    track('settings_changed', { 
      setting_type: settingType,
      new_value: newValue 
    })
  },

  // Error events
  errorOccurred: (errorType: string, errorMessage?: string, context?: string) => {
    track('error_occurred', { 
      error_type: errorType,
      error_message: errorMessage?.substring(0, 100), // Limit message length
      context: context 
    })
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
    track('subscription_cancel', { 
      plan: plan,
      reason: reason 
    })
  },
  
  paymentCompleted: (amount: number, currency: string, plan?: string) => {
    track('payment_completed', { 
      amount: amount,
      currency: currency,
      plan: plan 
    })
  },

  // Custom event wrapper for any additional tracking needs
  custom: (eventName: string, properties?: Record<string, any>) => {
    track(eventName, properties)
  }
}

// Helper function to track page views with additional context
export const trackPageView = (pageName: string, additionalProps?: Record<string, any>) => {
  track('page_view', {
    page: pageName,
    timestamp: new Date().toISOString(),
    ...additionalProps
  })
}

// Helper function to track user actions with timing
export const trackUserAction = (action: string, startTime: number, additionalProps?: Record<string, any>) => {
  const duration = Date.now() - startTime
  track('user_action', {
    action: action,
    duration_ms: duration,
    timestamp: new Date().toISOString(),
    ...additionalProps
  })
}

// Helper function to track conversion events
export const trackConversion = (conversionType: string, value?: number, additionalProps?: Record<string, any>) => {
  track('conversion', {
    type: conversionType,
    value: value,
    timestamp: new Date().toISOString(),
    ...additionalProps
  })
}
