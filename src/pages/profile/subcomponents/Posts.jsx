import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useSelector } from 'react-redux';
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

  // Edit state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState(null);

  // Delete state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingPrayer, setDeletingPrayer] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Expose openCreateModal method to parent component
  useImperativeHandle(ref, () => ({
    openCreateModal: () => {
      setIsCreateModalOpen(true);
    }
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
    refresh
  } = useInfiniteScroll(fetchMyPrayers, {
    limit: 20,
    enabledCondition: !!userId
  });

  // Profile-specific handlers
  const handleProfileTogglePin = async (prayerId, newPinState) => {
    try {
      console.log(`${newPinState ? 'Pinning' : 'Unpinning'} prayer:`, prayerId);
      const response = await togglePrayerPinStatus(prayerId);
      
      if (response.success) {
        console.log('Pin status updated successfully:', response.prayer);
        // Refresh the prayers list to get updated data
        refresh();
      } else {
        throw new Error(response.message || 'Failed to update pin status');
      }
    } catch (error) {
      console.error('Error toggling pin status:', error);
      // You could add a toast notification here to show the error to the user
    }
  };

  const handleProfileToggleVisibility = async (prayerId, newVisibilityState) => {
    try {
      console.log(`Making prayer ${newVisibilityState ? 'private' : 'public'}:`, prayerId);
      const response = await togglePrayerVisibility(prayerId);
      
      if (response.success) {
        console.log('Visibility updated successfully:', response.prayer);
        // Refresh the prayers list to get updated data
        refresh();
      } else {
        throw new Error(response.message || 'Failed to update visibility');
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      // You could add a toast notification here to show the error to the user
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
    console.log('Prayer edited successfully:', updatedPrayer);
    refresh();
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
    try {
      await deletePrayer(deletingPrayer._id);
      // Backend returns 204 No Content on success — no body to check
      console.log('Prayer deleted successfully');
      refresh();
      handleDeleteModalClose();
    } catch (error) {
      console.error('Error deleting prayer:', error);
    } finally {
      setIsDeleting(false);
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
              {prayers.map((prayer) => (
                <div key={prayer._id}>
                  <PrayerCard
                    prayer={prayer}
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
                  />
                </div>
              ))}
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

      {/* Edit Prayer Modal */}
      <CreatePrayerModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        onSuccess={handleEditSuccess}
        editMode={true}
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
                  className="text-gray-500 hover:text-gray-700 text-xl leading-none"
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
                <p className="text-gray-700 text-sm line-clamp-3">
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
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
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