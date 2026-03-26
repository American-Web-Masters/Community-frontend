import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaTimes } from 'react-icons/fa';
import { apiClient } from '../../../api';
import { selectUser } from '../../../store/userSlice';
import PrayerCard from '../../../components/ui/PrayerCard';
import PlusLoader from '../../../components/ui/PlusLoader';
import { formatComments, formatTimeAgo, getPrayerStatus } from '../../../utils/profileUtils';

const DEFAULT_PAGE_SIZE = 20;

/**
 * Scrollable picker for choosing one of the current user's prayers.
 * Uses the same API as Posts: GET /prayers/user/:userId?page&limit
 */
const LinkedPrayerPicker = ({ isOpen, onClose, onSelectPrayer }) => {
  const user = useSelector(selectUser);
  const userId = user?._id || user?.id || user?.user?._id;

  const [selectedPrayerId, setSelectedPrayerId] = useState(null);
  const [expandedPrayers, setExpandedPrayers] = useState({});

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setError('');
    setLoading(false);
  setSelectedPrayerId(null);
  setExpandedPrayers({});
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    reset();
  }, [isOpen, reset]);

  const fetchPage = useCallback(
    async (nextPage) => {
      if (!userId) {
        setError('Please log in to select a prayer.');
        setHasMore(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const res = await apiClient.get(`/prayers/user/${userId}?page=${nextPage}&limit=${DEFAULT_PAGE_SIZE}`);
        const body = res?.data;

        if (!body?.success) {
          throw new Error(body?.message || 'Failed to load prayers.');
        }

        // Backend shape: { success, data: { prayers: [], pagination: { hasNextPage } } }
        const nextItems = body?.data?.prayers ?? [];
        const normalized = Array.isArray(nextItems) ? nextItems : [];

        setItems((prev) => (nextPage === 1 ? normalized : [...prev, ...normalized]));
        setPage(nextPage);

        const nextHasMore = body?.data?.pagination?.hasNextPage;
        if (typeof nextHasMore === 'boolean') {
          setHasMore(nextHasMore);
        } else {
          // Fallback heuristic when pagination isn't present.
          setHasMore(normalized.length >= DEFAULT_PAGE_SIZE);
        }
      } catch (e) {
        setError(e?.response?.data?.message || e?.message || 'Failed to load prayers.');
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    if (!isOpen) return;
    fetchPage(1);
  }, [fetchPage, isOpen]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) onClose?.();
  };

  const title = useMemo(() => 'Link a Prayer', []);

  const handleToggleExpand = useCallback((prayerId) => {
    setExpandedPrayers((prev) => ({ ...prev, [prayerId]: !prev?.[prayerId] }));
  }, []);

  const handleSelect = useCallback((prayer) => {
    setSelectedPrayerId(prayer?._id);
  }, []);

  const handleConfirmLink = useCallback(() => {
    if (!selectedPrayerId) return;
    const selected = items.find((p) => p?._id === selectedPrayerId);
    if (!selected) return;
    onSelectPrayer?.(selected);
  }, [items, onSelectPrayer, selectedPrayerId]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
  <div className="w-full max-w-4xl overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-50 to-white shadow-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col border border-blue-100">
        <div className="flex items-start sm:items-center justify-between border-b border-gray-100 px-4 sm:px-6 py-4 sm:py-5 gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 text-[11px] sm:text-xs font-semibold text-[color:var(--color-primary-700)]">
              Choose One Of Your Prayers
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors duration-200"
            disabled={loading}
            aria-label="Close"
          >
            <FaTimes className="h-5 w-5 text-gray-600" />
          </button>
        </div>

  <div className="px-4 sm:px-6 py-4 overflow-y-auto">
          {error ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}

          {loading && items.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <PlusLoader />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Prayers Found</h3>
              <p className="text-gray-600 max-w-md mx-auto">Create a prayer first, then link it to your journal entry.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {items.map((prayer) => (
                <button
                  key={prayer._id}
                  type="button"
                  onClick={() => handleSelect(prayer)}
                  className={
                    "text-left rounded-2xl focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary-300)] transition-all cursor-pointer " +
                    (selectedPrayerId === prayer._id
                      ? "ring-2 ring-[color:var(--color-primary-400)] shadow-md"
                      : "hover:shadow-sm")
                  }
                  aria-pressed={selectedPrayerId === prayer._id}
                >
                  <div className={selectedPrayerId === prayer._id ? 'rounded-2xl bg-blue-50/60 p-1' : 'rounded-2xl p-1'}>
                    <PrayerCard
                    prayer={prayer}
                    prayerId={prayer._id}
                    user={{
                      name: prayer.anonymous
                        ? 'Anonymous'
                        : prayer.user?.firstname || prayer.userProfile?.firstname || 'Unknown User',
                      _id: prayer.user?._id || prayer.userProfile?._id,
                    }}
                    timeAgo={formatTimeAgo(prayer.createdAt)}
                    urgency={prayer.urgency}
                    prayerText={prayer.content}
                    status={getPrayerStatus(prayer)}
                    communities={prayer.communities || []}
                    mood={prayer.moodEmoji || '😊'}
                    comments={formatComments(prayer.comments)}
                    tags={prayer.tags || []}
                    isExpanded={!!expandedPrayers?.[prayer._id]}
                    onToggleExpand={() => handleToggleExpand(prayer._id)}
                    isPrayed={false}
                    prayerCount={prayer.isPrayed?.length || 0}
                    isShared={false}
                    shareCount={prayer.shares?.length || 0}
                    showStatusPill={true}
                    onPublishDraft={null}
                    isDraft={prayer.isDraft}
                    onRefresh={null}
                    isProfileContext={false}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}

          {hasMore && !loading ? (
            <div className="flex justify-center py-6">
              <button
                type="button"
                onClick={() => fetchPage(page + 1)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium cursor-pointer"
              >
                Load More
              </button>
            </div>
          ) : null}

          {loading && items.length > 0 ? (
            <div className="flex justify-center items-center py-6">
              <PlusLoader />
            </div>
          ) : null}
        </div>

        <div className="border-t border-blue-100 bg-white/70 backdrop-blur px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            {selectedPrayerId ? (
              <span>Selected</span>
            ) : (
              <span>Select a prayer to link (optional).</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium cursor-pointer"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmLink}
              className={
                "px-4 py-2 rounded-xl font-medium text-white transition-colors " +
                (selectedPrayerId
                  ? "bg-[color:var(--color-primary-600)] hover:bg-[color:var(--color-primary-700)] cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed")
              }
              disabled={!selectedPrayerId || loading}
            >
              Link selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedPrayerPicker;
