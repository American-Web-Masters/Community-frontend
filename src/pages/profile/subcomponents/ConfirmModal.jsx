import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel'
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm?.();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-[3px] bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-lg">
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
              <FaExclamationTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">×</button>
              </div>
              {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}

              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 cursor-pointer"
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
