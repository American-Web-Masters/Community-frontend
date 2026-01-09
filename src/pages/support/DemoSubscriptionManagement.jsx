import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../../components/ui/BottomNavBar';
import Header from '../../components/ui/Header';
import toast from 'react-hot-toast';

const DemoSubscriptionManagement = () => {
  const navigate = useNavigate();
  
  // Demo subscription data
  const [subscriptions, setSubscriptions] = useState([
    {
      id: 'sub_demo_1',
      amount: 1000, // $10.00
      interval: 'month',
      status: 'active',
      description: 'Monthly Community Support',
      communityName: 'Demo Community',
      created: '2026-01-01T00:00:00Z',
      nextPayment: '2026-02-01T00:00:00Z'
    },
    {
      id: 'sub_demo_2',
      amount: 2500, // $25.00
      interval: 'week',
      status: 'active',
      description: 'Weekly Prayer Support',
      communityName: 'Prayer Circle',
      created: '2025-12-15T00:00:00Z',
      nextPayment: '2026-01-13T00:00:00Z'
    }
  ]);

  const [cancelingId, setCancelingId] = useState(null);

  const handleCancelSubscription = async (subscriptionId, description) => {
    if (!window.confirm(`Are you sure you want to cancel the subscription: "${description}"?`)) {
      return;
    }

    try {
      setCancelingId(subscriptionId);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Remove from local state
      setSubscriptions(prev => prev.filter(sub => sub.id !== subscriptionId));
      
      toast.success('Demo subscription cancelled successfully!');
    } catch (error) {
      toast.error('Demo cancellation failed');
    } finally {
      setCancelingId(null);
    }
  };

  const formatInterval = (interval) => {
    switch (interval) {
      case 'week':
        return 'Weekly';
      case 'biweek':
        return 'Bi-weekly';
      case 'month':
        return 'Monthly';
      default:
        return interval;
    }
  };

  const formatAmount = (amount) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-16 pb-20">
        <div className="max-w-md mx-auto p-4">
          <div className="mb-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">
              Demo Subscriptions
            </h1>
            <button
              onClick={() => navigate('/demo-recurring-payment')}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              New Subscription
            </button>
          </div>

          {/* Demo Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">
              🔗 Demo Mode
            </h3>
            <p className="text-sm text-blue-700">
              These are sample subscriptions for demonstration. In production, this would connect to your Stripe account.
            </p>
          </div>

          {subscriptions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg 
                  className="w-8 h-8 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" 
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No Demo Subscriptions
              </h3>
              <p className="text-gray-600 mb-4">
                All demo subscriptions have been cancelled.
              </p>
              <button
                onClick={() => navigate('/demo-recurring-payment')}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Demo Subscription
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((subscription) => (
                <div 
                  key={subscription.id} 
                  className="bg-white rounded-lg shadow-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {subscription.description}
                      </h3>
                      {subscription.communityName && (
                        <p className="text-sm text-gray-600">
                          Supporting: {subscription.communityName}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full mb-1 ${
                        subscription.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {subscription.status}
                      </span>
                      <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
                        DEMO
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">
                        {formatAmount(subscription.amount)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frequency:</span>
                      <span className="font-medium">
                        {formatInterval(subscription.interval)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">
                        {formatDate(subscription.created)}
                      </span>
                    </div>
                    
                    {subscription.nextPayment && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Next Payment:</span>
                        <span className="font-medium">
                          {formatDate(subscription.nextPayment)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-600">Subscription ID:</span>
                      <span className="font-mono text-xs text-gray-500">
                        {subscription.id}
                      </span>
                    </div>
                  </div>

                  {subscription.status === 'active' && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleCancelSubscription(subscription.id, subscription.description)}
                        disabled={cancelingId === subscription.id}
                        className="w-full px-3 py-2 text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {cancelingId === subscription.id ? 'Cancelling Demo...' : 'Cancel Demo Subscription'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Production Note */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">
              Production Features:
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Real Stripe subscription management</li>
              <li>• Automatic payment processing</li>
              <li>• Email notifications for payments</li>
              <li>• Failed payment retry logic</li>
              <li>• Subscription modification (pause/resume)</li>
              <li>• Invoice history and downloads</li>
            </ul>
          </div>
        </div>
      </div>
      <BottomNavBar />
    </div>
  );
};

export default DemoSubscriptionManagement;
