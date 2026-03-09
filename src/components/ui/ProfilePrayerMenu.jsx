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
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // Keep local mirror of pin/visibility so the menu reflects current state immediately
  const [isPinned, setIsPinned] = useState(prayer?.isUserPinned || prayer?.isPinned || false);
  const [isPublic, setIsPublic] = useState(prayer?.isPrivate !== true); // isPrivate=true → private
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Sync local state when the prayer prop changes (e.g. after a refresh)
  useEffect(() => {
    setIsPinned(prayer?.isUserPinned || prayer?.isPinned || false);
    setIsPublic(prayer?.isPrivate !== true);
  }, [prayer?.isUserPinned, prayer?.isPinned, prayer?.isPrivate]);

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
    const newPinState = !isPinned;
    setIsPinned(newPinState);   // optimistic local update
    setIsOpen(false);
    if (onTogglePin) {
      onTogglePin(prayer._id, newPinState);
    }
  };

  const handleToggleVisibility = () => {
    const newIsPublic = !isPublic;
    setIsPublic(newIsPublic);   // optimistic local update
    setIsOpen(false);
    // pass newVisibilityState = newIsPublic (true → make public, false → make private)
    if (onToggleVisibility) {
      onToggleVisibility(prayer._id, newIsPublic);
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
        className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none"
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
          <button
            onClick={handleTogglePin}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
          >
            {isPinned ? (
              <>
                <TbPinFilled className="w-4 h-4 text-blue-600" />
                <span>Unpin Post</span>
              </>
            ) : (
              <>
                <TbPin className="w-4 h-4" />
                <span>Pin Post</span>
              </>
            )}
          </button>

          {/* Public/Private Option */}
          <button
            onClick={handleToggleVisibility}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
          >
            {isPublic ? (
              <>
                <IoEyeOffOutline className="w-4 h-4" />
                <span>Make Private</span>
              </>
            ) : (
              <>
                <IoEyeOutline className="w-4 h-4" />
                <span>Make Public</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="border-t border-gray-100 my-1" />

          {/* Edit Option */}
          <button
            onClick={handleEdit}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
          >
            <FiEdit2 className="w-4 h-4 text-blue-500" />
            <span>Edit Post</span>
          </button>

          {/* Delete Option */}
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-2"
          >
            <FiTrash2 className="w-4 h-4" />
            <span>Delete Post</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePrayerMenu;
