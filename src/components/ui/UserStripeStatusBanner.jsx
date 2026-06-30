import React, { useState, useEffect } from 'react';
import { getUserStripeAccountStatus, connectUserStripe } from '../../api/profile';
import { FaStripe, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';

/**
 * UserStripeStatusBanner
 * Mirrors StripeStatusBanner but for individual user Stripe accounts.
 * Only renders when isOwner=true and the user's Stripe isn't fully set up.
 */
const UserStripeStatusBanner = ({ isOwner }) => {
  const [stripeStatus, setStripeStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isOwner) {
      checkStripeStatus();
    } else {
      setChecking(false);
    }
  }, [isOwner]);

  const checkStripeStatus = async () => {
    try {
      setChecking(true);
      const response = await getUserStripeAccountStatus();
      setStripeStatus(response.data);
    } catch (error) {
      console.error('Error checking user Stripe status:', error);
      setStripeStatus({ connected: false });
    } finally {
      setChecking(false);
    }
  };

  const handleConnectStripe = async () => {
    try {
      setLoading(true);
      const response = await connectUserStripe();

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

  // Don't render if not owner or still checking
  if (!isOwner || checking) return null;

  // Don't render if Stripe is fully set up
  if (
    stripeStatus?.hasStripeAccount &&
    stripeStatus?.detailsSubmitted &&
    stripeStatus?.chargesEnabled
  ) {
    return null;
  }

  const getStatusInfo = () => {
    if (!stripeStatus?.hasStripeAccount) {
      return {
        title: 'Payment Support Not Connected',
        message:
          'Connect your Stripe account to enable others to send you donations and support. The support button will be disabled until this is set up.',
        buttonText: 'Connect Stripe',
        icon: <FaStripe className="w-5 h-5 text-amber-600 mt-0.5" />,
      };
    }

    if (!stripeStatus?.detailsSubmitted) {
      return {
        title: 'Complete Stripe Account Setup',
        message:
          'Your Stripe account is connected but needs additional information. Please complete your account details to start receiving payments.',
        buttonText: 'Complete Setup',
        icon: <FaExclamationTriangle className="w-5 h-5 text-amber-600 mt-0.5" />,
      };
    }

    if (!stripeStatus?.chargesEnabled) {
      return {
        title: 'Account Under Review',
        message:
          "Your Stripe account details are submitted and under review. You'll be able to receive payments once the review is complete.",
        buttonText: 'Check Status',
        icon: <FaExclamationTriangle className="w-5 h-5 text-amber-600 mt-0.5" />,
      };
    }

    return {
      title: 'Payment Setup Required',
      message:
        "There's an issue with your payment setup. Please complete the Stripe onboarding process.",
      buttonText: 'Fix Setup',
      icon: <FaExclamationTriangle className="w-5 h-5 text-amber-600 mt-0.5" />,
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">{statusInfo.icon}</div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-amber-800">{statusInfo.title}</h3>

          <div className="mt-2 text-sm text-amber-700">
            <p>{statusInfo.message}</p>
          </div>

          {stripeStatus?.accountStatus && (
            <div className="mt-2 text-xs text-amber-600">
              <strong>Status:</strong> {stripeStatus.accountStatus}
            </div>
          )}

          <div className="mt-3 flex items-center space-x-3">
            <button
              onClick={handleConnectStripe}
              disabled={
                loading ||
                (stripeStatus?.detailsSubmitted && !stripeStatus?.chargesEnabled)
              }
              className="inline-flex items-center px-3 py-2 border border-amber-300 shadow-sm text-sm leading-4 font-medium rounded-md text-amber-800 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                'Setting up...'
              ) : (
                <>
                  <FaStripe className="mr-2 -ml-0.5 h-4 w-4" />
                  {statusInfo.buttonText}
                </>
              )}
            </button>

            <button
              onClick={() =>
                setStripeStatus({ hasStripeAccount: true, detailsSubmitted: true, chargesEnabled: true })
              }
              className="text-xs text-amber-700 hover:text-amber-600 underline"
            >
              Hide for now
            </button>
          </div>
        </div>

        {/* Close ✕ */}
        <button
          onClick={() =>
            setStripeStatus({ hasStripeAccount: true, detailsSubmitted: true, chargesEnabled: true })
          }
          className="flex-shrink-0 text-amber-400 hover:text-amber-600"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default UserStripeStatusBanner;
