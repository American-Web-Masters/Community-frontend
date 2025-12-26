import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/userSlice';
import Header from '../../components/ui/Header';
import BottomNavBar from '../../components/ui/BottomNavBar';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [searchParams] = useSearchParams();
  
  // Get payment intent from URL parameters
  const paymentIntent = searchParams.get('payment_intent');
  const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
  const redirectStatus = searchParams.get('redirect_status');

  useEffect(() => {
    // Auto-redirect to communities after 5 seconds
    const timer = setTimeout(() => {
      navigate('/communities');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleContinue = () => {
    navigate('/communities');
  };

  return (
    <div className="min-h-screen light-background">
      {/* Header */}
      <div className="mt-2">
        <Header
          showNotification={false}
          showFilter={false}
          showSearch={false}
          onBackClick={() => navigate('/communities')}
        />
      </div>

      {/* Success Content */}
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="max-w-md mx-auto text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Payment Successful! 🎉
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for supporting the community! Your blessing has been received and will help strengthen our community bonds.
          </p>

          {/* Payment Details */}
          {redirectStatus === 'succeeded' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">Payment Confirmed</h3>
              <p className="text-sm text-green-700">
                Your payment has been processed successfully.
              </p>
              {paymentIntent && (
                <p className="text-xs text-green-600 mt-2">
                  Transaction ID: {paymentIntent}
                </p>
              )}
            </div>
          )}

          {/* Celebration Image */}
          <div className="mb-6">
            <img 
              src="/celebration-party.png" 
              alt="Celebration"
              className="w-32 h-32 mx-auto object-contain"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleContinue}
              className="w-full btn-blue-gradient text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
            >
              Continue to Communities
            </button>
            
            <div className="text-sm text-gray-500">
              You will be automatically redirected in a few seconds...
            </div>
          </div>

          {/* Share Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              Share your blessing with others
            </p>
            <div className="flex justify-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </button>
              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
};

export default PaymentSuccess;
