import { IoChevronBack, IoEllipsisVertical } from 'react-icons/io5';

const ChatHeader = ({
  activeChat,
  onlineUsers,
  isConnected,
  onBackClick,
  chatMode = 'direct',
  onlineGroupMemberIds = new Set(),
}) => {
  if (!activeChat) {
    return (
      <div className="bg-white/50 backdrop-blur-sm border-b border-white/50 px-5 py-3 flex-shrink-0">
        <div className="text-center text-gray-500">
          {chatMode === 'group' ? 'Select a community to start messaging' : 'Select a user to start messaging'}
        </div>
      </div>
    );
  }

  const isGroup = chatMode === 'group';
  const avatar = isGroup
    ? (activeChat.coverPhoto || activeChat.profilePicture || 'https://i.pravatar.cc/150?img=32')
    : (activeChat.profilePicture || 'https://i.pravatar.cc/150?img=12');
  const title = isGroup
    ? activeChat.name
    : `${activeChat.firstname} ${activeChat.lastname}`;
  const subtitle = isGroup
    ? `${onlineGroupMemberIds.size} online`
    : `@${activeChat.username}`;
  const isUserOnline = !isGroup && onlineUsers.has(activeChat._id);

  return (
    <div className="bg-white/50 backdrop-blur-sm border-b border-white/50 px-5 py-3 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Back button - mobile only */}
          <button
            onClick={onBackClick}
            className="sm:hidden w-8 h-8 rounded-full bg-[#03045E] flex items-center justify-center flex-shrink-0"
          >
            <IoChevronBack className="w-4 h-4 text-white" />
          </button>
          <div className="relative">
            <img
              src={avatar}
              alt={title}
              className="w-11 h-11 rounded-full"
            />
            {isUserOnline && (
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              {title}
            </h2>
            <p className="text-[11px] text-gray-500">
              {subtitle}
              {!isGroup && (isUserOnline ? (
                <span className="text-green-500 ml-2">● Online</span>
              ) : (
                <span className="text-gray-400 ml-2">● Offline</span>
              ))}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {isConnected ? (
            <span className="text-[10px] text-green-500 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
              Connected
            </span>
          ) : (
            <span className="text-[10px] text-red-500 flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-1.5"></span>
              Reconnecting...
            </span>
          )}
          <button className="text-gray-600 hover:text-gray-900 transition-colors">
            <IoEllipsisVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
