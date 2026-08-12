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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all duration-300 animate-in fade-in ease-out">
      <div className="bg-white rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] transform transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4 ease-out w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Flag Prayer</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 cursor-pointer text-2xl inline-block hover:rotate-90 hover:shadow-sm active:scale-90 transition-all duration-300"
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
                className="w-full px-5 py-3.5 border border-gray-300 rounded-lg bg-white/70 backdrop-blur-sm shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 cursor-pointer"
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
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
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