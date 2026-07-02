import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../store/userSlice';
import StripePaymentForm from '../../../components/ui/StripePaymentForm';
import RecurringPaymentForm from '../../../components/ui/RecurringPaymentForm';

// Settings Support Card
// Mirrors src/pages/support/UserSupport.jsx UI + flow, but routes payments to the app/admin account.
// Header is customized to AO1 Community + cross avatar.

const predefinedAmounts = [
  { label: '$10', value: 1000, description: 'Small Blessing' },
  { label: '$25', value: 2500, description: 'Kind Gift' },
  { label: '$50', value: 5000, description: 'Generous Donation' },
  { label: '$100', value: 10000, description: 'Major Support' },
];

const SettingsSupportCard = ({
  title = 'AO1 Community',
  avatarSrc = '/cross.png',
}) => {
  const user = useSelector(selectUser);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentType, setPaymentType] = useState('one-time'); // 'one-time' | 'recurring'
  const [refreshKey, setRefreshKey] = useState(0);

  const recurringInterval = 'month'; // fixed monthly

  const displayName = useMemo(() => title, [title]);

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    if (value) {
      setSelectedAmount(parseFloat(value) * 100);
    } else {
      setSelectedAmount(null);
    }
  };

  const handleSendSupport = () => {
    if (!selectedAmount || selectedAmount < 50) return;

  // When supporting the app from Settings, return the user to their own profile settings.
  const returnTo = user?.username ? `/profile/${user.username}/settings` : '/settings';

    if (paymentType === 'recurring') {
      const storagePayload = JSON.stringify({
        paymentType,
        amount: selectedAmount,
        interval: recurringInterval,
        communityName: displayName,
        recipientUsername: 'AO1',
        username: 'AO1',
    redirectTo: returnTo,
      });

      // Keep same storage keys as UserSupport for consistency with any existing success/refresh flows.
      localStorage.setItem('pendingPayment', storagePayload);
      sessionStorage.setItem('paymentDetails', storagePayload);
    } else {
      // One-time app support also needs a safe return path.
      const storagePayload = JSON.stringify({
        paymentType,
        amount: selectedAmount,
        communityName: displayName,
        recipientUsername: 'AO1',
        username: 'AO1',
        redirectTo: returnTo,
      });
      localStorage.setItem('pendingPayment', storagePayload);
      sessionStorage.setItem('paymentDetails', storagePayload);
    }

    setShowPaymentForm(true);
  };

  const resetCard = () => {
    setSelectedAmount(null);
    setCustomAmount('');
    setPersonalMessage('');
    setPaymentType('one-time');
  };

  const handlePaymentSuccess = () => {
    // Refresh card UI after successful payment.
    setShowPaymentForm(false);
    resetCard();
    // Force remount of Stripe Elements if the user immediately pays again.
    setRefreshKey((k) => k + 1);
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
  };

  return (
    <div className="min-h-screen ">
      <div className="px-4 sm:px-6 lg:px-8 pb-6">
        <div className="max-w-4xl mx-auto p-8 max-sm:p-4 bg-primary-50 rounded-2xl">
          {/* Header (AO1 Community + cross avatar) */}
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden flex-shrink-0 shadow-md bg-white">
              <img
                src={avatarSrc}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-center ml-4">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                {displayName}
              </h1>
              <div className="flex items-center gap-3">
                <div className="btn-blue-gradient text-white px-3 py-1 rounded-md">
                  <p className="text-xs sm:text-sm font-medium italic truncate">Support the app and keep it running</p>
                </div>
              </div>
            </div>
          </div>

          {!showPaymentForm ? (
            <>
              <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                {/* Left Column */}
                <div>
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">
                      Choose Your Blessing Amount
                    </h2>

                    <div className="grid grid-cols-2 gap-3">
                      {predefinedAmounts.map((amount) => (
                        <button
                          key={amount.value}
                          onClick={() => handleAmountSelect(amount.value)}
                          className={`p-4 rounded-2xl border text-center transition-all hover:shadow-md cursor-pointer ${
                            selectedAmount === amount.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-xl lg:text-2xl font-bold">{amount.label}</div>
                          <div className="text-xs lg:text-sm text-gray-500 mt-1.5">
                            {amount.description}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Custom Amount - Hidden for recurring payments */}
                    {paymentType === 'one-time' && (
                      <div className="mt-3">
                        <label className="block text-sm lg:text-base font-bold text-gray-700 mb-2">
                          Custom Amount
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-base">
                            $
                          </span>
                          <input
                            type="number"
                            value={customAmount}
                            onChange={handleCustomAmountChange}
                            placeholder="Enter amount"
                            className="w-full pl-10 pr-4 py-3.5 lg:py-4 border bg-white border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base shadow-sm"
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
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Payment Type</h2>

                    <div className="space-y-3">
                      {/* One-time Payment */}
                      <button
                        onClick={() => setPaymentType('one-time')}
                        className={`w-full flex items-center justify-between p-3.5 lg:p-4 bg-white rounded-lg border transition-all cursor-pointer ${
                          paymentType === 'one-time'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">💳</span>
                          <div className="text-left">
                            <div className="font-medium text-gray-800 text-sm">One-time Payment</div>
                            <div className="text-xs text-gray-500">Send support once</div>
                          </div>
                        </div>
                        <div
                          className={`w-4.5 h-4.5 border-2 rounded-full flex items-center justify-center ${
                            paymentType === 'one-time' ? 'border-blue-500' : 'border-gray-300'
                          }`}
                        >
                          {paymentType === 'one-time' && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </button>

                      {/* Recurring Payment */}
                      <button
                        onClick={() => setPaymentType('recurring')}
                        className={`w-full flex items-center justify-between p-3.5 lg:p-4 bg-white rounded-lg border transition-all cursor-pointer ${
                          paymentType === 'recurring'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">🔄</span>
                          <div className="text-left">
                            <div className="font-medium text-gray-800 text-sm">Monthly Recurring Payment</div>
                            <div className="text-xs text-gray-500">Automatic monthly support</div>
                          </div>
                        </div>
                        <div
                          className={`w-4.5 h-4.5 border-2 rounded-full flex items-center justify-center ${
                            paymentType === 'recurring' ? 'border-blue-500' : 'border-gray-300'
                          }`}
                        >
                          {paymentType === 'recurring' && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Personal Message - Hidden for recurring payments */}
                  {paymentType === 'one-time' && (
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-gray-800 mb-2">
                        Add a Personal Message or Prayer
                      </h2>
                      <textarea
                        value={personalMessage}
                        onChange={(e) => setPersonalMessage(e.target.value)}
                        placeholder="Write your message of support..."
                        className="w-full p-3.5 lg:p-4 border-1 border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm lg:text-base shadow-sm"
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
                    className={`w-full py-4.5 lg:py-5 rounded-lg font-semibold text-white text-base lg:text-lg transition-all shadow-lg hover:shadow-xl cursor-pointer ${
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
          ) : paymentType === 'one-time' ? (
            <StripePaymentForm
              key={`one-time-${refreshKey}`}
              amount={selectedAmount}
              // App-admin support: StripePaymentForm should interpret "no recipient" as platform payment.
              // If the component currently requires a recipient, we’ll adjust it next.
              personalMessage={personalMessage}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          ) : (
            <RecurringPaymentForm
              key={`recurring-${refreshKey}`}
              amount={selectedAmount}
              mode="app"
              description={`Monthly support for ${displayName}`}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsSupportCard;
