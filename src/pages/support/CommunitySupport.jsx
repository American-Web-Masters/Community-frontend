import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/userSlice';
import Header from '../../components/ui/Header';
import BottomNavBar from '../../components/ui/BottomNavBar';
import StripePaymentForm from '../../components/ui/StripePaymentForm';

const CommunitySupport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const predefinedAmounts = [
    { label: '$10', value: 1000, description: 'Small Blessing' },
    { label: '$25', value: 2500, description: 'Kind Gift' },
    { label: '$50', value: 5000, description: 'Generous Donation' },
    { label: '$100', value: 10000, description: 'Major Support' }
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

  const handleSendSupport = () => {
    if (!selectedAmount || selectedAmount < 50) { // Minimum $0.50
      return;
    }
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    // Handle successful payment
    setShowPaymentForm(false);
    navigate(`/communities/${id}`);
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
  };

  return (
    <div className="min-h-screen light-background">
      {/* Header */}
      <div className="mt-2">
        <Header
          showNotification={false}
          showFilter={false}
          showSearch={false}
          onBackClick={() => navigate(`/communities/${id}`)}
        />
      </div>

      {/* Main Content */}
      <div className="px-4 mt-6 pb-24">
        <div className="max-w-md mx-auto">
          {/* Community Info */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden">
              <img 
                src={user?.profileImage || '/celebration-party.png'} 
                alt="Community"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-xl font-semibold text-gray-800 mb-2">Morning Blessings</h1>
            <p className="text-sm text-gray-600">Send a blessing to support this community</p>
          </div>

          {!showPaymentForm ? (
            <>
              {/* Choose Blessing Amount Section */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Choose Your Blessing Amount</h2>
                
                {/* Predefined Amounts Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {predefinedAmounts.map((amount) => (
                    <button
                      key={amount.value}
                      onClick={() => handleAmountSelect(amount.value)}
                      className={`p-4 rounded-lg border text-center transition-all ${
                        selectedAmount === amount.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xl font-bold">{amount.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{amount.description}</div>
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      placeholder="Enter amount"
                      className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0.50"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods Section */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Choose Your Payment Method</h2>
                
                <div className="space-y-3">
                  {/* Credit Card Options */}
                  {[1, 2, 3].map((index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-6 bg-blue-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">💳</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">Credit Card</div>
                          <div className="text-sm text-gray-500">Add card details via Stripe</div>
                        </div>
                      </div>
                      <div className="w-6 h-6 border-2 border-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Message */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Add a Personal Message or Prayer</h2>
                <textarea
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder="Write your message of support..."
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="4"
                />
              </div>

              {/* Send Support Button */}
              <button
                onClick={handleSendSupport}
                disabled={!selectedAmount || selectedAmount < 50}
                className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${
                  selectedAmount && selectedAmount >= 50
                    ? 'btn-blue-gradient hover:opacity-90'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Send Support ({selectedAmount ? `$${(selectedAmount / 100).toFixed(2)}` : '$0.00'})
              </button>
            </>
          ) : (
            /* Stripe Payment Form */
            <StripePaymentForm
              amount={selectedAmount}
              communityId={id}
              personalMessage={personalMessage}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          )}
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
};

export default CommunitySupport;
