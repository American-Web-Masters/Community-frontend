import React, { useMemo, useState } from 'react';
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

    if (paymentType === 'recurring') {
      const storagePayload = JSON.stringify({
        paymentType,
        amount: selectedAmount,
        interval: recurringInterval,
        communityName: displayName,
        recipientUsername: 'AO1',
        username: 'AO1',
      });

      // Keep same storage keys as UserSupport for consistency with any existing success/refresh flows.
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
    <div className="min-h-screen light-background">
      <div className="px-4 sm:px-6 lg:px-8 pb-6">
        <div className="max-w-5xl mx-auto p-10 max-sm:p-5 bg-primary-50 rounded-2xl">
          {/* Header (AO1 Community + cross avatar) */}
          <div className="flex items-center justify-center mb-5">
            <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden flex-shrink-0 shadow-md bg-white">
              <img
                src={avatarSrc}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-center ml-5">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
                {displayName}
              </h1>
              <div className="flex items-center gap-3">
                <div className="btn-blue-gradient text-white px-3 py-1.5 rounded-md">
                  <p className="text-sm font-medium italic truncate">Support the app and keep it running</p>
                </div>
              </div>
            </div>
          </div>

          {!showPaymentForm ? (
            <>
              <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                {/* Left Column */}
                <div>
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">
                      Choose Your Blessing Amount
                    </h2>

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
                          <div className="text-sm lg:text-base text-gray-500 mt-2">
                            {amount.description}
                          </div>
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
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                            $
                          </span>
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
                        <div
                          className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                            paymentType === 'one-time' ? 'border-blue-500' : 'border-gray-300'
                          }`}
                        >
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
                        <div
                          className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                            paymentType === 'recurring' ? 'border-blue-500' : 'border-gray-300'
                          }`}
                        >
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
                      <h2 className="text-xl font-semibold text-gray-800 mb-3">
                        Add a Personal Message or Prayer
                      </h2>
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
