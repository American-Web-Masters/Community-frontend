import React, { useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../api/client';

const RecurringPaymentForm = ({ 
  amount,
  /**
   * mode:
   * - 'community': recurring support to a community (default when communityId provided)
   * - 'user': recurring support to a user (when recipientUserId provided)
   * - 'app': recurring support to the platform/admin Stripe account
   */
  mode = null,
  communityId = null,
  recipientUserId = null,
  description = null,
  onSuccess, 
  onCancel 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const interval = "month";
  // Convert amount from cents to dollars for display and API
  const dollarAmount = Math.round(amount / 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const effectiveMode = mode || (recipientUserId ? 'user' : (communityId ? 'community' : 'app'));

      if (effectiveMode === 'user') {
        // User-to-user recurring subscription
        const response = await apiClient.post('/subscriptions/user/create-subscripition', {
          amount: dollarAmount,
          recipientUserId,
          interval,
        });

        if (response.data?.data?.sessionUrl) {
          window.location.href = response.data.data.sessionUrl;
        } else {
          throw new Error('No session URL received from server');
        }
        return;
      }

      if (effectiveMode === 'community') {
        // Community recurring subscription
        const paymentData = {
          amount: amount,
          paymentType: 'recurring',
          interval: interval,
          communityId: communityId,
        };
        const encodedData = btoa(JSON.stringify(paymentData));
        window.location.hash = encodedData;

        const response = await apiClient.post('/subscriptions/create', {
          communityId,
          amount: dollarAmount,
          interval,
          ...(description ? { description } : {}),
        });

        if (response.data?.data?.sessionUrl) {
          window.location.href = response.data.data.sessionUrl;
        } else {
          throw new Error('No session URL received from server');
        }
        return;
      }

      // Platform/admin recurring support
      // Assumption: backend exposes a dedicated endpoint that creates a Checkout session
      // for the app/admin Stripe account.
      const response = await apiClient.post('/subscriptions/app/create', {
        amount: dollarAmount,
        interval,
        ...(description ? { description } : {}),
      });

      if (response.data?.data?.sessionUrl) {
        window.location.href = response.data.data.sessionUrl;
      } else {
        throw new Error('No session URL received from server');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(error.response?.data?.message || 'Failed to set up recurring payment');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Set Up Monthly Recurring Payment
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          You will be redirected to Stripe to complete your subscription setup
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Monthly Amount:</span>
            <span className="font-semibold text-lg">${dollarAmount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Payment Method:</span>
            <span className="text-sm text-gray-700">Secure Stripe Checkout</span>
          </div>
        </div>

        <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
          <p>• Your subscription will automatically renew monthly</p>
          <p>• You can cancel or modify anytime</p>
          <p>• Secure payment processing by Stripe</p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Redirecting...' : 'Continue to Checkout'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecurringPaymentForm;
