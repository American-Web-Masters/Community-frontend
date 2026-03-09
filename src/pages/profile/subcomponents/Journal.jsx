import React from 'react';
import { useNavigate } from 'react-router-dom';

const Journal = () => {
  const navigate = useNavigate();
  // Mock data - replace with real data from API
  const journalEntries = [];

  return (
    <div className="p-6">
      {journalEntries.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">📔</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No Journal Entries Yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            You haven't created any journal entries yet. Start documenting your spiritual journey and daily reflections.
          </p>
          <button
            onClick={() => navigate('/create')}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Create Your First Entry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {journalEntries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Journal entry content will go here */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{entry.title}</h3>
                <span className="text-sm text-gray-500">{entry.date}</span>
              </div>
              <p className="text-gray-600">{entry.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Journal;