import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectUserStripe } from '../../../api/profile';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../store/userSlice';
import toast from 'react-hot-toast';

const UserStripeOnboardingRefresh = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  useEffect(() => {
    refreshOnboarding();
  }, []);

  const refreshOnboarding = async () => {
    try {
      const response = await connectUserStripe();

      if (response.success && response.data?.onboardingUrl) {
        // Redirect to the new onboarding URL
        window.location.href = response.data.onboardingUrl;
      } else {
        toast.error('Failed to refresh Stripe Connect session');
        navigate(user?.username ? `/profile/${user.username}` : '/');
      }
    } catch (error) {
      console.error('Stripe Connect refresh error:', error);
      toast.error('Failed to refresh onboarding session');
      navigate(user?.username ? `/profile/${user.username}` : '/');
    }
  };

  return (
    <div className="min-h-screen light-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Refreshing your Stripe Connect session...</p>
      </div>
    </div>
  );
};

export default UserStripeOnboardingRefresh;
