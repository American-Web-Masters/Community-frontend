import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserStripeAccountStatus } from '../../../api/profile';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../store/userSlice';
import toast from 'react-hot-toast';

const UserStripeOnboardingSuccess = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(true);
  const [accountStatus, setAccountStatus] = useState(null);

  useEffect(() => {
    checkAccountStatus();
  }, []);

  const checkAccountStatus = async () => {
    try {
      const response = await getUserStripeAccountStatus();
      setAccountStatus(response.data);

      if (response.data?.connected) {
        toast.success('Stripe account connected successfully!');
      }
    } catch (error) {
      console.error('Error checking account status:', error);
      toast.error('Failed to verify account status');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate(user?.username ? `/profile/${user.username}` : '/');
  };

  if (loading) {
    return (
      <div className="min-h-screen light-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your Stripe account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen light-background flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Support Connected!
          </h1>

          <p className="text-gray-600 mb-6">
            {accountStatus?.chargesEnabled ? (
              "Your Stripe account has been successfully connected and verified. Your profile can now receive donations and support from other members."
            ) : (
              "Your Stripe account has been connected but may require additional verification. You'll be notified once it's fully activated."
            )}
          </p>

          {accountStatus && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left">
              <h3 className="font-medium text-gray-900 mb-2">Account Status:</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Connected: <span className="text-green-600">✓</span></div>
                <div>Charges Enabled: {accountStatus.chargesEnabled ? <span className="text-green-600">✓</span> : <span className="text-amber-600">Pending</span>}</div>
                <div>Payouts Enabled: {accountStatus.payoutsEnabled ? <span className="text-green-600">✓</span> : <span className="text-amber-600">Pending</span>}</div>
              </div>
            </div>
          )}

          <button
            onClick={handleContinue}
            className="w-full btn-blue-gradient py-3 rounded-lg font-medium text-white cursor-pointer"
          >
            Continue to Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserStripeOnboardingSuccess;
