import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState, useImperativeHandle } from 'react';
import { useSelector } from 'react-redux';
import { deleteJournalByUser, getJournalById, getJournalByUser } from '../../../api';
import { estimateReadTimeMin, formatRelativeTimeCompact, getInitials } from '../../../utils/profileUtils';
import { FaTrash, FaLock, FaGlobeAmericas } from 'react-icons/fa';
import { FiLink } from 'react-icons/fi';
import ConfirmModal from './ConfirmModal';
import { selectUser } from '../../../store/userSlice';
import CreateJournalModal from './CreateJournalModal';

const MOODS = [
  {
    label: 'Joyful',
    emoji: '😊',
    pillClass: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    pillClassActive: 'bg-yellow-200 text-yellow-800',
  },
  {
    label: 'Peaceful',
    emoji: '😌',
    pillClass: 'bg-teal-100 text-teal-700 hover:bg-teal-200',
    pillClassActive: 'bg-teal-200 text-teal-800',
  },
  {
    label: 'Sad',
    emoji: '😢',
    pillClass: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    pillClassActive: 'bg-blue-200 text-blue-800',
  },
  {
    label: 'Grateful',
    emoji: '🙏',
    pillClass: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    pillClassActive: 'bg-orange-200 text-orange-800',
  },
  {
    label: 'Inspired',
    emoji: '✨',
    pillClass: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    pillClassActive: 'bg-purple-200 text-purple-800',
  },
];

const moodMetaByLabel = new Map(MOODS.map((m) => [m.label, m]));

const Journal = forwardRef(({ userProfile, onOpenLinkedPrayer }, ref) => {
  const viewer = useSelector(selectUser);
  // When null, no filter is applied (show all journals). This should be the default on page load.
  const [activeMood, setActiveMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [journals, setJournals] = useState([]);
  const [expandedById, setExpandedById] = useState({});
  const descriptionRefs = useRef({});
  const [maxHeightById, setMaxHeightById] = useState({});

  // Delete modal + flow (mirrors Testimony delete behavior)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editInitialData, setEditInitialData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Create modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const userId = useMemo(() => {
    const nestedUser = userProfile?.user;
    if (typeof nestedUser === 'string') return nestedUser;
    return nestedUser?._id || nestedUser?.id || userProfile?.userId || userProfile?._id || null;
  }, [userProfile]);

  const isOwner = useMemo(() => {
    const viewerId = viewer?._id || viewer?.id || viewer?.user?._id;
    return Boolean(viewerId && userId && String(viewerId) === String(userId));
  }, [userId, viewer]);

  // Expose create action to Profile tab button (same pattern as Posts/Testimony)
  useImperativeHandle(ref, () => ({
    openCreateModal: () => {
      if (!isOwner) return;
      setIsCreateOpen(true);
    },
    refresh: () => setRefreshKey((k) => k + 1),
  }));

  const fetchJournals = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setJournals([]);
      return;
    }

    try {
      setLoading(true);
      setError('');
  const res = await getJournalByUser(userId);
  // API can return either { data: { journals: [] } } or { data: { journal: {} } }
  const items = res?.data?.journals ?? (res?.data?.journal ? [res.data.journal] : []);
      setJournals(Array.isArray(items) ? items : []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load journal.');
      setJournals([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchJournals();
  }, [fetchJournals, refreshKey]);

  const requestDelete = useCallback((journalId) => {
    if (!journalId) return;
    setError('');
    setEditError('');
    setDeleteTargetId(journalId);
    setIsDeleteOpen(true);
  }, []);

  const openEditModal = useCallback(async (journalId) => {
    if (!journalId) return;
    setError('');
    setEditError('');
    setEditLoading(true);

    try {
      const res = await getJournalById(journalId);
      const journal = res?.data?.journal;
      if (!journal?._id) throw new Error('Journal not found.');
      setEditInitialData({ ...journal, id: journal._id });
      setIsEditOpen(true);
    } catch (err) {
      setEditError(err?.response?.data?.message || err?.message || 'Failed to load journal.');
    } finally {
      setEditLoading(false);
    }
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTargetId) return;
    if (deleteLoading) return;

    setError('');
    setDeleteLoading(true);
    try {
      await deleteJournalByUser(deleteTargetId);
      setIsDeleteOpen(false);
      setDeleteTargetId(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to delete journal.');
      // Keep dialog open so user can retry/cancel
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteLoading, deleteTargetId]);

  const moodOption = useMemo(() => {
    // Fallback used only for UI bits that need a mood meta.
    // Don't force a default mood when no filter is selected.
    return activeMood ? moodMetaByLabel.get(activeMood) ?? null : null;
  }, [activeMood]);

  const filteredJournals = useMemo(() => {
    const list = Array.isArray(journals) ? journals : [];
    if (!activeMood) return list;
    return list.filter((j) => (j?.mood || '').toLowerCase() === activeMood.toLowerCase());
  }, [activeMood, journals]);

  const displayedJournals = filteredJournals;

  useEffect(() => {
    const nextHeights = {};

    for (const journal of displayedJournals) {
      const journalId = journal?.id ?? journal?._id;
      const el = journalId ? descriptionRefs.current[journalId] : null;
      if (journalId && el) {
        nextHeights[journalId] = el.scrollHeight;
      }
    }

    setMaxHeightById((prev) => {
      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(nextHeights);
      const sameLength = prevKeys.length === nextKeys.length;
      const sameValues = sameLength && nextKeys.every((key) => prev[key] === nextHeights[key]);
      return sameValues ? prev : nextHeights;
    });
  }, [displayedJournals]);

  const authorName = useMemo(() => {
    const first = userProfile?.user?.firstname || userProfile?.firstname || '';
    const last = userProfile?.user?.lastname || userProfile?.lastname || '';
    return `${first} ${last}`.trim() || userProfile?.user?.username || userProfile?.username || 'User';
  }, [userProfile]);

  const authorHandle = useMemo(() => {
    const u = userProfile?.user?.username || userProfile?.username;
    return u ? `@${u}` : null;
  }, [userProfile]);

  const authorProfilePicture = useMemo(() => {
    // ProfileHeader uses `userProfile.profilePicture`, but some APIs nest it.
    // Also allow fallback to the journal entry populated author (if backend returns it).
    return (
      userProfile?.profilePicture ||
      userProfile?.profile?.profilePicture ||
    displayedJournals?.[0]?.author?.profile?.profilePicture ||
      null
    );
  }, [displayedJournals, userProfile?.profile?.profilePicture, userProfile?.profilePicture]);

  return (
    <div className="w-full px-4 md:px-1 py-1">
      <CreateJournalModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          setIsCreateOpen(false);
          setRefreshKey((k) => k + 1);
        }}
      />

      <CreateJournalModal
        isOpen={isEditOpen}
        initialData={editInitialData}
        onClose={() => {
          if (editLoading) return;
          setIsEditOpen(false);
          setEditInitialData(null);
          setEditError('');
        }}
        onSuccess={() => {
          setIsEditOpen(false);
          setEditInitialData(null);
          setEditError('');
          setRefreshKey((k) => k + 1);
        }}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          if (deleteLoading) return;
          setIsDeleteOpen(false);
          setDeleteTargetId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete journal entry?"
        description="This action can't be undone."
        confirmLabel={deleteLoading ? 'Deleting…' : 'Delete'}
        cancelLabel="Cancel"
      />

      {editError ? (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {editError}
        </div>
      ) : null}

      {/* Filter Tabs */}
      <div className="w-full bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-3 overflow-x-auto">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by mood:</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveMood(null)}
            className={
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150 ring-1 ring-black/5 cursor-pointer ' +
              (activeMood === null
                ? 'bg-gray-200 text-gray-900 shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 opacity-90')
            }
          >
            All
          </button>

          {MOODS.map((mood) => {
            const isActive = activeMood === mood.label;
            return (
              <button
                key={mood.label}
                type="button"
                onClick={() => setActiveMood((prev) => (prev === mood.label ? null : mood.label))}
                className={
                  `px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150 ring-1 ring-black/5 cursor-pointer ` +
                  (isActive
                    ? `${mood.pillClassActive ?? mood.pillClass} shadow-sm`
                    : `${mood.pillClass} opacity-90`)
                }
              >
                <span className="mr-2">{mood.emoji}</span>
                {mood.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Header */}
      <div className="mt-3">
        <h2 className="text-2xl font-semibold text-gray-900">
          {isOwner ? 'My Faith Journal' : `${authorName}'s Faith Journal`}
        </h2>
        <p className="text-[15px] text-gray-800 mt-1">
          {isOwner 
            ? 'Reflect on your spiritual journey and track your emotional wellness'
            : 'Explore spiritual reflections and emotional wellness'}
        </p>
      </div>

      {/* Cards */}
      <div className="mt-6 space-y-5">
        {/* Loading / empty / error wrapper */}
          {loading ? (
            <div className="py-10 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="py-10 text-center">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : displayedJournals.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📔</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Journal Entries Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {isOwner 
                  ? "You haven't created any journal entries yet. Start documenting your spiritual journey and daily reflections."
                  : `${authorName} hasn't shared any public journal entries yet.`}
              </p>
              {isOwner && (
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="btn-blue-gradient text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition cursor-pointer"
                >
                  Create Your First Entry
                </button>
              )}
            </div>
          ) : (
            displayedJournals.map((j) => {
              const journalMood = String(j?.mood || '');
              const meta = moodMetaByLabel.get(journalMood) ?? moodOption ?? MOODS[0];

              const isExpanded = Boolean(expandedById[j?.id ?? j?._id]);
              const journalId = j?.id ?? j?._id;
              const maxHeight = maxHeightById[journalId] ?? 96;
              const linkedPrayerId =
                (typeof j?.prayer === 'string' && j.prayer) ||
                (typeof j?.prayer === 'object' && (j?.prayer?._id || j?.prayer?.id)) ||
                j?.linkedPrayer?._id ||
                j?.linkedPrayer?.id ||
                null;

              const linkedPrayerObj = typeof j?.prayer === 'object' ? j?.prayer : j?.linkedPrayer;
              const linkedPrayerPreview = String(linkedPrayerObj?.content || linkedPrayerObj?.description || '').trim();
              const linkedPrayerEmoji = linkedPrayerObj?.moodEmoji;
              const linkedPrayerUrgency = linkedPrayerObj?.urgency;

              return (
                <div
                  key={journalId}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl border border-black/5 shadow-sm overflow-hidden"
                >
                  <div className="p-6">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                          {authorProfilePicture ? (
                            <img src={authorProfilePicture} alt={authorName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-gray-600 text-sm font-semibold">{getInitials(authorName)}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 leading-5">{authorName}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {authorHandle ? `${authorHandle} • ` : ''}
                            {formatRelativeTimeCompact(j?.createdAt)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {linkedPrayerId ? (
                          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            <FiLink className="h-4 w-4" aria-hidden="true" />
                            Linked prayer
                          </span>
                        ) : null}
                        
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                            j.privacyLevel === 'public'
                              ? 'border-green-200 bg-green-50 text-green-700'
                              : 'border-gray-200 bg-gray-50 text-gray-700'
                          }`}
                        >
                          {j.privacyLevel === 'public' ? (
                            <>
                              <FaGlobeAmericas className="h-3.5 w-3.5" aria-hidden="true" />
                              Public
                            </>
                          ) : (
                            <>
                              <FaLock className="h-3.5 w-3.5" aria-hidden="true" />
                              Private
                            </>
                          )}
                        </span>
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-medium flex flex-col sm:flex-row justify-center items-center ${meta.pillClass}`}
                        >
                          <span className="mr-2">{meta.emoji}</span>
                          {journalMood}
                        </span>

                        {isOwner ? (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                requestDelete(journalId);
                              }}
                              className="w-10 h-10 rounded-xl border border-black/10 bg-white flex items-center justify-center text-red-600 hover:bg-red-50 transition disabled:opacity-60 cursor-pointer"
                              aria-label="Delete journal"
                              title="Delete"
                              disabled={deleteLoading}
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(journalId);
                              }}
                              className="w-10 h-10 rounded-xl border border-black/10 bg-white flex items-center justify-center hover:bg-gray-50 transition cursor-pointer"
                              aria-label="Edit journal"
                              title="Edit"
                              disabled={editLoading}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 20H21" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path
                                  d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
                                  stroke="#111827"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mt-5 bg-[#eeeeeed7] rounded-xl p-4 text-sm text-gray-700 leading-6 w-full">
                      <div
                        className={`journal-story ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}
                        style={{ maxHeight: isExpanded ? `${maxHeight}px` : '4.5rem' }}
                        aria-expanded={isExpanded}
                      >
                        <p
                          ref={(el) => {
                            if (!journalId) return;
                            if (el) descriptionRefs.current[journalId] = el;
                          }}
                          className="w-full whitespace-pre-wrap break-words"
                        >
                          {j?.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setExpandedById((prev) => ({ ...prev, [journalId]: !prev[journalId] }));
                        }}
                        className="mt-2 inline-flex items-center gap-1 text-blue-700 font-semibold hover:underline cursor-pointer"
                        style={{ cursor: 'pointer' }}
                      >
                        {isExpanded ? 'Show less' : 'Read full story →'}
                      </button>
                    </div>

                    {/* Verse banner */}
                    <div className="mt-5 rounded-xl btn-blue-gradient text-white px-5 py-3">
                      <p className="text-sm italic">
                        “{j?.verse?.quote}” - {j?.verse?.reference}
                      </p>
                    </div>

                    {/* Linked prayer preview (interactive) */}
                    {linkedPrayerId ? (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenLinkedPrayer?.(linkedPrayerId, linkedPrayerObj);
                        }}
                        className="mt-5 w-full text-left rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-3 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Open linked prayer"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <FiLink className="h-4 w-4 text-blue-700" aria-hidden="true" />
                            <p className="text-sm font-semibold text-blue-900">Linked prayer</p>
                          </div>
                          <span className="text-xs font-semibold text-blue-700">Open →</span>
                        </div>

                        {linkedPrayerPreview ? (
                          <p className="mt-2 text-sm text-blue-900/90 break-words whitespace-normal">{linkedPrayerPreview}</p>
                        ) : (
                          <p className="mt-2 text-xs text-blue-700/90">
                            Tap to open the attached prayer.
                          </p>
                        )}

                        {(linkedPrayerEmoji || linkedPrayerUrgency) ? (
                          <div className="mt-2 flex items-center gap-2 text-xs text-blue-700/90">
                            {linkedPrayerEmoji ? <span aria-hidden="true">{linkedPrayerEmoji}</span> : null}
                            {linkedPrayerUrgency ? (
                              <span className="rounded-full border border-blue-200 bg-white/70 px-2 py-0.5 font-semibold">
                                {String(linkedPrayerUrgency)}
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </button>
                    ) : null}

                    {/* Tags */}
                    {Array.isArray(j?.tags) && j.tags.length > 0 ? (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {j.tags.map((tag) => (
                          <span key={tag} className="px-3 py-1 rounded-full bg-primary-500 text-white text-xs font-semibold">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {/* Footer meta */}
                    <div className="mt-6 text-xs text-gray-700 flex items-center gap-3">
                      <span>Word count: {j?.wordCount ?? 0}</span>
                      <span>•</span>
                      <span>{estimateReadTimeMin(j?.wordCount)} min read</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
      </div>

      {/* Local styles: smooth expand/collapse for story content */}
      <style>{`
        .journal-story {
          overflow: hidden;
          transition: max-height 260ms ease, opacity 200ms ease;
          will-change: max-height;
        }
        .journal-story.is-collapsed {
          opacity: 0.92;
        }
        .journal-story.is-expanded {
          opacity: 1;
        }
        @media (prefers-reduced-motion: reduce) {
          .journal-story { transition: none; }
        }
      `}</style>
    </div>
  );
});

export default Journal;