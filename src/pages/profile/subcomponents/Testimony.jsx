import React from 'react';
import { useNavigate } from 'react-router-dom';

const Testimony = () => {
  const navigate = useNavigate();
  // Mock data - replace with real data from API
  const testimonies = [];

  return (
    <div className="p-6">
      {testimonies.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">✨</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No Testimonies Yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            You haven't shared any testimonies yet. Share your faith journey and inspire others with your experiences.
          </p>
          <button
            onClick={() => navigate('/create')}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Share Your Testimony
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {testimonies.map((testimony) => (
            <div key={testimony.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Testimony content will go here */}
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{testimony.title}</h3>
              <p className="text-gray-600">{testimony.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Testimony;