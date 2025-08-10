'use client';

import React, { useState } from 'react';
import { Card } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Progress } from './progress';
import { useSubscription } from '../../context/SubscriptionContext';
import {
  Calendar,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Settings,
  RefreshCw,
  Info
} from 'lucide-react';

interface SubscriptionStatusProps {
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  showActions = true,
  compact = false,
  className = ''
}) => {
  const {
    state,
    loadSubscription,
    showUpgradeDialog,
    formatCurrency,
    getPlanColor,
    getPlanBadgeColor
  } = useSubscription();

  const { subscription, subscriptionLoading, subscriptionError } = state;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadSubscription();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'trialing':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'past_due':
      case 'unpaid':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      trialing: 'secondary',
      past_due: 'destructive',
      unpaid: 'destructive',
      cancelled: 'outline',
      inactive: 'outline'
    } as const;

    const labels = {
      active: 'Active',
      trialing: 'Trial',
      past_due: 'Past Due',
      unpaid: 'Unpaid',
      cancelled: 'Cancelled',
      inactive: 'Inactive'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const calculateDaysUntilRenewal = (renewalDate: string) => {
    const today = new Date();
    const renewal = new Date(renewalDate);
    const diffTime = renewal.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const calculateTrialProgress = (startDate: string, trialEndDate: string) => {
    const start = new Date(startDate);
    const end = new Date(trialEndDate);
    const now = new Date();
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  if (subscriptionLoading && !subscription) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  if (subscriptionError) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 mb-4">{subscriptionError}</p>
          {showActions && (
            <Button onClick={handleRefresh} size="sm" disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Try Again
            </Button>
          )}
        </div>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <div className="mb-4">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
          <p className="text-gray-600 mb-4">
            Subscribe to a plan to unlock premium features and increased limits.
          </p>
        </div>
        
        {showActions && (
          <Button onClick={() => showUpgradeDialog()}>
            <TrendingUp className="h-4 w-4 mr-2" />
            View Plans
          </Button>
        )}
      </Card>
    );
  }

  const daysUntilRenewal = calculateDaysUntilRenewal(subscription.renewalDate);
  const isTrialing = subscription.status === 'trialing' && subscription.trialEndDate;
  const trialProgress = isTrialing ? 
    calculateTrialProgress(subscription.startDate, subscription.trialEndDate!) : 0;

  if (compact) {
    return (
      <div className={`flex items-center justify-between p-3 border rounded-lg ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {getStatusIcon(subscription.status)}
            <span className={`font-medium ${getPlanColor(subscription.plan.name)}`}>
              {subscription.plan.displayName}
            </span>
          </div>
          {getStatusBadge(subscription.status)}
        </div>
        
        <div className="text-right">
          <div className="text-sm font-medium">
            {formatCurrency(subscription.billing.amount)}/{subscription.billing.interval}
          </div>
          {daysUntilRenewal > 0 && (
            <div className="text-xs text-gray-500">
              Renews in {daysUntilRenewal} days
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon(subscription.status)}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {subscription.plan.displayName}
            </h3>
            <p className="text-sm text-gray-600">{subscription.plan.description}</p>
          </div>
        </div>
        
        <div className="text-right">
          {getStatusBadge(subscription.status)}
          {showActions && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="ml-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      {/* Billing Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-3">
          <CreditCard className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600">Billing Amount</p>
            <p className="font-semibold">
              {formatCurrency(subscription.billing.amount)} / {subscription.billing.interval}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Calendar className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600">
              {subscription.status === 'cancelled' ? 'Access Until' : 'Next Billing'}
            </p>
            <p className="font-semibold">
              {new Date(subscription.renewalDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Trial Information */}
      {isTrialing && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">Trial Period</span>
            <span className="text-sm text-blue-600">
              {Math.ceil((new Date(subscription.trialEndDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
            </span>
          </div>
          <Progress value={trialProgress} className="h-2" />
          <p className="text-xs text-blue-600 mt-1">
            Trial ends on {new Date(subscription.trialEndDate!).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Renewal Warning */}
      {daysUntilRenewal <= 7 && daysUntilRenewal > 0 && subscription.status === 'active' && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              Renewal Due Soon
            </span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Your subscription will renew in {daysUntilRenewal} days for {formatCurrency(subscription.billing.amount)}.
          </p>
        </div>
      )}

      {/* Cancellation Notice */}
      {subscription.status === 'cancelled' && subscription.cancellation && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">
              Subscription Cancelled
            </span>
          </div>
          <p className="text-sm text-red-700 mt-1">
            Access will continue until {new Date(subscription.cancellation.effectiveDate).toLocaleDateString()}.
            {subscription.cancellation.reason && (
              <span className="block mt-1">Reason: {subscription.cancellation.reason}</span>
            )}
          </p>
        </div>
      )}

      {/* Payment Method */}
      {subscription.paymentMethod.gateway !== 'manual' && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Payment Method</h4>
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 capitalize">
              {subscription.paymentMethod.gateway}
            </span>
            {subscription.paymentMethod.paymentMethodId && (
              <Badge variant="outline" className="text-xs">
                {subscription.paymentMethod.paymentMethodId.slice(-4)}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (
        <div className="flex flex-wrap gap-2">
          {subscription.status === 'active' && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => showUpgradeDialog()}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Upgrade
              </Button>
              
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </Button>
            </>
          )}
          
          {subscription.status === 'cancelled' && daysUntilRenewal > 0 && (
            <Button size="sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Reactivate
            </Button>
          )}
          
          {subscription.status === 'trialing' && (
            <Button 
              size="sm"
              onClick={() => showUpgradeDialog()}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Subscribe Now
            </Button>
          )}
        </div>
      )}

      {/* Auto-renewal status */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Auto-renewal:</span>
          <span className={subscription.autoRenew ? 'text-green-600' : 'text-red-600'}>
            {subscription.autoRenew ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default SubscriptionStatus;
