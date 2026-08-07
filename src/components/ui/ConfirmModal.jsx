import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  confirmColor = "bg-red-600 hover:bg-red-700 text-white",
  iconColor = "text-red-600 bg-red-100"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md transition-all duration-300 animate-in fade-in ease-out flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] transform transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4 ease-out border border-gray-100">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none hover:rotate-90 hover:shadow-sm active:scale-90 transition-all duration-300"
            >
              <span className="sr-only">Close</span>
              ×
            </button>
          </div>
          
          <div className="mb-6 flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconColor}`}>
              <FaExclamationTriangle className="w-5 h-5" />
            </div>
            <div className="mt-1">
              <p className="text-gray-600 leading-relaxed text-sm">
                {message}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3 justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-300 font-medium text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-5 py-2 rounded-lg font-medium text-sm flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 ${confirmColor}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
