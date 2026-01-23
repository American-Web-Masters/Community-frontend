import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { selectUser, selectIsLoggedIn } from "../../store/userSlice";
import { useLogout } from "../../hooks/useLogout";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../hooks/useSocket";
import BottomNavBar from "../../components/ui/BottomNavBar";
import CommunityCard from "../communities/subcomponents/CommunityCard";
import { IoSearchOutline, IoSend, IoEllipsisVertical, IoChevronBack, IoMenu } from "react-icons/io5";
import { IoPeopleOutline } from "react-icons/io5";
import { getAllUsers, getConversationWithUser, sendMessage, markConversationAsRead } from "../../api/messages";

// Custom styles for thin scrollbars
const scrollbarStyles = `
  .thin-scrollbar::-webkit-scrollbar {
    width: 3px;
    height: 3px;
  }
  .thin-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .thin-scrollbar::-webkit-scrollbar-thumb {
    background: #A6D3FF;
    border-radius: 10px;
  }
  .thin-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #8BC1FF;
  }
  .thin-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #A6D3FF transparent;
  }
`;

// Mock data for communities
const mockCommunities = [
  {
    id: 1,
    name: "Faith & Healing",
    wallAssociation: "Prayer Wall",
    category: ["Fellowship"],
    members: 125,
    avatar: "https://i.pravatar.cc/150?img=20",
  },
  {
    id: 2,
    name: "Faith & Healing",
    wallAssociation: "Prayer Wall",
    category: ["Fellowship"],
    members: 125,
    avatar: "https://i.pravatar.cc/150?img=21",
  },
];

const Messages = () => {
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // API state
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Socket.IO state
  const { socket, isConnected, onlineUsers } = useSocket();
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        if (response.data.status === 'success') {
          const allUsers = response.data.data.users;
          // Filter out current user
          const otherUsers = allUsers.filter(u => u._id !== user?._id);
          setUsers(otherUsers);
          if (otherUsers.length > 0 && !activeChat) {
            setActiveChat(otherUsers[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn && user) {
      fetchUsers();
    }
  }, [isLoggedIn, user]);

  // Fetch messages when active chat changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChat) return;
      
      try {
        const response = await getConversationWithUser(activeChat._id);
        if (response.data.status === 'success') {
          const sortedMessages = response.data.data.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          setMessages(sortedMessages);
          // Mark messages as read
          await markConversationAsRead(activeChat._id);
          
          // Instantly scroll to bottom (no animation) when loading conversation
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
          }, 0);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [activeChat]);

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for new messages
    const handleNewMessage = (messageData) => {
      console.log('📨 New message received:', messageData);
      
      // Check if message is for current conversation
      const isForCurrentChat = 
        (messageData.sender._id === activeChat?._id && messageData.receiver._id === user?._id) ||
        (messageData.sender._id === user?._id && messageData.receiver._id === activeChat?._id);
      
      if (isForCurrentChat) {
        setMessages(prev => {
          // Prevent duplicate messages
          const exists = prev.some(msg => msg._id === messageData._id);
          if (exists) return prev;
          return [...prev, messageData];
        });
        
        // Mark as read if we're the receiver
        if (messageData.receiver._id === user?._id && activeChat) {
          markConversationAsRead(activeChat._id).catch(console.error);
        }
        
        // Scroll to bottom
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      } else {
        // Show notification or update unread count for other conversations
        console.log('Message from other conversation');
      }
    };

    // Listen for typing indicators
    const handleTypingStart = ({ userId, username }) => {
      if (userId === activeChat?._id) {
        console.log(`${username} is typing...`);
        setIsTyping(true);
      }
    };

    const handleTypingStop = ({ userId }) => {
      if (userId === activeChat?._id) {
        setIsTyping(false);
      }
    };

    // Listen for message read receipts
    const handleMessageRead = ({ messageIds, readBy }) => {
      if (readBy !== user?._id) {
        setMessages(prev => 
          prev.map(msg => 
            messageIds.includes(msg._id) ? { ...msg, isRead: true } : msg
          )
        );
      }
    };

    // Listen for message deletions
    const handleMessageDeleted = ({ messageId }) => {
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    };

    // Attach event listeners
    socket.on('message:new', handleNewMessage);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);
    socket.on('message:read', handleMessageRead);
    socket.on('message:deleted', handleMessageDeleted);

    // Cleanup
    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
      socket.off('message:read', handleMessageRead);
      socket.off('message:deleted', handleMessageDeleted);
    };
  }, [socket, isConnected, activeChat, user]);

  // Handle typing with debounce
  const handleTyping = (value) => {
    setMessageInput(value);
    
    if (!socket || !isConnected || !activeChat) return;

    // Emit typing start
    socket.emit('typing:start', { receiverId: activeChat._id });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to emit typing stop
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', { receiverId: activeChat._id });
    }, 2000);
  };

  // Send message handler
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeChat || sendingMessage) return;

    setSendingMessage(true);
    try {
      const response = await sendMessage({
        receiverId: activeChat._id,
        content: messageInput.trim(),
        messageType: 'text'
      });

      if (response.data.status === 'success') {
        // Message will be received via Socket.IO, but update local state for immediate feedback
        const newMessage = response.data.data.message;
        setMessages(prev => {
          const exists = prev.some(msg => msg._id === newMessage._id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
        setMessageInput('');
        
        // Stop typing indicator
        if (socket && isConnected) {
          socket.emit('typing:stop', { receiverId: activeChat._id });
        }
        
        // Clear typing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        // Scroll to bottom after sending
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', error.response?.data);
      
      // Show error to user
      const errorMessage = error.response?.data?.message || 'Failed to send message. Please try again.';
      alert(errorMessage);
    } finally {
      setSendingMessage(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return `${Math.floor(diffMins / 1440)}d`;
  };

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="min-h-screen light-background overflow-hidden">
      <div className="flex" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Sidebar Toggle Button */}
        <div className="w-14 flex flex-col items-center justify-center space-y-6 mr-5">
          <div className="side-trapezoid btn-blue-gradient flex flex-col items-center justify-center">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center justify-center hover:opacity-90 transition-all duration-200 shadow-md"
          >
            <IoMenu className="w-6 h-6 text-white" />
          </button>
          <button className="flex items-center justify-center hover:opacity-90 transition-all duration-200 shadow-md">
            <IoPeopleOutline className="w-6 h-6 text-white" />
          </button>
        </div>
        </div>

        {/* Left Sidebar Container */}
        {isSidebarOpen && (
          <>
          
              <div className="fixed top-4.5 left-3">
                <button
                onClick={() => navigate(-1)}
                className="w-11 h-11 rounded-full bg-[#03045E] flex items-center justify-center hover:opacity-90 transition-all duration-200 shadow-sm flex-shrink-0"
              >
                <IoChevronBack className="w-5 h-5 text-white" />
              </button>
              </div>
          
          <div className="flex flex-col mt-4 mb-3">
            {/* Back Button and Search - Same Line */}
            <div className="flex items-center space-x-3 mb-2">
              
              {/* Search Input */}
              <div className="relative flex-1">
                <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 " />
                <input
                  type="text"
                  placeholder="search"
                  className="w-full h-11 pl-9 pr-3 py-2 rounded-full bg-white/70 border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 placeholder:text-[16px] placeholder:pl-2"
                />
              </div>
            </div>

            {/* Filter Tabs - Below Search */}
            <div className="flex space-x-2 mb-3 ">
              {["All", "Unread", "Communities"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                    activeTab === tab
                      ? "btn-blue-gradient text-white shadow-sm"
                      : "bg-white/70 text-gray-700 hover:bg-white/90"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Sidebar */}
            <div className="w-90 bg-white/50 backdrop-blur-sm flex flex-col overflow-hidden rounded-tr-2xl rounded-br-2xl shadow-sm flex-1">

          {/* Chats Section */}
          <div className="flex-1 overflow-y-auto px-4 pt-3 thin-scrollbar" style={{ maxHeight: '45%' }}>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Chats</h3>
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-xs">No users available</div>
            ) : (
              <div className="space-y-1">
                {users.map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => setActiveChat(chat)}
                    className={`flex items-start space-x-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                      activeChat?._id === chat._id
                        ? "bg-white shadow-sm"
                        : "hover:bg-white/50"
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={chat.profilePicture || "https://i.pravatar.cc/150?img=12"}
                        alt={`${chat.firstname} ${chat.lastname}`}
                        className="w-10 h-10 rounded-full flex-shrink-0"
                      />
                      {onlineUsers.has(chat._id) && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {chat.firstname} {chat.lastname}
                        </h4>
                        <span className="text-[11px] text-gray-400 ml-2 flex-shrink-0">
                          @{chat.username}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate leading-tight">
                        {chat.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="px-1 ">
            <div className="border-t border-gray-300"></div>
          </div>

          {/* Discover Section */}
          <div className="flex-1 overflow-y-auto px-4 pt-3 thin-scrollbar" style={{ maxHeight: '45%' }}>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Discover</h3>
            <div className="space-y-3">
              {mockCommunities.map((community) => (
                <CommunityCard
                  key={community.id}
                  id={community.id}
                  name={community.name}
                  wallAssociation={community.wallAssociation}
                  category={community.category}
                  members={community.members}
                  avatar={community.avatar}
                  isJoined={false}
                  onJoinClick={(id) => console.log("Join community:", id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
          </>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden ml-4 mr-4 my-4 rounded-2xl bg-white/30 backdrop-blur-sm shadow-sm">
          {/* Chat Header */}
          <div className="bg-white/50 backdrop-blur-sm border-b border-white/50 px-5 py-3 flex-shrink-0">
            {activeChat ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={activeChat.profilePicture || "https://i.pravatar.cc/150?img=12"}
                      alt={`${activeChat.firstname} ${activeChat.lastname}`}
                      className="w-11 h-11 rounded-full"
                    />
                    {onlineUsers.has(activeChat._id) && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">
                      {activeChat.firstname} {activeChat.lastname}
                    </h2>
                    <p className="text-[11px] text-gray-500">
                      @{activeChat.username}
                      {onlineUsers.has(activeChat._id) ? (
                        <span className="text-green-500 ml-2">● Online</span>
                      ) : (
                        <span className="text-gray-400 ml-2">● Offline</span>
                      )}
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
            ) : (
              <div className="text-center text-gray-500">Select a user to start messaging</div>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 thin-scrollbar">
            {!activeChat ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a user to view messages
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                No messages yet. Start the conversation!
              </div>
            ) : (
              <>
                {messages.map((message) => {
                  const isOutgoing = message.sender._id === user._id;
                  return (
                    <div
                      key={message._id}
                      className={`flex items-start gap-3 ${
                        isOutgoing ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isOutgoing && (
                        <img
                          src={message.sender.profilePicture || "https://i.pravatar.cc/150?img=12"}
                          alt={`${message.sender.firstname} ${message.sender.lastname}`}
                          className="w-8 h-8 rounded-full flex-shrink-0 mt-1"
                        />
                      )}
                      <div className="flex flex-col space-y-1 max-w-md">
                        <div
                          className={`px-4 py-2.5 rounded-2xl ${
                            isOutgoing
                              ? "btn-blue-gradient text-white"
                              : "bg-white/80 text-gray-900 shadow-sm"
                          }`}
                        >
                          <p className="text-[13px] leading-relaxed">{message.content}</p>
                        </div>
                        <div className="flex items-center gap-3 px-1">
                          <span className="text-[10px] text-gray-400">
                            {formatTimestamp(message.createdAt)}
                          </span>
                          {message.isRead && isOutgoing && (
                            <span className="text-[10px] text-blue-500">Read</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="flex items-start gap-3 justify-start">
                    <img
                      src={activeChat.profilePicture || "https://i.pravatar.cc/150?img=12"}
                      alt={`${activeChat.firstname} ${activeChat.lastname}`}
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
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="px-6 py-4 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder={activeChat ? `Reply to ${activeChat.firstname}` : "Select a user to start messaging"}
                disabled={!activeChat || sendingMessage}
                className="flex-1 px-4 py-2.5 rounded-full bg-white/70 border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!activeChat || !messageInput.trim() || sendingMessage}
                className="btn-blue-gradient w-11 h-11 rounded-full flex items-center justify-center shadow-md hover:opacity-90 transition-all duration-200 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingMessage ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <IoSend className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomNavBar />
      </div>
    </>
  );
};

export default Messages;
