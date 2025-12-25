import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import apiClient from '../../api/client';

// Initialize Stripe - Replace with your actual publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here');

const CheckoutForm = ({ amount, communityId, personalMessage, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (!stripe || !elements) {
      setIsLoading(false);
      return;
    }

    // Validate amount
    if (!amount || amount < 50) {
      setErrorMessage('Minimum amount is $0.50');
      setIsLoading(false);
      return;
    }

    console.log('Processing payment for amount:', amount, 'cents');

    try {
      // Trigger form validation and wallet collection
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message);
        setIsLoading(false);
        return;
      }

      // Create the PaymentIntent using axios with proper credentials
      const response = await apiClient.post('/payments/create-payment-intent', {
        amount,
        communityId,
        personalMessage,
      });

      console.log('Payment intent response:', response.data);

      // Check for success status (API returns "status": "success")
      if (response.data.status !== "success") {
        throw new Error(response.data.message || 'Failed to create payment intent');
      }

      // Get client secret from the response data
      const clientSecret = response.data.data?.clientSecret;
      
      if (!clientSecret) {
        throw new Error('No client secret received from server');
      }

      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        toast.success('🎉 Payment successful! Thank you for your support.');
        onSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'An unexpected error occurred. Please try again.';
      setErrorMessage(errorMsg);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Complete Your Payment</h3>
        <div className="text-2xl font-bold text-blue-600">${(amount / 100).toFixed(2)}</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="stripe-payment-element">
          <PaymentElement
            options={{
              layout: 'tabs',
            }}
          />
        </div>

        {personalMessage && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Your Message:</h4>
            <p className="text-gray-600 text-sm">{personalMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800 text-sm">{errorMessage}</div>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || !elements || isLoading}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-all ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'btn-blue-gradient hover:opacity-90'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              `Pay $${(amount / 100).toFixed(2)}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const StripePaymentForm = ({ amount, communityId, personalMessage, onSuccess, onCancel }) => {
  const options = {
    mode: 'payment',
    amount: amount,
    currency: 'usd',
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#3b82f6',
        colorBackground: '#ffffff',
        colorText: '#374151',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        amount={amount}
        communityId={communityId}
        personalMessage={personalMessage}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
};

export default StripePaymentForm;
