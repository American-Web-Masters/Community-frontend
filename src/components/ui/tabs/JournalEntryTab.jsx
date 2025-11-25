import React, { useState } from 'react';

const JournalEntryTab = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    description: '',
    privacy: 'public',
    feeling: '😊',
    tags: '',
    communityAssociation: '',
    scheduleDate: ''
  });

  const journalMoodOptions = ['😊', '🙂', '😢', '😡', '😔'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      setError('Journal description is required');
      return;
    }

    if (formData.scheduleDate && !formData.scheduleDate) {
      setError('Please select a schedule date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Implement journal entry creation API
      console.log('Journal Data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onSuccess) onSuccess({ message: 'Journal entry saved successfully' });
      onClose();
    } catch (err) {
      console.error('Journal entry creation error:', err);
      setError('Failed to save journal entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!formData.description.trim()) {
      setError('Journal description is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Implement save as draft API
      console.log('Saving journal draft:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (onSuccess) onSuccess({ message: 'Journal draft saved' });
      onClose();
    } catch (err) {
      console.error('Draft save error:', err);
      setError('Failed to save draft. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Journal Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Journal Description
            </label>
            <textarea
              placeholder="Capture your thoughts and reflections"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-4 py-4 bg-white border border-gray-200 rounded-3xl text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[140px]"
              rows={6}
              required
            />
          </div>

          {/* How are you feeling today? */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">How are you feeling today?</h3>
            <div className="flex gap-3 justify-center">
              {journalMoodOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleInputChange('feeling', emoji)}
                  className={`w-12 h-12 text-2xl rounded-full transition-all duration-200 hover:scale-110 ${
                    formData.feeling === emoji
                      ? 'bg-blue-100 ring-2 ring-blue-600 scale-110'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Community Association */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Community Association (Optional)
            </label>
            <select
              value={formData.communityAssociation}
              onChange={(e) => handleInputChange('communityAssociation', e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-3xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Select Community</option>
              <option value="community1">Community 1</option>
              <option value="community2">Community 2</option>
              <option value="community3">Community 3</option>
            </select>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Privacy */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Privacy</h3>
            <div className="space-y-3">
              <label className="flex items-center p-3 bg-white rounded-3xl cursor-pointer">
                <input
                  type="radio"
                  name="journalPrivacy"
                  value="public"
                  checked={formData.privacy === 'public'}
                  onChange={(e) => handleInputChange('privacy', e.target.value)}
                   className="appearance-none h-4 w-4 rounded-full border border-gray-400 checked:bg-blue-500 checked:border-gray-700 focus:outline-none focus:ring-0"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-800">Public</div>
                  <div className="text-sm text-gray-500">Everyone can see your journal</div>
                </div>
              </label>
              <label className="flex items-center p-3 bg-white rounded-3xl cursor-pointer">
                <input
                  type="radio"
                  name="journalPrivacy"
                  value="private"
                  checked={formData.privacy === 'private'}
                  onChange={(e) => handleInputChange('privacy', e.target.value)}
                  className="appearance-none h-4 w-4 rounded-full border border-gray-400 checked:bg-blue-500 checked:border-gray-700 focus:outline-none focus:ring-0"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-800">Private</div>
                  <div className="text-sm text-gray-500">Only visible to you</div>
                </div>
              </label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (Optional)
            </label>
            <input
              type="text"
              placeholder="Add tags..."
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-3xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
          </div>

          {/* Schedule Entry */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Schedule Entry</h3>
            <input
              type="date"
              value={formData.scheduleDate}
              onChange={(e) => handleInputChange('scheduleDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              placeholder="mm/dd/yy"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-3xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-700 text-sm">{error}</div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-6 mt-6">
        <button
          type="button"
          onClick={handleSaveAsDraft}
          disabled={loading || !formData.description.trim()}
          className="flex-1 py-3 px-6 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors duration-200 disabled:opacity-70"
        >
          {loading ? 'Saving...' : 'Save as Draft'}
        </button>
        <button
          type="submit"
          disabled={loading || !formData.description.trim()}
          className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Entry'}
        </button>
      </div>
    </form>
  );
};

export default JournalEntryTab;