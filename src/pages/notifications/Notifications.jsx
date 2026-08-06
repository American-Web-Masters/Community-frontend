import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { IoArrowBackOutline, IoNotificationsOutline } from "react-icons/io5";
import { FaPrayingHands, FaComment, FaShare, FaUserFriends, FaInfoCircle } from "react-icons/fa";
import {
  selectNotifications,
  selectNotificationsLoading,
  selectNotificationsPagination,
  selectNotificationsUnreadCount,
} from "../../store/notificationSlice";
import { selectUser } from "../../store/userSlice";
import { useNotificationActions } from "../../hooks/useNotifications";
import { useLogout } from "../../hooks/useLogout";
import {
  buildNotificationText,
  formatNotificationTime,
  getNotificationTargetPath,
} from "../../utils/notificationUtils";
import Header from "../../components/ui/Header";
import BottomNavBar from "../../components/ui/BottomNavBar";

const Notifications = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectNotificationsUnreadCount);
  const notificationsLoading = useSelector(selectNotificationsLoading);
  const pagination = useSelector(selectNotificationsPagination);
  const { loadMoreNotifications, markAllAsRead, markOneAsRead } = useNotificationActions();
  const { logout } = useLogout();

  const [activeTab, setActiveTab] = useState("All");

  const tabs = ["All", "Walls", "Communities", "Interactions"];

  const getNotificationCategory = (type) => {
    if (['PRAYER_LIKED', 'PRAYER_COMMENTED', 'COMMENT_REPLIED', 'PRAYER_SHARED'].includes(type)) {
      return "Walls";
    }
    if (['COMMUNITY_POST', 'COMMUNITY_JOIN'].includes(type)) {
      return "Communities";
    }
    if (['MESSAGE_RECEIVED', 'FORUM_REPLY', 'SUBSCRIPTION_CREATED'].includes(type)) {
      return "Interactions";
    }
    return "Other";
  };

  const filteredNotifications = useMemo(() => {
    if (activeTab === "All") return notifications;
    return notifications.filter(n => getNotificationCategory(n.type) === activeTab);
  }, [notifications, activeTab]);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markOneAsRead(notification._id);
    }
    const targetPath = getNotificationTargetPath(notification, user?.username);
    navigate(targetPath);
  };
  
  const getIconForType = (type) => {
    switch (type) {
      case 'PRAYER_LIKED': return <FaPrayingHands className="w-2.5 h-2.5 text-white" />;
      case 'PRAYER_COMMENTED':
      case 'COMMENT_REPLIED':
      case 'FORUM_REPLY': return <FaComment className="w-2.5 h-2.5 text-white" />;
      case 'PRAYER_SHARED': return <FaShare className="w-2.5 h-2.5 text-white" />;
      case 'COMMUNITY_JOIN': return <FaUserFriends className="w-2.5 h-2.5 text-white" />;
      default: return <FaInfoCircle className="w-2.5 h-2.5 text-white" />;
    }
  };

  const getIconBgColorForType = (type) => {
    switch (type) {
      case 'PRAYER_LIKED': return "bg-pink-500";
      case 'PRAYER_COMMENTED':
      case 'COMMENT_REPLIED': return "bg-[#0A1A44]";
      case 'PRAYER_SHARED': return "bg-green-500";
      case 'COMMUNITY_JOIN': return "bg-purple-500";
      default: return "bg-[#0A1A44]";
    }
  };

  return (
    <div className="min-h-screen light-background overflow-x-hidden flex flex-col">
      <div className="mt-2">
        <Header 
          showNotification={true} 
          showSearch={false} 
          showFilter={false} 
          showLogout={true} 
          onLogoutClick={logout} 
        />
      </div>
      
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 pt-6 pb-20 flex-1">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <IoArrowBackOutline className="w-5 h-5 text-gray-800" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notifications</h1>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="bg-white rounded-full p-1.5 inline-flex shadow-sm overflow-x-auto max-w-full">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeTab === tab 
                    ? "btn-blue-gradient text-white shadow-md" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className={`px-6 py-3 rounded-full text-sm font-semibold shadow-sm transition-all duration-200 whitespace-nowrap ${
              unreadCount === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "btn-blue-gradient text-white hover:bg-blue-900 cursor-pointer"
            }`}
          >
            Mark all as read
          </button>
        </div>

        <div className="space-y-4">
          {filteredNotifications.length === 0 && !notificationsLoading ? (
            <div className="text-center py-20 bg-white/50 rounded-3xl">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <IoNotificationsOutline className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No notifications found in this category.</p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const actor = item.actors?.[0];
              const actorInitial = actor?.firstname?.[0] || actor?.username?.[0] || '?';
              const actorImage = actor?.profilePicture;
              const isUnread = !item.isRead;
              
              return (
                <div
                  key={item._id}
                  onClick={() => handleNotificationClick(item)}
                  className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border border-white/50 flex ${
                    isUnread 
                      ? "bg-[#9fd1ffa4]" 
                      : "bg-white"
                  }`}
                >
                  {/* Thick Left Border */}
                  <div className="w-2 bg-[#001f6d] flex-shrink-0"></div>
                  
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center p-4 sm:p-5 gap-4">
                    <div className="relative flex-shrink-0 self-start sm:self-center">
                      {actorImage ? (
                        <img 
                          src={actorImage} 
                          alt="avatar" 
                          className="w-14 h-14 rounded-full object-cover shadow-sm border border-white"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-sm border border-white">
                          <span className="text-xl font-bold text-white uppercase">{actorInitial}</span>
                        </div>
                      )}
                      
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white ${getIconBgColorForType(item.type)}`}>
                        {getIconForType(item.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 pr-4">
                      <p className={`text-base leading-snug ${isUnread ? "text-[#0A1A44] font-bold" : "text-[#0A1A44] font-bold"}`}>
                        {buildNotificationText(item)}
                      </p>
                      {item.metadata?.textPreview && (
                        <p className={`text-sm mt-1 line-clamp-1 ${isUnread ? "text-gray-700" : "text-gray-500"}`}>
                          "{item.metadata.textPreview}"
                        </p>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0 self-start sm:self-center mt-2 sm:mt-0">
                      <span className={`text-sm ${isUnread ? "text-[#0A1A44] font-medium" : "text-gray-500"}`}>
                        {formatNotificationTime(item.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {notificationsLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {pagination?.hasNextPage && !notificationsLoading && (
            <div className="flex justify-center mt-6">
              <button 
                onClick={loadMoreNotifications}
                className="px-8 py-2.5 bg-white text-[#0A1A44] font-semibold rounded-full shadow-sm hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer border border-gray-200"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
      <BottomNavBar />
    </div>
  );
};

export default Notifications;
