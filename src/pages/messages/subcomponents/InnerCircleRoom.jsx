import React, { useEffect, useState, useCallback, useMemo } from 'react';
import '@livekit/components-styles';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../store/userSlice';
import { useSocket } from '../../../hooks/useSocket';
import * as innerCircleApi from '../../../api/innerCircle';
import toast from 'react-hot-toast';
import liveKitService from '../../../services/livekitService';

// Simple Avatar Component
const Avatar = ({ name, profilePicture, size = "md", isSpeaking = false }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-20 h-20 text-2xl",
  };

  return (
    <div className={`relative rounded-full flex items-center justify-center font-bold overflow-hidden shadow-sm transition-all duration-300 ${sizeClasses[size]} ${isSpeaking ? 'ring-4 ring-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-105' : 'ring-2 ring-white/80'} bg-gradient-to-br from-indigo-500 to-sky-400 text-white`}>
      {profilePicture ? (
        <img src={profilePicture} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{name?.charAt(0)?.toUpperCase()}</span>
      )}
    </div>
  );
};

const createEmptyRoomState = () => ({ speakers: [], queue: [], listeners: [] });

const getEntityUserId = (entry) => {
  if (!entry) return null;
  if (typeof entry === 'string' || typeof entry === 'number') return String(entry);
  return String(entry.userId || entry._id || entry.id || entry.user?._id || entry.user?.id || '');
};

const buildEntityMap = (...lists) => {
  const map = new Map();
  lists
    .flat()
    .forEach((entry) => {
      const userId = getEntityUserId(entry);
      if (userId) map.set(userId, entry);
    });
  return map;
};

const normalizeParticipant = (entry, fallbackMap, currentUser = null) => {
  const userId = getEntityUserId(entry);
  if (!userId) return null;

  let previous = fallbackMap.get(userId) || null;
  if (typeof entry === 'string' || typeof entry === 'number') {
    if (previous) {
      entry = previous;
    } else if (currentUser && String(userId) === String(currentUser._id)) {
      entry = currentUser;
    } else {
      return { userId: String(userId), name: 'User' };
    }
  }

  const userObj = entry.user || entry;

  const firstName = userObj.firstName || userObj.firstname;
  const lastName = userObj.lastName || userObj.lastname;
  const composedName = [firstName, lastName].filter(Boolean).join(' ').trim();

  const resolvedName =
    userObj.name ||
    composedName ||
    userObj.userName ||
    userObj.username ||
    previous?.name ||
    'User';

  const resolvedUsername =
    userObj.userName ||
    userObj.username ||
    previous?.username;

  return {
    ...previous,
    ...entry,
    userId,
    name: resolvedName,
    username: resolvedUsername,
    profilePicture: userObj.profilePicture || previous?.profilePicture,
  };
};

const normalizeRoomState = (incomingState, previousState = createEmptyRoomState(), currentUser = null, activeChat = null, allUsers = []) => {
  const state = incomingState || createEmptyRoomState();
  const previous = previousState || createEmptyRoomState();

  const communityMembers = activeChat?.members || activeChat?.community?.members || [];
  const fallbackMap = buildEntityMap(previous.speakers, previous.listeners, previous.queue, communityMembers, allUsers);

  if (currentUser) {
    fallbackMap.set(String(currentUser._id), currentUser);
  }

  const speakers = Array.isArray(state.speakers)
    ? state.speakers.map((entry) => normalizeParticipant(entry, fallbackMap, currentUser)).filter(Boolean)
    : [];

  const listeners = Array.isArray(state.listeners)
    ? state.listeners.map((entry) => normalizeParticipant(entry, fallbackMap, currentUser)).filter(Boolean)
    : [];

  const queueFallbackMap = buildEntityMap(speakers, listeners, previous.queue);
  if (currentUser) queueFallbackMap.set(String(currentUser._id), currentUser);
  const queue = Array.isArray(state.queue)
    ? state.queue.map((entry) => normalizeParticipant(entry, queueFallbackMap, currentUser)).filter(Boolean)
    : [];

  return { speakers, queue, listeners };
};

const inferIsSpeaker = (roomState, currentUserId, hostId) => {
  if (!currentUserId) return false;
  const me = String(currentUserId);

  if (hostId && String(hostId) === me) return true;

  const isListedSpeaker = roomState.speakers.some(
    (speaker) => String(speaker.userId) === me,
  );
  if (isListedSpeaker) return true;

  const isListedListener = roomState.listeners.some(
    (listener) => String(listener.userId) === me,
  );

  if (hostId && String(hostId) === me && !isListedListener) return true;
  return false;
};

const getEventTargetUserId = (payload) =>
  payload?.targetUserId ||
  payload?.targetUser?._id ||
  payload?.userId ||
  payload?.user?._id ||
  payload?.participantId ||
  null;

// Hook to bridge LiveKitService state to React
const useLiveKit = () => {
  const [state, setState] = useState(liveKitService.getState() || {
    connectionState: 'disconnected',
    participants: [],
    localParticipant: null,
    activeSpeakers: [],
    isMicEnabled: false
  });

  useEffect(() => {
    const unsubscribe = liveKitService.subscribe((newState) => {
      setState(newState || {
        connectionState: 'disconnected',
        participants: [],
        localParticipant: null,
        activeSpeakers: [],
        isMicEnabled: false
      });
    });
    return unsubscribe;
  }, []);

  return state;
};

// Main LiveKit UI wrapper
const InnerCircleUI = ({
  roomId,
  activeChat,
  hostId,
  hostName,
  isHost,
  canManageSpeakers,
  isSpeaker,
  onLeave,
  onQueueChange,
  onRefreshState,
  queue,
  speakers,
  listeners,
}) => {
  const user = useSelector(selectUser);
  const lkState = useLiveKit();
  const allParticipants = useMemo(() => {
    const arr = [...(lkState.participants || [])];
    if (lkState.localParticipant) arr.push(lkState.localParticipant);
    return arr;
  }, [lkState.participants, lkState.localParticipant]);

  const activeSpeakersMap = useMemo(() => {
    const map = new Set();
    (lkState.activeSpeakers || []).forEach(speaker => map.add(String(speaker.identity)));
    return map;
  }, [lkState.activeSpeakers]);

  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const canSpeak = isHost || isSpeaker;

  const hostParticipant = useMemo(() => {
    if (!hostId) return null;
    return [...speakers, ...listeners].find(
      (participant) => String(participant.userId) === String(hostId),
    );
  }, [hostId, speakers, listeners]);

  const hostDisplayName = hostParticipant?.name || hostName || "Host";
  const hostIsSpeaking = useMemo(() => {
    if (!hostId) return false;
    return activeSpeakersMap.has(String(hostId));
  }, [activeSpeakersMap, hostId]);

  const stageSpeakers = useMemo(
    () => speakers.filter((speaker) => String(speaker.userId) !== String(hostId)),
    [speakers, hostId],
  );

  const stageListeners = useMemo(
    () => listeners.filter((listener) => String(listener.userId) !== String(hostId)),
    [listeners, hostId],
  );

  // Sync mic state
  useEffect(() => {
    const syncMic = async () => {
      // Only attempt to sync mic if the room is fully connected
      if (lkState.connectionState !== 'connected') return;

      if (canSpeak) {
        if (!lkState.isMicEnabled) {
          try {
            await liveKitService.enableMicrophone();
          } catch(err) {
            console.error("Failed to enable mic:", err);
            toast.error(err.message || "Failed to enable mic");
          }
        }
      } else {
        if (lkState.isMicEnabled) {
          await liveKitService.disableMicrophone();
        }
      }
    };
    syncMic();
  }, [canSpeak, lkState.isMicEnabled, lkState.connectionState]);

  // Check if I'm in queue
  useEffect(() => {
    const myId = user?._id ? String(user._id) : null;
    if (!myId) {
      setHasRaisedHand(false);
      return;
    }

    setHasRaisedHand(
      (queue || []).some((q) => String(q.userId) === myId),
    );
  }, [queue, user?._id]);

  const toggleMute = async () => {
    if (lkState.isMicEnabled) {
      await liveKitService.disableMicrophone();
    } else {
      try {
        await liveKitService.enableMicrophone();
      } catch (err) {
        toast.error(err.message || "Could not access microphone");
      }
    }
  };

  const handleRaiseHand = async () => {
    try {
      const response = await innerCircleApi.requestToSpeak(roomId);
      const updatedQueue = response?.data?.queue || response?.queue;
      if (Array.isArray(updatedQueue)) {
        onQueueChange?.(updatedQueue);
      }
      setHasRaisedHand(true);
      await onRefreshState?.();
      toast.success("Hand raised! Waiting for approval.");
    } catch (err) {
      toast.error("Failed to raise hand.");
    }
  };

  const handleWithdrawHand = async () => {
    try {
      const response = await innerCircleApi.withdrawSpeakRequest(roomId);
      const updatedQueue = response?.data?.queue || response?.queue;
      if (Array.isArray(updatedQueue)) {
        onQueueChange?.(updatedQueue);
      }
      setHasRaisedHand(false);
      await onRefreshState?.();
      toast.success("Hand lowered");
    } catch (err) {
      toast.error("Failed to withdraw request.");
    }
  };

  const handleApprove = async (qUser) => {
    try {
      const targetUserName = qUser.name || qUser.username || qUser.userName;
      await innerCircleApi.approveSpeaker(roomId, qUser.userId, targetUserName);
      await onRefreshState?.();
      toast.success(`${targetUserName || "User"} approved to speak`);
    } catch (err) {
      toast.error("Failed to approve speaker.");
    }
  };

  const handleDemote = async (sUser) => {
    try {
      const targetUserName = sUser.name || sUser.username || sUser.userName;
      await innerCircleApi.demoteSpeaker(roomId, sUser.userId, targetUserName);
      await onRefreshState?.();
      toast.success(`${targetUserName || "User"} demoted to listener`);
    } catch (err) {
      toast.error("Failed to demote speaker.");
    }
  };

  const handleLeaveRoom = async () => {
    await liveKitService.disableMicrophone();
    await onLeave();
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#eff3f9] via-white to-[#f0f4fd] p-4  rounded-2xl relative overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
      
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3"></div>
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 h-18 mb-3 pb-3 border-b border-gray-200/60 relative z-10">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {activeChat?.name}
            </h2>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100/80 backdrop-blur-sm text-red-600 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-red-200">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
              Live
            </div>
          </div>
          
          <div className="mt-1.5 flex flex-wrap items-center gap-2.5 text-[13px]">
            <span className="font-medium text-slate-500 flex items-center gap-1.5 bg-white/60 px-2 py-0.5 rounded-md border border-slate-100">
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M96 224c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm448 0c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm32 32h-64c-17.6 0-33.5 7.1-45.1 18.6 40.3 22.1 68.9 62 75.1 109.4h66c17.7 0 32-14.3 32-32v-32c0-35.3-28.7-64-64-64zm-256 0c61.9 0 112-50.1 112-112S381.9 32 320 32 208 82.1 208 144s50.1 112 112 112zm76.8 32h-8.3c-20.8 10-43.9 16-68.5 16s-47.6-6-68.5-16h-8.3C179.6 288 128 339.6 128 403.2V432c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5 263.1 145.6 256 128 256H64c-35.3 0-64 28.7-64 64v32c0 17.7 14.3 32 32 32h66.1c6.2-47.4 34.8-87.3 75.1-109.4z"></path></svg>
              {speakers.length + listeners.length}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">Host: <span className="font-semibold text-slate-700">{hostDisplayName}</span></span>
            {isHost && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200">
                You are host
              </span>
            )}
            <span className={`ml-auto text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${lkState.connectionState === 'connected' ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-slate-200 text-slate-600'}`}>
              {lkState.connectionState}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isHost && (
            <button
              onClick={() => setShowConfirmEnd(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:text-red-600 hover:border-red-200 shadow-sm transition-all cursor-pointer group text-sm"
            >
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.1em" width="1.1em" xmlns="http://www.w3.org/2000/svg"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><line x1="9" x2="15" y1="9" y2="15"></line><line x1="15" x2="9" y1="9" y2="15"></line></svg>
              End Room
            </button>
          )}
          <button
            onClick={handleLeaveRoom}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 hover:border-red-300 shadow-sm transition-all cursor-pointer group text-sm"
          >
            <svg className="transition-transform group-hover:-translate-x-0.5" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1.1em" width="1.1em" xmlns="http://www.w3.org/2000/svg"><path d="M497 273L329 441c-15 15-41 4.5-41-17v-96H152c-13.3 0-24-10.7-24-24v-96c0-13.3 10.7-24 24-24h136V88c0-21.4 25.9-32 41-17l168 168c9.3 9.4 9.3 24.6 0 34zM192 436v-40c0-6.6-5.4-12-12-12H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h84c6.6 0 12-5.4 12-12V76c0-6.6-5.4-12-12-12H96c-53 0-96 43-96 96v256c0 53 43 96 96 96h84c6.6 0 12-5.4 12-12z"></path></svg>
            Leave
          </button>
        </div>
      </div>

      {/* Main Layout Area - using min-h-0 to allow scrolling */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 relative z-10">
        
        {/* Stage Column */}
        <div className="flex-[3] flex flex-col min-h-0 bg-white/80 backdrop-blur-md rounded-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          
          {/* Host Banner */}
          <div className="p-4 bg-gradient-to-r from-indigo-50/50 to-transparent border-b border-slate-100">
            <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-2">Host</div>
            <div className="flex items-center gap-3">
              <Avatar
                name={hostDisplayName}
                profilePicture={hostParticipant?.profilePicture}
                size="md"
                isSpeaking={hostIsSpeaking}
              />
              <div>
                <div className="text-sm font-bold text-slate-800">{hostDisplayName}</div>
                <div className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-1.5">
                  {hostIsSpeaking ? (
                    <span className="text-indigo-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                    </span>
                  ) : "Listening..."}
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-5 py-2.5 bg-white/50 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Stage
            </span>
            <span className="bg-slate-100 text-slate-600 py-0.5 px-2 rounded-md text-[10px] font-bold">
              {stageSpeakers.length}
            </span>
          </div>

          {/* Speakers Grid - flexible area with internal scrolling */}
          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            {stageSpeakers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" height="1.8em" width="1.8em" className="text-slate-300" xmlns="http://www.w3.org/2000/svg"><path d="M192 256A112 112 0 1 0 80 144a111.94 111.94 0 0 0 112 112zm76.8 32h-8.3c-20.8 10-43.9 16-68.5 16s-47.6-6-68.5-16h-8.3C88.4 288 40 336.4 40 396.8V432c0 26.5 21.5 48 48 48h208c26.5 0 48-21.5 48-48v-35.2c0-60.4-48.4-108.8-108.8-108.8zM560 256a112 112 0 1 0-112-112 111.94 111.94 0 0 0 112 112zm-76.8 32h-8.3c-20.8 10-43.9 16-68.5 16s-47.6-6-68.5-16h-8.3c-60.4 0-108.8 48.4-108.8 108.8V432c0 26.5 21.5 48 48 48h208c26.5 0 48-21.5 48-48v-35.2c0-60.4-48.4-108.8-108.8-108.8z"></path></svg>
                </div>
                <p className="text-sm font-medium text-slate-400">The stage is waiting for speakers.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-8 justify-center items-start content-start">
                {stageSpeakers.map((s) => {
                  const isParticipantSpeaking = activeSpeakersMap.has(String(s.userId));
                  const isMe = String(s.userId) === String(user?._id);
                  const speakerName = s.name || s.username || s.userName || "Speaker";

                  return (
                    <div key={s.userId} className="flex flex-col items-center gap-3 group relative w-24">
                      <Avatar name={speakerName} profilePicture={s.profilePicture} size="lg" isSpeaking={isParticipantSpeaking} />
                      <div className="text-center">
                        <span className="font-semibold text-sm text-slate-800 line-clamp-1 leading-tight">
                          {speakerName}
                        </span>
                        {isMe && <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">YOU</span>}
                      </div>

                      {canManageSpeakers && !isMe && (
                        <button
                          onClick={() => handleDemote(s)}
                          className="absolute -top-1 -right-1 bg-slate-800 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl hover:scale-110 hover:bg-red-500 cursor-pointer z-10"
                          title="Move to listeners"
                        >
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C71.8 304 0 375.8 0 481.3c0 17 13.8 30.7 30.7 30.7H417.3c17 0 30.7-13.8 30.7-30.7C448 375.8 376.2 304 269.7 304H178.3zM608 64H416c-17.7 0-32 14.3-32 32v32c0 17.7 14.3 32 32 32h192c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32z"></path></svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Listeners & Queue */}
        <div className="flex-[2] flex flex-col gap-4 min-h-0">
          
          {/* Raised Hands Queue */}
          {canManageSpeakers && queue.length > 0 && (
            <div className="flex flex-col max-h-[45%] bg-amber-50/80 backdrop-blur-md rounded-2xl border border-amber-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden shrink-0">
              <div className="px-4 py-2.5 bg-gradient-to-r from-amber-100/80 to-transparent border-b border-amber-200/50 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Raised Hands
                </span>
                <span className="bg-amber-200 text-amber-800 py-0.5 px-2 rounded-md text-[10px] font-bold">
                  {queue.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
                {queue.map(q => {
                  const queueName = q.name || q.username || q.userName || "Listener";
                  const queueHandle = q.username || q.userName;
                  return (
                    <div key={q.userId} className="flex items-center justify-between bg-white p-2.5 rounded-xl shadow-sm border border-amber-100 hover:border-amber-200 transition-colors">
                      <div className="flex items-center gap-3 truncate pr-2">
                        <Avatar name={queueName} profilePicture={q.profilePicture} size="md" />
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-800 truncate">{queueName}</div>
                          {queueHandle && (
                            <div className="text-[10px] font-medium text-slate-400 truncate">@{queueHandle}</div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleApprove(q)}
                        className="shrink-0 text-emerald-700 hover:text-white bg-emerald-100 hover:bg-emerald-500 px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                        title="Approve to speak"
                      >
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1.1em" width="1.1em" xmlns="http://www.w3.org/2000/svg"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path></svg>
                        Accept
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Listeners Container */}
          <div className="flex-1 flex flex-col min-h-0 bg-white/80 backdrop-blur-md rounded-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Listeners
              </span>
              <span className="bg-slate-200 text-slate-600 py-0.5 px-2 rounded-md text-[10px] font-bold">
                {stageListeners.length}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {stageListeners.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <p className="text-sm font-medium text-slate-400">No listeners yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {stageListeners.map((listener) => {
                    const isMe = String(listener.userId) === String(user?._id);
                    const listenerName = listener.name || listener.username || listener.userName || "Listener";
                    const listenerHandle = listener.username || listener.userName;
                    return (
                      <div key={listener.userId} className="flex items-center gap-3 bg-white hover:bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 transition-colors">
                        <Avatar name={listenerName} profilePicture={listener.profilePicture} size="sm" />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-800 truncate flex items-center gap-2">
                            {listenerName}
                            {isMe && <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">YOU</span>}
                          </div>
                          {listenerHandle && (
                            <div className="text-[11px] font-medium text-slate-400 truncate">
                              @{listenerHandle}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="mt-5 flex-shrink-0 flex flex-col sm:flex-row justify-center items-center gap-3 py-3.5 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white relative z-10">
        <div className="flex gap-4">
            {canSpeak ? (
            <button
              onClick={toggleMute}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-white transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5 ${!lkState.isMicEnabled ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/20' : 'bg-gradient-to-r from-slate-700 to-slate-900 shadow-slate-900/20'}`}
            >
              {!lkState.isMicEnabled ? (
                <>
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" height="1.3em" width="1.3em" xmlns="http://www.w3.org/2000/svg"><path d="M633.82 458.1l-157.8-121.38c22.88-29.77 35.98-67.22 35.98-112.72V192c0-17.67-14.32-32-31.98-32s-31.98 14.33-31.98 32v32c0 23.42-6.52 45.03-17.69 63.38L384.85 244.7c1.37-6.08 2.13-12.3 2.13-18.7V64c0-35.35-28.65-64-64-64s-64 28.65-64 64v107.03L38.18 10.63c-12.5-9.63-30.73-7.25-40.35 5.25-9.62 12.5-7.25 30.73 5.25 40.35l582.49 448.2c12.49 9.61 30.73 7.23 40.35-5.27 9.63-12.48 7.24-30.72-5.26-40.35M310.87 348.87l-44.57-34.28C261.2 316.59 256.63 318 251.98 318c-3.15 0-6.19-.52-9.15-1.25L173.34 263.3V192c0-17.67-14.33-32-31.98-32s-31.98 14.33-31.98 32v32c0 74.57 51.13 136.95 120.6 154.26V432H161.98c-17.67 0-31.98 14.33-31.98 32s14.32 32 31.98 32h206.5c1.86 0 3.65-.28 5.43-.53l-63.04-48.49V378.2c49.25-10.74 88.54-47.56 100-95.05L310.87 348.87z"></path></svg>
                  Unmute
                </>
              ) : (
                <>
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 352 512" height="1.3em" width="1.3em" xmlns="http://www.w3.org/2000/svg"><path d="M176 352c53.02 0 96-42.98 96-96V96c0-53.02-42.98-96-96-96S80 42.98 80 96v160c0 53.02 42.98 96 96 96zm160-160h-16c-8.84 0-16 7.16-16 16v48c0 74.8-64.49 134.82-140.79 127.38C96.71 373.97 48 318.11 48 250.3V208c0-8.84-7.16-16-16-16H16c-8.84 0-16 7.16-16 16v40.16c0 89.64 63.97 169.55 152 181.69V464H96c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h160c8.84 0 16-7.16 16-16v-16c0-8.84-7.16-16-16-16h-56v-33.77C285.71 418.47 352 344.9 352 256v-48c0-8.84-7.16-16-16-16z"></path></svg>
                  Mute
                </>
              )}
            </button>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleRaiseHand}
                disabled={hasRaisedHand}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-full font-bold transition-all duration-300 text-white shadow-md hover:-translate-y-0.5 ${hasRaisedHand ? 'bg-amber-300 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/30 hover:shadow-lg cursor-pointer'}`}
              >
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1.3em" width="1.3em" xmlns="http://www.w3.org/2000/svg"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32v208c0 8.8-7.2 16-16 16s-16-7.2-16-16V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v208c0 8.8-7.2 16-16 16s-16-7.2-16-16v-96c0-17.7-14.3-32-32-32s-32 14.3-32 32v184c0 37.7 20.3 72.1 52.8 89.9l46.7 25.5C216.5 491.5 252 512 289.4 512H384c53 0 96-43 96-96V256c0-35.3-28.7-64-64-64h-32c-17.7 0-32 14.3-32 32v112c0 8.8-7.2 16-16 16s-16-7.2-16-16V32z"></path></svg>
                {hasRaisedHand ? 'Request Sent' : 'Raise Hand'}
              </button>
              {hasRaisedHand && (
                <button
                  onClick={handleWithdrawHand}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-200 text-white bg-slate-400 hover:bg-slate-500 cursor-pointer"
                >
                  Withdraw
                </button>
              )}
            </div>
          )}
        </div>
        {!isSpeaker && hasRaisedHand && (
          <div className="absolute -top-7 text-[11px] font-medium text-slate-500 bg-white/80 px-3 py-1 rounded-full shadow-sm border border-slate-100">
            Waiting for host to approve...
          </div>
        )}
      </div>

      {/* Confirmation End Modal */}
      {showConfirmEnd && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm rounded-2xl">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full mx-4 transform transition-all">
            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <h3 className="text-xl font-bold text-center text-slate-800 mb-2">End Inner Circle?</h3>
            <p className="text-sm text-center text-slate-500 mb-6">
              Are you sure you want to end this Inner Circle? This will disconnect all participants and close the room permanently.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmEnd(false)}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  try {
                    await innerCircleApi.endInnerCircle(roomId);
                    toast.success("Inner Circle ended successfully");
                    window.location.reload();
                  } catch (error) {
                    toast.error("Failed to end Inner Circle");
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold shadow-md shadow-red-500/20 transition-all cursor-pointer"
              >
                End Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const InnerCircleRoom = ({ activeChat, roomId, initialToken, onClose, allUsers = [] }) => {
  const user = useSelector(selectUser);
  const resolvedRoomId = roomId || activeChat?.event?._id || activeChat?._id || activeChat?.communityId;
  const { socket } = useSocket();

  const [token, setToken] = useState(initialToken || null);
  const [roomState, setRoomState] = useState(() => createEmptyRoomState());
  const [error, setError] = useState(null);
  const [roomEndedByHost, setRoomEndedByHost] = useState(false);

  const hostId = activeChat?.event?.createdBy?._id || activeChat?.event?.createdBy;
  const hostName = useMemo(() => {
    const createdBy = activeChat?.event?.createdBy;
    if (!createdBy || typeof createdBy === "string") return "Host";
    const firstName = createdBy.firstName || createdBy.firstname;
    const lastName = createdBy.lastName || createdBy.lastname;
    return [firstName, lastName].filter(Boolean).join(" ") || "Host";
  }, [activeChat]);
  const isHost = Boolean(hostId && user?._id && String(hostId) === String(user._id));
  const canManageSpeakers = isHost;
  const hasFetchedRoleState = roomState.speakers.length > 0 || roomState.listeners.length > 0;
  const isSpeaker = hasFetchedRoleState
    ? inferIsSpeaker(roomState, user?._id, hostId)
    : isHost;

  const isCurrentRoomEvent = useCallback(
    (payload) => {
      const payloadRoomId = payload?.roomId || payload?.eventId || payload?.innerCircleRoomId;
      if (!payloadRoomId) return true;
      return String(payloadRoomId) === String(resolvedRoomId);
    },
    [resolvedRoomId],
  );

  const fetchState = useCallback(async () => {
    if (!resolvedRoomId) return;
    try {
      const res = await innerCircleApi.getInnerCircleState(resolvedRoomId);
      if (res.status === 'success') {
        setRoomState((prev) => normalizeRoomState(res.data, prev, user, activeChat, allUsers));
      }
    } catch (err) {
      console.error("Failed to fetch room state", err);
    }
  }, [resolvedRoomId]);

  useEffect(() => {
    setToken(initialToken || null);
  }, [initialToken]);

  useEffect(() => {
    if (!resolvedRoomId || !token) return;
    if (socket) {
      socket.emit('inner-circle:join', { roomId: resolvedRoomId });
    }
    fetchState();
  }, [resolvedRoomId, token, socket, fetchState]);

  // Handle LiveKit connection explicitly whenever token changes
  useEffect(() => {
    if (!token) return;
    let isMounted = true;
    const connectLiveKit = async () => {
      try {
        const livekitUrl = import.meta.env.VITE_LIVEKIT_URL;
        await liveKitService.connect(livekitUrl, token);
      } catch(err) {
        if (!isMounted) return; // Ignore errors if component unmounted
        if (err.message === 'Client initiated disconnect' || err.message.includes('Client initiated disconnect')) {
          console.warn('LiveKit connect aborted due to intentional disconnect.');
          return;
        }
        console.error("Failed to connect to LiveKit", err);
        setError(`Failed to connect to the voice room: ${err.message || 'Unknown error'}`);
      }
    };
    connectLiveKit();
    
    return () => {
      isMounted = false;
    };
  }, [token]);

  // Handle Unmount / Leave
  const handleLeave = useCallback(async () => {
    if (!resolvedRoomId) {
      onClose();
      return;
    }
    try {
      if (socket) socket.emit('inner-circle:leave', { roomId: resolvedRoomId });
      await innerCircleApi.leaveInnerCircle(resolvedRoomId);
    } catch (err) {
      console.error(err);
    } finally {
      onClose();
      liveKitService.disconnect().catch(console.error);
    }
  }, [resolvedRoomId, socket, onClose]);

  useEffect(() => {
    return () => {
      liveKitService.disconnect();
    };
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const getToastName = (payload) => {
      const directName = payload?.name;
      const userName = payload?.user?.name;
      const fullName = [payload?.user?.firstName, payload?.user?.lastName]
        .filter(Boolean)
        .join(" ");
      return directName || userName || fullName || "Someone";
    };

    const onUserJoined = (data) => {
      if (!isCurrentRoomEvent(data)) return;
      fetchState();
      const joinedId = data?.userId || data?.user?._id;
      if (joinedId && user?._id && String(joinedId) === String(user._id)) return;
      toast.success(`${getToastName(data)} joined the room`);
    };
    const onUserLeft = (data) => {
      if (!isCurrentRoomEvent(data)) return;
      fetchState();
      const leftId = data?.userId || data?.user?._id;
      if (leftId && user?._id && String(leftId) === String(user._id)) return;
      toast(`${getToastName(data)} left the room`, { icon: "👋" });
    };
    const onRoomStateChanged = (data) => {
      if (!isCurrentRoomEvent(data)) return;
      fetchState();
    };

    const onQueueUpdated = (data) => {
      if (!isCurrentRoomEvent(data)) return;
      if (Array.isArray(data?.queue)) {
        setRoomState((prev) => normalizeRoomState({ ...prev, queue: data.queue }, prev, user, activeChat, allUsers));
        return;
      }
      fetchState();
    };

    const onSpeakerApproved = async (data) => {
      if (!isCurrentRoomEvent(data)) return;
      const targetUserId = getEventTargetUserId(data);
      const isForCurrentUser =
        !targetUserId || (user?._id && String(targetUserId) === String(user._id));

      if (isForCurrentUser && data.token) {
        // According to checklist:
        // 1. disconnect existing room
        // 2. reconnect using new token
        // 3. enable microphone
        await liveKitService.disconnect();
        setToken(data.token); // Will trigger useEffect to reconnect
        
        toast.success("You are now a speaker!");
      }
      fetchState();
    };

    const onSpeakerDemoted = async (data) => {
      if (!isCurrentRoomEvent(data)) return;
      const targetUserId = getEventTargetUserId(data);
      const isForCurrentUser =
        !targetUserId || (user?._id && String(targetUserId) === String(user._id));

      if (isForCurrentUser && data.token) {
        // According to checklist:
        // 1. disable mic
        // 2. disconnect
        // 3. reconnect with listener token
        await liveKitService.disableMicrophone();
        await liveKitService.disconnect();
        setToken(data.token); // Will trigger useEffect to reconnect

        toast.info("You've been moved to listeners.");
      }
      fetchState();
    };

    socket.on('user-joined', onUserJoined);
    socket.on('user-left', onUserLeft);
    socket.on('room-state-changed', onRoomStateChanged);
    socket.on('speaker-queue-updated', onQueueUpdated);
    socket.on('speaker-approved', onSpeakerApproved);
    socket.on('speaker-demoted', onSpeakerDemoted);

    const onRoomEnded = (data) => {
      if (!isCurrentRoomEvent(data)) return;
      setRoomEndedByHost(true);
    };
    socket.on('room-ended', onRoomEnded);

    return () => {
      socket.off('user-joined', onUserJoined);
      socket.off('user-left', onUserLeft);
      socket.off('room-state-changed', onRoomStateChanged);
      socket.off('speaker-queue-updated', onQueueUpdated);
      socket.off('speaker-approved', onSpeakerApproved);
      socket.off('speaker-demoted', onSpeakerDemoted);
      socket.off('room-ended', onRoomEnded);
    };
  }, [socket, fetchState, isCurrentRoomEvent, user?._id]);

  if (roomEndedByHost) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/90 backdrop-blur-md h-full w-full rounded-2xl relative z-50">
        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full mx-4 text-center transform transition-all scale-100 animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-6 mx-auto">
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" height="3em" width="3em" xmlns="http://www.w3.org/2000/svg"><path d="M192 256A112 112 0 1 0 80 144a111.94 111.94 0 0 0 112 112zm76.8 32h-8.3c-20.8 10-43.9 16-68.5 16s-47.6-6-68.5-16h-8.3C88.4 288 40 336.4 40 396.8V432c0 26.5 21.5 48 48 48h208c26.5 0 48-21.5 48-48v-35.2c0-60.4-48.4-108.8-108.8-108.8zM560 256a112 112 0 1 0-112-112 111.94 111.94 0 0 0 112 112zm-76.8 32h-8.3c-20.8 10-43.9 16-68.5 16s-47.6-6-68.5-16h-8.3c-60.4 0-108.8 48.4-108.8 108.8V432c0 26.5 21.5 48 48 48h208c26.5 0 48-21.5 48-48v-35.2c0-60.4-48.4-108.8-108.8-108.8z"></path></svg>
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Room Ended</h3>
          <p className="text-base text-slate-500 mb-8 leading-relaxed">
            The host has permanently ended this Inner Circle. Thank you for participating!
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-sky-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50 h-full w-full rounded-2xl">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M256 48C141.6 48 48 141.6 48 256s93.6 208 208 208 208-93.6 208-208S370.4 48 256 48zm0 336c-13.3 0-24-10.7-24-24s10.7-24 24-24 24 10.7 24 24-10.7 24-24 24zm32-104c0 17.7-14.3 32-32 32s-32-14.3-32-32V176c0-17.7 14.3-32 32-32s32 14.3 32 32v104z"></path></svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800">{error}</h3>
        <button onClick={onClose} className="mt-6 px-6 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 font-medium">Go Back</button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white h-full w-full rounded-2xl">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Connecting to Inner Circle...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col min-h-0">
      <InnerCircleUI
        roomId={resolvedRoomId}
        activeChat={activeChat}
        hostId={hostId}
        hostName={hostName}
        isHost={isHost}
        canManageSpeakers={canManageSpeakers}
        isSpeaker={isSpeaker}
        onLeave={handleLeave}
        onQueueChange={(queue) =>
          setRoomState((prev) => normalizeRoomState({ ...prev, queue }, prev, user, activeChat, allUsers))
        }
        onRefreshState={fetchState}
        queue={roomState.queue}
        speakers={roomState.speakers}
        listeners={roomState.listeners}
      />
    </div>
  );
};

export default InnerCircleRoom;
