const TypingIndicator = ({ activeChat, chatMode = 'direct' }) => {
  const isGroup = chatMode === 'group';
  const avatar = isGroup
    ? (activeChat.coverPhoto || activeChat.profilePicture || 'https://i.pravatar.cc/150?img=32')
    : (activeChat.profilePicture || 'https://i.pravatar.cc/150?img=12');
  const title = isGroup ? activeChat.name : `${activeChat.firstname} ${activeChat.lastname}`;

  return (
    <div className="flex items-start gap-3 justify-start">
      <img
        src={avatar}
        alt={title}
        className="w-8 h-8 rounded-full flex-shrink-0 mt-1"
      />
      <div className="bg-white/80 px-4 py-3 rounded-2xl shadow-sm">
        <div className="flex space-x-1.5">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
