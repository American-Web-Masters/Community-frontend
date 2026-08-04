import React, { useState, useRef, useEffect } from 'react';
import { BsThreeDots } from 'react-icons/bs';
import { TbPin, TbPinFilled } from 'react-icons/tb';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const ProfilePrayerMenu = ({
  prayer,
  onTogglePin,
  onToggleVisibility,
  onEdit,
  onDelete,
  onToggleAnswered,
  isPinned: isPinnedProp = false,
  isPrivate: isPrivateProp = false,
  isAnswered: isAnsweredProp = false,
  isPinLoading = false,
  isVisibilityLoading = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Single source of truth: parent drives the state via props.
  const isPinned = !!isPinnedProp;
  const isPublic = !isPrivateProp;
  const isAnswered = !!isAnsweredProp;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target) &&
        buttonRef.current && !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleTogglePin = () => {
    if (isPinLoading) return;
    const newPinState = !isPinned;
    setIsOpen(false);
    if (onTogglePin) {
      onTogglePin(prayer._id, newPinState);
    }
  };

  const handleToggleVisibility = () => {
    if (isVisibilityLoading) return;
    const newIsPublic = !isPublic;
    setIsOpen(false);
    if (onToggleVisibility) {
      onToggleVisibility(prayer._id, newIsPublic);
    }
  };

  const handleToggleAnswered = () => {
    setIsOpen(false);
    if (onToggleAnswered) {
      onToggleAnswered(prayer._id, !isAnswered);
    }
  };

  const handleEdit = () => {
    setIsOpen(false);
    if (onEdit) onEdit(prayer);
  };

  const handleDelete = () => {
    setIsOpen(false);
    if (onDelete) onDelete(prayer);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Three Dots Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none cursor-pointer"
        title="Post options"
      >
        <BsThreeDots className="w-5 h-5 text-gray-500" />
      </button>

      {/* Popup Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[160px]"
        >
          {/* Pin/Unpin Option */}
          {onTogglePin && (
            <button
              onClick={handleTogglePin}
              disabled={isPinLoading}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPinLoading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : isPinned ? (
                <>
                  <TbPinFilled className="w-4 h-4 text-blue-600 cursor-pointer" />
                  <span>Unpin Post</span>
                </>
              ) : (
                <>
                  <TbPin className="w-4 h-4 cursor-pointer" />
                  <span>Pin Post</span>
                </>
              )}
            </button>
          )}

          {/* Public/Private Option */}
          {onToggleVisibility && (
            <button
              onClick={handleToggleVisibility}
              disabled={isVisibilityLoading}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isVisibilityLoading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : isPublic ? (
                <>
                  <IoEyeOffOutline className="w-4 h-4 cursor-pointer" />
                  <span>Make Private</span>
                </>
              ) : (
                <>
                  <IoEyeOutline className="w-4 h-4 cursor-pointer" />
                  <span>Make Public</span>
                </>
              )}
            </button>
          )}

          {/* Mark as Answered Option */}
          {onToggleAnswered && (
            <button
              onClick={handleToggleAnswered}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
            >
              <div className="flex items-center justify-center w-4 h-4">
                <span className="text-sm">🙏</span>
              </div>
              <span>{isAnswered ? "Unmark Answered" : "Mark as Answered"}</span>
            </button>
          )}

          {/* Divider */}
          {(onTogglePin || onToggleVisibility || onToggleAnswered) && (onEdit || onDelete) && (
            <div className="border-t border-gray-100 my-1" />
          )}

          {/* Edit Option */}
          {onEdit && (
            <button
              onClick={handleEdit}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
            >
              <FiEdit2 className="w-4 h-4 text-blue-500 cursor-pointer" />
              <span>Edit Post</span>
            </button>
          )}

          {/* Delete Option */}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
            >
              <FiTrash2 className="w-4 h-4 cursor-pointer" />
              <span>Delete Post</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePrayerMenu;
