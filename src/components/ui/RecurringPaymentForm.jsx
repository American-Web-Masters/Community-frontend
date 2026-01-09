import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { createSubscription } from '../../api/subscriptions';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here');

const SubscriptionCheckoutForm = ({ 
  amount, 
  interval, 
  communityId, 
  description, 
  onSuccess, 
  onCancel 
}) => {
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

    try {
      // Confirm the payment
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message);
        setIsLoading(false);
        return;
      }

      // Confirm payment with Stripe (using existing client secret)
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message);
        toast.error(`Payment failed: ${error.message}`);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast.success('Subscription created successfully!');
        onSuccess && onSuccess(paymentIntent);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage(error.message || 'An unexpected error occurred');
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Recurring Payment Setup
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          ${(amount / 100).toFixed(2)} per {interval === 'biweek' ? '2 weeks' : interval}
        </p>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border border-gray-300 rounded-md p-3">
          <PaymentElement />
        </div>
        
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}

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
            disabled={!stripe || !elements || isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Processing...' : 'Subscribe'}
          </button>
        </div>
      </form>
    </div>
  );
};

const RecurringPaymentForm = ({ 
  amount, 
  interval, 
  communityId = null, 
  description = '', 
  onSuccess, 
  onCancel 
}) => {
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setupSubscription = async () => {
      try {
        setIsLoading(true);
        const response = await createSubscription({
          amount,
          interval,
          communityId,
          description
        });
        
        // Handle nested response structure from backend
        const clientSecret = response.data?.clientSecret || response.clientSecret;
        
        if (clientSecret) {
          setClientSecret(clientSecret);
        } else {
          throw new Error('No client secret received from server');
        }
      } catch (error) {
        console.error('Error setting up subscription:', error);
        toast.error('Failed to setup subscription. Please try again.');
        onCancel && onCancel();
      } finally {
        setIsLoading(false);
      }
    };

    setupSubscription();
  }, [amount, interval, communityId, description, onCancel]);

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Setting up subscription...</p>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="text-center">
          <p className="text-sm text-red-600">Failed to setup subscription</p>
          <button 
            onClick={onCancel}
            className="mt-3 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#2563eb',
      },
    },
  };

  return (
    <Elements options={options} stripe={stripePromise}>
      <SubscriptionCheckoutForm
        amount={amount}
        interval={interval}
        communityId={communityId}
        description={description}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
};

export default RecurringPaymentForm;
