import React, { useState, useEffect } from 'react';
import { getStripeAccountStatus, connectStripe } from '../../api/communities';
import { FaStripe, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const StripeStatusBanner = ({ communityId, isOwner }) => {
  const [stripeStatus, setStripeStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isOwner && communityId) {
      checkStripeStatus();
    } else {
      setChecking(false);
    }
  }, [communityId, isOwner]);

  const checkStripeStatus = async () => {
    try {
      setChecking(true);
      const response = await getStripeAccountStatus(communityId);
      setStripeStatus(response.data);
    } catch (error) {
      console.error('Error checking Stripe status:', error);
      setStripeStatus({ connected: false });
    } finally {
      setChecking(false);
    }
  };

  const handleConnectStripe = async () => {
    try {
      setLoading(true);
      const response = await connectStripe(communityId);
      
      console.log('Stripe Connect Response:', response); // Debug log
      
      if (response.status === 'success' && response.data?.onboardingUrl) {
        window.location.href = response.data.onboardingUrl;
      } else {
        toast.error('Failed to initialize Stripe Connect');
      }
    } catch (error) {
      console.error('Stripe Connect error:', error);
      toast.error('Failed to connect Stripe account');
    } finally {
      setLoading(false);
    }
  };

  // Don't show anything if not owner or still checking
  if (!isOwner || checking) {
    return null;
  }

  // Don't show if Stripe is connected and working
  if (stripeStatus?.connected && stripeStatus?.chargesEnabled) {
    return null;
  }

  return (
    <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {stripeStatus?.connected ? (
            <FaExclamationTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
          ) : (
            <FaStripe className="w-5 h-5 text-amber-600 mt-0.5" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-amber-800">
            {stripeStatus?.connected ? 'Stripe Account Setup Required' : 'Payment Support Not Connected'}
          </h3>
          
          <div className="mt-2 text-sm text-amber-700">
            {stripeStatus?.connected ? (
              <p>
                Your Stripe account is connected but requires additional setup to receive payments. 
                Please complete the verification process.
              </p>
            ) : (
              <p>
                Connect your Stripe account to enable community members to send you donations and support.
                The support button will be disabled until this is set up.
              </p>
            )}
          </div>

          {stripeStatus?.requirements?.disabled_reason && (
            <div className="mt-2 text-xs text-amber-600">
              <strong>Issue:</strong> {stripeStatus.requirements.disabled_reason.replace(/_/g, ' ')}
            </div>
          )}

          <div className="mt-3 flex items-center space-x-3">
            <button
              onClick={handleConnectStripe}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-amber-300 shadow-sm text-sm leading-4 font-medium rounded-md text-amber-800 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
            >
              {loading ? (
                'Setting up...'
              ) : (
                <>
                  <FaStripe className="mr-2 -ml-0.5 h-4 w-4" />
                  {stripeStatus?.connected ? 'Complete Setup' : 'Connect Stripe'}
                </>
              )}
            </button>
            
            <button
              onClick={() => setStripeStatus({ connected: true, chargesEnabled: true })}
              className="text-xs text-amber-700 hover:text-amber-600 underline"
            >
              Hide for now
            </button>
          </div>
        </div>

        <button
          onClick={() => setStripeStatus({ connected: true, chargesEnabled: true })}
          className="flex-shrink-0 text-amber-400 hover:text-amber-600"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default StripeStatusBanner;
