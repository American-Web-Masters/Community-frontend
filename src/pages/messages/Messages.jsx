import React, { useState } from "react";
import { useSelector } from "react-redux";
import { selectUser, selectIsLoggedIn } from "../../store/userSlice";
import { useLogout } from "../../hooks/useLogout";
import { useNavigate } from "react-router-dom";
import BottomNavBar from "../../components/ui/BottomNavBar";
import CommunityCard from "../communities/subcomponents/CommunityCard";
import { IoSearchOutline, IoSend, IoEllipsisVertical, IoChevronBack, IoMenu } from "react-icons/io5";
import { IoPeopleOutline } from "react-icons/io5";

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
  const [activeChat, setActiveChat] = useState(mockChats[0]);
  const [activeTab, setActiveTab] = useState("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
          <div className="flex flex-col mt-4">
            {/* Back Button and Search - Same Line */}
            <div className="flex items-center space-x-3 mb-3 ml-4">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full bg-[#03045E] flex items-center justify-center hover:opacity-90 transition-all duration-200 shadow-sm flex-shrink-0"
              >
                <IoChevronBack className="w-5 h-5 text-white" />
              </button>
              
              {/* Search Input */}
              <div className="relative flex-1">
                <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="search"
                  className="w-full pl-9 pr-3 py-2 rounded-full bg-white/70 border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300"
                />
              </div>
            </div>

            {/* Filter Tabs - Below Search */}
            <div className="flex space-x-2 mb-3 ml-4">
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
          <div className="flex-1 overflow-y-auto px-4 py-3 thin-scrollbar" style={{ maxHeight: '45%' }}>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Chats</h3>
            <div className="space-y-1">
              {mockChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  className={`flex items-start space-x-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                    activeChat.id === chat.id
                      ? "bg-white shadow-sm"
                      : "hover:bg-white/50"
                  }`}
                >
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {chat.name}
                      </h4>
                      <span className="text-[11px] text-gray-400 ml-2 flex-shrink-0">
                        {chat.timestamp}
                      </span>
                    </div>
                    {chat.isTyping ? (
                      <p className="text-xs text-blue-600 font-medium">typing...</p>
                    ) : (
                      <p className="text-xs text-gray-500 truncate leading-tight">
                        {chat.lastMessage}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className="px-4 py-2">
            <div className="border-t border-gray-200"></div>
          </div>

          {/* Discover Section */}
          <div className="flex-1 overflow-y-auto px-4 py-3 pb-4 thin-scrollbar" style={{ maxHeight: '45%' }}>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Discover</h3>
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
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden ml-4 mr-4 my-4 rounded-2xl bg-white/30 backdrop-blur-sm shadow-sm">
          {/* Chat Header */}
          <div className="bg-white/50 backdrop-blur-sm border-b border-white/50 px-5 py-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={activeChat.avatar}
                  alt={activeChat.name}
                  className="w-11 h-11 rounded-full"
                />
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    {activeChat.name}
                  </h2>
                  {activeChat.isTyping && (
                    <p className="text-[11px] text-blue-600 font-medium">typing...</p>
                  )}
                </div>
              </div>
              <button className="text-gray-600 hover:text-gray-900 transition-colors">
                <IoEllipsisVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 thin-scrollbar">
            {mockMessages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.isOutgoing ? "justify-end" : "justify-start"
                }`}
              >
                {!message.isOutgoing && message.senderAvatar && (
                  <img
                    src={message.senderAvatar}
                    alt={message.sender}
                    className="w-8 h-8 rounded-full flex-shrink-0 mt-1"
                  />
                )}
                <div className="flex flex-col space-y-1 max-w-md">
                  <div
                    className={`px-4 py-2.5 rounded-2xl ${
                      message.isOutgoing
                        ? "btn-blue-gradient text-white"
                        : "bg-white/80 text-gray-900 shadow-sm"
                    }`}
                  >
                    <p className="text-[13px] leading-relaxed">{message.text}</p>
                  </div>
                  <div className="flex items-center gap-3 px-1">
                    {message.label && (
                      <span className="text-[11px] text-gray-600 font-medium">
                        {message.label}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400">
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="px-6 py-4 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Reply to David"
                className="flex-1 px-4 py-2.5 rounded-full bg-white/70 border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300"
              />
              <button className="btn-blue-gradient w-11 h-11 rounded-full flex items-center justify-center shadow-md hover:opacity-90 transition-all duration-200 flex-shrink-0">
                <IoSend className="w-4 h-4 text-white" />
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
