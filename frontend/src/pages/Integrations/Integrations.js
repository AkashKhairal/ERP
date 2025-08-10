import React, { useState } from 'react';
import { 
  Settings, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  TrendingUp
} from 'lucide-react';

const Integrations = () => {
  const [integrations, setIntegrations] = useState([
    {
      id: 1,
      name: 'YouTube',
      category: 'Social Media',
      description: 'Connect your YouTube channel to get real-time analytics and manage comments.',
      status: 'connected',
      lastSync: '2023-10-27T10:00:00Z',
      apiKey: true,
      dataPoints: ['Views', 'Subscribers', 'Comments', 'Likes'],
      icon: '🎥'
    },
    {
      id: 2,
      name: 'Slack',
      category: 'Communication',
      description: 'Integrate your Slack workspace to send notifications and receive messages.',
      status: 'disconnected',
      lastSync: null,
      apiKey: false,
      dataPoints: ['Messages', 'Channels', 'Users'],
      icon: '💬'
    },
    {
      id: 3,
      name: 'Stripe',
      category: 'Payment',
      description: 'Connect your Stripe account to manage payments and subscriptions.',
      status: 'pending',
      lastSync: null,
      apiKey: false,
      dataPoints: ['Payments', 'Subscriptions', 'Customers'],
      icon: '💳'
    },
    {
      id: 4,
      name: 'Notion',
      category: 'Productivity',
      description: 'Sync your Notion database with your application for better data organization.',
      status: 'connected',
      lastSync: '2023-10-26T14:30:00Z',
      apiKey: true,
      dataPoints: ['Pages', 'Blocks', 'Databases'],
      icon: '📝'
    },
    {
      id: 5,
      name: 'GitHub',
      category: 'Development',
      description: 'Connect your GitHub repository to track issues and pull requests.',
      status: 'connected',
      lastSync: '2023-10-25T09:15:00Z',
      apiKey: true,
      dataPoints: ['Issues', 'Pull Requests', 'Commits'],
      icon: '🐙'
    },
    {
      id: 6,
      name: 'Twilio',
      category: 'Communication',
      description: 'Send SMS and make phone calls using Twilio for notifications.',
      status: 'disconnected',
      lastSync: null,
      apiKey: false,
      dataPoints: ['Messages', 'Calls', 'Twilio Account'],
      icon: '📞'
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'disconnected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'disconnected': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatLastSync = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    return `${Math.floor(diffMinutes / 1440)} days ago`;
  };

  const connectIntegration = (integrationId) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: 'connected', lastSync: new Date().toISOString() }
        : integration
    ));
  };

  const disconnectIntegration = (integrationId) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: 'disconnected', lastSync: null }
        : integration
    ));
  };

  const syncIntegration = (integrationId) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, lastSync: new Date().toISOString() }
        : integration
    ));
  };

  const stats = {
    totalIntegrations: integrations.length,
    connectedIntegrations: integrations.filter(i => i.status === 'connected').length,
    disconnectedIntegrations: integrations.filter(i => i.status === 'disconnected').length,
    categories: [...new Set(integrations.map(i => i.category))].length
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Integrations</h1>
            <p className="text-gray-600">Connect with YouTube, Slack, Stripe, Notion, and other services</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
            <Plus className="w-4 h-4" />
            <span>Add Integration</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ExternalLink className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Integrations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalIntegrations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Connected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.connectedIntegrations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Disconnected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.disconnectedIntegrations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{stats.categories}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{integration.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{integration.name}</h3>
                    <p className="text-sm text-gray-600">{integration.category}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon(integration.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                    {integration.status}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last Sync:</span>
                  <span className="text-gray-900">{formatLastSync(integration.lastSync)}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">API Status:</span>
                  <span className={integration.apiKey ? 'text-green-600' : 'text-red-600'}>
                    {integration.apiKey ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
              </div>

              {/* Data Points */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Data Points:</p>
                <div className="flex flex-wrap gap-1">
                  {integration.dataPoints.map((point, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  {integration.status === 'connected' ? (
                    <>
                      <button
                        onClick={() => syncIntegration(integration.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Sync</span>
                      </button>
                      <button
                        onClick={() => disconnectIntegration(integration.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Disconnect</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => connectIntegration(integration.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Connect</span>
                    </button>
                  )}
                </div>
                
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Integration Status Overview */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Integration Status Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <ExternalLink className="w-5 h-5 mr-2" />
              Communication
            </h3>
            <div className="space-y-2">
              {integrations.filter(i => i.category === 'Communication').map(integration => (
                <div key={integration.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{integration.name}</span>
                  {getStatusIcon(integration.status)}
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <ExternalLink className="w-5 h-5 mr-2" />
              Payment
            </h3>
            <div className="space-y-2">
              {integrations.filter(i => i.category === 'Payment').map(integration => (
                <div key={integration.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{integration.name}</span>
                  {getStatusIcon(integration.status)}
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <ExternalLink className="w-5 h-5 mr-2" />
              Productivity
            </h3>
            <div className="space-y-2">
              {integrations.filter(i => i.category === 'Productivity').map(integration => (
                <div key={integration.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{integration.name}</span>
                  {getStatusIcon(integration.status)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations; 