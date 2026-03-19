import { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { selectUser, selectIsLoggedIn } from "../../store/userSlice";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../hooks/useSocket";
import BottomNavBar from "../../components/ui/BottomNavBar";
import { IoMenu } from "react-icons/io5";
import { IoPeopleOutline } from "react-icons/io5";
import { 
  getAllUsers, 
  getConversationWithUser, 
  sendMessage, 
  markConversationAsRead, 
  addReaction, 
  removeReaction, 
  deleteMessageForEveryone, 
  pinUser, 
  unpinUser, 
  getPinnedUsers,
  sendGroupMessage,
  getCommunityGroupMessages,
  getMyGroupConversations,
  markCommunityGroupAsRead,
  getCommunityOnlineMembers,
  addGroupReaction,
  removeGroupReaction,
  deleteGroupMessageForEveryone,
} from "../../api/messages";
import { fetchCommunities as apiFetchCommunities } from "../../api";
import toast from 'react-hot-toast';

// Import subcomponents
import MessagesSidebar from './subcomponents/MessagesSidebar';
import ChatHeader from './subcomponents/ChatHeader';
import MessageList from './subcomponents/MessageList';
import MessageInput from './subcomponents/MessageInput';

const MESSAGES_LIMIT = 30;

const toIdString = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (typeof value._id === 'string') return value._id;
    if (typeof value.id === 'string') return value.id;
  }
  return String(value);
};

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
  const [chatMode, setChatMode] = useState("direct");
  const [activeTab, setActiveTab] = useState("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // API state
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [groupConversations, setGroupConversations] = useState([]);
  const [loadingGroupConversations, setLoadingGroupConversations] = useState(false);
  const [groupOnlineMemberCountMap, setGroupOnlineMemberCountMap] = useState({});
  const [onlineGroupMemberIds, setOnlineGroupMemberIds] = useState(new Set());
  const [discoverCommunities, setDiscoverCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchDebounceRef = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const messageListRef = useRef(null);

  // Socket.IO state
  const { socket, isConnected, onlineUsers } = useSocket();
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  
  // Reaction state
  const [showReactionPickerFor, setShowReactionPickerFor] = useState(null);
  const [reactingToMessage, setReactingToMessage] = useState(null);
  const reactionPickerRef = useRef(null);
  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
  
  // Reply state
  const [replyingTo, setReplyingTo] = useState(null);
  
  // Delete state
  const [deletingMessage, setDeletingMessage] = useState(null);
  
  // Pin state
  const [pinnedUserIds, setPinnedUserIds] = useState(new Set());
  const [pinningUserId, setPinningUserId] = useState(null);

  const activeCommunityId = useMemo(() => {
    if (chatMode !== 'group') return null;
    return activeChat?._id || activeChat?.communityId || null;
  }, [chatMode, activeChat]);

  const normalizeGroupConversation = (item) => {
    const community = item?.community || item || {};
    const normalizedId = community._id || item?.communityId || item?._id;
    return {
      ...community,
      _id: normalizedId,
      communityId: normalizedId,
      name: community.name || item?.name || 'Community',
      coverPhoto: community.coverPhoto || item?.coverPhoto || community.profilePicture,
      unreadCount: item?.unreadCount ?? community.unreadCount ?? 0,
      lastMessage: item?.lastMessage || community.lastMessage || null,
      members: community.members || item?.members || [],
    };
  };
  

  // Fetch all users and pinned users.
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        if (response.data.status === 'success') {
          const allUsers = response.data.data.users;
          // Filter out current user
          const otherUsers = allUsers.filter(u => u._id !== user?._id);
          setUsers(otherUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPinnedUsers = async () => {
      try {
        const response = await getPinnedUsers();
        if (response.data.status === 'success') {
          const pinnedIds = new Set(
            response.data.data.pinnedUsers.map(u => u._id)
          );
          setPinnedUserIds(pinnedIds);
        }
      } catch (error) {
        console.error('Error fetching pinned users:', error);
      }
    };

    const fetchGroupConversations = async () => {
      try {
        setLoadingGroupConversations(true);
        setLoadingCommunities(true);

        const [communitiesResult, conversationsResult] = await Promise.allSettled([
          apiFetchCommunities(user),
          getMyGroupConversations(),
        ]);

        let joinedCommunities = [];
        if (communitiesResult.status === 'fulfilled' && communitiesResult.value?.success) {
          const allCommunities = communitiesResult.value.data || [];
          const joined = allCommunities.filter((community) => community.isMember || community.isOwner);
          const notJoined = allCommunities.filter((community) => !community.isMember && !community.isOwner);

          setDiscoverCommunities(notJoined);
          joinedCommunities = joined
            .map((community) => normalizeGroupConversation(community))
            .filter((community) => Boolean(community._id));
        } else {
          setDiscoverCommunities([]);
        }

        let conversationMap = new Map();
        if (
          conversationsResult.status === 'fulfilled' &&
          conversationsResult.value?.data?.status === 'success'
        ) {
          const rawConversations = conversationsResult.value.data.data?.conversations || conversationsResult.value.data.data || [];
          const normalizedConversations = rawConversations
            .map(normalizeGroupConversation)
            .filter((item) => Boolean(item._id));

          conversationMap = new Map(
            normalizedConversations.map((community) => [community._id, community])
          );
        }

        const mergedJoinedCommunities = joinedCommunities.map((community) => {
          const conversation = conversationMap.get(community._id);
          if (!conversation) {
            return {
              ...community,
              unreadCount: community.unreadCount || 0,
              lastMessage: community.lastMessage || null,
            };
          }

          return {
            ...community,
            unreadCount: conversation.unreadCount ?? community.unreadCount ?? 0,
            lastMessage: conversation.lastMessage || community.lastMessage || null,
          };
        });

        setGroupConversations(mergedJoinedCommunities);

        if (mergedJoinedCommunities.length > 0) {
          const onlineEntries = await Promise.all(
            mergedJoinedCommunities.map(async (community) => {
              try {
                const onlineResponse = await getCommunityOnlineMembers(community._id);
                const onlineMembers = onlineResponse.data?.data?.onlineMembers || [];
                return [community._id, onlineMembers.length];
              } catch {
                return [community._id, 0];
              }
            })
          );

          setGroupOnlineMemberCountMap(Object.fromEntries(onlineEntries));
        } else {
          setGroupOnlineMemberCountMap({});
        }
      } catch (error) {
        console.error('Error fetching group conversations:', error);
        setGroupConversations([]);
        setGroupOnlineMemberCountMap({});
      } finally {
        setLoadingGroupConversations(false);
        setLoadingCommunities(false);
      }
    };

    if (isLoggedIn && user) {
      fetchUsers();
      fetchPinnedUsers();
      fetchGroupConversations();
    }
  }, [isLoggedIn, user]);
  useEffect(() => {
    if (chatMode === 'direct') {
      if (!activeChat || !activeChat.firstname) {
        setActiveChat(null);
      }
      return;
    }

    if (!activeChat || !activeChat.name) {
      setActiveChat(null);
    }
  }, [chatMode, users, groupConversations]);

  // Fetch messages when active chat changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChat) return;

      // Reset pagination state for this conversation
      setCurrentPage(1);
      setHasMoreMessages(false);
      setMessages([]);

      try {
        const response = chatMode === 'group'
          ? await getCommunityGroupMessages(activeChat._id, {
              page: 1,
              limit: MESSAGES_LIMIT,
            })
          : await getConversationWithUser(activeChat._id, {
              page: 1,
              limit: MESSAGES_LIMIT,
            });

        if (response.data.status === 'success') {
          const fetched = response.data.data.messages || [];
          // Backend returns newest-first (index 0 = newest).
          // MessageList uses flex-col-reverse so index 0 renders at the visual bottom.
          setMessages(fetched);
          setHasMoreMessages(fetched.length === MESSAGES_LIMIT);
          if (chatMode === 'group') {
            await markCommunityGroupAsRead(activeChat._id);
          } else {
            await markConversationAsRead(activeChat._id);
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [activeChat, chatMode]);

  useEffect(() => {
    const fetchOnlineMembersForCommunity = async () => {
      if (!activeCommunityId) return;

      try {
        const response = await getCommunityOnlineMembers(activeCommunityId);
        const onlineMembers = response.data?.data?.onlineMembers || [];
        const ids = onlineMembers
          .map((member) => member?._id || member?.userId)
          .filter(Boolean);

        setOnlineGroupMemberIds(new Set(ids));
        setGroupOnlineMemberCountMap((prev) => ({
          ...prev,
          [activeCommunityId]: ids.length,
        }));
      } catch (error) {
        console.error('Error fetching community online members:', error);
      }
    };

    if (chatMode === 'group' && activeCommunityId) {
      fetchOnlineMembersForCommunity();
    } else {
      setOnlineGroupMemberIds(new Set());
    }
  }, [chatMode, activeCommunityId]);

  useEffect(() => {
    if (chatMode !== 'group' || !activeCommunityId) return;

    setGroupConversations((prev) =>
      prev.map((community) =>
        toIdString(community._id) === toIdString(activeCommunityId)
          ? { ...community, unreadCount: 0 }
          : community
      )
    );
  }, [chatMode, activeCommunityId]);

  // Join group-chat rooms after connect (and re-join on reconnect) so live events are received.
  useEffect(() => {
    if (!socket || !isConnected || chatMode !== 'group') return;
    if (!groupConversations.length) return;

    const communityIds = groupConversations
      .map((community) => toIdString(community._id || community.communityId))
      .filter(Boolean);

    if (!communityIds.length) return;

    communityIds.forEach((communityId) => {
      socket.emit('group:join', { communityId });
      socket.emit('community:join', { communityId });
      socket.emit('room:join', { roomType: 'community', roomId: communityId });
    });

    socket.emit('groups:join', { communityIds });
    socket.emit('communities:join', { communityIds });
  }, [socket, isConnected, chatMode, groupConversations]);

  // Ensure currently opened group room is explicitly joined.
  useEffect(() => {
    if (!socket || !isConnected || chatMode !== 'group' || !activeCommunityId) return;

    socket.emit('group:join', { communityId: activeCommunityId });
    socket.emit('community:join', { communityId: activeCommunityId });
    socket.emit('room:join', { roomType: 'community', roomId: activeCommunityId });
  }, [socket, isConnected, chatMode, activeCommunityId]);

  // Load older messages when user scrolls to the top of the chat
  const loadMoreMessages = async () => {
    if (!activeChat || loadingMore || !hasMoreMessages) return;

    setLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const response = chatMode === 'group'
        ? await getCommunityGroupMessages(activeChat._id, {
            page: nextPage,
            limit: MESSAGES_LIMIT,
          })
        : await getConversationWithUser(activeChat._id, {
            page: nextPage,
            limit: MESSAGES_LIMIT,
          });

      if (response.data.status === 'success') {
        const fetched = response.data.data.messages || [];
        if (fetched.length > 0) {
          // Append older messages to the END of the array.
          // In flex-col-reverse the last DOM children render at the VISUAL TOP,
          // so older messages naturally slot in above the existing ones.
          setMessages(prev => [...prev, ...fetched]);
          setCurrentPage(nextPage);
          setHasMoreMessages(fetched.length === MESSAGES_LIMIT);
        } else {
          setHasMoreMessages(false);
        }
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    const getGroupPayload = (raw) => raw?.message || raw;
    const getCommunityId = (raw) => {
      const payload = getGroupPayload(raw);
      return toIdString(payload?.community?._id || payload?.community || payload?.communityId);
    };

    const upsertGroupConversationFromMessage = (messageData) => {
      const payload = getGroupPayload(messageData);
      const communityFromPayload = payload.community || {};
      const communityId = getCommunityId(payload);
      if (!communityId) return;

      setGroupConversations((prev) => {
        const existingIndex = prev.findIndex((c) => c._id === communityId);
        const unreadIncrement = payload.sender?._id === user?._id ? 0 : 1;

        if (existingIndex >= 0) {
          const existing = prev[existingIndex];
          const updated = {
            ...existing,
            lastMessage: payload,
            unreadCount: (existing.unreadCount || 0) + unreadIncrement,
          };
          return [updated, ...prev.filter((_, idx) => idx !== existingIndex)];
        }

        const created = normalizeGroupConversation({
          community: communityFromPayload,
          communityId,
          lastMessage: payload,
          unreadCount: unreadIncrement,
        });
        return [created, ...prev];
      });
    };

    // Listen for new direct messages
    const handleNewMessage = (messageData) => {
      console.log('📨 New message received:', messageData);

      const isForCurrentChat =
        chatMode === 'direct' && (
          (messageData.sender._id === activeChat?._id && messageData.receiver._id === user?._id) ||
          (messageData.sender._id === user?._id && messageData.receiver._id === activeChat?._id)
        );

      if (!isForCurrentChat) return;

      const el = messageListRef.current;
      const wasAtBottom = !el || el.scrollTop < 80;

      setMessages(prev => {
        const exists = prev.some(msg => msg._id === messageData._id);
        if (exists) return prev;
        return [messageData, ...prev];
      });

      if (messageData.receiver._id === user?._id && activeChat) {
        markConversationAsRead(activeChat._id).catch(console.error);
      }

      if (wasAtBottom) {
        setTimeout(() => {
          if (messageListRef.current) messageListRef.current.scrollTop = 0;
        }, 50);
      }
    };

    // Listen for new group messages
    const handleNewGroupMessage = (messageData) => {
      const payload = getGroupPayload(messageData);
      const communityId = getCommunityId(payload);
      if (!communityId) return;

      upsertGroupConversationFromMessage(payload);

      const isForCurrentCommunity =
        chatMode === 'group' && toIdString(activeCommunityId) === toIdString(communityId);
      if (!isForCurrentCommunity) return;

      const el = messageListRef.current;
      const wasAtBottom = !el || el.scrollTop < 80;

      setMessages((prev) => {
        const exists = prev.some((msg) => toIdString(msg._id) === toIdString(payload._id));
        if (exists) return prev;
        return [payload, ...prev];
      });

      if (payload.sender?._id !== user?._id && activeCommunityId) {
        markCommunityGroupAsRead(activeCommunityId).catch(console.error);
      }

      if (wasAtBottom) {
        setTimeout(() => {
          if (messageListRef.current) messageListRef.current.scrollTop = 0;
        }, 50);
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

    const handleGroupTypingStart = ({ communityId, userId }) => {
      if (chatMode !== 'group') return;
      if (toIdString(communityId) !== toIdString(activeCommunityId)) return;
      if (userId === user?._id) return;
      setIsTyping(true);
    };

    const handleGroupTypingStop = ({ communityId }) => {
      if (chatMode !== 'group') return;
      if (toIdString(communityId) !== toIdString(activeCommunityId)) return;
      setIsTyping(false);
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

    const handleGroupMessageRead = ({ communityId, messageIds, readBy }) => {
      if (chatMode !== 'group' || toIdString(communityId) !== toIdString(activeCommunityId)) return;
      if (readBy === user?._id) return;
      setMessages((prev) =>
        prev.map((msg) =>
          messageIds.some((id) => toIdString(id) === toIdString(msg._id))
            ? { ...msg, isRead: true }
            : msg
        )
      );
    };

    const handleGroupMessageDeleted = ({ communityId, messageId }) => {
      if (chatMode !== 'group' || toIdString(communityId) !== toIdString(activeCommunityId)) return;
      setMessages((prev) => prev.filter((msg) => toIdString(msg._id) !== toIdString(messageId)));
    };

    const handleGroupMessageDeletedForEveryone = ({ communityId, messageId }) => {
      if (chatMode !== 'group' || toIdString(communityId) !== toIdString(activeCommunityId)) return;
      setMessages((prev) =>
        prev.map((msg) =>
          toIdString(msg._id) === toIdString(messageId)
            ? { ...msg, isDeletedForEveryone: true }
            : msg
        )
      );
    };

    const handleGroupReactionAdded = ({ communityId, messageId, reaction }) => {
      if (toIdString(communityId) !== toIdString(activeCommunityId)) return;
      setMessages((prev) =>
        prev.map((msg) => {
          if (toIdString(msg._id) !== toIdString(messageId)) return msg;
          const reactions = msg.reactions || [];
          const withoutCurrentUser = reactions.filter((r) => r.user._id !== reaction.user._id);
          return { ...msg, reactions: [...withoutCurrentUser, reaction] };
        })
      );
    };

    const handleGroupReactionRemoved = ({ communityId, messageId, userId: reactionUserId, emoji }) => {
      if (toIdString(communityId) !== toIdString(activeCommunityId)) return;
      setMessages((prev) =>
        prev.map((msg) => {
          if (toIdString(msg._id) !== toIdString(messageId)) return msg;
          const reactions = (msg.reactions || []).filter(
            (r) => !(r.user._id === reactionUserId && r.emoji === emoji)
          );
          return { ...msg, reactions };
        })
      );
    };

    const handleGroupMemberOnline = ({ communityId, userId: memberId }) => {
      const normalizedCommunityId = toIdString(communityId);
      if (!normalizedCommunityId) return;

      setGroupOnlineMemberCountMap((prev) => {
        const current = prev[normalizedCommunityId] || 0;
        return { ...prev, [normalizedCommunityId]: current + 1 };
      });

      if (normalizedCommunityId === toIdString(activeCommunityId)) {
        setOnlineGroupMemberIds((prev) => new Set([...prev, memberId]));
      }
    };

    const handleGroupMemberOffline = ({ communityId, userId: memberId }) => {
      const normalizedCommunityId = toIdString(communityId);
      if (!normalizedCommunityId) return;

      setGroupOnlineMemberCountMap((prev) => {
        const current = prev[normalizedCommunityId] || 0;
        return { ...prev, [normalizedCommunityId]: Math.max(0, current - 1) };
      });

      if (normalizedCommunityId === toIdString(activeCommunityId)) {
        setOnlineGroupMemberIds((prev) => {
          const next = new Set(prev);
          next.delete(memberId);
          return next;
        });
      }
    };

    if (chatMode === 'group') {
      socket.on('group:message:new', handleNewGroupMessage);
      socket.on('group:message:read', handleGroupMessageRead);
      socket.on('group:message:deleted', handleGroupMessageDeleted);
      socket.on('group:message:deleted-for-everyone', handleGroupMessageDeletedForEveryone);
      socket.on('group:reaction:added', handleGroupReactionAdded);
      socket.on('group:reaction:removed', handleGroupReactionRemoved);
      socket.on('group:typing:start', handleGroupTypingStart);
      socket.on('group:typing:stop', handleGroupTypingStop);
      socket.on('group:member:online', handleGroupMemberOnline);
      socket.on('group:member:offline', handleGroupMemberOffline);

      return () => {
        socket.off('group:message:new', handleNewGroupMessage);
        socket.off('group:message:read', handleGroupMessageRead);
        socket.off('group:message:deleted', handleGroupMessageDeleted);
        socket.off('group:message:deleted-for-everyone', handleGroupMessageDeletedForEveryone);
        socket.off('group:reaction:added', handleGroupReactionAdded);
        socket.off('group:reaction:removed', handleGroupReactionRemoved);
        socket.off('group:typing:start', handleGroupTypingStart);
        socket.off('group:typing:stop', handleGroupTypingStop);
        socket.off('group:member:online', handleGroupMemberOnline);
        socket.off('group:member:offline', handleGroupMemberOffline);
      };
    }

    socket.on('message:new', handleNewMessage);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);
    socket.on('message:read', handleMessageRead);
    socket.on('message:deleted', handleMessageDeleted);
    socket.on('message:reaction-added', handleReactionAdded);
    socket.on('message:reaction-removed', handleReactionRemoved);
    socket.on('message:deleted-for-everyone', handleMessageDeletedForEveryone);

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
  }, [socket, isConnected, activeChat, activeCommunityId, chatMode, user]);

  // Handle typing with debounce
  const handleTyping = (value) => {
    setMessageInput(value);
    
    if (!socket || !isConnected || !activeChat) return;

    // Emit typing start
    if (chatMode === 'group') {
      socket.emit('group:typing:start', { communityId: activeChat._id });
    } else {
      socket.emit('typing:start', { receiverId: activeChat._id });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to emit typing stop
    typingTimeoutRef.current = setTimeout(() => {
      if (chatMode === 'group') {
        socket.emit('group:typing:stop', { communityId: activeChat._id });
      } else {
        socket.emit('typing:stop', { receiverId: activeChat._id });
      }
    }, 2000);
  };

  // Send message handler
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeChat || sendingMessage) return;

    setSendingMessage(true);
    try {
      const payload = {
        content: messageInput.trim(),
        messageType: 'text'
      };
      
      // Add replyTo if replying to a message
      if (replyingTo) {
        payload.replyTo = replyingTo._id;
      }
      
      const response = chatMode === 'group'
        ? await sendGroupMessage(activeChat._id, payload)
        : await sendMessage({ ...payload, receiverId: activeChat._id });

      if (response.data.status === 'success') {
        const newMessage = response.data.data.message;
        setMessages(prev => {
          const exists = prev.some(msg => msg._id === newMessage._id);
          if (exists) return prev;
          // Prepend: newest at index 0 = visual bottom in flex-col-reverse
          return [newMessage, ...prev];
        });
        setMessageInput('');
        setReplyingTo(null);

        if (socket && isConnected) {
          if (chatMode === 'group') {
            socket.emit('group:typing:stop', { communityId: activeChat._id });
          } else {
            socket.emit('typing:stop', { receiverId: activeChat._id });
          }
        }

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Always snap to the bottom after sending own message
        setTimeout(() => {
          if (messageListRef.current) messageListRef.current.scrollTop = 0;
        }, 50);
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
      const response = chatMode === 'group'
        ? await addGroupReaction(messageId, { emoji })
        : await addReaction(messageId, { emoji });
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
      const response = chatMode === 'group'
        ? await removeGroupReaction(messageId, { emoji })
        : await removeReaction(messageId, { emoji });
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
      const response = chatMode === 'group'
        ? await deleteGroupMessageForEveryone(messageId)
        : await deleteMessageForEveryone(messageId);
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
      const copyButton = document.activeElement;
      const originalTitle = copyButton?.getAttribute?.('title');
      copyButton?.setAttribute?.('title', 'Copied!');
      toast.success('Message copied to clipboard');
      setTimeout(() => {
        if (originalTitle) {
          copyButton?.setAttribute?.('title', originalTitle);
        }
      }, 1500);
    } catch (error) {
      console.error('Error copying message:', error);
      alert('Failed to copy message');
    }
  };

  // Handle pinning user
  const handlePinUser = async (userId, e) => {
    e.stopPropagation(); // Prevent chat selection
    
    if (pinnedUserIds.has(userId)) {
      // Unpin
      setPinningUserId(userId);
      try {
        const response = await unpinUser(userId);
        if (response.data.status === 'success') {
          setPinnedUserIds(prev => {
            const updated = new Set(prev);
            updated.delete(userId);
            return updated;
          });
          toast.success('Conversation unpinned');
        }
      } catch (error) {
        console.error('Error unpinning user:', error);
        toast.error(error.response?.data?.message || 'Failed to unpin conversation');
      } finally {
        setPinningUserId(null);
      }
    } else {
      // Pin
      setPinningUserId(userId);
      try {
        const response = await pinUser(userId);
        if (response.data.status === 'success') {
          setPinnedUserIds(prev => new Set([...prev, userId]));
          toast.success('Conversation pinned');
        }
      } catch (error) {
        console.error('Error pinning user:', error);
        toast.error(error.response?.data?.message || 'Failed to pin conversation');
      } finally {
        setPinningUserId(null);
      }
    }
  };

  // Sort users: pinned first, then by name
  const sortUsers = (usersList) => {
    return [...usersList].sort((a, b) => {
      const aIsPinned = pinnedUserIds.has(a._id);
      const bIsPinned = pinnedUserIds.has(b._id);
      
      // Pinned users come first
      if (aIsPinned && !bIsPinned) return -1;
      if (!aIsPinned && bIsPinned) return 1;
      
      // Then sort alphabetically by firstname
      return a.firstname.localeCompare(b.firstname);
    });
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

  useEffect(() => {
    setMessageInput('');
    setReplyingTo(null);
    setIsTyping(false);
  }, [chatMode, activeChat?._id]);

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
                onClick={() => {
                  setChatMode('direct');
                  setIsSidebarOpen(true);
                }}
                className={`flex items-center justify-center hover:opacity-90 transition-all duration-200 shadow-md ${
                  chatMode === 'direct' ? 'opacity-100' : 'opacity-70'
                }`}
                title="Open direct chats"
              >
                <IoMenu className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => {
                  setChatMode('group');
                  setIsSidebarOpen(true);
                }}
                className={`flex items-center justify-center hover:opacity-90 transition-all duration-200 shadow-md ${
                  chatMode === 'group' ? 'opacity-100' : 'opacity-70'
                }`}
                title="Open group chats"
              >
                <IoPeopleOutline className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Left Sidebar */}
          <MessagesSidebar
            isSidebarOpen={isSidebarOpen}
            activeChat={activeChat}
            chatMode={chatMode}
            setChatMode={setChatMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchDebounceRef={searchDebounceRef}
            setDebouncedSearch={setDebouncedSearch}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            loading={loading}
            users={users}
            debouncedSearch={debouncedSearch}
            sortUsers={sortUsers}
            pinnedUserIds={pinnedUserIds}
            setActiveChat={setActiveChat}
            onlineUsers={onlineUsers}
            handlePinUser={handlePinUser}
            pinningUserId={pinningUserId}
            groupConversations={groupConversations}
            loadingGroupConversations={loadingGroupConversations}
            groupOnlineMemberCountMap={groupOnlineMemberCountMap}
            loadingCommunities={loadingCommunities}
            discoverCommunities={discoverCommunities}
          />

          {/* Main Chat Area */}
          <div className={`flex-1 flex-col overflow-hidden ml-0 sm:ml-4 mr-0 sm:mr-4 my-0 sm:my-4 rounded-none sm:rounded-2xl bg-white/30 backdrop-blur-sm shadow-sm ${!activeChat ? 'hidden sm:flex' : 'flex'}`}>
            {/* Chat Header */}
            <ChatHeader
              activeChat={activeChat}
              onlineUsers={onlineUsers}
              isConnected={isConnected}
              chatMode={chatMode}
              onlineGroupMemberIds={onlineGroupMemberIds}
              onBackClick={() => setActiveChat(null)}
            />

            {/* Messages List */}
            <MessageList
              activeChat={activeChat}
              messages={messages}
              user={user}
              formatTimestamp={formatTimestamp}
              setReplyingTo={setReplyingTo}
              showReactionPickerFor={showReactionPickerFor}
              setShowReactionPickerFor={setShowReactionPickerFor}
              handleCopyMessage={handleCopyMessage}
              handleDeleteForEveryone={handleDeleteForEveryone}
              deletingMessage={deletingMessage}
              reactionPickerRef={reactionPickerRef}
              commonEmojis={commonEmojis}
              handleToggleReaction={handleToggleReaction}
              isTyping={isTyping}
              messageListRef={messageListRef}
              loadMoreMessages={loadMoreMessages}
              hasMoreMessages={hasMoreMessages}
              loadingMore={loadingMore}
              chatMode={chatMode}
            />

            {/* Message Input */}
            <MessageInput
              activeChat={activeChat}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              user={user}
              messageInput={messageInput}
              handleTyping={handleTyping}
              handleSendMessage={handleSendMessage}
              sendingMessage={sendingMessage}
              chatMode={chatMode}
            />
          </div>
        </div>

        <BottomNavBar />
      </div>
    </>
  );
};

export default Messages;
