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

const CheckoutForm = ({ amount, communityId, recipientUserId, personalMessage, onSuccess, onCancel }) => {
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
      let response;
      if (recipientUserId) {
        // User-to-user payment
        response = await apiClient.post('/payments/user/create-payment-intent', {
          amount,
          recipientUserId,
          personalMessage,
        });
      } else if (communityId) {
        // Community payment
        response = await apiClient.post('/payments/create-payment-intent', {
          amount,
          communityId,
          personalMessage,
        });
      } else {
        // App/admin payment (platform support)
        response = await apiClient.post('/payments/application/create-payment-intent', {
          amount,
          personalMessage,
        });
      }

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

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message);
        toast.error(`Payment failed: ${error.message}`);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast.success('🎉 Payment successful! Thank you for your support.');
        onSuccess && onSuccess(paymentIntent);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full px-6 py-8">
        {/* Back Button */}
        <button 
          onClick={onCancel}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Support Options
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 h-full">
          {/* Payment Summary - Left Column */}
          <div className="lg:col-span-2 mb-8 lg:mb-0">
            <div className="bg-white rounded-xl p-6 lg:p-8 shadow-xl border border-gray-100 h-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-600 text-lg">Support Amount</span>
                  <span className="text-3xl font-bold text-blue-600">${(amount / 100).toFixed(2)}</span>
                </div>
                
                {personalMessage && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Your Message:</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{personalMessage}</p>
                  </div>
                )}
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-800 font-medium">Secure Payment</span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">Your payment is secured by Stripe</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form - Right Column */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-xl border border-gray-100 h-full">
              <div className="p-6 lg:p-8 border-b border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Payment</h3>
                <p className="text-gray-600">Choose your preferred payment method below</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-6">
                <div className="stripe-payment-element">
                  <PaymentElement
                    options={{
                      layout: 'tabs',
                      fields: {
                        billingDetails: {
                          name: 'auto',
                          email: 'auto',
                        }
                      }
                    }}
                  />
                </div>

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-red-800 text-sm font-medium">Payment Error</span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-4 px-6 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!stripe || !elements || isLoading}
                    className={`flex-1 py-4 px-6 rounded-lg font-semibold text-white transition-all text-lg shadow-lg hover:shadow-xl transform hover:scale-105 ${
                      isLoading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'btn-blue-gradient hover:opacity-90'
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing Payment...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Pay ${(amount / 100).toFixed(2)}</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StripePaymentForm = ({ amount, communityId, recipientUserId, personalMessage, onSuccess, onCancel }) => {
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
        spacingUnit: '6px',
        borderRadius: '12px',
        focusBoxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)',
        fontSizeBase: '16px',
      },
      rules: {
        '.Input': {
          padding: '12px',
          fontSize: '16px',
        },
        '.Tab': {
          padding: '16px 24px',
          fontSize: '16px',
        }
      }
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        amount={amount}
        communityId={communityId}
        recipientUserId={recipientUserId}
        personalMessage={personalMessage}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
};

export default StripePaymentForm;
