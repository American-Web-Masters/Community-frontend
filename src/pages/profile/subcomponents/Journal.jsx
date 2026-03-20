import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJournalByUser } from '../../../api';

const MOODS = [
  { label: 'Joyful', emoji: '😊', pillClass: 'bg-yellow-100 text-yellow-700' },
  { label: 'Peaceful', emoji: '😌', pillClass: 'bg-teal-100 text-teal-700' },
  { label: 'Sad', emoji: '😢', pillClass: 'bg-blue-100 text-blue-700' },
  { label: 'Grateful', emoji: '🙏', pillClass: 'bg-yellow-100 text-yellow-700' },
  { label: 'Inspired', emoji: '✨', pillClass: 'bg-purple-100 text-purple-700' },
];

const moodMetaByLabel = new Map(MOODS.map((m) => [m.label, m]));

const formatRelativeTime = (isoDate) => {
  if (!isoDate) return '';
  const then = new Date(isoDate);
  const now = new Date();
  const diffMs = now - then;
  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);

  if (day > 0) return `${day} day${day === 1 ? '' : 's'} ago`;
  if (hour > 0) return `${hour} hour${hour === 1 ? '' : 's'} ago`;
  if (min > 0) return `${min} minute${min === 1 ? '' : 's'} ago`;
  return 'just now';
};

const estimateReadTimeMin = (wordCount) => {
  const words = Number(wordCount ?? 0);
  if (!Number.isFinite(words) || words <= 0) return 1;
  return Math.max(1, Math.round(words / 200));
};

const Journal = ({ userProfile }) => {
  const navigate = useNavigate();
  const [activeMood, setActiveMood] = useState('Joyful');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [journals, setJournals] = useState([]);
  const [expanded, setExpanded] = useState(false);

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
      const items = res?.data?.journals || [];
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

  const displayedJournal = filteredJournals[0] ?? null;

  const authorName = useMemo(() => {
    const first = userProfile?.user?.firstname || '';
    const last = userProfile?.user?.lastname || '';
    return `${first} ${last}`.trim() || userProfile?.user?.username || 'User';
  }, [userProfile]);

  const authorHandle = useMemo(() => {
    const u = userProfile?.user?.username;
    return u ? `@${u}` : null;
  }, [userProfile]);

  return (
    <div className="w-full px-4 sm:px-6 py-6">
      {/* Filter Tabs */}
      <div className="w-full bg-white/90 backdrop-blur-sm rounded-full px-4 py-3 flex items-center gap-3 overflow-x-auto">
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
                  `px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150 ` +
                  (isActive
                    ? `${mood.pillClass} shadow-sm ring-1 ring-black/5`
                    : 'bg-gray-100/70 text-gray-600 hover:bg-gray-100')
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
        <h2 className="text-2xl font-bold text-gray-900">My Faith Journal</h2>
        <p className="text-sm text-gray-600 mt-1">Reflect on your spiritual journey and track your emotional wellness</p>
      </div>

      {/* Card */}
      <div className="mt-6 bg-white/90 backdrop-blur-sm rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-6">
          {loading ? (
            <div className="py-10 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="py-10 text-center">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : !displayedJournal ? (
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
            <>
              {/* Top row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-semibold">SG</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 leading-5">{authorName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {authorHandle ? `${authorHandle} • ` : ''}{formatRelativeTime(displayedJournal.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${moodOption.pillClass}`}>
                    <span className="mr-2">{moodOption.emoji}</span>
                    {displayedJournal.mood ?? activeMood}
                  </span>
                  <button
                    type="button"
                    className="w-10 h-10 rounded-xl border border-black/10 bg-white flex items-center justify-center hover:bg-gray-50 transition"
                    aria-label="Edit journal"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 20H21"
                        stroke="#111827"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
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
              <div className="mt-5 bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-6">
                <p className={expanded ? '' : 'line-clamp-3'}>{displayedJournal.description}</p>
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="mt-2 text-blue-700 font-semibold hover:underline"
                >
                  {expanded ? 'Show less' : 'Read full story →'}
                </button>
              </div>

              {/* Verse banner */}
              <div className="mt-5 rounded-xl bg-gradient-to-r from-[#0C64C5] to-[#0B4F9F] text-white px-5 py-4">
                <p className="text-sm italic">
                  “{displayedJournal.verse?.quote}” - {displayedJournal.verse?.reference}
                </p>
              </div>

              {/* Tags */}
              <div className="mt-5 flex flex-wrap gap-2">
                {(displayedJournal.tags ?? []).map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Footer meta */}
              <div className="mt-6 text-xs text-gray-500 flex items-center gap-3">
                <span>Word count: {displayedJournal.wordCount ?? 0}</span>
                <span>•</span>
                <span>{estimateReadTimeMin(displayedJournal.wordCount)} min read</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Journal;