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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
      {/* Minimal Confetti Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-3 h-3 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
        <div className="absolute top-20 right-20 w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-200"></div>
        <div className="absolute top-32 right-1/3 w-3 h-3 bg-green-400 rounded-full animate-bounce delay-150"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-5xl px-4 mt-10">
        
        {/* Success Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          
          {/* Header Section - Compact */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-8 text-center relative">
            <div className="absolute inset-0 bg-white/10"></div>
            <div className="relative z-10">
              {/* Success Icon */}
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                Payment Successful! 🎉
              </h1>
              <p className="text-lg text-white/90 max-w-xl mx-auto">
                Thank you for your generous blessing! Your support will strengthen our community.
              </p>
            </div>
          </div>

          {/* Content Section - Compact Grid */}
          <div className="px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              
              {/* Left Column - Payment Details */}
              <div className="lg:col-span-2">
                {redirectStatus === 'succeeded' && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 mb-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-green-800">Payment Confirmed</h3>
                    </div>
                    <p className="text-green-700 mb-3">
                      Your payment has been processed successfully and your blessing is now part of our community.
                    </p>
                    {paymentIntent && (
                      <div className="bg-white/50 rounded-lg p-3">
                        <p className="text-xs font-medium text-green-800">Transaction ID:</p>
                        <p className="text-xs text-green-600 font-mono break-all">{paymentIntent}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={handleContinue}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl mb-3"
                >
                  Continue to Communities
                </button>
                
                <div className="flex items-center justify-center space-x-2 text-gray-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L10 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Auto-redirecting in a few seconds...</span>
                </div>
              </div>

              {/* Right Column - Visual */}
              <div className="text-center">
                {/* Celebration Visual - Compact */}
                <div className="relative mb-4">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center border-4 border-yellow-200 shadow-lg">
                    <img 
                      src="/celebration-party.png" 
                      alt="Celebration"
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                  {/* Minimal floating elements */}
                  <div className="absolute top-2 right-4 text-red-400 text-lg animate-pulse">💖</div>
                  <div className="absolute bottom-2 left-4 text-yellow-400 text-sm animate-pulse delay-300">⭐</div>
                </div>

                {/* Share Section - Compact */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-800">Share the Joy! 🎊</h4>
                  <div className="flex justify-center space-x-3">
                    <button className="p-3 bg-blue-50 hover:bg-blue-500 text-blue-500 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-110">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                      </svg>
                    </button>
                    <button className="p-3 bg-green-50 hover:bg-green-500 text-green-500 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-110">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                    </button>
                    <button className="p-3 bg-purple-50 hover:bg-purple-500 text-purple-500 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-110">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
};

export default PaymentSuccess;
