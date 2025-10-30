import {
  IoBookmarkOutline,
  IoChatbubbleOutline,
  IoShareOutline,
} from "react-icons/io5";
import {
  PiHandsPrayingThin,
  PiBookBookmarkLight,
} from "react-icons/pi";
import { BsSend } from "react-icons/bs";
import { useState } from "react";

const PrayerCard = ({
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
  isExpanded = false,
  onToggleExpand,
  onPray,
  onBookmark,
  onComment,
  onShare,
  onMore,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentReactions, setCommentReactions] = useState({});
  
  const handleToggleExpand = () => {
    console.log("PrayerCard toggle clicked for user:", user?.name);
    onToggleExpand();
  };

  const handleEmojiReaction = (commentIndex, emoji) => {
    setCommentReactions(prev => {
      const key = `${commentIndex}-${emoji}`;
      const newReactions = { ...prev };
      
      if (newReactions[key]) {
        newReactions[key] += 1;
      } else {
        newReactions[key] = 1;
      }
      
      return newReactions;
    });
  };

  const getEmojiCount = (commentIndex, emoji) => {
    const key = `${commentIndex}-${emoji}`;
    const baseCount = comments[commentIndex]?.reactions?.[emoji] || 0;
    const additionalCount = commentReactions[key] || 0;
    return baseCount + additionalCount;
  };
  const getUrgencyMeter = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case "low":
        return {
          bars: [
            { height: 'h-4', color: 'bg-green-300' },
            // { height: 'h-4', color: 'bg-gray-200' },
            { height: 'h-6', color: 'bg-green-400' },
            { height: 'h-8', color: 'bg-green-500' },
            { height: 'h-10', color: 'bg-green-600' }
          ]
        };
      case "normal":
      case "medium":
        return {
          bars: [
            { height: 'h-4', color: 'bg-yellow-200' },
            // { height: 'h-4', color: 'bg-yellow-400' },
            { height: 'h-6', color: 'bg-yellow-300' },
            { height: 'h-8', color: 'bg-yellow-400' },
            { height: 'h-10', color: 'bg-yellow-500' }
          ]
        };
      case "urgent":
      case "high":
        return {
          bars: [
            { height: 'h-4', color: 'bg-red-500' },
            // { height: 'h-4', color: 'bg-red-400' },
            { height: 'h-6', color: 'bg-red-500' },
            { height: 'h-8', color: 'bg-red-600' },
            { height: 'h-10', color: 'bg-red-700' }
          ]
        };
      default:
        return {
          bars: [
            { height: 'h-6', color: 'bg-green-500' },
            // { height: 'h-4', color: 'bg-gray-200' },
            { height: 'h-8', color: 'bg-gray-200' },
            { height: 'h-10', color: 'bg-gray-200' },
            { height: 'h-12', color: 'bg-gray-200' }
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

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-sm border border-blue-200/50 p-4 mb-4">
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
            {status === "Draft" && (
              <button className="bg-blue-600 btn-blue-gradient text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors duration-200">
                Draft
              </button>
            )}
            {status === "Scheduled" && (
              <button className="btn-blue-gradient text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors duration-200">
                Scheduled
              </button>
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
      <div className="mb-4 relative">
        {isExpanded ? (
          <div>
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
                <div className="flex items-end space-x-1 h-7">
                  {urgencyMeter.bars.map((bar, index) => (
                    <div
                      key={index}
                      className={`w-3 ${bar.height} ${bar.color} rounded-sm`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
            
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
                    Read By {update.user} · {update.time}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Comments Section Toggle */}
            <div className="mb-4">
              <button 
                onClick={() => setShowComments(!showComments)}
                className="text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors duration-200"
              >
                Comments {showComments ? '▲' : '▼'}
              </button>
            </div>
            
            {/* Comments Section */}
            {showComments && (
              <div className="mb-4">
                {comments.slice(0, 2).map((comment, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-3 mb-3">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-sm text-gray-800">{comment.user}</span>
                      <span className="text-xs text-gray-500">{comment.time}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{comment.text}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleEmojiReaction(index, "🙏")}
                          className="text-lg hover:scale-110 transition-transform"
                        >
                          🙏
                        </button>
                        <span className="text-xs text-gray-500">{getEmojiCount(index, "🙏")}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleEmojiReaction(index, "♥️")}
                          className="text-lg hover:scale-110 transition-transform"
                        >
                          ♥️
                        </button>
                        <span className="text-xs text-gray-500">{getEmojiCount(index, "♥️")}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleEmojiReaction(index, "😇")}
                          className="text-lg hover:scale-110 transition-transform"
                        >
                          😇
                        </button>
                        <span className="text-xs text-gray-500">{getEmojiCount(index, "😇")}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleEmojiReaction(index, "😢")}
                          className="text-lg hover:scale-110 transition-transform"
                        >
                          😢
                        </button>
                        <span className="text-xs text-gray-500">{getEmojiCount(index, "😢")}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleEmojiReaction(index, "🎉")}
                          className="text-lg hover:scale-110 transition-transform"
                        >
                          🎉
                        </button>
                        <span className="text-xs text-gray-500">{getEmojiCount(index, "🎉")}</span>
                      </div>
                      <button className="text-xs text-blue-600 hover:underline ml-auto">Reply</button>
                    </div>
                  </div>
                ))}
                
                {comments.length > 2 && (
                  <button className="text-sm text-blue-600 hover:underline mb-3">
                    View {comments.length - 2} more comments
                  </button>
                )}
                
                {/* Add comment input */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Add a prayer or encouragement..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                    Post
                  </button>
                </div>
              </div>
            )}
            
            <button 
              onClick={handleToggleExpand}
              className="text-[#03045E] text-sm font-medium hover:underline"
            >
              Show less
            </button>
          </div>
        ) : (
          <div>
            <p className="text-gray-800 leading-relaxed text-sm line-clamp-2 overflow-hidden pr-20">
              {prayerText}
            </p>
            <button 
              onClick={handleToggleExpand}
              className="absolute bottom-0 right-0 text-[#03045E] text-sm font-medium hover:underline bg-gradient-to-l from-blue-100 to-transparent pl-4"
            >
              Read more
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-blue-200/50">
        <div className="flex items-center space-x-4">
          <button
            onClick={onPray}
            className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <PiHandsPrayingThin className="w-5 h-5" />
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
            onClick={onComment}
            className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <IoChatbubbleOutline className="w-5 h-5" />
          </button>

          <button
            onClick={onShare}
            className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <BsSend className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrayerCard;
