import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { selectUser, selectIsLoggedIn } from "../../store/userSlice";
import { useLogout } from "../../hooks/useLogout";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../hooks/useSocket";
import BottomNavBar from "../../components/ui/BottomNavBar";
import CommunityCard from "../communities/subcomponents/CommunityCard";
import { IoSearchOutline, IoSend, IoEllipsisVertical, IoChevronBack, IoMenu, IoArrowUndoSharp, IoClose, IoTrash, IoCopyOutline } from "react-icons/io5";
import { IoPeopleOutline } from "react-icons/io5";
import { getAllUsers, getConversationWithUser, sendMessage, markConversationAsRead, addReaction, removeReaction, deleteMessageForEveryone } from "../../api/messages";
import { fetchCommunities as apiFetchCommunities } from "../../api";
import toast from 'react-hot-toast';

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
  const [discoverCommunities, setDiscoverCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchDebounceRef = useRef(null);
  
  // Socket.IO state
  const { socket, isConnected, onlineUsers } = useSocket();
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // Reaction state
  const [showReactionPickerFor, setShowReactionPickerFor] = useState(null);
  const [reactingToMessage, setReactingToMessage] = useState(null);
  const reactionPickerRef = useRef(null);
  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
  
  // Reply state
  const [replyingTo, setReplyingTo] = useState(null);
  
  // Delete state
  const [deletingMessage, setDeletingMessage] = useState(null);
  

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


  useEffect(() => {
    const fetchDiscover = async () => {
      try {
        setLoadingCommunities(true);
        const response = await apiFetchCommunities(user);
        if (response.success) {
          const notJoined = response.data.filter(c => !c.isMember && !c.isOwner);
          setDiscoverCommunities(notJoined);
        }
      } catch (error) {
        console.error('Error fetching discover communities:', error);
      } finally {
        setLoadingCommunities(false);
      }
    };

    if (isLoggedIn && user) {
      fetchDiscover();
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

    // Listen for reaction added
    const handleReactionAdded = ({ messageId, reaction }) => {
      setMessages(prev => 
        prev.map(msg => {
          if (msg._id === messageId) {
            const reactions = msg.reactions || [];
            // Check if reaction already exists
            const exists = reactions.some(
              r => r.user._id === reaction.user._id && r.emoji === reaction.emoji
            );
            if (exists) return msg;
            return { ...msg, reactions: [...reactions, reaction] };
          }
          return msg;
        })
      );
    };

    // Listen for reaction removed
    const handleReactionRemoved = ({ messageId, userId, emoji }) => {
      setMessages(prev => 
        prev.map(msg => {
          if (msg._id === messageId) {
            const reactions = (msg.reactions || []).filter(
              r => !(r.user._id === userId && r.emoji === emoji)
            );
            return { ...msg, reactions };
          }
          return msg;
        })
      );
    };

    // Listen for message deleted for everyone
    const handleMessageDeletedForEveryone = ({ messageId }) => {
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, isDeletedForEveryone: true }
            : msg
        )
      );
    };

    // Attach event listeners
    socket.on('message:new', handleNewMessage);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);
    socket.on('message:read', handleMessageRead);
    socket.on('message:deleted', handleMessageDeleted);
    socket.on('message:reaction-added', handleReactionAdded);
    socket.on('message:reaction-removed', handleReactionRemoved);
    socket.on('message:deleted-for-everyone', handleMessageDeletedForEveryone);

    // Cleanup
    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
      socket.off('message:read', handleMessageRead);
      socket.off('message:deleted', handleMessageDeleted);
      socket.off('message:reaction-added', handleReactionAdded);
      socket.off('message:reaction-removed', handleReactionRemoved);
      socket.off('message:deleted-for-everyone', handleMessageDeletedForEveryone);
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
      const payload = {
        receiverId: activeChat._id,
        content: messageInput.trim(),
        messageType: 'text'
      };
      
      // Add replyTo if replying to a message
      if (replyingTo) {
        payload.replyTo = replyingTo._id;
      }
      
      const response = await sendMessage(payload);

      if (response.data.status === 'success') {
        // Message will be received via Socket.IO, but update local state for immediate feedback
        const newMessage = response.data.data.message;
        setMessages(prev => {
          const exists = prev.some(msg => msg._id === newMessage._id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
        setMessageInput('');
        setReplyingTo(null); // Clear reply state
        
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

  // Handle adding reaction
  const handleAddReaction = async (messageId, emoji) => {
    try {
      const response = await addReaction(messageId, { emoji });
      if (response.data.status === 'success') {
        // Update local state
        setMessages(prev => 
          prev.map(msg => 
            msg._id === messageId 
              ? { ...msg, reactions: response.data.data.reactions }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    } finally {
      setShowReactionPickerFor(null);
    }
  };

  // Handle removing reaction
  const handleRemoveReaction = async (messageId, emoji) => {
    try {
      const response = await removeReaction(messageId, { emoji });
      if (response.data.status === 'success') {
        // Update local state
        setMessages(prev => 
          prev.map(msg => 
            msg._id === messageId 
              ? { ...msg, reactions: response.data.data.reactions }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  // Toggle reaction (replace if different, remove if same)
  const handleToggleReaction = async (messageId, emoji) => {
    const message = messages.find(msg => msg._id === messageId);
    if (!message) return;

    // Find any existing reaction from this user
    const existingReaction = message.reactions?.find(
      r => r.user._id === user._id
    );

    if (existingReaction) {
      // If clicking the same emoji, remove it (toggle off)
      if (existingReaction.emoji === emoji) {
        await handleRemoveReaction(messageId, emoji);
      } else {
        // If clicking a different emoji, replace the old one
        await handleRemoveReaction(messageId, existingReaction.emoji);
        await handleAddReaction(messageId, emoji);
      }
    } else {
      // No existing reaction, just add the new one
      await handleAddReaction(messageId, emoji);
    }
  };

  // Close reaction picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (reactionPickerRef.current && !reactionPickerRef.current.contains(event.target)) {
        setShowReactionPickerFor(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle deleting message for everyone
  const handleDeleteForEveryone = async (messageId) => {
    const message = messages.find(msg => msg._id === messageId);
    if (!message) return;

    // Check if user is the sender
    if (message.sender._id !== user._id) {
      alert('You can only delete your own messages');
      return;
    }

    // Check if message is within 1 hour
    const messageTime = new Date(message.createdAt);
    const now = new Date();
    const hoursDiff = (now - messageTime) / (1000 * 60 * 60);
    
    if (hoursDiff > 1) {
      alert('Messages can only be deleted for everyone within 1 hour of sending');
      return;
    }

    if (!confirm('Delete this message for everyone?')) return;

    setDeletingMessage(messageId);
    try {
      const response = await deleteMessageForEveryone(messageId);
      if (response.data.status === 'success') {
        // Update local state to mark as deleted
        setMessages(prev => 
          prev.map(msg => 
            msg._id === messageId 
              ? { ...msg, isDeletedForEveryone: true }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete message';
      alert(errorMessage);
    } finally {
      setDeletingMessage(null);
    }
  };

  // Handle copying message to clipboard
  const handleCopyMessage = async (messageContent) => {
    try {
      await navigator.clipboard.writeText(messageContent);
      // Optional: Show a brief success message (you could use a toast notification library)
      // For now, we'll use a simple temporary alert
      const copyButton = document.activeElement;
      const originalTitle = copyButton.getAttribute('title');
      copyButton.setAttribute('title', 'Copied!');
      toast.success('Message copied to clipboard');
      setTimeout(() => {
        copyButton.setAttribute('title', originalTitle);
      }, 1500);
    } catch (error) {
      console.error('Error copying message:', error);
      alert('Failed to copy message');
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
        {/* Sidebar Toggle Button - desktop only */}
        <div className="hidden sm:flex w-14 flex-col items-center justify-center space-y-6 mr-5">
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
        <>
          {/* Fixed back button - desktop only, shown when sidebar open */}
          {isSidebarOpen && (
            <div className="hidden sm:block fixed top-4.5 left-3">
              <button
                onClick={() => navigate(-1)}
                className="w-11 h-11 rounded-full bg-[#03045E] flex items-center justify-center hover:opacity-90 transition-all duration-200 shadow-sm flex-shrink-0"
              >
                <IoChevronBack className="w-5 h-5 text-white" />
              </button>
            </div>
          )}

          <div className={`flex-col mt-4 mb-3 w-full sm:w-auto px-3 sm:px-0 ${!activeChat ? 'flex' : 'hidden'} ${isSidebarOpen ? 'sm:flex' : 'sm:hidden'}`}>
            {/* Back Button and Search - Same Line */}
            <div className="flex items-center space-x-3 mb-2">
              
              {/* Search Input */}
              <div className="relative flex-1">
                <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 " />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                    searchDebounceRef.current = setTimeout(() => setDebouncedSearch(val), 300);
                  }}
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

            {/* Chats Container */}
            <div className="w-full sm:w-90 bg-white/50 backdrop-blur-sm flex flex-col overflow-hidden rounded-2xl sm:rounded-tr-2xl sm:rounded-br-2xl shadow-sm" style={{ maxHeight: '48%' }}>
          {/* Chats Section */}
          <div className="flex-1 overflow-y-auto px-4 pt-3 thin-scrollbar">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Chats</h3>
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : users.filter(u => {
                const q = debouncedSearch.toLowerCase();
                return !q || `${u.firstname} ${u.lastname}`.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
              }).length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-xs">{debouncedSearch ? 'No users found' : 'No users available'}</div>
            ) : (
              <div className="space-y-1">
                {users.filter(u => {
                  const q = debouncedSearch.toLowerCase();
                  return !q || `${u.firstname} ${u.lastname}`.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
                }).map((chat) => (
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
        </div>

            <div className="w-full sm:w-90 bg-white/50 backdrop-blur-sm flex flex-col overflow-hidden rounded-2xl sm:rounded-tr-2xl sm:rounded-br-2xl shadow-sm mt-3" style={{ maxHeight: '48%' }}>
          {/* Discover Section */}
          <div className="flex-1 overflow-y-auto px-4 pt-3 thin-scrollbar">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Discover</h3>
            {loadingCommunities ? (
              <div className="text-center py-4 text-gray-500 text-xs">Loading...</div>
            ) : discoverCommunities.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-xs">No communities to discover</div>
            ) : (
              <div className="space-y-3">
                {discoverCommunities.map((community) => (
                  <CommunityCard
                    key={community._id || community.id}
                    id={community._id || community.id}
                    name={community.name}
                    wallAssociation={community.wallAssociation}
                    category={community.tags || []}
                    members={community.memberCount}
                    avatar={community.coverPhoto}
                    privacyLevel={community.privacyLevel}
                    status={community.privacyLevel === 'private' ? 'Private' : 'Public'}
                    isJoined={false}
                    onJoinClick={() => navigate('/communities')}
                    onViewClick={() => navigate('/communities')}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
        </>

        {/* Main Chat Area */}
        <div className={`flex-1 flex-col overflow-hidden ml-0 sm:ml-4 mr-0 sm:mr-4 my-0 sm:my-4 rounded-none sm:rounded-2xl bg-white/30 backdrop-blur-sm shadow-sm ${!activeChat ? 'hidden sm:flex' : 'flex'}`}>
          {/* Chat Header */}
          <div className="bg-white/50 backdrop-blur-sm border-b border-white/50 px-5 py-3 flex-shrink-0">
            {activeChat ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Back button - mobile only */}
                  <button
                    onClick={() => setActiveChat(null)}
                    className="sm:hidden w-8 h-8 rounded-full bg-[#03045E] flex items-center justify-center flex-shrink-0"
                  >
                    <IoChevronBack className="w-4 h-4 text-white" />
                  </button>
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
                  const messageReactions = message.reactions || [];
                  const isDeleted = message.isDeletedForEveryone;
                  
                  // Check if message can be deleted (within 1 hour, sender only)
                  const messageTime = new Date(message.createdAt);
                  const now = new Date();
                  const hoursDiff = (now - messageTime) / (1000 * 60 * 60);
                  const canDelete = isOutgoing && hoursDiff <= 1 && !isDeleted;
                  
                  // Group reactions by emoji
                  const groupedReactions = messageReactions.reduce((acc, reaction) => {
                    if (!acc[reaction.emoji]) {
                      acc[reaction.emoji] = [];
                    }
                    acc[reaction.emoji].push(reaction);
                    return acc;
                  }, {});

                  return (
                    <div
                      key={message._id}
                      className={`flex items-start gap-3 group ${
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
                      
                      {/* Action Buttons Row - centered with message, shows on hover */}
                      {!isDeleted && (
                        <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                          isOutgoing ? 'order-first' : 'order-last'
                        }`}>
                          {/* Reply Button */}
                          <button
                            onClick={() => setReplyingTo(message)}
                            className="w-6 h-6 rounded-full bg-white cursor-pointer shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50"
                            title="Reply to message"
                          >
                            <IoArrowUndoSharp className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* Reaction Button */}
                          <button
                            onClick={() => setShowReactionPickerFor(showReactionPickerFor === message._id ? null : message._id)}
                            className="w-6 h-6 rounded-full cursor-pointer bg-white shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50"
                            title="Add reaction"
                          >
                            <span className="text-sm">😊</span>
                          </button>
                          
                          {/* Copy Button */}
                          <button
                            onClick={() => handleCopyMessage(message.content)}
                            className="w-6 h-6 rounded-full bg-white cursor-pointer shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50"
                            title="Copy message"
                          >
                            <IoCopyOutline className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* Delete Button - only for sender within 1 hour */}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteForEveryone(message._id)}
                              disabled={deletingMessage === message._id}
                              className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 text-gray-600 cursor-pointerdisabled:opacity-50"
                              title="Delete for everyone"
                            >
                              {deletingMessage === message._id ? (
                                <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <IoTrash className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                      
                      <div className="flex flex-col space-y-1 max-w-md relative">
                        <div className="relative">
                          <div
                            className={`px-4 py-2.5 rounded-2xl ${
                              isOutgoing
                                ? "btn-blue-gradient text-white"
                                : "bg-white/80 text-gray-900 shadow-sm"
                            }`}
                          >
                            {isDeleted ? (
                              <p className="text-[13px] italic opacity-60">
                                🚫 This message was deleted
                              </p>
                            ) : (
                              <>
                                {/* Show replied-to message if exists */}
                                {message.replyTo && !message.replyTo.isDeletedForEveryone && (
                                  <div className={`mb-2 pb-2 border-l-2 pl-2 ${
                                    isOutgoing ? 'border-white/50' : 'border-gray-300'
                                  }`}>
                                    <p className={`text-[10px] font-medium mb-0.5 ${
                                      isOutgoing ? 'text-white/80' : 'text-gray-600'
                                    }`}>
                                      {message.replyTo.sender._id === user._id ? 'You' : `${message.replyTo.sender.firstname} ${message.replyTo.sender.lastname}`}
                                    </p>
                                    <p className={`text-[11px] line-clamp-2 ${
                                      isOutgoing ? 'text-white/70' : 'text-gray-500'
                                    }`}>
                                      {message.replyTo.isDeletedForEveryone ? '🚫 This message was deleted' : message.replyTo.content}
                                    </p>
                                  </div>
                                )}
                                <p className="text-[13px] leading-relaxed">{message.content}</p>
                              </>
                            )}
                          </div>

                          {/* Reaction Picker */}
                          {showReactionPickerFor === message._id && !isDeleted && (
                            <div
                              ref={reactionPickerRef}
                              className={`absolute ${isOutgoing ? 'right-0' : 'left-0'} top-full mt-2 z-10 bg-white rounded-full shadow-lg px-2 py-1.5 flex gap-1`}
                            >
                              {commonEmojis.map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => handleToggleReaction(message._id, emoji)}
                                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-lg transition-all hover:scale-110"
                                  title={`React with ${emoji}`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Display Reactions */}
                        {!isDeleted && Object.keys(groupedReactions).length > 0 && (
                          <div className={`flex flex-wrap gap-1 px-1 ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                            {Object.entries(groupedReactions).map(([emoji, reactions]) => {
                              const userHasReacted = reactions.some(r => r.user._id === user._id);
                              const reactionCount = reactions.length;
                              
                              return (
                                <button
                                  key={emoji}
                                  onClick={() => handleToggleReaction(message._id, emoji)}
                                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all hover:scale-105 ${
                                    userHasReacted 
                                      ? 'bg-blue-100 border border-blue-300' 
                                      : 'bg-gray-100 border border-gray-200'
                                  }`}
                                  title={reactions.map(r => `${r.user.firstname} ${r.user.lastname}`).join(', ')}
                                >
                                  <span>{emoji}</span>
                                  <span className={userHasReacted ? 'text-blue-600 font-medium' : 'text-gray-600'}>
                                    {reactionCount}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}

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
            {/* Reply Preview */}
            {replyingTo && (
              <div className="mb-2 bg-blue-50 border border-blue-200 rounded-lg p-2.5 flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <IoArrowUndoSharp className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <p className="text-[11px] font-medium text-blue-600">
                      Replying to {replyingTo.sender._id === user._id ? 'yourself' : `${replyingTo.sender.firstname} ${replyingTo.sender.lastname}`}
                    </p>
                  </div>
                  <p className="text-[12px] text-gray-600 line-clamp-1 ml-5">{replyingTo.content}</p>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0"
                >
                  <IoClose className="w-4 h-4" />
                </button>
              </div>
            )}
            
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
