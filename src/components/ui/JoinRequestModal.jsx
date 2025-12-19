import React from 'react';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';

const JoinRequestModal = ({
  isOpen,
  onClose,
  communityName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="p-6">
          <div className="text-center">
            {/* Success icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <IoCheckmarkCircleOutline className="h-8 w-8 text-green-600" />
            </div>
            
            {/* Title and message */}
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Request Sent!
            </h3>
            <p className="text-gray-600 mb-6">
              Your join request for{' '}
              <span className="font-medium">{communityName}</span> has been sent 
              to the community moderators. You'll be notified when it's reviewed.
            </p>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="w-full py-3 px-4 btn-blue-gradient text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRequestModal;