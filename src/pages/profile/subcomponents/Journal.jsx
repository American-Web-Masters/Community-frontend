import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJournalByUser } from '../../../api';
import { estimateReadTimeMin, formatRelativeTimeCompact, getInitials } from '../../../utils/profileUtils';

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

const Journal = ({ userProfile }) => {
  const navigate = useNavigate();
  const [activeMood, setActiveMood] = useState('Joyful');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [journals, setJournals] = useState([]);
  const [expandedById, setExpandedById] = useState({});

  const userId = userProfile?.user?._id;

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
  }, [fetchJournals]);

  const moodOption = useMemo(() => moodMetaByLabel.get(activeMood) ?? MOODS[0], [activeMood]);

  const filteredJournals = useMemo(() => {
    const list = Array.isArray(journals) ? journals : [];
    if (!activeMood) return list;
    return list.filter((j) => (j?.mood || '').toLowerCase() === activeMood.toLowerCase());
  }, [activeMood, journals]);

  const displayedJournals = filteredJournals;

  const authorName = useMemo(() => {
    const first = userProfile?.user?.firstname || '';
    const last = userProfile?.user?.lastname || '';
    return `${first} ${last}`.trim() || userProfile?.user?.username || 'User';
  }, [userProfile]);

  const authorHandle = useMemo(() => {
    const u = userProfile?.user?.username;
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
      {/* Filter Tabs */}
      <div className="w-full bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-3 overflow-x-auto">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by mood:</span>
        <div className="flex items-center gap-2">
          {MOODS.map((mood) => {
            const isActive = activeMood === mood.label;
            return (
              <button
                key={mood.label}
                type="button"
                onClick={() => setActiveMood(mood.label)}
                className={
                  `px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150 ring-1 ring-black/5 ` +
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
      <div className="mt-6">
        <h2 className="text-2xl font-semibold text-gray-900">My Faith Journal</h2>
        <p className="text-[15px] text-gray-800 mt-1">Reflect on your spiritual journey and track your emotional wellness</p>
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
                You haven't created any journal entries yet. Start documenting your spiritual journey and daily reflections.
              </p>
              <button
                onClick={() => navigate('/create')}
                className="btn-blue-gradient text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition"
              >
                Create Your First Entry
              </button>
            </div>
          ) : (
            displayedJournals.map((j) => {
              const journalMood = String(j?.mood || activeMood);
              const meta = moodMetaByLabel.get(journalMood) ?? moodOption;

              const isExpanded = Boolean(expandedById[j?.id ?? j?._id]);
              const journalId = j?.id ?? j?._id;

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
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-medium flex flex-col sm:flex-row justify-center items-center ${meta.pillClass}`}
                        >
                          <span className="mr-2">{meta.emoji}</span>
                          {journalMood}
                        </span>
                        <button
                          type="button"
                          className="w-10 h-10 rounded-xl border border-black/10 bg-white flex items-center justify-center hover:bg-gray-50 transition"
                          aria-label="Edit journal"
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
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mt-5 bg-[#eeeeeed7] rounded-xl p-4 text-sm text-gray-700 leading-6">
                      <p className={isExpanded ? '' : 'line-clamp-3 '}>{j?.description}</p>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedById((prev) => ({
                            ...prev,
                            [journalId]: !Boolean(prev[journalId]),
                          }))
                        }
                        className="mt-2 text-blue-700 font-semibold hover:underline"
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

                    {/* Tags */}
                    <div className="mt-5 flex flex-wrap gap-2">
                      {(j?.tags ?? []).map((tag) => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-primary-500 text-white text-xs font-semibold">
                          #{tag}
                        </span>
                      ))}
                    </div>

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
    </div>
  );
};

export default Journal;