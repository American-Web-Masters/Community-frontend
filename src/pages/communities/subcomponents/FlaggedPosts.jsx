import React, { useState, useEffect } from 'react';
import { fetchReportedPrayers, handleReportedPrayer } from '../../../api/communities';
import { getTimeAgo } from '../../../utils/prayerUtils';
import toast from 'react-hot-toast';

const FlaggedPosts = ({ community, currentUser }) => {
  const [reportedPrayers, setReportedPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [processingItems, setProcessingItems] = useState(new Set());

  useEffect(() => {
    if (community?._id) {
      fetchReportedPrayersData();
    }
  }, [community?._id]);

  const fetchReportedPrayersData = async () => {
    try {
      setLoading(true);
      const response = await fetchReportedPrayers(community._id);
      
      if (response.success) {
        setReportedPrayers(response.data.reportedPrayers || []);
        setError(null);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to load reported prayers');
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleApprove = async (itemId) => {
    if (processingItems.has(itemId)) return;
    
    setProcessingItems(prev => new Set(prev).add(itemId));
    try {
      const response = await handleReportedPrayer(community._id, itemId, 'approve');
      
      if (response.success) {
        toast.success('Request has been accepted and prayer is removed');
        // Remove the item from the list after successful approval
        setReportedPrayers(prev => prev.filter(item => item._id !== itemId));
      } else {
        toast.error(response.error || 'Failed to approve request');
      }
    } catch (error) {
      toast.error('Failed to approve request. Please try again.');
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleReject = async (itemId) => {
    if (processingItems.has(itemId)) return;
    
    setProcessingItems(prev => new Set(prev).add(itemId));
    try {
      const response = await handleReportedPrayer(community._id, itemId, 'reject');
      
      if (response.success) {
        toast.success('Request for prayer removal has been rejected');
        // Remove the item from the list after successful rejection
        setReportedPrayers(prev => prev.filter(item => item._id !== itemId));
      } else {
        toast.error(response.error || 'Failed to reject request');
      }
    } catch (error) {
      toast.error('Failed to reject request. Please try again.');
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const formatReason = (reason) => {
    const reasonMap = {
      'inappropriate_content': 'Inappropriate content',
      'spam': 'Spam',
      'harassment': 'Harassment',
      'false_information': 'False information',
      'offensive_language': 'Offensive language',
      'other': 'Other'
    };
    return reasonMap[reason] || reason;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flagged posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (reportedPrayers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No flagged posts</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reportedPrayers.map((item) => (
        <div key={item._id}>
          {/* Post Item (Flagged) - Card Design */}
          <div className="rounded-2xl p-4 border border-blue-100 bg-red-50">
            {/* Header with badge and timestamp */}
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
                Flagged
              </span>
              <span className="text-sm text-gray-600">
                {getTimeAgo(item.firstReportedAt)}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-bold text-gray-900 mb-1">
              Controversial Post
            </h3>

            {/* Author */}
            <p className="text-sm text-gray-700 mb-2">
              by {item.prayer?.user?.firstname + " " + (item.prayer?.user?.lastname || "") || "User"} 
            </p>
            {/* Content */}
            <p className="text-gray-800 text-sm mb-2 leading-relaxed">
              {item.prayer.content}
            </p>

            {/* Flagged post additional info */}
            <p className="text-sm text-red-600 mb-4">
              Reason: {formatReason(item.topReasons[0]?.reason)}  •  {item.totalReports} Flag{item.totalReports > 1 ? 's' : ''}
            </p>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleApprove(item._id)}
                disabled={processingItems.has(item._id)}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-1 rounded-3xl text-xs font-medium transition-colors flex items-center gap-1"
              >
                {processingItems.has(item._id) && (
                  <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                )}
                Approve
              </button>
              <button
                onClick={() => handleReject(item._id)}
                disabled={processingItems.has(item._id)}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-1 rounded-3xl text-xs font-medium transition-colors flex items-center gap-1"
              >
                {processingItems.has(item._id) && (
                  <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                )}
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlaggedPosts;