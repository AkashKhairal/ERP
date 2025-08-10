'use client';

import React from 'react';
import { Progress } from './progress';
import { Card } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { UsageMetric } from '../../services/subscriptionService';
import { useSubscription } from '../../context/SubscriptionContext';
import { 
  Users, 
  FolderOpen, 
  HardDrive, 
  Zap,
  AlertTriangle,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface UsageMonitorProps {
  showUpgradeButton?: boolean;
  compact?: boolean;
  className?: string;
}

interface UsageItemProps {
  icon: React.ReactNode;
  label: string;
  metric: UsageMetric;
  formatValue: (value: number) => string;
  onUpgrade?: () => void;
  compact?: boolean;
}

const UsageItem: React.FC<UsageItemProps> = ({
  icon,
  label,
  metric,
  formatValue,
  onUpgrade,
  compact = false
}) => {
  const { getUsageColor, getUsageBarColor } = useSubscription();
  
  const progressColor = getUsageBarColor(metric.percentage);
  const textColor = getUsageColor(metric.percentage);
  
  const getProgressVariant = (percentage: number) => {
    if (percentage >= 95) return 'destructive';
    if (percentage >= 80) return 'warning';
    return 'default';
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex items-center space-x-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-sm ${textColor}`}>
            {metric.unlimited ? 'Unlimited' : `${formatValue(metric.current)} / ${formatValue(metric.limit)}`}
          </span>
          {metric.limitReached && (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="text-sm font-medium text-gray-900">{label}</h3>
        </div>
        
        {metric.warning && (
          <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Warning
          </Badge>
        )}
        
        {metric.limitReached && (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Limit Reached
          </Badge>
        )}
      </div>

      {metric.unlimited ? (
        <div className="text-center py-4">
          <div className="text-2xl font-bold text-green-600 mb-1">∞</div>
          <p className="text-sm text-gray-600">Unlimited</p>
        </div>
      ) : (
        <>
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">
                {formatValue(metric.current)} used
              </span>
              <span className="text-gray-600">
                {formatValue(metric.limit)} total
              </span>
            </div>
            <Progress 
              value={metric.percentage} 
              variant={getProgressVariant(metric.percentage)}
              className="h-2"
            />
          </div>

          <div className="flex justify-between items-center">
            <span className={`text-sm font-medium ${textColor}`}>
              {metric.percentage.toFixed(1)}% used
            </span>
            
            {metric.remaining !== undefined && (
              <span className="text-sm text-gray-500">
                {formatValue(metric.remaining)} remaining
              </span>
            )}
          </div>
        </>
      )}

      {metric.limitReached && onUpgrade && (
        <div className="mt-3 pt-3 border-t">
          <Button 
            size="sm" 
            onClick={onUpgrade}
            className="w-full"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Button>
        </div>
      )}

      {metric.resetDate && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-gray-500">
            Resets on {new Date(metric.resetDate).toLocaleDateString()}
          </p>
        </div>
      )}
    </Card>
  );
};

const UsageMonitor: React.FC<UsageMonitorProps> = ({
  showUpgradeButton = true,
  compact = false,
  className = ''
}) => {
  const { 
    state, 
    refreshUsage, 
    showUpgradeDialog,
    formatStorage,
    formatApiCalls 
  } = useSubscription();

  const { usage, usageLoading, usageError } = state;

  const handleRefresh = async () => {
    await refreshUsage();
  };

  const handleUpgrade = () => {
    showUpgradeDialog();
  };

  if (usageLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (usageError) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-600 mb-4">{usageError}</p>
        <Button onClick={handleRefresh} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </Card>
    );
  }

  if (!usage) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <p className="text-gray-600">No usage data available</p>
      </Card>
    );
  }

  const usageItems = [
    {
      icon: <Users className="h-5 w-5 text-blue-500" />,
      label: 'Team Members',
      metric: usage.teamMembers,
      formatValue: (value: number) => value.toString()
    },
    {
      icon: <FolderOpen className="h-5 w-5 text-green-500" />,
      label: 'Projects',
      metric: usage.projects,
      formatValue: (value: number) => value.toString()
    },
    {
      icon: <HardDrive className="h-5 w-5 text-purple-500" />,
      label: 'Storage',
      metric: usage.storage,
      formatValue: formatStorage
    },
    {
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
      label: 'API Calls',
      metric: usage.apiCalls,
      formatValue: formatApiCalls
    }
  ];

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Usage Monitor</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={usageLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${usageLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className={compact ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
        {usageItems.map((item, index) => (
          <UsageItem
            key={index}
            icon={item.icon}
            label={item.label}
            metric={item.metric}
            formatValue={item.formatValue}
            onUpgrade={showUpgradeButton ? handleUpgrade : undefined}
            compact={compact}
          />
        ))}
      </div>

      {/* Overall usage summary */}
      {!compact && (
        <Card className="mt-6 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Usage Summary</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {usageItems.map((item, index) => {
              const hasWarning = item.metric.warning || item.metric.limitReached;
              
              return (
                <div key={index} className="text-center">
                  <div className={`text-2xl font-bold mb-1 ${
                    hasWarning ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {item.metric.unlimited ? '∞' : `${item.metric.percentage.toFixed(0)}%`}
                  </div>
                  <p className="text-sm text-gray-600">{item.label}</p>
                  {hasWarning && (
                    <AlertTriangle className="h-4 w-4 text-red-500 mx-auto mt-1" />
                  )}
                </div>
              );
            })}
          </div>

          {showUpgradeButton && (
            <div className="mt-4 pt-4 border-t text-center">
              <p className="text-sm text-gray-600 mb-3">
                Need more resources? Upgrade your plan for increased limits.
              </p>
              <Button onClick={handleUpgrade}>
                <TrendingUp className="h-4 w-4 mr-2" />
                View Plans
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default UsageMonitor;
