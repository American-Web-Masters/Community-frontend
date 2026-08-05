import React, { useEffect, useState } from 'react';
import { getGlobalReportedPrayers, dismissGlobalReport, deletePrayer } from '../../../api/prayer';
import toast from 'react-hot-toast';
import PrayerCard from '../../../components/ui/PrayerCard';
import ConfirmModal from '../../../components/ui/ConfirmModal';

const DashboardFlaggedPosts = () => {
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'dismiss' or 'delete'
    prayerId: null,
    title: '',
    message: '',
    confirmText: '',
    confirmColor: '',
    iconColor: ''
  });

  const fetchFlaggedPrayers = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await getGlobalReportedPrayers(pageNum, 20);
      if (res.success && res.data) {
        if (pageNum === 1) {
          setPrayers(res.data.prayers || []);
        } else {
          setPrayers(prev => [...prev, ...(res.data.prayers || [])]);
        }
        setHasMore(res.data.pagination?.hasNextPage || false);
      }
    } catch (error) {
      toast.error('Failed to load flagged posts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlaggedPrayers(1);
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFlaggedPrayers(nextPage);
    }
  };

  const handleDismissReport = async (prayerId) => {
    setConfirmModal({
      isOpen: true,
      type: 'dismiss',
      prayerId,
      title: 'Dismiss Report',
      message: 'Are you sure you want to dismiss all reports for this post? This will clear its flagged status but keep the post active.',
      confirmText: 'Dismiss Report',
      confirmColor: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      iconColor: 'text-yellow-600 bg-yellow-100'
    });
  };

  const handleDeletePost = async (prayerId) => {
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      prayerId,
      title: 'Delete Post',
      message: 'Are you sure you want to permanently delete this post? This action cannot be undone and will remove the post from all communities.',
      confirmText: 'Delete Post',
      confirmColor: 'bg-red-600 hover:bg-red-700 text-white',
      iconColor: 'text-red-600 bg-red-100'
    });
  };

  const handleConfirmAction = async () => {
    const { type, prayerId } = confirmModal;
    
    if (type === 'dismiss') {
      try {
        await dismissGlobalReport(prayerId);
        setPrayers(prev => prev.filter(p => p._id !== prayerId));
        toast.success('Report dismissed successfully');
      } catch (error) {
        toast.error('Failed to dismiss report');
        console.error(error);
      }
    } else if (type === 'delete') {
      try {
        await deletePrayer(prayerId);
        setPrayers(prev => prev.filter(p => p._id !== prayerId));
        toast.success('Post deleted successfully');
      } catch (error) {
        toast.error('Failed to delete post');
        console.error(error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Flagged Posts</h2>
          <p className="text-sm text-gray-500 mt-1">
            Review and manage prayers that have been reported by users.
          </p>
        </div>
        <button
          onClick={() => {
            setPage(1);
            fetchFlaggedPrayers(1);
          }}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-md transition-all text-sm font-medium cursor-pointer flex items-center gap-2"
        >
          Refresh List
        </button>
      </div>

      {loading && prayers.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : prayers.length === 0 ? (
        <div className="bg-white/40 backdrop-blur-md rounded-2xl shadow-sm border border-blue-100/50 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <span className="text-4xl">✨</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">All Clear!</h3>
          <p className="text-gray-500 max-w-md mx-auto text-base">
            There are no flagged prayers to review at the moment. You're all caught up!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          {prayers.map((prayer) => (
            <div key={prayer._id} className="relative group flex flex-col bg-white/40 backdrop-blur-md border border-red-100/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-center mb-4">
                <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200 flex items-center gap-2 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  {prayer.reports?.length || 0} Reports
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDismissReport(prayer._id)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                  >
                    Dismiss Report
                  </button>
                  <button
                    onClick={() => handleDeletePost(prayer._id)}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
                  >
                    Delete Post
                  </button>
                </div>
              </div>

              {/* Prayer Card */}
              <div className="pointer-events-none mb-4">
                <PrayerCard
                  prayer={prayer}
                  prayerId={prayer._id}
                  user={{ name: prayer.user?.firstname || prayer.user?.username || 'User' }}
                  timeAgo={new Date(prayer.createdAt).toLocaleDateString()}
                  urgency={prayer.urgency}
                  prayerText={prayer.content}
                  status={prayer.status}
                  communities={prayer.communities || []}
                  isModeratorContext={false} // We handle deletion manually above instead of relying on the 3-dots menu
                />
              </div>
              
              {/* Reports Breakdown */}
              <div className="mt-auto bg-white/60 rounded-xl border border-red-50 p-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Report Details</h4>
                <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {(prayer.reports || []).map((report, idx) => (
                    <div key={idx} className="bg-white border border-red-100 p-3 rounded-lg text-sm shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-red-800 capitalize">
                          {report.reason?.replace(/_/g, ' ')}
                        </span>
                        {report.reportedAt && (
                          <span className="text-[10px] text-gray-400">
                            {new Date(report.reportedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {report.description ? (
                        <p className="text-gray-600 text-xs mt-1 leading-relaxed">{report.description}</p>
                      ) : (
                        <p className="text-gray-400 text-xs mt-1 italic">No description provided</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all text-sm font-semibold cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More Prayers'}
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmColor={confirmModal.confirmColor}
        iconColor={confirmModal.iconColor}
      />
    </div>
  );
};

export default DashboardFlaggedPosts;
