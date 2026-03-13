import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMySubscriptions, cancelSubscription, getMyReceivedSubscriptions } from '../../../api/subscriptions';

const SubscriptionMgt = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my'); // 'my' | 'received'
  const [subscriptions, setSubscriptions] = useState([]);
  const [receivedSubscriptions, setReceivedSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receivedLoading, setReceivedLoading] = useState(false);
  const [cancelingId, setCancelingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedToCancel, setSelectedToCancel] = useState(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    if (activeTab === 'received' && receivedSubscriptions.length === 0 && !receivedLoading) {
      fetchReceivedSubscriptions();
    }
  }, [activeTab]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await getMySubscriptions();
      console.log(response.data?.subscriptions)
      
      // Map the response to only necessary fields
      const mappedSubscriptions = response.data?.subscriptions?.map(sub => ({
        id: sub._id,
        stripeSubscriptionId: sub.stripeSubscriptionId,
        amount: sub.amount,
        interval: sub.interval,
        status: sub.status,
  subscriptionType: sub.subscriptionType,
  // Community fields (when subscriptionType === 'community')
  communityName: sub.communityId?.name || (sub.metadata?.communityName ?? 'Unknown Community'),
  communityId: sub.communityId?._id,
  // Recipient / user fields (when subscriptionType === 'user')
  recipientId: sub.recipientProfileId?._id || null,
  recipientName: sub.recipientProfileId?.fullname || sub.metadata?.recipientName || null,
  recipientUsername: sub.recipientProfileId?.username || sub.metadata?.recipientUsername || null,
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

  const fetchReceivedSubscriptions = async () => {
    try {
      setReceivedLoading(true);
      const response = await getMyReceivedSubscriptions();

      const mapped = response.data?.subscriptions?.map(sub => ({
        id: sub._id,
        subscriberName: `${sub.userId?.firstname ?? ''} ${sub.userId?.lastname ?? ''}`.trim() || 'Unknown',
        subscriberEmail: sub.userId?.email || '',
        avatarInitials: `${sub.userId?.firstname?.[0] ?? ''}${sub.userId?.lastname?.[0] ?? ''}`.toUpperCase() || '?',
        amount: sub.amount,
        interval: sub.interval,
        status: sub.status,
        communityName: sub.communityId?.name || null,
        subscriptionType: sub.subscriptionType,
        startDate: sub.startDate,
        canceledAt: sub.canceledAt,
        endDate: sub.endDate,
        lastPaymentDate: sub.lastPaymentDate,
        nextPayment: sub.currentPeriodEnd,
        durationInDays: sub.durationInDays,
        cancelAtPeriodEnd: sub.metadata?.cancelAtPeriodEnd === 'true',
      })) || [];

      setReceivedSubscriptions(mapped);
    } catch (error) {
      toast.error('Failed to load received subscriptions');
    } finally {
      setReceivedLoading(false);
    }
  };

  const handleCancelSubscription = async (subscription) => {
    const confirmMessage = `Are you sure you want to cancel your $${subscription.amount}/${subscription.interval} subscription to "${subscription.communityName}"?\n\nNote: Your subscription will remain active until the end of the current billing period.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
  };

  const handleCancelSubscription = async (subscription) => {
    // open confirm modal for this subscription
    setSelectedToCancel(subscription);
    setConfirmOpen(true);
  };

  const confirmCancel = async () => {
    const subscription = selectedToCancel;
    if (!subscription) return;

    try {
      setCancelingId(subscription.id);
      setConfirmOpen(false);

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
      setSelectedToCancel(null);
      setConfirmOpen(false);
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

  const renderReceivedSubscriptions = () => {
    if (receivedLoading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading received subscriptions...</p>
        </div>
      );
    }

    if (receivedSubscriptions.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">🤝</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No Received Subscriptions</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Nobody has subscribed to you yet. Share your profile or communities to start receiving support.
          </p>
        </div>
      );
    }

    return (
      <>
        {/* Simple count badge */}
        <div className="flex items-center space-x-3 mb-6">
          <span className="text-sm text-gray-500">{receivedSubscriptions.length} subscriber{receivedSubscriptions.length !== 1 ? 's' : ''}</span>
          <span className="text-gray-300">·</span>
          <span className="text-sm text-green-600 font-medium">{activeReceivedCount} active</span>
        </div>

        <div className="space-y-3">
          {receivedSubscriptions.map((sub) => (
            <div key={sub.id} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Left: Avatar + subscriber info */}
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-700 font-semibold text-sm">{sub.avatarInitials}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{sub.subscriberName}</p>
                  <p className="text-xs text-gray-500 truncate">{sub.subscriberEmail}</p>
                  {sub.communityName && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      via <span className="text-gray-600">{sub.communityName}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Right: amount + status + date */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-1 flex-shrink-0">
                <div className="flex items-baseline space-x-1">
                  <span className="text-lg font-bold text-blue-600">${sub.amount}</span>
                  <span className="text-xs text-gray-500">/ {sub.interval}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(sub.status, sub.cancelAtPeriodEnd)}`}>
                  {getStatusText(sub.status, sub.cancelAtPeriodEnd)}
                </span>
                <span className="text-xs text-gray-400">since {formatDate(sub.startDate)}</span>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

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