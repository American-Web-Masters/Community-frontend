import React from 'react';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';

const JoinRequestModal = ({
  isOpen,
  onClose,
  communityName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all duration-300 animate-in fade-in ease-out">
      <div className="bg-white rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] transform transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4 ease-out w-full max-w-md">
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
              className="w-full py-3 px-4 btn-blue-gradient cursor-pointer text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
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