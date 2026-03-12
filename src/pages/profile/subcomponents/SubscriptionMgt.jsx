import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMySubscriptions, cancelSubscription } from '../../../api/subscriptions';

// ---------------------------------------------------------------------------
// Placeholder data for "Received Subscriptions" (replace with real API later)
// ---------------------------------------------------------------------------
const MOCK_RECEIVED_SUBSCRIPTIONS = [
  {
    id: 'recv_001',
    subscriberName: 'Jordan Mitchell',
    subscriberUsername: '@jordan_m',
    avatarInitials: 'JM',
    avatarColor: 'bg-purple-500',
    amount: 15,
    interval: 'month',
    status: 'active',
    communityName: 'Faith & Growth',
    startDate: '2025-11-01T00:00:00.000Z',
    lastPaymentDate: '2026-03-01T00:00:00.000Z',
    nextPayment: '2026-04-01T00:00:00.000Z',
    durationInDays: 132,
    cancelAtPeriodEnd: false,
  },
  {
    id: 'recv_002',
    subscriberName: 'Priya Sharma',
    subscriberUsername: '@priya_s',
    avatarInitials: 'PS',
    avatarColor: 'bg-pink-500',
    amount: 25,
    interval: 'month',
    status: 'active',
    communityName: 'Morning Prayer Circle',
    startDate: '2025-09-15T00:00:00.000Z',
    lastPaymentDate: '2026-03-15T00:00:00.000Z',
    nextPayment: '2026-04-15T00:00:00.000Z',
    durationInDays: 179,
    cancelAtPeriodEnd: false,
  },
  {
    id: 'recv_003',
    subscriberName: 'Marcus Williams',
    subscriberUsername: '@marcus_w',
    avatarInitials: 'MW',
    avatarColor: 'bg-blue-500',
    amount: 10,
    interval: 'month',
    status: 'canceled',
    communityName: 'Faith & Growth',
    startDate: '2025-07-01T00:00:00.000Z',
    lastPaymentDate: '2026-01-01T00:00:00.000Z',
    canceledAt: '2026-01-20T00:00:00.000Z',
    durationInDays: 204,
    cancelAtPeriodEnd: false,
  },
  {
    id: 'recv_004',
    subscriberName: 'Aisha Patel',
    subscriberUsername: '@aisha_p',
    avatarInitials: 'AP',
    avatarColor: 'bg-emerald-500',
    amount: 20,
    interval: 'month',
    status: 'active',
    communityName: 'Morning Prayer Circle',
    startDate: '2026-01-10T00:00:00.000Z',
    lastPaymentDate: '2026-03-10T00:00:00.000Z',
    nextPayment: '2026-04-10T00:00:00.000Z',
    durationInDays: 62,
    cancelAtPeriodEnd: true,
    endDate: '2026-04-10T00:00:00.000Z',
  },
];

const SubscriptionMgt = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my'); // 'my' | 'received'
  const [subscriptions, setSubscriptions] = useState([]);
  const [receivedSubscriptions] = useState(MOCK_RECEIVED_SUBSCRIPTIONS);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await getMySubscriptions();
      
      // Map the response to only necessary fields
      const mappedSubscriptions = response.data?.subscriptions?.map(sub => ({
        id: sub._id,
        stripeSubscriptionId: sub.stripeSubscriptionId,
        amount: sub.amount,
        interval: sub.interval,
        status: sub.status,
        communityName: sub.communityId?.name || 'Unknown Community',
        communityId: sub.communityId?._id,
        startDate: sub.startDate,
        canceledAt: sub.canceledAt,
        endDate: sub.endDate,
        durationInDays: sub.durationInDays,
        nextPayment: sub.currentPeriodEnd,
        currentPeriodEnd: sub.currentPeriodEnd,
        cancelAtPeriodEnd: sub.metadata?.cancelAtPeriodEnd === 'true',
        lastPaymentDate: sub.lastPaymentDate
      })) || [];

      setSubscriptions(mappedSubscriptions);
    } catch (error) {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscription) => {
    const confirmMessage = `Are you sure you want to cancel your $${subscription.amount}/${subscription.interval} subscription to "${subscription.communityName}"?\n\nNote: Your subscription will remain active until the end of the current billing period.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setCancelingId(subscription.id);
      
      // Call the cancel API with database subscription ID
      const response = await cancelSubscription(subscription.id);
      
      // Update local state with the response data
      if (response.data?.subscription) {
        setSubscriptions(prev => 
          prev.map(sub => 
            sub.id === subscription.id 
              ? { 
                  ...sub, 
                  status: response.data.subscription.status,
                  canceledAt: response.data.subscription.canceledAt,
                  endDate: response.data.subscription.endDate,
                  cancelAtPeriodEnd: response.data.subscription.metadata?.cancelAtPeriodEnd === 'true',
                  willEndOn: response.data.willEndOn
                }
              : sub
          )
        );
      }
      
      toast.success(response.message || 'Subscription will be canceled at the end of the current billing period');
    } catch (error) {
      toast.error('Failed to cancel subscription. Please try again.');
    } finally {
      setCancelingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status, cancelAtPeriodEnd) => {
    if (cancelAtPeriodEnd && status === 'active') {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'incomplete':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'past_due':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status, cancelAtPeriodEnd) => {
    if (cancelAtPeriodEnd && status === 'active') {
      return 'Ending Soon';
    }
    
    switch (status) {
      case 'active':
        return 'Active';
      case 'canceled':
        return 'Cancelled';
      case 'incomplete':
        return 'Incomplete';
      case 'past_due':
        return 'Past Due';
      default:
        return status?.charAt(0)?.toUpperCase() + status?.slice(1) || 'Unknown';
    }
  };

  // ── Derived stats for Received tab ────────────────────────────────────────
  const activeReceivedCount = receivedSubscriptions.filter(
    s => s.status === 'active' && !s.cancelAtPeriodEnd
  ).length;
  const totalMonthlyReceived = receivedSubscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0);

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  // ── Tab content helpers ─────────────────────────────────────────────────
  const renderMySubscriptions = () => (
    <>
      {subscriptions.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">💳</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No Subscriptions Yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            You haven't set up any recurring payments yet. Start supporting your favourite communities with monthly donations.
          </p>
          <button
            onClick={() => navigate('/communities')}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Explore Communities
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Cancellation Notice Banner */}
              {subscription.cancelAtPeriodEnd && subscription.status === 'active' && (
                <div className="bg-orange-50 border-b border-orange-200 px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-800">
                        Subscription ends on {formatDate(subscription.endDate || subscription.currentPeriodEnd)}
                      </p>
                      <p className="text-xs text-orange-700">You'll continue to have access until then</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{subscription.communityName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status, subscription.cancelAtPeriodEnd)}`}>
                        {getStatusText(subscription.status, subscription.cancelAtPeriodEnd)}
                      </span>
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold text-blue-600">${subscription.amount}</span>
                      <span className="text-gray-500">per {subscription.interval}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 mt-4 sm:mt-0">
                    <button
                      onClick={() => navigate(`/communities/${subscription.communityId}`)}
                      className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                    >
                      View Community
                    </button>
                    {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                      <button
                        onClick={() => handleCancelSubscription(subscription)}
                        disabled={cancelingId === subscription.id}
                        className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        {cancelingId === subscription.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-gray-100">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Started</p>
                    <p className="font-medium text-gray-900">{formatDate(subscription.startDate)}</p>
                  </div>
                  {subscription.cancelAtPeriodEnd && subscription.endDate && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Will End On</p>
                      <p className="font-medium text-orange-600">{formatDate(subscription.endDate)}</p>
                    </div>
                  )}
                  {subscription.canceledAt && !subscription.cancelAtPeriodEnd && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Cancelled</p>
                      <p className="font-medium text-gray-900">{formatDate(subscription.canceledAt)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Duration</p>
                    <p className="font-medium text-gray-900">{subscription.durationInDays} days</p>
                  </div>
                  {subscription.nextPayment && subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Next Payment</p>
                      <p className="font-medium text-gray-900">{formatDate(subscription.nextPayment)}</p>
                    </div>
                  )}
                  {subscription.lastPaymentDate && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Last Payment</p>
                      <p className="font-medium text-gray-900">{formatDate(subscription.lastPaymentDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  const renderReceivedSubscriptions = () => (
    <>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Total Subscribers</p>
          <p className="text-2xl font-bold text-blue-700">{receivedSubscriptions.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <p className="text-xs text-green-600 font-medium uppercase tracking-wide mb-1">Active</p>
          <p className="text-2xl font-bold text-green-700">{activeReceivedCount}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 col-span-2 sm:col-span-1">
          <p className="text-xs text-purple-600 font-medium uppercase tracking-wide mb-1">Monthly Revenue</p>
          <p className="text-2xl font-bold text-purple-700">${totalMonthlyReceived}</p>
        </div>
      </div>

      {/* Placeholder notice */}
      <div className="flex items-center space-x-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mb-6">
        <svg className="w-4 h-4 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-yellow-700">
          <span className="font-semibold">Demo data</span> — real subscriber data will load once the API is connected.
        </p>
      </div>

      {receivedSubscriptions.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">🤝</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No Received Subscriptions</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Nobody has subscribed to your communities yet. Share your communities to start receiving support.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {receivedSubscriptions.map((sub) => (
            <div key={sub.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Ending Soon Banner */}
              {sub.cancelAtPeriodEnd && sub.status === 'active' && (
                <div className="bg-orange-50 border-b border-orange-200 px-5 py-3 flex items-center space-x-2">
                  <svg className="w-4 h-4 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-xs font-medium text-orange-800">
                    Subscriber's plan ends on {formatDate(sub.endDate)}
                  </p>
                </div>
              )}

              <div className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Subscriber Info */}
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full ${sub.avatarColor} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white font-semibold text-sm">{sub.avatarInitials}</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-0.5">
                        <p className="font-semibold text-gray-900">{sub.subscriberName}</p>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(sub.status, sub.cancelAtPeriodEnd)}`}>
                          {getStatusText(sub.status, sub.cancelAtPeriodEnd)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{sub.subscriberUsername}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Community: <span className="text-gray-600 font-medium">{sub.communityName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="sm:text-right">
                    <div className="flex items-baseline space-x-1 sm:justify-end">
                      <span className="text-2xl font-bold text-blue-600">${sub.amount}</span>
                      <span className="text-sm text-gray-500">/ {sub.interval}</span>
                    </div>
                  </div>
                </div>

                {/* Details Row */}
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Started</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(sub.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Duration</p>
                    <p className="text-sm font-medium text-gray-900">{sub.durationInDays} days</p>
                  </div>
                  {sub.lastPaymentDate && (
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Last Payment</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(sub.lastPaymentDate)}</p>
                    </div>
                  )}
                  {sub.nextPayment && sub.status === 'active' && !sub.cancelAtPeriodEnd && (
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Next Payment</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(sub.nextPayment)}</p>
                    </div>
                  )}
                  {sub.canceledAt && (
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Cancelled On</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(sub.canceledAt)}</p>
                    </div>
                  )}
                  {sub.cancelAtPeriodEnd && sub.endDate && (
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Will End On</p>
                      <p className="text-sm font-medium text-orange-600">{formatDate(sub.endDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-2xl font-bold text-gray-900">Subscription Management</h2>
          <p className="text-gray-600 mt-1">Track what you give and what you receive</p>
        </div>
        {activeTab === 'my' && (
          <button
            onClick={() => navigate('/communities')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Browse Communities
          </button>
        )}
      </div>

      {/* Tab Bar */}
      <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-8">
        <button
          onClick={() => setActiveTab('my')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'my'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span>My Subscriptions</span>
          {subscriptions.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === 'my' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
              {subscriptions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('received')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'received'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Received Subscriptions</span>
          {receivedSubscriptions.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === 'received' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
              {receivedSubscriptions.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'my' ? renderMySubscriptions() : renderReceivedSubscriptions()}
    </div>
  );
};

export default SubscriptionMgt;