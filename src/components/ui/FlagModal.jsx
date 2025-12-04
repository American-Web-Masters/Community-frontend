import React from 'react';
import { IoFlagOutline } from 'react-icons/io5';

const FlagModal = ({
  isOpen,
  onClose,
  onSubmit,
  flagReason,
  setFlagReason,
  flagDescription,
  setFlagDescription,
  selectedPrayerToFlag
}) => {
  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Flag Prayer</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="sr-only">Close</span>
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for flagging *
              </label>
              <select
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a reason</option>
                <option value="inappropriate_content">Inappropriate content</option>
                <option value="spam">Spam</option>
                <option value="harassment">Harassment</option>
                <option value="false_information">False information</option>
                <option value="offensive_language">Offensive language</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Flag Prayer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlagModal;