import {
  IoBookmarkOutline,
  IoChatbubbleOutline,
  IoShareOutline,
  IoClose,
} from "react-icons/io5";
import {
  PiHandsPrayingThin,
  PiBookBookmarkLight,
} from "react-icons/pi";
import { BsSend } from "react-icons/bs";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/userSlice";
import { 
  markAsPrayed, 
  unmarkAsPrayed, 
  addComment, 
  addCommentReaction, 
  removeCommentReaction 
} from "../../api/prayer";

const PrayerCard = ({
  prayerId,
  user,
  timeAgo,
  urgency,
  prayerText,
  status,
  communities = ["Church Group", "Prayer Group", "Youth Group"],
  mood = "😊",
  timeline = [
    { user: "Micheal R.", action: "Read", time: "3h ago" },
    { user: "John Ray", action: "Read", time: "3h ago" }
  ],
  comments = [
    { 
      user: "Michael Chen", 
      text: "Praying for your grandmother and your whole family. May God grant her healing and peace.", 
      time: "2 hours ago",
      reactions: { "🙏": 5, "♥️": 3 }
    }
  ],
  tags = [],
  isExpanded = false,
  onToggleExpand,
  onPray,
  onBookmark,
  onComment,
  onShare,
  onMore,
  isPrayed = false,
  prayerCount = 0,
  onPrayedStateChange,
  onCommentsUpdate,
  showStatusPill = false,
}) => {
  const currentUser = useSelector(selectUser);
  const [showComments, setShowComments] = useState(false);
  const [commentReactions, setCommentReactions] = useState({});
  const [newComment, setNewComment] = useState("");
  const [isPrayedState, setIsPrayedState] = useState(isPrayed);
  const [commentsState, setCommentsState] = useState(comments);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingPrayer, setIsSubmittingPrayer] = useState(false);
  const [error, setError] = useState(null);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  
  const handleToggleExpand = () => {
    console.log("PrayerCard toggle clicked for user:", user?.name);
    onToggleExpand();
  };

  // Handle praying for this prayer
  const handlePrayClick = async () => {
    if (!currentUser?._id || isSubmittingPrayer) return;

    setIsSubmittingPrayer(true);
    try {
      if (isPrayedState) {
        await unmarkAsPrayed(prayerId, currentUser._id);
        setIsPrayedState(false);
        if (onPrayedStateChange) onPrayedStateChange(false);
      } else {
        await markAsPrayed(prayerId, currentUser._id);
        setIsPrayedState(true);
        if (onPrayedStateChange) onPrayedStateChange(true);
      }
      if (onPray) onPray();
    } catch (error) {
      console.error("Error toggling prayer state:", error);
      setError("Failed to update prayer status. Please try again.");
      // Reset state on error
      setIsPrayedState(isPrayed);
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsSubmittingPrayer(false);
    }
  };

  // Handle adding a new comment
  const handleAddComment = async () => {
    if (!currentUser?._id || !newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const response = await addComment(prayerId, currentUser._id, newComment.trim());
      
      // Add the new comment to the local state
      const newCommentObj = {
        _id: response.comment?._id || Date.now().toString(),
        user: currentUser.username || "You",
        text: newComment.trim(),
        time: "Just now",
        reactions: {},
        userId: currentUser._id
      };
      
      const updatedComments = [...commentsState, newCommentObj];
      setCommentsState(updatedComments);
      setNewComment("");
      
      if (onCommentsUpdate) onCommentsUpdate(updatedComments);
      if (onComment) onComment();
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Failed to add comment. Please try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle emoji reactions on comments
  const handleEmojiReaction = async (commentIndex, emoji) => {
    if (!currentUser?._id) return;

    const comment = commentsState[commentIndex];
    if (!comment?._id) return;

    try {
      // Check if user already has this reaction
      const currentUserReaction = comment.userReaction;
      
      if (currentUserReaction === emoji) {
        // Remove the reaction if clicking the same emoji
        await removeCommentReaction(prayerId, comment._id, currentUser._id);
        
        // Update local state
        const updatedComments = [...commentsState];
        updatedComments[commentIndex] = {
          ...comment,
          userReaction: null,
          reactions: {
            ...comment.reactions,
            [emoji]: Math.max(0, (comment.reactions[emoji] || 0) - 1)
          }
        };
        setCommentsState(updatedComments);
        if (onCommentsUpdate) onCommentsUpdate(updatedComments);
      } else {
        // Add new reaction (backend will handle removing old one if exists)
        await addCommentReaction(prayerId, comment._id, currentUser._id, emoji);
        
        // Update local state
        const updatedComments = [...commentsState];
        const oldReaction = comment.userReaction;
        
        updatedComments[commentIndex] = {
          ...comment,
          userReaction: emoji,
          reactions: {
            ...comment.reactions,
            // Remove old reaction count
            ...(oldReaction && { [oldReaction]: Math.max(0, (comment.reactions[oldReaction] || 0) - 1) }),
            // Add new reaction count
            [emoji]: (comment.reactions[emoji] || 0) + 1
          }
        };
        setCommentsState(updatedComments);
        if (onCommentsUpdate) onCommentsUpdate(updatedComments);
      }
    } catch (error) {
      console.error("Error handling emoji reaction:", error);
      setError("Failed to update reaction. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const getEmojiCount = (commentIndex, emoji) => {
    const comment = commentsState[commentIndex];
    return comment?.reactions?.[emoji] || 0;
  };

  // Function to get status pill styling
  const getStatusPillStyle = (status) => {
    switch (status) {
      case "Draft":
        return "bg-gray-500 text-white";
      case "Scheduled":
        return "bg-blue-500 text-white";
      case "Submitted":
        return "bg-green-500 text-white";
      case "Answered":
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };


  const getUrgencyMeter = (urgency) => {
    const baseHeights = ['h-3', 'h-4', 'h-5', 'h-6', 'h-7', 'h-8'];
    
    switch (urgency?.toLowerCase()) {
      case "low":
        return {
          bars: [
            { height: 'h-3', color: 'bg-yellow-400', filled: true },
            { height: 'h-4', color: 'bg-yellow-500', filled: true },
            { height: 'h-5', color: 'bg-gray-200', filled: false },
            { height: 'h-6', color: 'bg-gray-200', filled: false },
            { height: 'h-7', color: 'bg-gray-200', filled: false },
            { height: 'h-8', color: 'bg-gray-200', filled: false }
          ]
        };
      case "normal":
      case "medium":
        return {
          bars: [
            { height: 'h-3', color: 'bg-green-400', filled: true },
            { height: 'h-4', color: 'bg-green-500', filled: true },
            { height: 'h-5', color: 'bg-green-500', filled: true },
            { height: 'h-6', color: 'bg-green-600', filled: true },
            { height: 'h-7', color: 'bg-gray-200', filled: false },
            { height: 'h-8', color: 'bg-gray-200', filled: false }
          ]
        };
      case "urgent":
      case "high":
        return {
          bars: [
            { height: 'h-3', color: 'bg-red-400', filled: true },
            { height: 'h-4', color: 'bg-red-500', filled: true },
            { height: 'h-5', color: 'bg-red-500', filled: true },
            { height: 'h-6', color: 'bg-red-600', filled: true },
            { height: 'h-7', color: 'bg-red-600', filled: true },
            { height: 'h-8', color: 'bg-red-700', filled: true }
          ]
        };
      default:
        return {
          bars: [
            { height: 'h-3', color: 'bg-gray-200', filled: false },
            { height: 'h-4', color: 'bg-gray-200', filled: false },
            { height: 'h-5', color: 'bg-gray-200', filled: false },
            { height: 'h-6', color: 'bg-gray-200', filled: false },
            { height: 'h-7', color: 'bg-gray-200', filled: false },
            { height: 'h-8', color: 'bg-gray-200', filled: false }
          ]
        };
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "draft":
        return "bg-gray-500 text-white";
      case "scheduled":
        return "bg-blue-600 text-white";
      case "submitted":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const urgencyMeter = getUrgencyMeter(urgency);

  // Comments Modal Component
  const CommentsModal = () => {
    if (!showCommentsModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              All Comments ({commentsState.length})
            </h3>
            <button
              onClick={() => setShowCommentsModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <IoClose className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Body - Scrollable Comments */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {commentsState.map((comment, index) => (
              <div key={comment._id || index} className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-medium text-sm text-gray-800">{comment.user}</span>
                  <span className="text-xs text-gray-500">{comment.time}</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">{comment.text}</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleEmojiReaction(index, "🙏")}
                      className={`text-lg hover:scale-110 transition-transform ${
                        comment.userReaction === "🙏" ? 'bg-blue-200 rounded-full p-1' : ''
                      }`}
                      disabled={!currentUser?._id}
                    >
                      🙏
                    </button>
                    <span className="text-xs text-gray-500">{getEmojiCount(index, "🙏")}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleEmojiReaction(index, "♥️")}
                      className={`text-lg hover:scale-110 transition-transform ${
                        comment.userReaction === "♥️" ? 'bg-blue-200 rounded-full p-1' : ''
                      }`}
                      disabled={!currentUser?._id}
                    >
                      ♥️
                    </button>
                    <span className="text-xs text-gray-500">{getEmojiCount(index, "♥️")}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleEmojiReaction(index, "😇")}
                      className={`text-lg hover:scale-110 transition-transform ${
                        comment.userReaction === "😇" ? 'bg-blue-200 rounded-full p-1' : ''
                      }`}
                      disabled={!currentUser?._id}
                    >
                      😇
                    </button>
                    <span className="text-xs text-gray-500">{getEmojiCount(index, "😇")}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleEmojiReaction(index, "😢")}
                      className={`text-lg hover:scale-110 transition-transform ${
                        comment.userReaction === "😢" ? 'bg-blue-200 rounded-full p-1' : ''
                      }`}
                      disabled={!currentUser?._id}
                    >
                      😢
                    </button>
                    <span className="text-xs text-gray-500">{getEmojiCount(index, "😢")}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleEmojiReaction(index, "🎉")}
                      className={`text-lg hover:scale-110 transition-transform ${
                        comment.userReaction === "🎉" ? 'bg-blue-200 rounded-full p-1' : ''
                      }`}
                      disabled={!currentUser?._id}
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!currentUser?._id || isSubmittingComment}
              />
              <button 
                onClick={handleAddComment}
                disabled={!currentUser?._id || !newComment.trim() || isSubmittingComment}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingComment ? "..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Comments Modal */}
      <CommentsModal />
      
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-sm border border-blue-200/50 p-4 mb-4 transition-all duration-500 ease-in-out">
        {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Header */}
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <img className="rounded-full" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPnE_fy9lLMRP5DLYLnGN0LRLzZOiEpMrU4g&s" alt="banda" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900">
                {user?.name || "Anonymous"}
              </h3>
              
              {/* Community Pills - Show only in collapsed view */}
              {!isExpanded && (
                <div className="flex items-center space-x-1">
                  <span className="bg-blue-400 text-white px-2 py-1 rounded-full text-xs">
                    {communities[0]}
                  </span>
                  {communities.length > 1 && (
                    <span className="bg-gray-400 text-white px-2 py-1 rounded-full text-xs">
                      +{communities.length - 1} more
                    </span>
                  )}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500">{timeAgo}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Show status pill only when showStatusPill is true */}
            {showStatusPill && status && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusPillStyle(status)}`}>
                {status}
              </span>
            )}
            <svg
              width="18"
              height="25"
              viewBox="0 0 28 38"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M3.03578 11.0538C3.03578 8.12217 4.19093 5.31059 6.24712 3.23759C8.30332 1.1646 11.0921 0 14 0C16.9079 0 19.6967 1.1646 21.7529 3.23759C23.8091 5.31059 24.9642 8.12217 24.9642 11.0538V16.9976L27.8181 22.7519C27.9494 23.0168 28.0115 23.3111 27.9983 23.6069C27.9851 23.9027 27.8971 24.1902 27.7426 24.4421C27.5882 24.694 27.3725 24.9019 27.1159 25.0461C26.8594 25.1903 26.5705 25.2659 26.2768 25.2659H20.0679C19.7195 26.6212 18.9346 27.8214 17.8363 28.6783C16.7381 29.5351 15.3887 30 14 30C12.6113 30 11.2619 29.5351 10.1637 28.6783C9.06543 27.8214 8.28049 26.6212 7.93209 25.2659H1.7232C1.42949 25.2659 1.14063 25.1903 0.884076 25.0461C0.627522 24.9019 0.411786 24.694 0.257358 24.4421C0.102931 24.1902 0.0149391 23.9027 0.00174063 23.6069C-0.0114578 23.3111 0.0505752 23.0168 0.181948 22.7519L3.03578 16.9976V11.0538ZM11.2871 25.2659C11.5621 25.746 11.9575 26.1446 12.4338 26.4218C12.91 26.699 13.4501 26.8449 14 26.8449C14.5499 26.8449 15.09 26.699 15.5662 26.4218C16.0425 26.1446 16.4379 25.746 16.7129 25.2659H11.2871ZM14 3.15824C11.9229 3.15824 9.93094 3.99009 8.46223 5.4708C6.99352 6.95151 6.16841 8.95979 6.16841 11.0538V16.9976C6.16838 17.4877 6.05523 17.971 5.83792 18.4094L4.00533 22.1077H23.9962L22.1636 18.4094C21.9458 17.9711 21.8321 17.4878 21.8316 16.9976V11.0538C21.8316 8.95979 21.0065 6.95151 19.5378 5.4708C18.0691 3.99009 16.0771 3.15824 14 3.15824Z"
                fill="#03045E"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Prayer Text */}
      <div className="mb-4 relative overflow-hidden smooth-height">
        {isExpanded ? (
          <div className="expand-animation transform transition-all duration-500 ease-out">
            {/* Community Pills - Show all in expanded view */}
            <div className="flex flex-wrap gap-2 mb-3">
              {communities.map((community, index) => (
                <span 
                  key={index}
                  className="bg-blue-400 text-white px-3 py-1 rounded-full text-sm"
                >
                  {community}
                </span>
              ))}
            </div>
            
            <p className="text-gray-800 leading-relaxed text-sm mb-4">
              {prayerText}
            </p>
            
            {/* Mood and Urgency Meter in expanded view */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 font-medium">Mood:</span>
                <span className="text-lg">{mood}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 font-medium">{urgency}</span>
                <div className="flex items-end space-x-0.5 h-8">
                  {urgencyMeter.bars.map((bar, index) => (
                    <div
                      key={index}
                      className={`w-2 ${bar.height} ${bar.color} rounded-sm`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Tags Section */}
            {tags && tags.length > 0 && (
              <div className="mb-4">
                <span className="text-sm text-gray-600 font-medium mb-2 block">Tags:</span>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Timeline Section */}
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-800">Recent Updates</h4>
                <button className="text-xs text-blue-600 hover:underline">
                  View full timeline →
                </button>
              </div>
              <div className="space-y-1">
                {timeline.map((update, index) => (
                  <div key={index} className="text-xs text-gray-600">
                    Liked By {update.user} · {update.time}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Comments Section */}
            {showComments && (
              <div className="mb-4 animate-in fade-in duration-300 ease-in-out">
                {commentsState.slice(0, 2).map((comment, index) => (
                  <div key={comment._id || index} className="bg-blue-50 rounded-lg p-3 mb-3">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-sm text-gray-800">{comment.user}</span>
                      <span className="text-xs text-gray-500">{comment.time}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{comment.text}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleEmojiReaction(index, "🙏")}
                          className={`text-lg hover:scale-110 transition-transform ${
                            comment.userReaction === "🙏" ? 'bg-blue-200 rounded-full p-1' : ''
                          }`}
                          disabled={!currentUser?._id}
                        >
                          🙏
                        </button>
                        <span className="text-xs text-gray-500">{getEmojiCount(index, "🙏")}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleEmojiReaction(index, "♥️")}
                          className={`text-lg hover:scale-110 transition-transform ${
                            comment.userReaction === "♥️" ? 'bg-blue-200 rounded-full p-1' : ''
                          }`}
                          disabled={!currentUser?._id}
                        >
                          ♥️
                        </button>
                        <span className="text-xs text-gray-500">{getEmojiCount(index, "♥️")}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleEmojiReaction(index, "😇")}
                          className={`text-lg hover:scale-110 transition-transform ${
                            comment.userReaction === "😇" ? 'bg-blue-200 rounded-full p-1' : ''
                          }`}
                          disabled={!currentUser?._id}
                        >
                          😇
                        </button>
                        <span className="text-xs text-gray-500">{getEmojiCount(index, "😇")}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleEmojiReaction(index, "😢")}
                          className={`text-lg hover:scale-110 transition-transform ${
                            comment.userReaction === "😢" ? 'bg-blue-200 rounded-full p-1' : ''
                          }`}
                          disabled={!currentUser?._id}
                        >
                          😢
                        </button>
                        <span className="text-xs text-gray-500">{getEmojiCount(index, "😢")}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleEmojiReaction(index, "🎉")}
                          className={`text-lg hover:scale-110 transition-transform ${
                            comment.userReaction === "🎉" ? 'bg-blue-200 rounded-full p-1' : ''
                          }`}
                          disabled={!currentUser?._id}
                        >
                          🎉
                        </button>
                        <span className="text-xs text-gray-500">{getEmojiCount(index, "🎉")}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {commentsState.length > 2 && (
                  <button 
                    onClick={() => setShowCommentsModal(true)}
                    className="text-sm text-blue-600 hover:underline mb-3"
                  >
                    View {commentsState.length - 2} more comments
                  </button>
                )}
                
                {/* Add comment input */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    placeholder="Add a prayer or encouragement..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!currentUser?._id || isSubmittingComment}
                  />
                  <button 
                    onClick={handleAddComment}
                    disabled={!currentUser?._id || !newComment.trim() || isSubmittingComment}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingComment ? "..." : "Post"}
                  </button>
                </div>
              </div>
            )}
            
            <button 
              onClick={handleToggleExpand}
              className="text-[#03045E] text-sm font-medium hover:underline transition-all duration-300 hover:text-blue-600"
            >
              Show less
            </button>
          </div>
        ) : (
          <div className="transition-all duration-300 ease-in-out transform smooth-height">
            <p className="text-gray-800 leading-relaxed text-sm line-clamp-2 overflow-hidden pr-20 transition-all duration-500 ease-in-out">
              {prayerText}
            </p>
            <button 
              onClick={handleToggleExpand}
              className="absolute bottom-0 right-0 text-[#03045E] text-sm font-medium hover:underline bg-gradient-to-l from-blue-100 to-transparent pl-4 transition-all duration-300 hover:text-blue-600"
            >
              Read more
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {isExpanded && (
      <div className="flex items-center justify-between pt-3 border-t border-blue-200/50">
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePrayClick}
            disabled={!currentUser?._id || isSubmittingPrayer}
            className={`flex items-center space-x-1 transition-all duration-200 ${
              isPrayedState 
                ? 'text-white bg-blue-600 px-3 py-2 rounded-full shadow-sm hover:bg-blue-700' 
                : 'text-gray-600 hover:text-blue-600 px-2 py-1'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <PiHandsPrayingThin className="w-5 h-5" />
            {prayerCount > 0 && (
              <span className="text-xs font-medium">
                {isPrayedState ? `${prayerCount} Prayed` : prayerCount}
              </span>
            )}
            {isPrayedState && prayerCount === 0 && <span className="text-xs">Prayed</span>}
          </button>

          <button
            onClick={onBookmark}
            className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <PiBookBookmarkLight className="w-5 h-5" />
          </button>

          <button
            onClick={onBookmark}
            className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <IoBookmarkOutline className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <IoChatbubbleOutline className="w-5 h-5" />
            {commentsState.length > 0 && (
              <span className="text-xs">{commentsState.length}</span>
            )}
          </button>

          <button
            onClick={onShare}
            className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <BsSend className="w-5 h-5" />
          </button>
        </div>
      </div>
      )}
    </div>
    </>
  );
};

export default PrayerCard;
