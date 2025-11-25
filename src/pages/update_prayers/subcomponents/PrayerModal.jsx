import React from 'react';
import { IoClose } from 'react-icons/io5';
import { getTimeAgo, getUrgencyColor } from '../../../utils/prayerUtils';

const PrayerModal = ({ prayer, isOpen, onClose }) => {
  if (!isOpen || !prayer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Prayer Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IoClose size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {prayer.anonymous ? 'A' : (prayer.user?.firstname?.[0] || 'U')}
                </span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {prayer.anonymous ? 'Anonymous' : prayer.user?.firstname || 'User'}
                </h3>
                <p className="text-sm text-gray-500">
                  {getTimeAgo(prayer.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{prayer.moodEmoji || '😐'}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getUrgencyColor(prayer.urgency)}`}>
                {prayer.urgency}
              </span>
            </div>
          </div>

          {/* Prayer Content */}
          <div className="mb-6">
            <p className="text-gray-800 leading-relaxed">
              {prayer.content}
            </p>
          </div>

          {/* Tags */}
          {prayer.tags && prayer.tags.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {prayer.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center space-x-6 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {prayer.isPrayed?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Prayers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {prayer.comments?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Comments</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {prayer.shares?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Shares</div>
            </div>
          </div>

          {/* Comments */}
          {prayer.comments && prayer.comments.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Comments</h4>
              <div className="space-y-3">
                {prayer.comments.map((comment) => (
                  <div key={comment._id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-gray-900">
                        {comment.user?.firstname || 'User'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.commentText}</p>
                    {comment.reactions && comment.reactions.length > 0 && (
                      <div className="flex items-center space-x-2 mt-2">
                        {comment.reactions.map((reaction, index) => (
                          <span key={index} className="text-xs bg-white px-2 py-1 rounded-full">
                            {reaction.emoji}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrayerModal;
