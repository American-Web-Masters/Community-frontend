import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, selectIsLoggedIn, clearUser } from '../../store/userSlice';

const Home = () => {
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearUser());
  };

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white rounded-lg shadow-md p-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome to AO1 Community! 🎉
            </h1>
            <p className="text-gray-600 mt-2">
              You have successfully joined our community
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
          >
            Logout
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">
                {user.firstname?.charAt(0)}{user.lastname?.charAt(0)}
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {user.firstname} {user.lastname}
            </h2>
            <p className="text-gray-600">@{user.username}</p>
          </div>

          {/* User Details */}
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Profile Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    First Name
                  </label>
                  <p className="text-gray-800 font-medium">{user.firstname}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Last Name
                  </label>
                  <p className="text-gray-800 font-medium">{user.lastname}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Email
                  </label>
                  <p className="text-gray-800 font-medium">{user.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Username
                  </label>
                  <p className="text-gray-800 font-medium">@{user.username}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    User ID
                  </label>
                  <p className="text-gray-800 font-medium font-mono text-sm">{user._id}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Member Since
                  </label>
                  <p className="text-gray-800 font-medium">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Account Status
              </h3>
              
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.isVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.isVerified ? '✓ Verified' : '⏳ Pending Verification'}
                </span>
                
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.otpVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.otpVerified ? '✓ OTP Verified' : '✗ OTP Not Verified'}
                </span>
                
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Phase {user.registrationPhase || 'Complete'}
                </span>
              </div>
            </div>

            {/* Debug Info */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Debug Information (Development)
              </h3>
              <pre className="text-xs text-gray-600 overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Community Features (Placeholder) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-600 text-xl">👥</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Community</h3>
            <p className="text-gray-600 text-sm">Connect with fellow believers</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-accent-600 text-xl">📚</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Resources</h3>
            <p className="text-gray-600 text-sm">Access spiritual content</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-xl">🙏</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Prayer</h3>
            <p className="text-gray-600 text-sm">Join prayer requests</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;