import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectUser, selectIsLoggedIn } from "../../store/userSlice";
import { useLogout } from "../../hooks/useLogout";
import { useNavigate } from "react-router-dom";
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

// Mock data for chats
const mockChats = [
  {
    id: 1,
    name: "David Park",
    avatar: "https://i.pravatar.cc/150?img=12",
    lastMessage: "Hey Chris, Can you please review the latest work when you can?",
    timestamp: "2m",
    isTyping: true,
  },
  {
    id: 2,
    name: "David Park",
    avatar: "https://i.pravatar.cc/150?img=12",
    lastMessage: "Thanks for sharing this with me",
    timestamp: "1hr",
    isTyping: false,
  },
  {
    id: 3,
    name: "David Park",
    avatar: "https://i.pravatar.cc/150?img=12",
    lastMessage: "What do you think about this strategy?",
    timestamp: "3hr",
    isTyping: false,
  },
];

// Mock data for messages
const mockMessages = [
  {
    id: 1,
    sender: "David Park",
    senderAvatar: "https://i.pravatar.cc/150?img=12",
    text: "No Worries, I'm on it!",
    label: "Isaac Work",
    timestamp: "11m",
    isOutgoing: false,
  },
  {
    id: 2,
    sender: "David Park",
    senderAvatar: "https://i.pravatar.cc/150?img=12",
    text: "Hey Chris, Can you please review the latest work when you can?",
    label: "Isaac Work",
    timestamp: "5 M",
    isOutgoing: false,
  },
  {
    id: 3,
    text: "I'm not able to bike this at the moment thankyou",
    timestamp: "10 m",
    isOutgoing: true,
  },
  {
    id: 4,
    sender: "David Park",
    senderAvatar: "https://i.pravatar.cc/150?img=12",
    text: "Hey Chris, Can you please review the latest work when you can?",
    label: "Okay!",
    timestamp: "5 M",
    isOutgoing: false,
  },
  {
    id: 5,
    text: "I'm not able to bike this at the moment thankyou",
    timestamp: "20 m",
    isOutgoing: true,
  },
  {
    id: 6,
    sender: "David Park",
    senderAvatar: "https://i.pravatar.cc/150?img=12",
    text: "Hey Chris, Can you please review the latest work when you can?",
    label: "Isaac Work",
    timestamp: "5 M",
    isOutgoing: false,
  },
  {
    id: 7,
    text: "I'm not able to bike this at the moment thankyou",
    timestamp: "30 m",
    isOutgoing: true,
  },
];

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
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [activeChat]);

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
        // Add the new message to the list
        setMessages(prev => [...prev, response.data.data.message]);
        setMessageInput('');
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
                    <img
                      src={chat.profilePicture || "https://i.pravatar.cc/150?img=12"}
                      alt={`${chat.firstname} ${chat.lastname}`}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
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
                  <img
                    src={activeChat.profilePicture || "https://i.pravatar.cc/150?img=12"}
                    alt={`${activeChat.firstname} ${activeChat.lastname}`}
                    className="w-11 h-11 rounded-full"
                  />
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">
                      {activeChat.firstname} {activeChat.lastname}
                    </h2>
                    <p className="text-[11px] text-gray-500">@{activeChat.username}</p>
                  </div>
                </div>
                <button className="text-gray-600 hover:text-gray-900 transition-colors">
                  <IoEllipsisVertical className="w-5 h-5" />
                </button>
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
              messages.map((message) => {
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
              })
            )}
          </div>

          {/* Input Area */}
          <div className="px-6 py-4 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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
