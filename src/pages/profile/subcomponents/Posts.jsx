import React, { useState, useCallback, forwardRef, useImperativeHandle, useRef } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { selectUser } from '../../../store/userSlice';
import { apiClient } from '../../../api';
import { togglePrayerPinStatus, togglePrayerVisibility, deletePrayer } from '../../../api/prayer';
import PrayerCard from '../../../components/ui/PrayerCard';
import CreatePrayerModal from '../../../components/ui/CreatePrayerModal';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import PlusLoader from '../../../components/ui/PlusLoader';
import { formatComments, formatTimeAgo, getPrayerStatus } from '../../../utils/profileUtils';
import { FaTrash, FaExclamationTriangle } from 'react-icons/fa';

const Posts = forwardRef((props, ref) => {
  console.log(props?.userProfile?.user?._id);
  const userId = props?.userProfile?.user?._id;
  const user = useSelector(selectUser);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [selectedDraftPrayer, setSelectedDraftPrayer] = useState(null);
  const [expandedPrayers, setExpandedPrayers] = useState({});
  const prayerCardRefs = useRef({});

  // Edit state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState(null);

  // Delete state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingPrayer, setDeletingPrayer] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Per-prayer loading state for pin / visibility / delete so the card can show a soft overlay
  // and the rest of the list doesn't re-render.
  const [pinLoadingIds, setPinLoadingIds] = useState(() => new Set());
  const [visibilityLoadingIds, setVisibilityLoadingIds] = useState(() => new Set());
  const [deletingId, setDeletingId] = useState(null);

  // Expose openCreateModal method to parent component
  useImperativeHandle(ref, () => ({
    openCreateModal: () => {
      setIsCreateModalOpen(true);
    },
    /**
     * Scroll to a prayer card, expand it, and briefly highlight.
     * Used by Journal linked-prayer preview.
     */
    focusPrayerById: (prayerId) => {
      if (!prayerId) return;
      const id = String(prayerId);
      setExpandedPrayers((prev) => ({ ...prev, [id]: true }));
      // After switching tabs, Posts mounts and refs populate asynchronously.
      // Retry a few times so we reliably scroll to the correct card.
      const startedAt = Date.now();
      const MAX_MS = 2500;
      const TICK_MS = 120;

      const tryScroll = () => {
        const el = prayerCardRefs.current[id];
        if (el && el.scrollIntoView) {
          // Make sure the window itself isn't stuck at some old scroll position.
          // Then scroll to the specific card.
          window.scrollTo({ top: 0, behavior: 'auto' });
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        if (Date.now() - startedAt < MAX_MS) {
          window.setTimeout(tryScroll, TICK_MS);
        }
      };

      window.setTimeout(tryScroll, 60);
    },
  }));

  // Function to fetch user's prayers from API with pagination
  const fetchMyPrayers = useCallback(async (page, limit) => {
    try {
      const response = await apiClient.get(`/prayers/user/${userId}?page=${page}&limit=${limit}`);
      console.log('Fetched my prayers:', response);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error('Failed to fetch prayers');
      }
    } catch (err) {
      console.error('Error fetching my prayers:', err);
      throw new Error('Failed to fetch my prayers');
    }
  }, [userId]);

  // Use infinite scroll hook for prayers
  const {
    items: prayers,
    hasMore,
    loading,
    error,
    fetchMoreItems,
    refresh,
    setItems
  } = useInfiniteScroll(fetchMyPrayers, {
    limit: 20,
    enabledCondition: !!userId
  });

  // Profile-specific handlers — in-place updates so the list never re-renders as a whole.
  const handleProfileTogglePin = async (prayerId, newPinState) => {
    if (!prayerId) return;
    setPinLoadingIds((prev) => {
      const next = new Set(prev);
      next.add(prayerId);
      return next;
    });

    // Optimistic flip
    setItems((prev) => prev.map((p) => (
      p._id === prayerId
        ? { ...p, isUserPinned: newPinState, isPinned: newPinState }
        : p
    )));

    try {
      const response = await togglePrayerPinStatus(prayerId);
      if (response?.success) {
        // Merge any fields the server returned without losing the optimistic state.
        setItems((prev) => prev.map((p) => (
          p._id === prayerId
            ? { ...p, ...(response.prayer || {}), isUserPinned: newPinState, isPinned: newPinState }
            : p
        )));
        toast.success(newPinState ? 'Pinned to your profile' : 'Unpinned from your profile');
      } else {
        throw new Error(response?.message || 'Failed to update pin status');
      }
    } catch (error) {
      console.error('Error toggling pin status:', error);
      // Revert optimistic update
      setItems((prev) => prev.map((p) => (
        p._id === prayerId
          ? { ...p, isUserPinned: !newPinState, isPinned: !newPinState }
          : p
      )));
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update pin status');
    } finally {
      setPinLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(prayerId);
        return next;
      });
    }
  };

  const handleProfileToggleVisibility = async (prayerId, newIsPublic) => {
    if (!prayerId) return;
    // newIsPublic === true means "make public", false means "make private".
    const newIsPrivate = !newIsPublic;
    setVisibilityLoadingIds((prev) => {
      const next = new Set(prev);
      next.add(prayerId);
      return next;
    });

    // Optimistic flip
    setItems((prev) => prev.map((p) => (
      p._id === prayerId ? { ...p, isPrivate: newIsPrivate } : p
    )));

    try {
      const response = await togglePrayerVisibility(prayerId);
      if (response?.success) {
        setItems((prev) => prev.map((p) => (
          p._id === prayerId
            ? { ...p, ...(response.prayer || {}), isPrivate: newIsPrivate }
            : p
        )));
        toast.success(newIsPublic ? 'Post is now public' : 'Post is now private');
      } else {
        throw new Error(response?.message || 'Failed to update visibility');
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      // Revert
      setItems((prev) => prev.map((p) => (
        p._id === prayerId ? { ...p, isPrivate: !newIsPrivate } : p
      )));
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update visibility');
    } finally {
      setVisibilityLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(prayerId);
        return next;
      });
    }
  };

  // Open the CreatePrayerModal in edit mode pre-filled with the selected prayer
  const handleProfileEdit = (prayer) => {
    setEditingPrayer(prayer);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingPrayer(null);
  };

  const handleEditSuccess = (updatedPrayer) => {
    if (updatedPrayer?._id) {
      setItems((prev) => prev.map((p) => (
        p._id === updatedPrayer._id ? { ...p, ...updatedPrayer } : p
      )));
    } else {
      // Fallback: if the modal didn't return the updated prayer, refresh.
      refresh();
    }
    toast.success('Post updated');
    handleEditModalClose();
  };

  // Open delete confirmation modal
  const handleProfileDelete = (prayer) => {
    setDeletingPrayer(prayer);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setDeletingPrayer(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPrayer?._id || isDeleting) return;
    setIsDeleting(true);
    setDeletingId(deletingPrayer._id);
    try {
      await deletePrayer(deletingPrayer._id);
      // Remove the prayer from the list in place so the rest of the list doesn't re-render.
      const removedId = deletingPrayer._id;
      setItems((prev) => prev.filter((p) => p._id !== removedId));
      toast.success('Post deleted');
      handleDeleteModalClose();
    } catch (error) {
      console.error('Error deleting prayer:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const handlePrayerCreated = (newPrayer) => {
    console.log('New prayer created:', newPrayer);
    setIsCreateModalOpen(false);
    refresh();
  };

  const handlePublishDraft = (draftPrayer) => {
    console.log('Publishing draft prayer:', draftPrayer);
    setSelectedDraftPrayer(draftPrayer);
    setIsPublishModalOpen(true);
  };

  const handlePublishModalClose = () => {
    setIsPublishModalOpen(false);
    setSelectedDraftPrayer(null);
  };

  const handlePublishSuccess = (updatedPrayer) => {
    console.log('Prayer published successfully:', updatedPrayer);
    refresh();
    handlePublishModalClose();
  };

  const handleToggleExpand = (prayerId) => {
    setExpandedPrayers(prev => ({
      ...prev,
      [prayerId]: !prev[prayerId]
    }));
  };

  

  return (
    <>
      <div className="w-full">
        {loading && prayers.length === 0 ? (
          <div className="flex justify-center items-center py-16">
            <PlusLoader />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Error Loading Posts</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">{error}</p>
            <button
              onClick={refresh}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        ) : prayers.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">📝</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No Posts Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't created any posts yet. Start sharing your prayers with the community.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          <>
            {/* Simple grid layout for posts */}
            <div className="grid grid-cols-1 w-full max-md:px-3">
              {prayers.map((prayer) => {
                // Determine if this prayer is in the list because the profile user shared it
                const profileUserId = props?.userProfile?.user?._id;
                const isAuthor = prayer.user?._id === profileUserId || prayer.userProfile?._id === profileUserId;
                const isSharedByProfileUser = prayer.shares?.some(s => s.user?._id === profileUserId || s.user === profileUserId || s === profileUserId);
                
                let sharedByText = null;
                if (!isAuthor && isSharedByProfileUser) {
                  sharedByText = `${props?.userProfile?.user?.firstname || 'User'} shared this`;
                }

                return (
                <div
                  key={prayer._id}
                  className="mb-4"
                  ref={(el) => {
                    if (el) prayerCardRefs.current[String(prayer._id)] = el;
                  }}
                >
                  <PrayerCard
                    prayer={prayer}
                    sharedByText={sharedByText}
                    prayerId={prayer._id}
                    user={{
                      name: prayer.anonymous ? 'Anonymous' : prayer.user?.firstname || prayer.userProfile?.firstname || 'Unknown User',
                      _id: prayer.user?._id || prayer.userProfile?._id
                    }}
                    timeAgo={formatTimeAgo(prayer.createdAt)}
                    urgency={prayer.urgency}
                    prayerText={prayer.content}
                    status={getPrayerStatus(prayer)}
                    communities={prayer.communities || []}
                    mood={prayer.moodEmoji || '😊'}
                    comments={formatComments(prayer.comments)}
                    tags={prayer.tags || []}
                    isExpanded={expandedPrayers[prayer._id] || false}
                    onToggleExpand={() => handleToggleExpand(prayer._id)}
                    isPrayed={prayer.isPrayed?.some(p => p.user === user?._id || p === user?._id) || false}
                    prayerCount={prayer.isPrayed?.length || 0}
                    isShared={prayer.shares?.some(s => s.user === user?._id || s === user?._id) || false}
                    shareCount={prayer.shares?.length || 0}
                    showStatusPill={true}
                    onPublishDraft={prayer.isDraft ? handlePublishDraft : null}
                    isDraft={prayer.isDraft}
                    onRefresh={refresh}
                    isProfileContext={true}
                    onProfileTogglePin={handleProfileTogglePin}
                    onProfileToggleVisibility={handleProfileToggleVisibility}
                    onProfileEdit={handleProfileEdit}
                    onProfileDelete={handleProfileDelete}
                    isPinned={prayer.isUserPinned || false}
                    isPrivate={prayer.isPrivate || false}
                    isPinLoading={pinLoadingIds.has(prayer._id)}
                    isVisibilityLoading={visibilityLoadingIds.has(prayer._id)}
                    isDeleting={deletingId === prayer._id}
                  />
                </div>
              );
              })}
            </div>

            {/* Loading indicator for infinite scroll */}
            {loading && prayers.length > 0 && (
              <div className="flex justify-center items-center py-8">
                <PlusLoader />
              </div>
            )}

            {/* Load more trigger */}
            {hasMore && !loading && (
              <div className="flex justify-center py-8">
                <button
                  onClick={fetchMoreItems}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Load More
                </button>
              </div>
            )}

            {/* End of list message */}
            {!hasMore && prayers.length > 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                You've reached the end of your posts
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Prayer Modal */}
      <CreatePrayerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handlePrayerCreated}
      />

      {/* Publish Modal */}
      <CreatePrayerModal
        isOpen={isPublishModalOpen}
        onClose={handlePublishModalClose}
        onSuccess={handlePublishSuccess}
        editMode={true}
        initialData={selectedDraftPrayer}
        editPrayerId={selectedDraftPrayer?._id}
      />

      {/* Edit Prayer Modal (slim profile-edit flow: no scheduler, draft, or community picker) */}
      <CreatePrayerModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        onSuccess={handleEditSuccess}
        editMode={true}
        profileEditMode={true}
        initialData={editingPrayer}
        editPrayerId={editingPrayer?._id}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Delete Post</h3>
                <button
                  onClick={handleDeleteModalClose}
                  className="text-gray-500 hover:text-gray-700 text-xl leading-none cursor-pointer"
                  disabled={isDeleting}
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <FaExclamationTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-gray-900 mb-1">Are you sure?</h4>
                    <p className="text-sm text-gray-600">This action cannot be undone.</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm break-words whitespace-normal">
                  You are about to permanently delete this prayer post:
                  <span className="font-medium block mt-1 text-gray-800">
                    "{deletingPrayer?.content?.slice(0, 80)}{deletingPrayer?.content?.length > 80 ? '…' : ''}"
                  </span>
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteModalClose}
                  disabled={isDeleting}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <FaTrash className="w-4 h-4" />
                  {isDeleting ? 'Deleting…' : 'Delete Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default Posts;