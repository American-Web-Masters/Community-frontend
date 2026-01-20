import React from 'react';
import { useNavigate } from 'react-router-dom';

const Communities = () => {
  const navigate = useNavigate();
  // Mock data - replace with real data from API
  const communities = [];

  return (
    <div className="p-6">
      {communities.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">🏘️</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No Communities Yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            You haven't joined any communities yet. Connect with like-minded people and build meaningful relationships.
          </p>
          <button
            onClick={() => navigate('/communities')}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Explore Communities
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {communities.map((community) => (
            <div key={community.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Community card content will go here */}
              <h3 className="text-lg font-semibold text-gray-900">{community.name}</h3>
              <p className="text-gray-600 mt-2">{community.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Communities;