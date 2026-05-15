import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { LiveKitRoom, RoomAudioRenderer, useLocalParticipant, useParticipants, AudioTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../store/userSlice';
import { useSocket } from '../../../hooks/useSocket';
import * as innerCircleApi from '../../../api/innerCircle';
import toast from 'react-hot-toast';

// Simple Avatar Component
const Avatar = ({ name, profilePicture, size = "md", isSpeaking = false }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-20 h-20 text-xl",
  };
  
  return (
    <div className={`relative rounded-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold overflow-hidden ${sizeClasses[size]} ${isSpeaking ? 'ring-4 ring-green-500 ring-opacity-50 animate-pulse' : 'ring-2 ring-gray-200'}`}>
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

const normalizeParticipant = (entry, fallbackMap) => {
  const userId = getEntityUserId(entry);
  if (!userId) return null;

  const previous = fallbackMap.get(userId) || null;
  if (typeof entry === 'string' || typeof entry === 'number') {
    return previous || { userId, name: 'User' };
  }

  const firstName =
    entry.firstName || entry.firstname || entry.user?.firstName || entry.user?.firstname;
  const lastName =
    entry.lastName || entry.lastname || entry.user?.lastName || entry.user?.lastname;
  const composedName = [firstName, lastName].filter(Boolean).join(' ').trim();

  return {
    ...previous,
    ...entry,
    userId,
    name:
      entry.name ||
      entry.username ||
      entry.userName ||
      entry.user?.name ||
      composedName ||
      previous?.name ||
      'User',
    username: entry.username || entry.userName || entry.user?.username || previous?.username,
    profilePicture: entry.profilePicture || entry.user?.profilePicture || previous?.profilePicture,
  };
};

const normalizeRoomState = (incomingState, previousState = createEmptyRoomState()) => {
  const state = incomingState || createEmptyRoomState();
  const previous = previousState || createEmptyRoomState();
  const fallbackMap = buildEntityMap(previous.speakers, previous.listeners, previous.queue);

  const speakers = Array.isArray(state.speakers)
    ? state.speakers.map((entry) => normalizeParticipant(entry, fallbackMap)).filter(Boolean)
    : [];

  const listeners = Array.isArray(state.listeners)
    ? state.listeners.map((entry) => normalizeParticipant(entry, fallbackMap)).filter(Boolean)
    : [];

  const queueFallbackMap = buildEntityMap(speakers, listeners, previous.queue);
  const queue = Array.isArray(state.queue)
    ? state.queue.map((entry) => normalizeParticipant(entry, queueFallbackMap)).filter(Boolean)
    : [];

  return { speakers, queue, listeners };
};

const inferIsSpeaker = (roomState, currentUserId, hostId) => {
  if (!currentUserId) return false;
  const me = String(currentUserId);

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
  const { localParticipant } = useLocalParticipant();
  const allParticipants = useParticipants();
  const [isMuted, setIsMuted] = useState(false);
  const [hasRaisedHand, setHasRaisedHand] = useState(false);

  const hostParticipant = useMemo(() => {
    if (!hostId) return null;
    return [...speakers, ...listeners].find(
      (participant) => String(participant.userId) === String(hostId),
    );
  }, [hostId, speakers, listeners]);

  const hostDisplayName = hostParticipant?.name || hostName || "Host";
  const hostIsSpeaking = useMemo(() => {
    if (!hostId) return false;
    const rtcParticipant = allParticipants.find(
      (participant) => String(participant.identity) === String(hostId),
    );
    return Boolean(rtcParticipant?.isSpeaking);
  }, [allParticipants, hostId]);

  const stageSpeakers = useMemo(
    () => speakers.filter((speaker) => String(speaker.userId) !== String(hostId)),
    [speakers, hostId],
  );

  const stageListeners = useMemo(
    () => listeners.filter((listener) => String(listener.userId) !== String(hostId)),
    [listeners, hostId],
  );

  // Sync mic state with localParticipant
  useEffect(() => {
    if (!localParticipant) return;

    if (isSpeaker) {
      localParticipant.setMicrophoneEnabled(!isMuted).catch(console.error);
      return;
    }

    if (isMuted) setIsMuted(false);
    localParticipant.setMicrophoneEnabled(false).catch(console.error);
  }, [isSpeaker, isMuted, localParticipant]);

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

  const toggleMute = () => setIsMuted(prev => !prev);

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
    if (localParticipant) {
      await localParticipant.setMicrophoneEnabled(false).catch(console.error);
    }
    await onLeave();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-4 rounded-xl shadow-inner relative">
      <RoomAudioRenderer />
      
      {/* Background tracks rendering for remote speakers */}
      <div className="hidden">
        {allParticipants.map((p) => {
          const audioTrack = p.getTrackPublication(Track.Source.Microphone);
          if (audioTrack && audioTrack.isSubscribed && audioTrack.track) {
            return <AudioTrack key={p.identity} trackRef={{ participant: p, source: Track.Source.Microphone, publication: audioTrack }} />;
          }
          return null;
        })}
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            {activeChat?.name} - Inner Circle
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-500">
              {speakers.length + listeners.length} Participants
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">Host</span>
            <span className="font-semibold text-gray-700">{hostDisplayName}</span>
            {isHost && (
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-semibold">
                You are host
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleLeaveRoom}
          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-full font-semibold hover:bg-red-200 transition"
        >
          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M497 273L329 441c-15 15-41 4.5-41-17v-96H152c-13.3 0-24-10.7-24-24v-96c0-13.3 10.7-24 24-24h136V88c0-21.4 25.9-32 41-17l168 168c9.3 9.4 9.3 24.6 0 34zM192 436v-40c0-6.6-5.4-12-12-12H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h84c6.6 0 12-5.4 12-12V76c0-6.6-5.4-12-12-12H96c-53 0-96 43-96 96v256c0 53 43 96 96 96h84c6.6 0 12-5.4 12-12z"></path></svg>
          Leave
        </button>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        {/* Stage / Speakers */}
        <div className="col-span-1 md:col-span-2 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <div className="text-xs uppercase tracking-wide text-gray-500">Host</div>
            <div className="mt-3 flex items-center gap-3">
              <Avatar
                name={hostDisplayName}
                profilePicture={hostParticipant?.profilePicture}
                size="md"
                isSpeaking={hostIsSpeaking}
              />
              <div>
                <div className="text-sm font-semibold text-gray-900">{hostDisplayName}</div>
                <div className="text-xs text-gray-500">
                  {hostIsSpeaking ? "Speaking" : "Host"}
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 border-b border-gray-100 font-semibold text-gray-700">
            Stage ({stageSpeakers.length})
          </div>
          <div className="p-6 flex-1 overflow-y-auto flex flex-wrap gap-8 justify-center content-start">
            {stageSpeakers.length === 0 ? (
              <div className="text-sm text-gray-400">No one else is on stage yet.</div>
            ) : (
              stageSpeakers.map((s) => {
              const rtcParticipant = allParticipants.find(
                (p) => String(p.identity) === String(s.userId),
              );
              const isParticipantSpeaking = rtcParticipant?.isSpeaking || false;
              const isMe = String(s.userId) === String(user?._id);
              const speakerName = s.name || s.username || s.userName || "Speaker";

              return (
                <div key={s.userId} className="flex flex-col items-center gap-2 group relative">
                  <Avatar name={speakerName} profilePicture={s.profilePicture} size="lg" isSpeaking={isParticipantSpeaking} />
                  <span className="font-medium text-gray-800 flex items-center gap-1">
                    {speakerName} {isMe && "(You)"}
                  </span>
                  
                  {canManageSpeakers && !isMe && (
                    <button 
                      onClick={() => handleDemote(s)}
                      className="absolute -top-2 -right-2 bg-gray-800 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"
                      title="Move to listeners"
                    >
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C71.8 304 0 375.8 0 481.3c0 17 13.8 30.7 30.7 30.7H417.3c17 0 30.7-13.8 30.7-30.7C448 375.8 376.2 304 269.7 304H178.3zM608 64H416c-17.7 0-32 14.3-32 32v32c0 17.7 14.3 32 32 32h192c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32z"></path></svg>
                    </button>
                  )}
                </div>
              );
            })
            )}
          </div>
        </div>

        {/* Listeners & Queue */}
        <div className="flex flex-col gap-4 overflow-hidden">
          {canManageSpeakers && queue.length > 0 && (
            <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-200 flex flex-col max-h-60">
              <div className="p-3 bg-yellow-100 font-semibold text-yellow-800 border-b border-yellow-200">Raised Hands ({queue.length})</div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {queue.map(q => {
                  const queueName = q.name || q.username || q.userName || "Listener";
                  const queueHandle = q.username || q.userName;
                  return (
                  <div key={q.userId} className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 truncate">
                      <Avatar name={queueName} size="sm" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-700 truncate">{queueName}</div>
                        {queueHandle && (
                          <div className="text-[11px] text-gray-400 truncate">@{queueHandle}</div>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleApprove(q)}
                      className="text-green-600 hover:text-green-700 bg-green-50 p-1.5 rounded-full transition"
                      title="Approve exactly"
                    >
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path></svg>
                    </button>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-100 font-semibold text-gray-700">
              Listeners ({stageListeners.length})
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {stageListeners.length === 0 ? (
                <div className="text-sm text-gray-400">No listeners yet.</div>
              ) : (
                stageListeners.map((listener) => {
                  const isMe = String(listener.userId) === String(user?._id);
                  const listenerName = listener.name || listener.username || listener.userName || "Listener";
                  const listenerHandle = listener.username || listener.userName;
                  return (
                    <div key={listener.userId} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                      <Avatar name={listenerName} profilePicture={listener.profilePicture} size="sm" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-800 truncate">
                          {listenerName} {isMe && "(You)"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {listenerHandle ? `@${listenerHandle}` : "Listener"}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3 py-4 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex gap-4">
          {isSpeaker ? (
            <button 
              onClick={toggleMute}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white transition ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-800 hover:bg-gray-900'}`}
            >
              {isMuted ? (
                <>
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg"><path d="M633.82 458.1l-157.8-121.38c22.88-29.77 35.98-67.22 35.98-112.72V192c0-17.67-14.32-32-31.98-32s-31.98 14.33-31.98 32v32c0 23.42-6.52 45.03-17.69 63.38L384.85 244.7c1.37-6.08 2.13-12.3 2.13-18.7V64c0-35.35-28.65-64-64-64s-64 28.65-64 64v107.03L38.18 10.63c-12.5-9.63-30.73-7.25-40.35 5.25-9.62 12.5-7.25 30.73 5.25 40.35l582.49 448.2c12.49 9.61 30.73 7.23 40.35-5.27 9.63-12.48 7.24-30.72-5.26-40.35M310.87 348.87l-44.57-34.28C261.2 316.59 256.63 318 251.98 318c-3.15 0-6.19-.52-9.15-1.25L173.34 263.3V192c0-17.67-14.33-32-31.98-32s-31.98 14.33-31.98 32v32c0 74.57 51.13 136.95 120.6 154.26V432H161.98c-17.67 0-31.98 14.33-31.98 32s14.32 32 31.98 32h206.5c1.86 0 3.65-.28 5.43-.53l-63.04-48.49V378.2c49.25-10.74 88.54-47.56 100-95.05L310.87 348.87z"></path></svg> 
                  Unmute
                </>
              ) : (
                <>
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 352 512" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg"><path d="M176 352c53.02 0 96-42.98 96-96V96c0-53.02-42.98-96-96-96S80 42.98 80 96v160c0 53.02 42.98 96 96 96zm160-160h-16c-8.84 0-16 7.16-16 16v48c0 74.8-64.49 134.82-140.79 127.38C96.71 373.97 48 318.11 48 250.3V208c0-8.84-7.16-16-16-16H16c-8.84 0-16 7.16-16 16v40.16c0 89.64 63.97 169.55 152 181.69V464H96c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h160c8.84 0 16-7.16 16-16v-16c0-8.84-7.16-16-16-16h-56v-33.77C285.71 418.47 352 344.9 352 256v-48c0-8.84-7.16-16-16-16z"></path></svg>
                  Mute
                </>
              )}
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleRaiseHand}
                disabled={hasRaisedHand}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition text-white ${hasRaisedHand ? 'bg-yellow-300 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'}`}
              >
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32v208c0 8.8-7.2 16-16 16s-16-7.2-16-16V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v208c0 8.8-7.2 16-16 16s-16-7.2-16-16v-96c0-17.7-14.3-32-32-32s-32 14.3-32 32v184c0 37.7 20.3 72.1 52.8 89.9l46.7 25.5C216.5 491.5 252 512 289.4 512H384c53 0 96-43 96-96V256c0-35.3-28.7-64-64-64h-32c-17.7 0-32 14.3-32 32v112c0 8.8-7.2 16-16 16s-16-7.2-16-16V32z"></path></svg>
                Raise Hand
              </button>
              {hasRaisedHand && (
                <button
                  onClick={handleWithdrawHand}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-bold transition text-white bg-orange-500 hover:bg-orange-600"
                >
                  Withdraw Request
                </button>
              )}
            </div>
          )}
        </div>
        {!isSpeaker && hasRaisedHand && (
          <div className="text-xs text-gray-500">
            Your request is visible to the host.
          </div>
        )}
      </div>
    </div>
  );
};

export const InnerCircleRoom = ({ activeChat, roomId, initialToken, onClose }) => {
  const user = useSelector(selectUser);
  const resolvedRoomId = roomId || activeChat?.event?._id || activeChat?._id || activeChat?.communityId;
  const { socket } = useSocket();
  
  const [token, setToken] = useState(initialToken || null);
  const [roomState, setRoomState] = useState(() => createEmptyRoomState());
  const [error, setError] = useState(null);

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
        setRoomState((prev) => normalizeRoomState(res.data, prev));
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
      setToken(null);
      setRoomState(createEmptyRoomState());
      setError(null);
      onClose();
    }
  }, [resolvedRoomId, socket, onClose]);

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
        setRoomState((prev) => normalizeRoomState({ ...prev, queue: data.queue }, prev));
        return;
      }
      fetchState();
    };

    const onSpeakerApproved = (data) => {
      if (!isCurrentRoomEvent(data)) return;
      const targetUserId = getEventTargetUserId(data);
      const isForCurrentUser =
        !targetUserId || (user?._id && String(targetUserId) === String(user._id));

      if (isForCurrentUser && data.token) {
        setToken(data.token);
        toast.success("You are now a speaker!");
      }
      fetchState();
    };

    const onSpeakerDemoted = (data) => {
      if (!isCurrentRoomEvent(data)) return;
      const targetUserId = getEventTargetUserId(data);
      const isForCurrentUser =
        !targetUserId || (user?._id && String(targetUserId) === String(user._id));

      if (isForCurrentUser && data.token) {
        setToken(data.token);
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

    return () => {
      socket.off('user-joined', onUserJoined);
      socket.off('user-left', onUserLeft);
      socket.off('room-state-changed', onRoomStateChanged);
      socket.off('speaker-queue-updated', onQueueUpdated);
      socket.off('speaker-approved', onSpeakerApproved);
      socket.off('speaker-demoted', onSpeakerDemoted);
    };
  }, [socket, fetchState, isCurrentRoomEvent, user?._id]);

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
    <LiveKitRoom
      serverUrl={import.meta.env.VITE_LIVEKIT_URL}
      token={token}
      connect={true}
      data-lk-theme="default"
      className="w-full flex-1"
    >
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
          setRoomState((prev) => normalizeRoomState({ ...prev, queue }, prev))
        }
        onRefreshState={fetchState}
        queue={roomState.queue}
        speakers={roomState.speakers}
        listeners={roomState.listeners}
      />
    </LiveKitRoom>
  );
};

export default InnerCircleRoom;
