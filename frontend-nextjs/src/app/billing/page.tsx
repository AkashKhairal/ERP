'use client';

import React from 'react';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import SubscriptionStatus from '../../components/ui/subscription-status';
import UsageMonitor from '../../components/ui/usage-monitor';
import PricingPage from '../../components/pages/Billing/PricingPage';
import { useSubscription } from '../../context/SubscriptionContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  CreditCard, 
  Calendar, 
  Download,
  ExternalLink,
  AlertTriangle,
  Clock
} from 'lucide-react';

const BillingPage: React.FC = () => {
  const { state, loadPayments } = useSubscription();
  const { subscription, payments, paymentsLoading } = state;

  React.useEffect(() => {
    loadPayments();
  }, []);

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <div className="h-2 w-2 bg-green-500 rounded-full" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-2 w-2 bg-gray-300 rounded-full" />;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      pending: 'secondary',
      processing: 'secondary',
      failed: 'destructive',
      cancelled: 'outline',
      refunded: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Billing & Subscription
          </h1>
          <p className="text-gray-600">
            Manage your subscription, usage, and billing information.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Subscription Status */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Subscription Status
              </h2>
              <SubscriptionStatus showActions={true} />
            </div>

            {/* Usage Monitor */}
            {subscription && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Usage & Limits
                </h2>
                <UsageMonitor showUpgradeButton={true} />
              </div>
            )}

            {/* Payment History */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Payment History
              </h2>
              
              {paymentsLoading ? (
                <Card className="p-6">
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : payments.length > 0 ? (
                <Card className="p-6">
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div 
                        key={payment._id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-4">
                          {getPaymentStatusIcon(payment.status)}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                {payment.description}
                              </span>
                              {getPaymentStatusBadge(payment.status)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date(payment.createdAt).toLocaleDateString()} • 
                              Receipt #{payment.receiptNumber}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold">
                            ₹{payment.amount.toLocaleString()}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Receipt
                            </Button>
                            {payment.gatewayPaymentId && (
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {payments.length >= 10 && (
                    <div className="mt-4 text-center">
                      <Button variant="outline" size="sm">
                        Load More
                      </Button>
                    </div>
                  )}
                </Card>
              ) : (
                <Card className="p-6 text-center">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Payment History
                  </h3>
                  <p className="text-gray-600">
                    Your payment history will appear here once you make a purchase.
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button className="w-full justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Update Payment Method
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Invoices
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
              </div>
            </Card>

            {/* Billing Contact */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Need Help?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Have questions about your subscription or billing? 
                Our support team is here to help.
              </p>
              
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  Contact Support
                </Button>
                
                <Button variant="ghost" size="sm" className="w-full">
                  View FAQ
                </Button>
              </div>
            </Card>

            {/* Subscription Info */}
            {subscription && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Subscription Details
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-medium">{subscription.plan.displayName}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Billing:</span>
                    <span className="font-medium">
                      ₹{subscription.billing.amount}/{subscription.billing.interval}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next billing:</span>
                    <span className="font-medium">
                      {new Date(subscription.renewalDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Auto-renewal:</span>
                    <span className={`font-medium ${
                      subscription.autoRenew ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {subscription.autoRenew ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Pricing Section for Users Without Subscription */}
        {!subscription && (
          <div className="mt-12">
            <PricingPage />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default BillingPage;
