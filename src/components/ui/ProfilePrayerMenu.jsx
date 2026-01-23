import React, { useState, useRef, useEffect } from 'react';
import { BsThreeDots } from 'react-icons/bs';
import { TbPin, TbPinFilled } from 'react-icons/tb';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';

const ProfilePrayerMenu = ({ 
  prayer, 
  onTogglePin, 
  onToggleVisibility, 
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(prayer?.isPinned || false);
  const [isPublic, setIsPublic] = useState(prayer?.isPublic !== false); // Default to true
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleTogglePin = async () => {
    const newPinState = !isPinned;
    setIsPinned(newPinState);
    setIsOpen(false);
    
    // Call the parent handler
    if (onTogglePin) {
      onTogglePin(prayer._id, newPinState);
    }
  };

  const handleToggleVisibility = async () => {
    const newVisibilityState = !isPublic;
    setIsPublic(newVisibilityState);
    setIsOpen(false);
    
    // Call the parent handler
    if (onToggleVisibility) {
      onToggleVisibility(prayer._id, newVisibilityState);
    }
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
        </div>
      )}
    </div>
  );
};

export default ProfilePrayerMenu;
