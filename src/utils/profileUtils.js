export const formatTimeAgo = (date) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(days / 365);
    return `${years}y ago`;
  };

  // Get prayer status
  export const getPrayerStatus = (prayer) => {
    if (prayer.isDraft) return "Draft";
    if (prayer.isScheduled) return "Scheduled";
    return "Published";
  };

  // Format comments to ensure user is a string
  export const formatComments = (comments) => {
    if (!comments || !Array.isArray(comments)) return [];
    
    return comments.map((comment, index) => ({
      _id: comment._id || `comment-${index}-${Date.now()}`, // Ensure unique ID
      user: typeof comment.user === 'object' 
        ? (comment.user?.firstname || comment.user?.username || 'Unknown User')
        : (comment.user || 'Unknown User'),
      text: comment.commentText || comment.content || '', // Map content to text
      time: comment.time || (comment.createdAt ? formatTimeAgo(comment.createdAt) : 'just now'),
      reactions: comment.reactions || {},
      userReaction: comment.userReaction || null,
      userId: typeof comment.user === 'object' ? comment.user?._id : comment.userId
    }));
  };