'use client';

import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { useSubscription } from '../../../context/SubscriptionContext';
import { 
  Check, 
  Star, 
  TrendingUp,
  Users,
  FolderOpen,
  HardDrive,
  Zap,
  BarChart3,
  Headphones,
  Puzzle
} from 'lucide-react';

const PricingPage: React.FC = () => {
  const { 
    state, 
    createSubscription, 
    upgradeSubscription,
    formatCurrency,
    formatStorage,
    formatApiCalls 
  } = useSubscription();
  
  const { plans, plansLoading, subscription } = state;
  const [isCreating, setIsCreating] = useState<string | null>(null);

  const handleSelectPlan = async (planName: string) => {
    setIsCreating(planName);
    try {
      if (subscription) {
        if (planName !== subscription.plan.name) {
          await upgradeSubscription(planName);
        }
      } else {
        await createSubscription(planName);
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
    } finally {
      setIsCreating(null);
    }
  };

  const getFeatureIcon = (feature: string) => {
    const icons = {
      teamMembers: <Users className="h-4 w-4" />,
      projects: <FolderOpen className="h-4 w-4" />,
      storage: <HardDrive className="h-4 w-4" />,
      analytics: <BarChart3 className="h-4 w-4" />,
      prioritySupport: <Headphones className="h-4 w-4" />,
      customIntegrations: <Puzzle className="h-4 w-4" />,
      apiCalls: <Zap className="h-4 w-4" />
    };
    return icons[feature as keyof typeof icons] || <Check className="h-4 w-4" />;
  };

  const formatFeatureValue = (feature: string, value: any) => {
    switch (feature) {
      case 'teamMembers':
      case 'projects':
        return value === -1 ? 'Unlimited' : value.toString();
      case 'storage':
        return value === -1 ? 'Unlimited' : formatStorage(value);
      case 'apiCalls':
        return value === -1 ? 'Unlimited' : formatApiCalls(value);
      case 'analytics':
        return value === 'advanced' ? 'Advanced' : 'Basic';
      case 'prioritySupport':
      case 'customIntegrations':
        return value ? 'Included' : 'Not included';
      default:
        return value?.toString() || 'N/A';
    }
  };

  const isCurrentPlan = (planName: string) => {
    return subscription?.plan?.name === planName;
  };

  const canSelectPlan = (planName: string) => {
    if (!subscription) return true;
    return planName !== subscription.plan.name;
  };

  if (plansLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Scale your content creation and team management with our flexible subscription plans. 
          Start free and upgrade as you grow.
        </p>
      </div>

      {/* Current Subscription Banner */}
      {subscription && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Star className="h-5 w-5 text-blue-500" />
              <span className="text-blue-800 font-medium">
                You're currently on the {subscription.plan.displayName}
              </span>
            </div>
            <Badge className="bg-blue-100 text-blue-800">Current Plan</Badge>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => (
          <Card 
            key={plan._id} 
            className={`relative p-6 ${
              plan.popularPlan 
                ? 'ring-2 ring-blue-500 shadow-lg scale-105' 
                : isCurrentPlan(plan.name)
                ? 'ring-2 ring-green-500'
                : ''
            }`}
          >
            {/* Popular Badge */}
            {plan.popularPlan && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-3 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}

            {/* Current Plan Badge */}
            {isCurrentPlan(plan.name) && (
              <div className="absolute -top-3 right-4">
                <Badge className="bg-green-500 text-white px-3 py-1">
                  Current Plan
                </Badge>
              </div>
            )}

            {/* Plan Header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.displayName}
              </h3>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  {formatCurrency(plan.price)}
                </span>
                <span className="text-gray-600">/{plan.interval}</span>
              </div>

              {plan.trialDays > 0 && (
                <div className="text-sm text-green-600 font-medium">
                  {plan.trialDays} days free trial
                </div>
              )}
            </div>

            {/* Features List */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                {getFeatureIcon('teamMembers')}
                <span className="text-sm">
                  {formatFeatureValue('teamMembers', plan.features.teamMembers)} team members
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                {getFeatureIcon('projects')}
                <span className="text-sm">
                  {formatFeatureValue('projects', plan.features.projects)} projects
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                {getFeatureIcon('storage')}
                <span className="text-sm">
                  {formatFeatureValue('storage', plan.features.storage)} storage
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                {getFeatureIcon('apiCalls')}
                <span className="text-sm">
                  {formatFeatureValue('apiCalls', plan.features.apiCalls)} API calls/month
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                {getFeatureIcon('analytics')}
                <span className="text-sm">
                  {formatFeatureValue('analytics', plan.features.analytics)} analytics
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                {getFeatureIcon('prioritySupport')}
                <span className="text-sm">
                  {formatFeatureValue('prioritySupport', plan.features.prioritySupport)}
                </span>
              </div>
              
              {plan.features.customIntegrations && (
                <div className="flex items-center space-x-3">
                  {getFeatureIcon('customIntegrations')}
                  <span className="text-sm">
                    {formatFeatureValue('customIntegrations', plan.features.customIntegrations)}
                  </span>
                </div>
              )}
            </div>

            {/* Action Button */}
            <Button
              className="w-full"
              variant={plan.popularPlan ? 'default' : 'outline'}
              disabled={!canSelectPlan(plan.name) || isCreating === plan.name}
              onClick={() => handleSelectPlan(plan.name)}
            >
              {isCreating === plan.name ? (
                'Processing...'
              ) : isCurrentPlan(plan.name) ? (
                'Current Plan'
              ) : subscription && plan.price > subscription.plan.price ? (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Upgrade to {plan.name}
                </>
              ) : subscription && plan.price < subscription.plan.price ? (
                `Downgrade to ${plan.name}`
              ) : (
                `Get ${plan.name}`
              )}
            </Button>

            {plan.setupFee > 0 && (
              <p className="text-xs text-gray-500 text-center mt-2">
                One-time setup fee: {formatCurrency(plan.setupFee)}
              </p>
            )}
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Frequently Asked Questions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="p-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">
              Can I change my plan anytime?
            </h3>
            <p className="text-gray-600 text-sm">
              Yes, you can upgrade or downgrade your plan at any time. 
              Upgrades take effect immediately, while downgrades take effect at your next billing cycle.
            </p>
          </Card>
          
          <Card className="p-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">
              What happens if I exceed my limits?
            </h3>
            <p className="text-gray-600 text-sm">
              We'll notify you when you approach your limits. 
              You can upgrade your plan to increase limits or manage your usage.
            </p>
          </Card>
          
          <Card className="p-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">
              Do you offer refunds?
            </h3>
            <p className="text-gray-600 text-sm">
              We offer a 30-day money-back guarantee for annual plans. 
              Monthly plans can be cancelled anytime without penalty.
            </p>
          </Card>
          
          <Card className="p-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">
              Is my data secure?
            </h3>
            <p className="text-gray-600 text-sm">
              Absolutely. We use enterprise-grade security measures and comply with 
              industry standards to keep your data safe and secure.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
