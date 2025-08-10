'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import SubscriptionService, { 
  Plan, 
  Subscription, 
  SubscriptionData, 
  UsageSummary,
  PaymentHistory 
} from '../services/subscriptionService';
import { useAuth } from './AuthContext';

// Types
interface SubscriptionState {
  // Plans
  plans: Plan[];
  plansLoading: boolean;
  plansError: string | null;
  
  // Current subscription
  subscription: Subscription | null;
  subscriptionLoading: boolean;
  subscriptionError: string | null;
  
  // Usage data
  usage: UsageSummary | null;
  usageLoading: boolean;
  usageError: string | null;
  
  // Payment history
  payments: PaymentHistory[];
  paymentsLoading: boolean;
  paymentsError: string | null;
  
  // Feature access
  features: {
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    customIntegrations: boolean;
  };
  
  // UI states
  showUpgradeModal: boolean;
  selectedPlan: Plan | null;
}

type SubscriptionAction =
  | { type: 'SET_PLANS_LOADING'; payload: boolean }
  | { type: 'SET_PLANS'; payload: Plan[] }
  | { type: 'SET_PLANS_ERROR'; payload: string | null }
  | { type: 'SET_SUBSCRIPTION_LOADING'; payload: boolean }
  | { type: 'SET_SUBSCRIPTION'; payload: SubscriptionData | null }
  | { type: 'SET_SUBSCRIPTION_ERROR'; payload: string | null }
  | { type: 'SET_USAGE_LOADING'; payload: boolean }
  | { type: 'SET_USAGE'; payload: UsageSummary }
  | { type: 'SET_USAGE_ERROR'; payload: string | null }
  | { type: 'SET_PAYMENTS_LOADING'; payload: boolean }
  | { type: 'SET_PAYMENTS'; payload: PaymentHistory[] }
  | { type: 'SET_PAYMENTS_ERROR'; payload: string | null }
  | { type: 'SET_FEATURES'; payload: Partial<SubscriptionState['features']> }
  | { type: 'SET_SHOW_UPGRADE_MODAL'; payload: boolean }
  | { type: 'SET_SELECTED_PLAN'; payload: Plan | null }
  | { type: 'RESET_STATE' };

interface SubscriptionContextType {
  state: SubscriptionState;
  dispatch: React.Dispatch<SubscriptionAction>;
  
  // Plan operations
  loadPlans: () => Promise<void>;
  getPlan: (planName: string) => Promise<Plan>;
  
  // Subscription operations
  loadSubscription: () => Promise<void>;
  createSubscription: (planName: string, paymentData?: any) => Promise<any>;
  upgradeSubscription: (planName: string, paymentData?: any) => Promise<any>;
  downgradeSubscription: (planName: string) => Promise<any>;
  cancelSubscription: (reason?: string, immediate?: boolean) => Promise<any>;
  
  // Usage operations
  loadUsage: () => Promise<void>;
  refreshUsage: () => Promise<void>;
  checkCanAddTeamMember: () => Promise<{ canAdd: boolean; error?: string }>;
  checkCanAddProject: () => Promise<{ canAdd: boolean; error?: string }>;
  checkCanUploadFile: (fileSizeMB: number) => Promise<{ canUpload: boolean; error?: string }>;
  
  // Payment operations
  loadPayments: () => Promise<void>;
  
  // Feature checks
  hasFeature: (feature: keyof SubscriptionState['features']) => boolean;
  loadFeatureAccess: () => Promise<void>;
  
  // UI helpers
  showUpgradeDialog: (plan?: Plan) => void;
  hideUpgradeDialog: () => void;
  
  // Utility functions
  formatCurrency: (amount: number, currency?: string) => string;
  formatStorage: (sizeInMB: number) => string;
  formatApiCalls: (calls: number) => string;
  getPlanColor: (planName: string) => string;
  getPlanBadgeColor: (planName: string) => string;
  getUsageColor: (percentage: number) => string;
  getUsageBarColor: (percentage: number) => string;
}

const initialState: SubscriptionState = {
  plans: [],
  plansLoading: false,
  plansError: null,
  
  subscription: null,
  subscriptionLoading: false,
  subscriptionError: null,
  
  usage: null,
  usageLoading: false,
  usageError: null,
  
  payments: [],
  paymentsLoading: false,
  paymentsError: null,
  
  features: {
    advancedAnalytics: false,
    prioritySupport: false,
    customIntegrations: false,
  },
  
  showUpgradeModal: false,
  selectedPlan: null,
};

const subscriptionReducer = (state: SubscriptionState, action: SubscriptionAction): SubscriptionState => {
  switch (action.type) {
    case 'SET_PLANS_LOADING':
      return { ...state, plansLoading: action.payload };
    case 'SET_PLANS':
      return { ...state, plans: action.payload, plansError: null };
    case 'SET_PLANS_ERROR':
      return { ...state, plansError: action.payload };
      
    case 'SET_SUBSCRIPTION_LOADING':
      return { ...state, subscriptionLoading: action.payload };
    case 'SET_SUBSCRIPTION':
      return { 
        ...state, 
        subscription: action.payload?.subscription || null,
        usage: action.payload?.usage.usage || null,
        subscriptionError: null,
        usageError: null
      };
    case 'SET_SUBSCRIPTION_ERROR':
      return { ...state, subscriptionError: action.payload };
      
    case 'SET_USAGE_LOADING':
      return { ...state, usageLoading: action.payload };
    case 'SET_USAGE':
      return { ...state, usage: action.payload, usageError: null };
    case 'SET_USAGE_ERROR':
      return { ...state, usageError: action.payload };
      
    case 'SET_PAYMENTS_LOADING':
      return { ...state, paymentsLoading: action.payload };
    case 'SET_PAYMENTS':
      return { ...state, payments: action.payload, paymentsError: null };
    case 'SET_PAYMENTS_ERROR':
      return { ...state, paymentsError: action.payload };
      
    case 'SET_FEATURES':
      return { ...state, features: { ...state.features, ...action.payload } };
      
    case 'SET_SHOW_UPGRADE_MODAL':
      return { ...state, showUpgradeModal: action.payload };
    case 'SET_SELECTED_PLAN':
      return { ...state, selectedPlan: action.payload };
      
    case 'RESET_STATE':
      return initialState;
      
    default:
      return state;
  }
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(subscriptionReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Plan operations
  const loadPlans = async () => {
    dispatch({ type: 'SET_PLANS_LOADING', payload: true });
    try {
      const plans = await SubscriptionService.getPlans();
      dispatch({ type: 'SET_PLANS', payload: plans });
    } catch (error: any) {
      dispatch({ type: 'SET_PLANS_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_PLANS_LOADING', payload: false });
    }
  };

  const getPlan = async (planName: string): Promise<Plan> => {
    try {
      return await SubscriptionService.getPlan(planName);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Subscription operations
  const loadSubscription = async () => {
    if (!isAuthenticated) return;
    
    dispatch({ type: 'SET_SUBSCRIPTION_LOADING', payload: true });
    try {
      const subscriptionData = await SubscriptionService.getMySubscription();
      dispatch({ type: 'SET_SUBSCRIPTION', payload: subscriptionData });
    } catch (error: any) {
      dispatch({ type: 'SET_SUBSCRIPTION_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_SUBSCRIPTION_LOADING', payload: false });
    }
  };

  const createSubscription = async (planName: string, paymentData?: any) => {
    try {
      const result = await SubscriptionService.createSubscription(planName, paymentData);
      if (result.success) {
        await loadSubscription();
        await loadFeatureAccess();
      }
      return result;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const upgradeSubscription = async (planName: string, paymentData?: any) => {
    try {
      const result = await SubscriptionService.upgradeSubscription(planName, paymentData);
      if (result.success) {
        await loadSubscription();
        await loadFeatureAccess();
      }
      return result;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const downgradeSubscription = async (planName: string) => {
    try {
      const result = await SubscriptionService.downgradeSubscription(planName);
      if (result.success) {
        await loadSubscription();
      }
      return result;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const cancelSubscription = async (reason?: string, immediate: boolean = false) => {
    try {
      const result = await SubscriptionService.cancelSubscription(reason, immediate);
      if (result.success) {
        await loadSubscription();
      }
      return result;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Usage operations
  const loadUsage = async () => {
    if (!isAuthenticated) return;
    
    dispatch({ type: 'SET_USAGE_LOADING', payload: true });
    try {
      const usage = await SubscriptionService.getUsageStats();
      dispatch({ type: 'SET_USAGE', payload: usage });
    } catch (error: any) {
      dispatch({ type: 'SET_USAGE_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_USAGE_LOADING', payload: false });
    }
  };

  const refreshUsage = async () => {
    await loadUsage();
  };

  const checkCanAddTeamMember = async () => {
    try {
      return await SubscriptionService.canAddTeamMember();
    } catch (error: any) {
      return { canAdd: false, error: error.message };
    }
  };

  const checkCanAddProject = async () => {
    try {
      return await SubscriptionService.canAddProject();
    } catch (error: any) {
      return { canAdd: false, error: error.message };
    }
  };

  const checkCanUploadFile = async (fileSizeMB: number) => {
    try {
      return await SubscriptionService.canUploadFile(fileSizeMB);
    } catch (error: any) {
      return { canUpload: false, error: error.message };
    }
  };

  // Payment operations
  const loadPayments = async () => {
    if (!isAuthenticated) return;
    
    dispatch({ type: 'SET_PAYMENTS_LOADING', payload: true });
    try {
      const payments = await SubscriptionService.getPaymentHistory();
      dispatch({ type: 'SET_PAYMENTS', payload: payments });
    } catch (error: any) {
      dispatch({ type: 'SET_PAYMENTS_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_PAYMENTS_LOADING', payload: false });
    }
  };

  // Feature checks
  const hasFeature = (feature: keyof SubscriptionState['features']): boolean => {
    return state.features[feature];
  };

  const loadFeatureAccess = async () => {
    if (!isAuthenticated) return;
    
    try {
      const [advancedAnalytics, prioritySupport, customIntegrations] = await Promise.all([
        SubscriptionService.testAdvancedAnalytics(),
        SubscriptionService.testPrioritySupport(),
        SubscriptionService.testCustomIntegrations(),
      ]);

      dispatch({
        type: 'SET_FEATURES',
        payload: {
          advancedAnalytics,
          prioritySupport,
          customIntegrations,
        },
      });
    } catch (error: any) {
      console.error('Error loading feature access:', error);
    }
  };

  // UI helpers
  const showUpgradeDialog = (plan?: Plan) => {
    if (plan) {
      dispatch({ type: 'SET_SELECTED_PLAN', payload: plan });
    }
    dispatch({ type: 'SET_SHOW_UPGRADE_MODAL', payload: true });
  };

  const hideUpgradeDialog = () => {
    dispatch({ type: 'SET_SHOW_UPGRADE_MODAL', payload: false });
    dispatch({ type: 'SET_SELECTED_PLAN', payload: null });
  };

  // Load data on mount and when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      loadPlans();
      loadSubscription();
      loadFeatureAccess();
      loadPayments();
    } else {
      dispatch({ type: 'RESET_STATE' });
    }
  }, [isAuthenticated]);

  // Utility functions
  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return SubscriptionService.formatCurrency(amount, currency);
  };

  const formatStorage = (sizeInMB: number) => {
    return SubscriptionService.formatStorage(sizeInMB);
  };

  const formatApiCalls = (calls: number) => {
    return SubscriptionService.formatApiCalls(calls);
  };

  const getPlanColor = (planName: string) => {
    return SubscriptionService.getPlanColor(planName);
  };

  const getPlanBadgeColor = (planName: string) => {
    return SubscriptionService.getPlanBadgeColor(planName);
  };

  const getUsageColor = (percentage: number) => {
    return SubscriptionService.getUsageColor(percentage);
  };

  const getUsageBarColor = (percentage: number) => {
    return SubscriptionService.getUsageBarColor(percentage);
  };

  const contextValue: SubscriptionContextType = {
    state,
    dispatch,
    
    // Plan operations
    loadPlans,
    getPlan,
    
    // Subscription operations
    loadSubscription,
    createSubscription,
    upgradeSubscription,
    downgradeSubscription,
    cancelSubscription,
    
    // Usage operations
    loadUsage,
    refreshUsage,
    checkCanAddTeamMember,
    checkCanAddProject,
    checkCanUploadFile,
    
    // Payment operations
    loadPayments,
    
    // Feature checks
    hasFeature,
    loadFeatureAccess,
    
    // UI helpers
    showUpgradeDialog,
    hideUpgradeDialog,
    
    // Utility functions
    formatCurrency,
    formatStorage,
    formatApiCalls,
    getPlanColor,
    getPlanBadgeColor,
    getUsageColor,
    getUsageBarColor,
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionContext;
