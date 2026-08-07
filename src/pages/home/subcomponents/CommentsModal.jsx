import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { IoClose } from "react-icons/io5";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/userSlice";

const CommentsModal = ({
  showCommentsModal,
  setShowCommentsModal,
  commentsState,
  newComment,
  setNewComment,
  handleAddComment,
  handleEmojiReaction,
  getEmojiCount,
  isSubmittingComment
}) => {
  const currentUser = useSelector(selectUser);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showCommentsModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showCommentsModal]);

  if (!showCommentsModal) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-md transition-all duration-300 animate-in fade-in ease-out flex items-center justify-center modal-portal p-4 "
      onClick={() => setShowCommentsModal(false)}
      style={{ zIndex: 9999 }}
    >
      <div 
        className="bg-white rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] transform transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4 ease-out w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            All Comments ({commentsState.length})
          </h3>
          <button
            onClick={() => setShowCommentsModal(false)}
            className="text-gray-400 hover:text-gray-600 cursor-pointer hover:rotate-90 hover:shadow-sm active:scale-90 transition-all duration-300"
          >
            <IoClose className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body - Scrollable Comments */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {commentsState.map((comment, index) => (
            <div key={comment._id || index} className={`bg-blue-50 rounded-lg p-4 ${
              comment.isOptimistic ? 'opacity-70' : ''
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm text-gray-800">{comment.user}</span>
                  {comment.isOptimistic && (
                    <div className="animate-pulse">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500">{comment.time}</span>
              </div>
              <p className="text-sm text-gray-700 mb-3">{comment.text}</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => handleEmojiReaction(index, "🙏")}
                    className={`text-lg cursor-pointer hover:scale-110 transition-transform ${
                      comment.userReaction === "🙏" ? 'bg-blue-200 rounded-full p-1' : ''
                    } ${comment.isOptimistic ? 'pointer-events-none opacity-50' : ''}`}
                    disabled={!currentUser?._id || comment.isOptimistic}
                  >
                    🙏
                  </button>
                  <span className="text-xs text-gray-500">{getEmojiCount(index, "🙏")}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => handleEmojiReaction(index, "♥️")}
                    className={`text-lg cursor-pointer hover:scale-110 transition-transform ${
                      comment.userReaction === "♥️" ? 'bg-blue-200 rounded-full p-1' : ''
                    } ${comment.isOptimistic ? 'pointer-events-none opacity-50' : ''}`}
                    disabled={!currentUser?._id || comment.isOptimistic}
                  >
                    ♥️
                  </button>
                  <span className="text-xs text-gray-500">{getEmojiCount(index, "♥️")}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => handleEmojiReaction(index, "😇")}
                    className={`text-lg cursor-pointer hover:scale-110 transition-transform ${
                      comment.userReaction === "😇" ? 'bg-blue-200 rounded-full p-1' : ''
                    } ${comment.isOptimistic ? 'pointer-events-none opacity-50' : ''}`}
                    disabled={!currentUser?._id || comment.isOptimistic}
                  >
                    😇
                  </button>
                  <span className="text-xs text-gray-500">{getEmojiCount(index, "😇")}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => handleEmojiReaction(index, "😢")}
                    className={`text-lg cursor-pointer hover:scale-110 transition-transform ${
                      comment.userReaction === "😢" ? 'bg-blue-200 rounded-full p-1' : ''
                    } ${comment.isOptimistic ? 'pointer-events-none opacity-50' : ''}`}
                    disabled={!currentUser?._id || comment.isOptimistic}
                  >
                    😢
                  </button>
                  <span className="text-xs text-gray-500">{getEmojiCount(index, "😢")}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => handleEmojiReaction(index, "🎉")}
                    className={`text-lg cursor-pointer hover:scale-110 transition-transform ${
                      comment.userReaction === "🎉" ? 'bg-blue-200 rounded-full p-1' : ''
                    } ${comment.isOptimistic ? 'pointer-events-none opacity-50' : ''}`}
                    disabled={!currentUser?._id || comment.isOptimistic}
                  >
                    🎉
                  </button>
                  <span className="text-xs text-gray-500">{getEmojiCount(index, "🎉")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer - Add Comment */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              placeholder="Add a prayer or encouragement..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none bg-white/70 backdrop-blur-sm shadow-inner focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300"
              disabled={!currentUser?._id || isSubmittingComment}
            />
            <button 
              onClick={handleAddComment}
              disabled={!currentUser?._id || !newComment.trim() || isSubmittingComment}
              className="bg-blue-600 text-white px-4 py-2 cursor-pointer rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {isSubmittingComment ? "..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default CommentsModal;