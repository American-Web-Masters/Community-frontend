import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/userSlice';
import { getUserProfile, getUserStripeAccountStatus } from '../../api/profile';
import BottomNavBar from '../../components/ui/BottomNavBar';
import StripePaymentForm from '../../components/ui/StripePaymentForm';
import RecurringPaymentForm from '../../components/ui/RecurringPaymentForm';
import UserStripeStatusBanner from '../../components/ui/UserStripeStatusBanner';
import toast from 'react-hot-toast';

const UserSupport = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector(selectUser);

  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentType, setPaymentType] = useState('one-time'); // 'one-time' or 'recurring'
  const [recurringInterval] = useState('month'); // Fixed to monthly only
  const [userInfo, setUserInfo] = useState(null);
  const [paymentAvailable, setPaymentAvailable] = useState(false);
  const [checkingStripe, setCheckingStripe] = useState(true);

  const predefinedAmounts = [
    { label: '$10', value: 1000, description: 'Small Blessing' },
    { label: '$25', value: 2500, description: 'Kind Gift' },
    { label: '$50', value: 5000, description: 'Generous Donation' },
    { label: '$100', value: 10000, description: 'Major Support' },
  ];

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    if (value) {
      setSelectedAmount(parseFloat(value) * 100); // Convert to cents
    } else {
      setSelectedAmount(null);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const profileResult = await getUserProfile(username);
        if (profileResult.success) {
          setUserInfo(profileResult.data);
        } else {
          toast.error('Failed to load user information.');
        }

        // Check payment availability
        try {
          const stripeResponse = await getUserStripeAccountStatus();
          console.log(stripeResponse)
          setPaymentAvailable(stripeResponse.data?.chargesEnabled || false);
        } catch (stripeError) {
          console.error('Payment status check failed:', stripeError);
          setPaymentAvailable(false);
        }
      } catch (error) {
        toast.error('Failed to load user information.');
      } finally {
        setCheckingStripe(false);
      }
    };

    if (username) {
      loadUser();
    }
  }, [username]);

  const handleSendSupport = () => {
    if (!selectedAmount || selectedAmount < 50) {
      return;
    }

    if (paymentType === 'recurring') {
      localStorage.setItem(
        'pendingPayment',
        JSON.stringify({
          paymentType,
          amount: selectedAmount,
          interval: recurringInterval,
          recipientName: userInfo
            ? `${userInfo.firstname || ''} ${userInfo.lastname || ''}`.trim()
            : username,
          username,
        })
      );

      sessionStorage.setItem(
        'paymentDetails',
        JSON.stringify({
          paymentType,
          amount: selectedAmount,
          interval: recurringInterval,
          recipientName: userInfo
            ? `${userInfo.firstname || ''} ${userInfo.lastname || ''}`.trim()
            : username,
          username,
        })
      );
    }

    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = (paymentIntent) => {
    setShowPaymentForm(false);
    if (paymentType === 'recurring') {
      toast.success('Recurring payment set up successfully!');
    } else {
      toast.success('Payment sent successfully!');
    }

    navigate('/payment-success', {
      state: {
        paymentType,
        amount: selectedAmount,
        interval: recurringInterval,
        communityName:
          userInfo
            ? `${userInfo.firstname || ''} ${userInfo.lastname || ''}`.trim()
            : username,
        paymentIntent,
      },
    });
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
  };

  const displayName = userInfo
    ? `${userInfo.firstname || ''} ${userInfo.lastname || ''}`.trim()
    : username;

  // True when the logged-in user is viewing their own support page
  const isOwner = currentUser?.username === username;

  // ---------- Loading ----------
  if (checkingStripe) {
    return (
      <div className="min-h-screen light-background">
        <div className="px-4 sm:px-6 lg:px-8 pb-24">
          <div className="max-w-4xl mx-auto py-6">
            <button
              onClick={() => navigate(`/profile/${username}`)}
              className="flex items-center text-gray-800 hover:text-gray-900 mb-6 transition-colors"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Profile
            </button>

            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Checking payment availability...</p>
            </div>
          </div>
        </div>
        <BottomNavBar />
      </div>
    );
  }

  // ---------- Payments not available ----------
  if (!paymentAvailable) {
    return (
      <div className="min-h-screen light-background">
        <div className="px-4 sm:px-6 lg:px-8 pb-24">
          <div className="max-w-4xl mx-auto py-6">
            <button
              onClick={() => navigate(`/profile/${username}`)}
              className="flex items-center text-gray-800 hover:text-gray-900 mb-6 transition-colors"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Profile
            </button>

            {/* Owner-only: Stripe connect banner */}
            <UserStripeStatusBanner isOwner={isOwner} />

            <div className="max-w-lg mx-auto text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Payment Support Unavailable</h2>
              <p className="text-gray-600 mb-6">
                This user has not set up payment support yet. Donations are currently unavailable.
              </p>
              <button
                onClick={() => navigate(`/profile/${username}`)}
                className="btn-blue-gradient px-6 py-3 rounded-lg font-medium"
              >
                Back to Profile
              </button>
            </div>
          </div>
        </div>
        <BottomNavBar />
      </div>
    );
  }

  // ---------- Main Page ----------
  return (
    <div className="min-h-screen light-background">
      <div className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="pt-4">
          {/* Back Button */}
          <button
            onClick={() => navigate(`/profile/${username}`)}
            className="flex items-center text-white hover:text-gray-900 mb-6 transition-colors bg-primary-500 py-2 px-2 rounded-full"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </button>
        </div>

        <div className="max-w-5xl mx-auto p-10 max-sm:p-5 bg-primary-50 rounded-2xl">

          {/* User Header */}
          <div className="flex items-center justify-center mb-5">
            {/* Avatar */}
            <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden flex-shrink-0 shadow-md">
              {userInfo?.profilePicture ? (
                <img
                  src={userInfo.profilePicture}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-3xl">
                    {displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex flex-col justify-center ml-5 ">
              {/* Full Name */}
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
                {displayName}
              </h1>

              {/* Username */}
              <p className="text-sm text-gray-500 mb-2">@{userInfo?.username || username}</p>

              {/* Verse */}
              {userInfo?.verse && (
                <div className="btn-blue-gradient text-white px-3 py-1.5 rounded-md max-w-xs">
                  <p className="text-sm font-medium italic truncate">{userInfo.verse}</p>
                </div>
              )}
            </div>
          </div>

          {!showPaymentForm ? (
            <>
              <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                {/* Left Column */}
                <div>
                  {/* Choose Blessing Amount Section */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">Choose Your Blessing Amount</h2>

                    {/* Predefined Amounts Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {predefinedAmounts.map((amount) => (
                        <button
                          key={amount.value}
                          onClick={() => handleAmountSelect(amount.value)}
                          className={`p-5 rounded-2xl border text-center transition-all hover:shadow-md ${
                            selectedAmount === amount.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-2xl lg:text-3xl font-bold">{amount.label}</div>
                          <div className="text-sm lg:text-base text-gray-500 mt-2">{amount.description}</div>
                        </button>
                      ))}
                    </div>

                    {/* Custom Amount - Hidden for recurring payments */}
                    {paymentType === 'one-time' && (
                      <div className="mt-3">
                        <label className="block text-base lg:text-lg font-bold text-gray-700 mb-3">
                          Custom Amount
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                          <input
                            type="number"
                            value={customAmount}
                            onChange={handleCustomAmountChange}
                            placeholder="Enter amount"
                            className="w-full pl-10 pr-4 py-4 lg:py-5 border bg-white border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg shadow-sm"
                            min="0.50"
                            step="0.01"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  {/* Payment Type Selection */}
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">Payment Type</h2>

                    <div className="space-y-3">
                      {/* One-time Payment */}
                      <button
                        onClick={() => setPaymentType('one-time')}
                        className={`w-full flex items-center justify-between p-4 lg:p-5 bg-white rounded-lg border transition-all ${
                          paymentType === 'one-time'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">💳</span>
                          <div className="text-left">
                            <div className="font-medium text-gray-800">One-time Payment</div>
                            <div className="text-sm text-gray-500">Send support once</div>
                          </div>
                        </div>
                        <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                          paymentType === 'one-time' ? 'border-blue-500' : 'border-gray-300'
                        }`}>
                          {paymentType === 'one-time' && (
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </button>

                      {/* Recurring Payment */}
                      <button
                        onClick={() => setPaymentType('recurring')}
                        className={`w-full flex items-center justify-between p-4 lg:p-5 bg-white rounded-lg border transition-all ${
                          paymentType === 'recurring'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">🔄</span>
                          <div className="text-left">
                            <div className="font-medium text-gray-800">Monthly Recurring Payment</div>
                            <div className="text-sm text-gray-500">Automatic monthly support</div>
                          </div>
                        </div>
                        <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                          paymentType === 'recurring' ? 'border-blue-500' : 'border-gray-300'
                        }`}>
                          {paymentType === 'recurring' && (
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Personal Message - Hidden for recurring payments */}
                  {paymentType === 'one-time' && (
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold text-gray-800 mb-3">Add a Personal Message or Prayer</h2>
                      <textarea
                        value={personalMessage}
                        onChange={(e) => setPersonalMessage(e.target.value)}
                        placeholder="Write your message of support..."
                        className="w-full p-4 lg:p-5 border-1 border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-base lg:text-lg shadow-sm"
                        rows="3"
                      />
                    </div>
                  )}
                </div>

                {/* Send Support Button */}
                <div className="lg:col-span-2">
                  <button
                    onClick={handleSendSupport}
                    disabled={!selectedAmount || selectedAmount < 50}
                    className={`w-full py-5 lg:py-6 rounded-lg font-semibold text-white text-lg lg:text-xl transition-all shadow-lg hover:shadow-xl ${
                      selectedAmount && selectedAmount >= 50
                        ? 'btn-blue-gradient hover:opacity-90'
                        : 'bg-blue-700/50 cursor-not-allowed'
                    }`}
                  >
                    {paymentType === 'recurring'
                      ? `Set Up Monthly Payment (${selectedAmount ? `$${(selectedAmount / 100).toFixed(2)}` : '$0.00'})`
                      : `Send Support (${selectedAmount ? `$${(selectedAmount / 100).toFixed(2)}` : '$0.00'})`}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Payment Form - Choose based on payment type */
            paymentType === 'one-time' ? (
              <StripePaymentForm
                amount={selectedAmount}
                communityId={null}
                personalMessage={personalMessage}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            ) : (
              <RecurringPaymentForm
                amount={selectedAmount}
                interval={recurringInterval}
                communityId={null}
                description={`Monthly support for ${displayName}`}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            )
          )}
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
};

export default UserSupport;
