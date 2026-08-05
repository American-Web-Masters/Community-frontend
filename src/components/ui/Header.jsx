import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { IoNotificationsOutline, IoSearchOutline, IoCloseOutline, IoClose } from "react-icons/io5";
import { CiFilter } from "react-icons/ci";
import {
  selectNotifications,
  selectNotificationsLoading,
  selectNotificationsPagination,
  selectNotificationsUnreadCount,
} from "../../store/notificationSlice";
import { selectUser } from "../../store/userSlice";
import { useNotificationActions } from "../../hooks/useNotifications";
import {
  buildNotificationText,
  formatNotificationTime,
  getNotificationDateGroup,
  getNotificationTargetPath,
} from "../../utils/notificationUtils";

const Header = ({ 
  showNotification = true, 
  showFilter = true, 
  showSearch = true,
  showLogout,
  onNotificationClick,
  onLogoutClick,
  onFilterClick,
  onSearchClick,
  // Search props
  isSearchActive,
  searchQuery,
  onSearchChange,
  // Filter props
  isFilterActive,
  activeFilters,
  onFilterChange,
  onClearFilters,
}) => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectNotificationsUnreadCount);
  const notificationsLoading = useSelector(selectNotificationsLoading);
  const pagination = useSelector(selectNotificationsPagination);
  const { loadMoreNotifications, markAllAsRead, markOneAsRead } = useNotificationActions();

  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);

  const urgencyOptions = ['low', 'normal', 'high'];
  const moodOptions = ['😄', '😐', '😔', '😡', '😢'];
  const commonTags = ['healing', 'family', 'work', 'health', 'peace', 'guidance'];
  const shouldShowLogout = typeof showLogout === 'boolean' ? showLogout : !!onLogoutClick;

  const groupedNotifications = useMemo(() => {
    const grouped = {
      Today: [],
      Yesterday: [],
      Older: [],
    };

    notifications.forEach((item) => {
      const key = getNotificationDateGroup(item?.createdAt);
      grouped[key] = grouped[key] || [];
      grouped[key].push(item);
    });

    return grouped;
  }, [notifications]);

  const handleNotificationButtonClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    }
    setShowNotificationsPanel((prev) => !prev);
  };

  const handleNotificationItemClick = async (notification) => {
    if (!notification) return;

    if (!notification.isRead) {
      try {
        await markOneAsRead(notification._id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    const targetPath = getNotificationTargetPath(notification, user?.username);
    setShowNotificationsPanel(false);
    navigate(targetPath);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  return (
    <>
      <div className="relative">
        {/* Main Header */}
        <div className="w-[98vw] bg-white/35 backdrop-blur-sm px-2 py-2 rounded-full shadow-sm relative top-2 mx-2">
          <div className="flex items-center justify-between max-w-full">
            {/* Left side - Notification */}
            <div className="flex-1">
              {showNotification && (
                <button
                  onClick={handleNotificationButtonClick}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-200 relative cursor-pointer"
                >
                  <IoNotificationsOutline className="w-5 h-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] leading-5 font-semibold text-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
              )}
            </div>
            
            {/* Right side - Filter and Search */}
            <div className="flex items-center space-x-3">
              {shouldShowLogout && (
                <button
                  onClick={onLogoutClick}
                  className="px-4 py-2 md:px-6 text-xs cursor-pointer bg-red-500 text-white rounded-full shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  Logout
                </button>
              )}

              {showFilter && (
                <button
                  onClick={onFilterClick}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 ${
                    isFilterActive ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
                  }`}
                >
                  <CiFilter className="w-5 h-5 cursor-pointer" />
                </button>
              )}
              
              {showSearch && (
                <button
                  onClick={onSearchClick}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 ${
                    isSearchActive ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
                  }`}
                >
                  <IoSearchOutline className="w-5 h-5 cursor-pointer" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notification Drawer */}
        {showNotification && (
          <div
            className={`absolute z-40 left-2 right-2 mt-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/60 max-h-[75vh] flex flex-col overflow-hidden transform transition-all duration-300 origin-top ${
              showNotificationsPanel
                ? 'scale-100 opacity-100 translate-y-0 visible'
                : 'scale-95 opacity-0 -translate-y-2 invisible pointer-events-none'
            }`}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white/60">
            <div>
              <h3 className="text-base font-bold text-gray-900 tracking-tight">Notifications</h3>
              <p className="text-xs font-medium text-blue-600/80 mt-0.5">{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllAsRead}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 ${
                  unreadCount === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 cursor-pointer'
                }`}
                disabled={unreadCount === 0}
              >
                Mark all read
              </button>
              {/* Close (Cross) Button */}
              <button
                onClick={() => setShowNotificationsPanel(false)}
                aria-label="Close notifications"
                className="p-2 rounded-full cursor-pointer text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200"
              >
                <IoClose className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 max-h-[55vh]">
            {!notifications.length && !notificationsLoading && (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <IoNotificationsOutline className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-800">You're all caught up!</p>
                <p className="text-xs text-gray-500 mt-1">Check back later for new updates.</p>
              </div>
            )}

            {Object.keys(groupedNotifications).map((group) => {
              const list = groupedNotifications[group] || [];
              if (!list.length) return null;

              return (
                <div key={group} className="py-2">
                  <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 px-5 py-1.5 mb-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      {group}
                    </p>
                  </div>
                  <div className="px-3 space-y-1">
                    {list.map((item) => (
                      <button
                        key={item._id}
                        onClick={() => handleNotificationItemClick(item)}
                        className={`w-full group text-left p-3 rounded-xl transition-all duration-200 cursor-pointer relative flex items-start gap-3 ${
                          item.isRead 
                            ? 'hover:bg-gray-50' 
                            : 'bg-blue-50/50 hover:bg-blue-50'
                        }`}
                      >
                        {!item.isRead && (
                          <span className="absolute top-5 left-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
                        )}
                        
                        <div className="flex-shrink-0 mt-0.5 ml-1">
                           <div className={`w-9 h-9 rounded-full flex items-center justify-center ${item.isRead ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                              <IoNotificationsOutline className="w-4.5 h-4.5" />
                           </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${item.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                            {buildNotificationText(item)}
                          </p>
                          <p className={`text-[11px] mt-1 font-medium ${item.isRead ? 'text-gray-400' : 'text-blue-500/80'}`}>
                            {formatNotificationTime(item?.createdAt)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {notificationsLoading && (
              <div className="flex items-center justify-center py-6">
                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>

          {pagination?.hasNextPage && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-center backdrop-blur-sm">
              <button
                onClick={loadMoreNotifications}
                className="w-full max-w-[200px] py-2 px-4 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 shadow-sm text-sm font-semibold text-gray-700 transition-all duration-200 active:scale-95 hover:shadow-md cursor-pointer"
              >
                Load older
              </button>
            </div>
          )}
        </div>
        )}
        
        {/* Search Bar */}
        {isSearchActive && (
          <div className="w-[98vw] mx-2 mt-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 overflow-hidden">
            <div className="p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search prayers, users, or tags..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <IoSearchOutline className="absolute cursor-pointer left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <IoCloseOutline className="w-5 cursor-pointer h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Sidebar Overlay */}
      {isFilterActive && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop with blur effect */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out"
            onClick={onFilterClick}
          />
          
          {/* Sidebar */}
          <div className={`absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
            isFilterActive ? 'translate-x-0' : 'translate-x-full'
          }`}>
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-xl font-semibold text-gray-800">Filters</h3>
              <button
                onClick={onFilterClick}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
              >
                <IoClose className="w-5 h-5 text-gray-600 cursor-pointer" />
              </button>
            </div>
            
            {/* Sidebar Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-8">
                {/* Clear All Button */}
                <div className="flex justify-end">
                  <button
                    onClick={onClearFilters}
                    className="text-blue-500 cursor-pointer text-sm font-medium hover:text-blue-700 transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
                  >
                    Clear All Filters
                  </button>
                </div>
                
                {/* Sort Filter */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Sort By</h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => onFilterChange('sortBy', 'recentActivity')}
                      className={`w-full cursor-pointer text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                        (!activeFilters?.sortBy || activeFilters?.sortBy === 'recentActivity')
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Most Recent Activity
                    </button>
                    <button
                      onClick={() => onFilterChange('sortBy', 'newest')}
                      className={`w-full cursor-pointer text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                        activeFilters?.sortBy === 'newest'
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Newest Created
                    </button>
                  </div>
                </div>

                {/* Urgency Filter */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Urgency Level</h4>
                  <div className="space-y-3">
                    {urgencyOptions.map(urgency => (
                      <button
                        key={urgency}
                        onClick={() => onFilterChange('urgency', urgency)}
                        className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                          activeFilters?.urgency?.includes(urgency)
                            ? urgency === 'low' ? 'bg-green-500 text-white shadow-md'
                            : urgency === 'normal' ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-red-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {urgency.charAt(0).toUpperCase() + urgency.slice(1)} Priority
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Mood Filter */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Mood</h4>
                  <div className="grid grid-cols-5 gap-3">
                    {moodOptions.map(mood => (
                      <button
                        key={mood}
                        onClick={() => onFilterChange('mood', mood)}
                        className={`w-12 h-12 rounded-xl text-2xl transition-all duration-200 flex items-center justify-center ${
                          activeFilters?.mood?.includes(mood)
                            ? 'bg-blue-100 ring-2 ring-blue-500 scale-105 shadow-md'
                            : 'bg-gray-100 hover:bg-gray-200 hover:scale-105'
                        }`}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Tags Filter */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Tags</h4>
                  <div className="space-y-3">
                    {commonTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => onFilterChange('tags', tag)}
                        className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                          activeFilters?.tags?.includes(tag)
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Visibility Filter */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Visibility</h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => onFilterChange('anonymous', false)}
                      className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                        activeFilters?.anonymous === false
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Public Prayers
                    </button>
                    <button
                      onClick={() => onFilterChange('anonymous', true)}
                      className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                        activeFilters?.anonymous === true
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Anonymous Prayers
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <button
                onClick={onFilterClick}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors duration-200"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;