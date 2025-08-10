import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Types and Interfaces
export interface Plan {
  _id: string;
  name: 'Beginner' | 'Pro' | 'Master';
  displayName: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: {
    teamMembers: number;
    projects: number;
    storage: number;
    analytics: 'basic' | 'advanced';
    prioritySupport: boolean;
    customIntegrations: boolean;
    apiCalls: number;
  };
  isActive: boolean;
  isDefault: boolean;
  popularPlan: boolean;
  recommendedPlan: boolean;
  trialDays: number;
  setupFee: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  plan: Plan;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'unpaid' | 'trialing';
  startDate: string;
  endDate: string;
  renewalDate: string;
  trialEndDate?: string;
  cancelledAt?: string;
  billing: {
    amount: number;
    currency: string;
    interval: 'month' | 'year';
  };
  autoRenew: boolean;
  paymentMethod: {
    gateway: 'razorpay' | 'stripe' | 'manual';
    customerId?: string;
    subscriptionId?: string;
    paymentMethodId?: string;
  };
  planHistory: Array<{
    plan: string;
    changedAt: string;
    changedBy: string;
    reason: string;
    previousPlan?: string;
  }>;
  cancellation?: {
    reason: string;
    feedback?: string;
    cancelledBy: string;
    effectiveDate: string;
    immediateCancel: boolean;
  };
  discount?: {
    type: 'percentage' | 'fixed' | 'free_trial';
    value: number;
    couponCode: string;
    validUntil: string;
    appliedAt: string;
  };
  metadata?: {
    source?: string;
    campaignId?: string;
    referralCode?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UsageMetric {
  current: number;
  limit: number;
  unlimited: boolean;
  percentage: number;
  warning: boolean;
  limitReached: boolean;
  lastUpdated: string;
  resetDate?: string;
  remaining?: number;
}

export interface UsageSummary {
  teamMembers: UsageMetric;
  projects: UsageMetric;
  storage: UsageMetric;
  apiCalls: UsageMetric;
}

export interface SubscriptionData {
  subscription: Subscription;
  usage: {
    user: {
      id: string;
      email: string;
      name: string;
    };
    plan: {
      name: string;
      displayName: string;
    };
    usage: UsageSummary;
    warnings: {
      teamMembers: {
        at80Percent: boolean;
        at95Percent: boolean;
        limitReached: boolean;
      };
      projects: {
        at80Percent: boolean;
        at95Percent: boolean;
        limitReached: boolean;
      };
      storage: {
        at80Percent: boolean;
        at95Percent: boolean;
        limitReached: boolean;
      };
      apiCalls: {
        at80Percent: boolean;
        at95Percent: boolean;
        limitReached: boolean;
      };
    };
  };
}

export interface PaymentHistory {
  _id: string;
  user: string;
  subscription: string;
  plan: Plan;
  amount: number;
  currency: string;
  gateway: 'razorpay' | 'stripe' | 'manual' | 'bank_transfer';
  gatewayPaymentId?: string;
  gatewayOrderId?: string;
  gatewaySignature?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  method: {
    type: 'card' | 'upi' | 'netbanking' | 'wallet' | 'bank_transfer' | 'manual';
    details: any;
  };
  initiatedAt: string;
  processedAt?: string;
  completedAt?: string;
  failedAt?: string;
  refundedAt?: string;
  description: string;
  receiptNumber: string;
  failure?: {
    code: string;
    message: string;
    retryCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionAnalytics {
  overview: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    cancelledSubscriptions: number;
    averageSubscriptionValue: number;
    churnRate: number;
  };
  planDistribution: Array<{
    _id: string;
    count: number;
    revenue: number;
  }>;
  paymentStats: {
    totalPayments: number;
    totalAmount: number;
    successfulPayments: number;
    successfulAmount: number;
    failedPayments: number;
    avgAmount: number;
    avgProcessingTime: number;
    successRate: number;
  };
}

// Configure axios with auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

class SubscriptionService {
  // ==================== PLAN OPERATIONS ====================

  async getPlans(): Promise<Plan[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/subscriptions/plans`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching plans:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch plans');
    }
  }

  async getPlan(planName: string): Promise<Plan> {
    try {
      const response = await axios.get(`${API_BASE_URL}/subscriptions/plans/${planName}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching plan:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch plan');
    }
  }

  // ==================== SUBSCRIPTION OPERATIONS ====================

  async getMySubscription(): Promise<SubscriptionData> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/subscriptions/my-subscription`,
        getAuthHeaders()
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch subscription');
    }
  }

  async createSubscription(planName: string, paymentData?: any): Promise<any> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/subscriptions/create`,
        { planName, paymentData },
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      throw new Error(error.response?.data?.message || 'Failed to create subscription');
    }
  }

  async upgradeSubscription(planName: string, paymentData?: any): Promise<any> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/subscriptions/upgrade`,
        { planName, paymentData },
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error upgrading subscription:', error);
      throw new Error(error.response?.data?.message || 'Failed to upgrade subscription');
    }
  }

  async downgradeSubscription(planName: string): Promise<any> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/subscriptions/downgrade`,
        { planName },
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error downgrading subscription:', error);
      throw new Error(error.response?.data?.message || 'Failed to downgrade subscription');
    }
  }

  async cancelSubscription(reason?: string, immediate: boolean = false): Promise<any> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/subscriptions/cancel`,
        { reason, immediate },
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel subscription');
    }
  }

  // ==================== USAGE OPERATIONS ====================

  async getUsageStats(): Promise<UsageSummary> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/subscriptions/usage`,
        getAuthHeaders()
      );
      return response.data.data.usage;
    } catch (error: any) {
      console.error('Error fetching usage stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch usage statistics');
    }
  }

  async getUsageHistory(metric?: string, limit: number = 50): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (metric) params.append('metric', metric);
      params.append('limit', limit.toString());

      const response = await axios.get(
        `${API_BASE_URL}/subscriptions/usage/history?${params.toString()}`,
        getAuthHeaders()
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching usage history:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch usage history');
    }
  }

  // ==================== PAYMENT OPERATIONS ====================

  async getPaymentHistory(limit: number = 10, status?: string): Promise<PaymentHistory[]> {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (status) params.append('status', status);

      const response = await axios.get(
        `${API_BASE_URL}/subscriptions/payments?${params.toString()}`,
        getAuthHeaders()
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching payment history:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch payment history');
    }
  }

  // ==================== FEATURE TESTING ====================

  async testAdvancedAnalytics(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/subscriptions/test/advanced-analytics`,
        getAuthHeaders()
      );
      return response.data.success;
    } catch (error: any) {
      if (error.response?.status === 403) {
        return false;
      }
      throw new Error(error.response?.data?.message || 'Failed to test advanced analytics');
    }
  }

  async testPrioritySupport(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/subscriptions/test/priority-support`,
        getAuthHeaders()
      );
      return response.data.success;
    } catch (error: any) {
      if (error.response?.status === 403) {
        return false;
      }
      throw new Error(error.response?.data?.message || 'Failed to test priority support');
    }
  }

  async testCustomIntegrations(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/subscriptions/test/custom-integrations`,
        getAuthHeaders()
      );
      return response.data.success;
    } catch (error: any) {
      if (error.response?.status === 403) {
        return false;
      }
      throw new Error(error.response?.data?.message || 'Failed to test custom integrations');
    }
  }

  // ==================== USAGE TESTING ====================

  async canAddTeamMember(): Promise<{ canAdd: boolean; usage?: any; error?: string }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/subscriptions/test/add-team-member`,
        {},
        getAuthHeaders()
      );
      return { canAdd: true, usage: response.data };
    } catch (error: any) {
      if (error.response?.status === 403) {
        return { canAdd: false, error: error.response.data.message };
      }
      throw new Error(error.response?.data?.message || 'Failed to test team member addition');
    }
  }

  async canAddProject(): Promise<{ canAdd: boolean; usage?: any; error?: string }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/subscriptions/test/add-project`,
        {},
        getAuthHeaders()
      );
      return { canAdd: true, usage: response.data };
    } catch (error: any) {
      if (error.response?.status === 403) {
        return { canAdd: false, error: error.response.data.message };
      }
      throw new Error(error.response?.data?.message || 'Failed to test project addition');
    }
  }

  async canUploadFile(fileSizeMB: number): Promise<{ canUpload: boolean; usage?: any; error?: string }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/subscriptions/test/upload-file`,
        { fileSizeMB },
        getAuthHeaders()
      );
      return { canUpload: true, usage: response.data };
    } catch (error: any) {
      if (error.response?.status === 403) {
        return { canUpload: false, error: error.response.data.message };
      }
      throw new Error(error.response?.data?.message || 'Failed to test file upload');
    }
  }

  // ==================== ADMIN OPERATIONS ====================

  async getAllSubscriptions(
    status?: string,
    planName?: string,
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'createdAt',
    order: string = 'desc'
  ): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (planName) params.append('planName', planName);
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      params.append('sortBy', sortBy);
      params.append('order', order);

      const response = await axios.get(
        `${API_BASE_URL}/subscriptions/admin/all?${params.toString()}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching all subscriptions:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch subscriptions');
    }
  }

  async getSubscriptionAnalytics(startDate?: string, endDate?: string): Promise<SubscriptionAnalytics> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await axios.get(
        `${API_BASE_URL}/subscriptions/admin/analytics?${params.toString()}`,
        getAuthHeaders()
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching subscription analytics:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch subscription analytics');
    }
  }

  async getUserSubscription(userId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/subscriptions/admin/user/${userId}`,
        getAuthHeaders()
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching user subscription:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch user subscription');
    }
  }

  async updateUserPlan(userId: string, planName: string, reason?: string): Promise<any> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/subscriptions/admin/user/${userId}/plan`,
        { planName, reason },
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating user plan:', error);
      throw new Error(error.response?.data?.message || 'Failed to update user plan');
    }
  }

  // ==================== UTILITY METHODS ====================

  formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  formatStorage(sizeInMB: number): string {
    if (sizeInMB < 1024) {
      return `${sizeInMB} MB`;
    } else {
      return `${(sizeInMB / 1024).toFixed(1)} GB`;
    }
  }

  formatApiCalls(calls: number): string {
    if (calls < 1000) {
      return calls.toString();
    } else if (calls < 1000000) {
      return `${(calls / 1000).toFixed(1)}K`;
    } else {
      return `${(calls / 1000000).toFixed(1)}M`;
    }
  }

  getPlanColor(planName: string): string {
    switch (planName) {
      case 'Beginner':
        return 'text-green-600';
      case 'Pro':
        return 'text-blue-600';
      case 'Master':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  }

  getPlanBadgeColor(planName: string): string {
    switch (planName) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Pro':
        return 'bg-blue-100 text-blue-800';
      case 'Master':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getUsageColor(percentage: number): string {
    if (percentage >= 95) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  }

  getUsageBarColor(percentage: number): string {
    if (percentage >= 95) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  }
}

export default new SubscriptionService();
