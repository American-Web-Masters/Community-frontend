import {
  IoBookmarkOutline,
  IoChatbubbleOutline,
  IoShareOutline,
} from "react-icons/io5";
import { BsThreeDots } from "react-icons/bs";
import { TbPin, TbPinFilled } from "react-icons/tb";
import {
  PiHandsPrayingThin,
  PiBookBookmarkLight,
} from "react-icons/pi";
import { BsSend } from "react-icons/bs";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/userSlice";
import {CommentsModal, TimelineModal} from "../../pages/home/subcomponents";
import {
  markAsPrayed, 
  unmarkAsPrayed, 
  addComment, 
  addCommentReaction, 
  removeCommentReaction,
  sharePrayer,
  bookmarkPrayer,
  unbookmarkPrayer,
  isBookmarkedByUser,
  isSharedByUser,
} from "../../api/prayer";
import { togglePrayerPin } from "../../api/communities";
import { getUrgencyMeter, getTimelineUserName, getStatusPillStyle, getTimelineActivityText, getTimelineActivityIcon, formatTimelineTime } from "../../utils/prayerUtils";

const PrayerCard = ({
  prayer, // Full prayer object with bookmarks array
  prayerId,
  user,
  timeAgo,
  urgency,
  prayerText,
  status,
  communities = ["Church Group", "Prayer Group", "Youth Group"],
  mood = "😊",
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
  isCommunityPrayer = false,
  isOwnerOrModerator = false,
  isPrayed = false,
  prayerCount = 0,
  isShared = false,
  shareCount = 0,
  onPrayedStateChange,
  onSharedStateChange,
  onCommentsUpdate,
  onBookmarkStateChange, // New callback for bookmark state changes
  showStatusPill = false,
  onPublishDraft = null, // New callback for publishing draft prayers
  isDraft = false, // Flag to show if this is a draft prayer
  isPinned = false, // Flag to show if prayer is pinned
  communityId = null, // Community ID for pin/unpin functionality
  onPinStateChange = null, // Callback for pin state changes
  feedItemId = null, // Feed item ID for pin/unpin functionality
}) => {
  const currentUser = useSelector(selectUser);
  const [showComments, setShowComments] = useState(false);
  const [commentReactions, setCommentReactions] = useState({});
  const [newComment, setNewComment] = useState("");
  const [isPrayedState, setIsPrayedState] = useState(isPrayed);
  const [isSharedState, setIsSharedState] = useState(() => 
    prayer ? isSharedByUser(prayer, currentUser?._id) : isShared
  );
  const [commentsState, setCommentsState] = useState(comments);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingPrayer, setIsSubmittingPrayer] = useState(false);
  const [isSubmittingShare, setIsSubmittingShare] = useState(false);
  const [isSubmittingBookmark, setIsSubmittingBookmark] = useState(false);
  const [isSubmittingPin, setIsSubmittingPin] = useState(false);
  const [isPinnedState, setIsPinnedState] = useState(isPinned);
  const [error, setError] = useState(null);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [isBookmarkedState, setIsBookmarkedState] = useState(() => 
    prayer ? isBookmarkedByUser(prayer, currentUser?._id) : false
  );
  
  // Extract timeline from prayer object and sort by date (recent first)
  const timelineData = (prayer?.timeline || []).sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateB - dateA; // Descending order (most recent first)
  });
  
  const handleToggleExpand = () => {
    console.log("PrayerCard toggle clicked for user:", user?.name);
    onToggleExpand();
  };

  // Handle praying for this prayer with optimistic update
  const handlePrayClick = async () => {
    if (!currentUser?._id || isSubmittingPrayer) return;

    // Optimistic UI update
    const previousState = isPrayedState;
    const newState = !previousState;
    setIsPrayedState(newState);
    if (onPrayedStateChange) onPrayedStateChange(newState);
    if (onPray) onPray();

    setIsSubmittingPrayer(true);
    try {
      if (previousState) {
        await unmarkAsPrayed(prayerId, currentUser._id);
      } else {
        await markAsPrayed(prayerId, currentUser._id);
      }
    } catch (error) {
      console.error("Error toggling prayer state:", error);
      // Revert optimistic update on error
      setIsPrayedState(previousState);
      if (onPrayedStateChange) onPrayedStateChange(previousState);
      setError("Failed to update prayer status. Please try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsSubmittingPrayer(false);
    }
  };

  // Handle sharing this prayer with optimistic update
  const handleShareClick = async () => {
    if (!currentUser?._id || isSubmittingShare) return;

    // Optimistic UI update
    const previousState = isSharedState;
    const newState = !previousState;
    setIsSharedState(newState);
    if (onSharedStateChange) onSharedStateChange(newState);
    if (onShare) onShare();

    setIsSubmittingShare(true);
    try {
      await sharePrayer(prayerId, currentUser._id);
    } catch (error) {
      console.error("Error toggling share state:", error);
      // Revert optimistic update on error
      setIsSharedState(previousState);
      if (onSharedStateChange) onSharedStateChange(previousState);
      setError("Failed to update share status. Please try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsSubmittingShare(false);
    }
  };

  // Handle bookmark toggle with optimistic update
  const handleBookmarkClick = async () => {
    if (!currentUser?._id || isSubmittingBookmark) return;

    // Optimistic UI update
    const previousState = isBookmarkedState;
    const newState = !previousState;
    setIsBookmarkedState(newState);
    if (onBookmarkStateChange) onBookmarkStateChange(newState);
    if (onBookmark) onBookmark();

    setIsSubmittingBookmark(true);
    try {
      if (previousState) {
        await bookmarkPrayer(prayerId, currentUser._id);
      } else {
        await bookmarkPrayer(prayerId, currentUser._id);
      }
    } catch (error) {
      console.error("Error toggling bookmark state:", error);
      // Revert optimistic update on error
      setIsBookmarkedState(previousState);
      if (onBookmarkStateChange) onBookmarkStateChange(previousState);
      setError("Failed to update bookmark status. Please try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsSubmittingBookmark(false);
    }
  };

  // Handle pin/unpin toggle with optimistic update
  const handleTogglePin = async () => {
    if (!currentUser?._id || !communityId || isSubmittingPin) return;

    // Use feedItemId for community pin operations, fallback to prayerId if not available
    const idToUse = feedItemId || prayer?.feedItemId || prayerId;


    // Optimistic UI update
    const previousState = isPinnedState;
    const newState = !previousState;
    setIsPinnedState(newState);
    if (onPinStateChange) onPinStateChange(newState);

    setIsSubmittingPin(true);
    try {
      await togglePrayerPin(communityId, idToUse);
      console.log('Pin/Unpin success');
    } catch (error) {
      console.error("Error toggling pin state:", error);
      console.error("Error details:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message
      });
      
      // Revert optimistic update on error
      setIsPinnedState(previousState);
      if (onPinStateChange) onPinStateChange(previousState);
      setError(error?.response?.data?.message || "Failed to update pin status. Please try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsSubmittingPin(false);
    }
  };

  // Handle adding a new comment with optimistic update
  const handleAddComment = async () => {
    if (!currentUser?._id || !newComment.trim() || isSubmittingComment) return;

    // Optimistic UI update
    const commentText = newComment.trim();
    const tempCommentId = `temp-${Date.now()}`;
    const newCommentObj = {
      _id: tempCommentId,
      user: currentUser.username || "You",
      text: commentText,
      time: "Just now",
      reactions: {},
      userId: currentUser._id,
      isOptimistic: true
    };
    
    const previousComments = [...commentsState];
    const updatedComments = [...commentsState, newCommentObj];
    setCommentsState(updatedComments);
    setNewComment("");
    if (onCommentsUpdate) onCommentsUpdate(updatedComments);
    if (onComment) onComment();

    setIsSubmittingComment(true);
    try {
      const response = await addComment(prayerId, currentUser._id, commentText);
      
      // Replace optimistic comment with real comment
      const finalComments = updatedComments.map(comment => 
        comment._id === tempCommentId 
          ? {
              ...comment,
              _id: response.comment?._id || comment._id,
              isOptimistic: false
            }
          : comment
      );
      setCommentsState(finalComments);
      if (onCommentsUpdate) onCommentsUpdate(finalComments);
    } catch (error) {
      console.error("Error adding comment:", error);
      // Revert optimistic update on error
      setCommentsState(previousComments);
      setNewComment(commentText); // Restore the comment text
      if (onCommentsUpdate) onCommentsUpdate(previousComments);
      setError("Failed to add comment. Please try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle emoji reactions on comments with optimistic update
  const handleEmojiReaction = async (commentIndex, emoji) => {
    if (!currentUser?._id) return;

    const comment = commentsState[commentIndex];
    if (!comment?._id || comment.isOptimistic) return;

    // Optimistic UI update
    const currentUserReaction = comment.userReaction;
    const previousComments = [...commentsState];
    
    let newUserReaction;
    let newReactions = { ...comment.reactions };
    
    if (currentUserReaction === emoji) {
      // Remove the reaction
      newUserReaction = null;
      newReactions[emoji] = Math.max(0, (newReactions[emoji] || 0) - 1);
    } else {
      // Add new reaction (and remove old one if exists)
      newUserReaction = emoji;
      if (currentUserReaction) {
        newReactions[currentUserReaction] = Math.max(0, (newReactions[currentUserReaction] || 0) - 1);
      }
      newReactions[emoji] = (newReactions[emoji] || 0) + 1;
    }
    
    const updatedComments = [...commentsState];
    updatedComments[commentIndex] = {
      ...comment,
      userReaction: newUserReaction,
      reactions: newReactions
    };
    setCommentsState(updatedComments);
    if (onCommentsUpdate) onCommentsUpdate(updatedComments);

    try {
      if (currentUserReaction === emoji) {
        // Remove the reaction
        await removeCommentReaction(prayerId, comment._id, currentUser._id);
      } else {
        // Add new reaction (backend will handle removing old one if exists)
        await addCommentReaction(prayerId, comment._id, currentUser._id, emoji);
      }
    } catch (error) {
      console.error("Error handling emoji reaction:", error);
      // Revert optimistic update on error
      setCommentsState(previousComments);
      if (onCommentsUpdate) onCommentsUpdate(previousComments);
      setError("Failed to update reaction. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const getEmojiCount = (commentIndex, emoji) => {
    const comment = commentsState[commentIndex];
    return comment?.reactions?.[emoji] || 0;
  };

  // Handle publishing a draft prayer
  const handlePublishDraft = () => {
    if (onPublishDraft && isDraft && prayer) {
      onPublishDraft(prayer);
    }
  };

  const urgencyMeter = getUrgencyMeter(urgency);

  return (
    <>
      {/* Comments Modal */}
      <CommentsModal 
        showCommentsModal={showCommentsModal}
        setShowCommentsModal={setShowCommentsModal}
        commentsState={commentsState}
        newComment={newComment}
        setNewComment={setNewComment}
        handleAddComment={handleAddComment}
        handleEmojiReaction={handleEmojiReaction}
        getEmojiCount={getEmojiCount}
        isSubmittingComment={isSubmittingComment}
      />
      
      {/* Timeline Modal */}
      <TimelineModal 
        showTimelineModal={showTimelineModal}
        setShowTimelineModal={setShowTimelineModal}
        timelineData={timelineData}
      />
      
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-sm border border-blue-200/50 p-4 mb-4 transition-all duration-500 ease-in-out relative">
        {/* Publish Draft Button - positioned absolutely */}
        {isDraft && onPublishDraft && (
          <button
            onClick={handlePublishDraft}
            className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-2xl cursor-pointer text-xs font-medium transition-colors duration-200 shadow-lg hover:shadow-xl z-10"
          >
            Publish
          </button>
        )}
        
        {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
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
                  {communities[0] &&(
                    <span className="bg-blue-400 text-white px-2 py-1 rounded-full text-xs">
                    {communities[0]?.name?.length > 8 ? communities[0]?.name?.slice(0,7) + "..." : communities[0]?.name}
                  </span>
                  )}
                  {communities[1] && (
                  <span className="bg-blue-400 text-white px-2 py-1 rounded-full text-xs">
                    {communities[1]?.name?.length > 8 ? communities[1]?.name?.slice(0,7) + "..." : communities[1]?.name}
                  </span>
                  )}
                  {communities.length > 2 && (
                    <span className="bg-gray-400 text-white px-2 py-1 rounded-full text-xs">
                      +{communities.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4 mt-2">
            <span className="text-sm text-gray-500">{timeAgo}</span>
            {showStatusPill && status && (
              <span className={`px-1 py-1 rounded-full md:hidden text-xs ${getStatusPillStyle(status)}`}>
                {status}
              </span>
            )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Show status pill only when showStatusPill is true */}
            {showStatusPill && status && (
              <span className={`px-1 py-1 rounded-full hidden md:block text-xs relative -top-1 ${getStatusPillStyle(status)}`}>
                {status}
              </span>
            )}
            {(isCommunityPrayer && isOwnerOrModerator) ? (
              <button
                onClick={handleTogglePin}
                disabled={isSubmittingPin}
                className={`p-2 rounded-full transition-colors duration-200 focus:outline-none ${
                  isPinnedState 
                    ? 'text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                } ${isSubmittingPin ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isPinnedState ? 'Unpin this prayer' : 'Pin this prayer'}
              >
                {isPinnedState ? (
                  <TbPinFilled className="w-5 h-5 cursor-pointer" />
                ) : (
                  <TbPin className="w-5 h-5 cursor-pointer" />
                )}
              </button>
            ) : (
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
            )}
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
                  {community?.name}
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
                {timelineData.length > 2 && (
                  <button 
                    onClick={() => setShowTimelineModal(true)}
                    className="text-xs cursor-pointer text-blue-600 hover:underline"
                  >
                    View full timeline →
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {timelineData.length === 0 ? (
                  <div className="text-xs text-gray-500">No recent activity</div>
                ) : (
                  timelineData.slice(0, 2).map((activity, index) => (
                    <div key={activity._id || index} className="flex items-start space-x-2">
                      <span className="text-sm">{getTimelineActivityIcon(activity.activityType)}</span>
                      <div className="flex-1 text-xs text-gray-600">
                        <span className="font-medium">
                          {getTimelineUserName(activity, currentUser)}
                        </span>{' '}
                        {getTimelineActivityText(activity.activityType, activity.activityData)}
                        <span className="text-gray-400 ml-1">
                          · {formatTimelineTime(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                {timelineData.length > 2 && (
                  <button 
                    onClick={() => setShowTimelineModal(true)}
                    className="text-xs cursor-pointer text-blue-600 hover:underline mt-1"
                  >
                    View {timelineData.length - 2} more activities
                  </button>
                )}
              </div>
            </div>
            

            
            <button 
              onClick={handleToggleExpand}
              className="text-[#03045E] cursor-pointer text-sm font-medium hover:underline transition-all duration-300 hover:text-blue-600"
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
              className="absolute bottom-0 cursor-pointer right-0 text-[#03045E] text-sm font-medium hover:underline bg-gradient-to-l from-blue-100 to-transparent pl-4 transition-all duration-300 hover:text-blue-600"
            >
              Read more
            </button>
          </div>
        )}
      </div>

      {/* Comments Section - Available in both collapsed and expanded views */}
      {showComments && (
        <div className="mb-4 animate-in fade-in duration-300 ease-in-out">
          {commentsState.slice(0, 2).map((comment, index) => (
            <div key={comment._id || index} className={`bg-blue-50 rounded-lg p-3 mb-3 ${
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
                    } ${comment.isOptimistic ? 'pointer-events-none' : ''}`}
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
                    } ${comment.isOptimistic ? 'pointer-events-none' : ''}`}
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
                    } ${comment.isOptimistic ? 'pointer-events-none' : ''}`}
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
                    } ${comment.isOptimistic ? 'pointer-events-none' : ''}`}
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
                    } ${comment.isOptimistic ? 'pointer-events-none' : ''}`}
                    disabled={!currentUser?._id || comment.isOptimistic}
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

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-blue-200/50">
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePrayClick}
            disabled={!currentUser?._id || isSubmittingPrayer}
            className={`flex cursor-pointer items-center space-x-1 transition-all duration-200 ${
              isPrayedState 
                ? 'text-blue-600 bg-blue-50 px-2 py-1 rounded-full' 
                : 'text-gray-600 hover:text-blue-500 px-2 py-1'
            } disabled:opacity-50 disabled:cursor-not-allowed ${
              isSubmittingPrayer ? 'animate-pulse' : ''
            }`}
          >
            <PiHandsPrayingThin className={`w-5 h-5 cursor-pointer ${
              isSubmittingPrayer ? 'animate-pulse' : ''
            }`} />
            {prayerCount > 0 && (
              <span className="text-xs font-medium transition-all duration-200 ease-in-out">
                {isPrayedState ? `${prayerCount}` : prayerCount}
              </span>
            )}
            {isPrayedState && prayerCount === 0 && <span className="text-xs">Prayed</span>}
          </button>

          <button
            onClick={handleBookmarkClick}
            disabled={!currentUser?._id || isSubmittingBookmark}
            className={`flex items-center cursor-pointer space-x-1 transition-all duration-200 ${
              isBookmarkedState 
                ? 'text-blue-600 bg-blue-50 px-2 py-1 rounded-full' 
                : 'text-gray-600 hover:text-blue-600'
            } disabled:opacity-50 disabled:cursor-not-allowed ${
              isSubmittingBookmark ? 'animate-pulse' : ''
            }`}
          >
            <IoBookmarkOutline className={`w-5 h-5 cursor-pointer ${
              isSubmittingBookmark ? 'animate-pulse' : ''
            }`} />
            {/* {isBookmarkedState && <span className="text-xs">Saved</span>} */}
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center cursor-pointer space-x-1 text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <IoChatbubbleOutline className="w-5 h-5 cursor-pointer" />
            {commentsState.length > 0 && (
              <span className="text-xs">{commentsState.length}</span>
            )}
          </button>

          <button
            onClick={handleShareClick}
            disabled={!currentUser?._id || isSubmittingShare || isSharedState}
            className={`flex items-center space-x-1 cursor-pointer transition-all duration-200 ${
              isSharedState 
                ? 'cursor-not-allowed text-blue-600 bg-blue-50 px-2 py-1 rounded-full' 
                : 'text-gray-600 hover:text-blue-600 px-2 py-1'
            } disabled:opacity-50 disabled:cursor-not-allowed ${
              isSubmittingShare ? 'animate-pulse' : ''
            }`}
          >
            <BsSend className={`w-5 h-5 cursor-pointer ${
              isSubmittingShare ? 'animate-pulse' : ''
            }`} />
            {shareCount > 0 && (
              <span className="text-xs font-medium transition-all duration-200 ease-in-out">
                {shareCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default PrayerCard;
