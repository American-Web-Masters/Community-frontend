import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaFacebook, FaWhatsapp, FaTwitter, FaLink, FaRegUserCircle } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import toast from 'react-hot-toast';

const ShareModal = ({ 
  isOpen, 
  onClose, 
  shareUrl, 
  prayerUrl, // backward compatibility
  onShareToProfile, 
  isShared,
  title = "Share",
  shareText = "Check this out: "
}) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const finalUrl = shareUrl || prayerUrl;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(finalUrl);
    setIsCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(finalUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const handleWhatsappShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + finalUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(finalUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 mx-4 relative shadow-xl transform transition-all">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors cursor-pointer"
        >
          <IoClose className="w-6 h-6" />
        </button>

        <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">{title}</h3>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <button 
            onClick={handleFacebookShare}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200 shadow-sm">
              <FaFacebook className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-gray-600">Facebook</span>
          </button>

          <button 
            onClick={handleWhatsappShare}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all duration-200 shadow-sm">
              <FaWhatsapp className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-gray-600">WhatsApp</span>
          </button>

          <button 
            onClick={handleTwitterShare}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-12 h-12 bg-sky-50 rounded-full flex items-center justify-center text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-all duration-200 shadow-sm">
              <FaTwitter className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-gray-600">X (Twitter)</span>
          </button>

          <button 
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 group-hover:bg-gray-600 group-hover:text-white transition-all duration-200 shadow-sm">
              <FaLink className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-gray-600">{isCopied ? "Copied" : "Copy Link"}</span>
          </button>
        </div>

        {onShareToProfile && (
          <div className="border-t border-gray-100 pt-4">
            <button 
              onClick={() => {
                if (isShared) return;
                if(onShareToProfile) onShareToProfile();
                onClose();
              }}
              disabled={isShared}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors duration-200 cursor-pointer ${
                isShared
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
              }`}
            >
              <FaRegUserCircle className="w-5 h-5" />
              {isShared ? "Already Shared to Profile" : "Share to Profile"}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ShareModal;
