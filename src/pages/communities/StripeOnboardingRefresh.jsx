import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { connectStripe } from '../../api/communities';
import toast from 'react-hot-toast';

const StripeOnboardingRefresh = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const communityId = searchParams.get('communityId');
    
    if (communityId) {
      refreshOnboarding(communityId);
    } else {
      toast.error('Missing community information');
      navigate('/communities');
    }
  }, [searchParams, navigate]);

  const refreshOnboarding = async (communityId) => {
    try {
      const response = await connectStripe(communityId);
      
      if (response.success && response.data?.onboardingUrl) {
        // Redirect to the new onboarding URL
        window.location.href = response.data.onboardingUrl;
      } else {
        toast.error('Failed to refresh Stripe Connect session');
        navigate(`/communities/${communityId}`);
      }
    } catch (error) {
      console.error('Stripe Connect refresh error:', error);
      toast.error('Failed to refresh onboarding session');
      navigate(`/communities/${communityId}`);
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

export default StripeOnboardingRefresh;
