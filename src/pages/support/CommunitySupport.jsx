import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/userSlice';
import { fetchCommunityById } from '../../api/communities';
import BottomNavBar from '../../components/ui/BottomNavBar';
import StripePaymentForm from '../../components/ui/StripePaymentForm';
import toast from 'react-hot-toast';  

const CommunitySupport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(0);
  const [communityInfo, setCommunityInfo] = useState(null);

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

useEffect(() => {
  const loadCommunity = async () => {
    try {
      const community = await fetchCommunityById(id, user);
      setCommunityInfo(community?.data || null);
    } catch (error) {
      toast.error("Failed to load community information.");
    }
  };

  if (id && user) {
    loadCommunity();
  }
}, [id, user]);



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
      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-4xl mx-auto py-6">
          {/* Back Button */}
          <button 
            onClick={() => navigate(`/communities/${id}`)}
            className="flex items-center text-gray-800 hover:text-gray-900 mb-6 transition-colors"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Community
          </button>

          {/* Community Info */}
          <div className="text-center mb-8 lg:mb-12">
            <div className="w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-4 rounded-full overflow-hidden shadow-lg">
              <img 
                src={communityInfo?.coverPhoto || '/celebration-party.png'} 
                alt="Community"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-2xl lg:text-3xl font-semibold text-gray-800 mb-2">
              {communityInfo?.name || 'Community'} Support
            </h1>
            <p className="text-base lg:text-lg text-gray-600 max-w-md mx-auto">Send a blessing to support this community</p>
          </div>

          {!showPaymentForm ? (
            <>
              <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                {/* Left Column */}
                <div>
                  {/* Choose Blessing Amount Section */}
                  <div className="mb-8">
                    <h2 className="text-xl lg:text-2xl font-semibold text-gray-800 mb-6">Choose Your Blessing Amount</h2>
                    
                    {/* Predefined Amounts Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                      {predefinedAmounts.map((amount) => (
                        <button
                          key={amount.value}
                          onClick={() => handleAmountSelect(amount.value)}
                          className={`p-5 lg:p-6 rounded-lg border text-center transition-all hover:shadow-md ${
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

                    {/* Custom Amount */}
                    <div className="mt-6">
                      <label className="block text-base lg:text-lg font-medium text-gray-700 mb-3">
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
                  </div>
                </div>

                {/* Right Column */}
                <div>

                  {/* Payment Methods Section */}
                  <div className="mb-8">
                    <h2 className="text-xl lg:text-2xl font-semibold text-gray-800 mb-6">Choose Your Payment Method</h2>
                    
                    <div className="space-y-4">
                      {/* Credit Card Options */}
                      {[1, 2, 3].map((index) => (
                        <div 
                          key={index}
                          onClick={() => setSelectedPaymentMethod(index)}
                          className="flex items-center justify-between p-5 lg:p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-8 lg:w-12 lg:h-10 bg-blue-600 rounded flex items-center justify-center">
                              <span className="text-white text-sm lg:text-base font-bold">💳</span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-800 text-base lg:text-lg">Credit Card</div>
                              <div className="text-sm lg:text-base text-gray-500">Add card details via Stripe</div>
                            </div>
                          </div>
                          <div className={`w-6 h-6 lg:w-8 lg:h-8 border-2 rounded-full flex items-center justify-center transition-colors ${
                            selectedPaymentMethod === index 
                              ? 'border-blue-500' 
                              : 'border-gray-300'
                          }`}>
                            {selectedPaymentMethod === index && (
                              <div className="w-3 h-3 lg:w-4 lg:h-4 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Personal Message */}
                  <div className="mb-8">
                    <h2 className="text-xl lg:text-2xl font-semibold text-gray-800 mb-4">Add a Personal Message or Prayer</h2>
                    <textarea
                      value={personalMessage}
                      onChange={(e) => setPersonalMessage(e.target.value)}
                      placeholder="Write your message of support..."
                      className="w-full p-4 lg:p-5 border-1 border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-base lg:text-lg shadow-sm"
                      rows="6"
                    />
                  </div>
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
                  Send Support ({selectedAmount ? `$${(selectedAmount / 100).toFixed(2)}` : '$0.00'})
                </button>
              </div>
            </div>
            </>
          ) : (
            /* Stripe Payment Form */
            <div className="max-w-2xl mx-auto">
              <StripePaymentForm
                amount={selectedAmount}
                communityId={id}
                personalMessage={personalMessage}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            </div>
          )}
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
};

export default CommunitySupport;
