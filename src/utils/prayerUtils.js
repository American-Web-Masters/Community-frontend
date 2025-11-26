export function localInputToUTC(localString) {
    // localString example: "2025-11-17T22:15"
    const [datePart, timePart] = localString.split("T");

    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    // Create a date in LOCAL time (not UTC)
    const localDate = new Date(year, month - 1, day, hour, minute);

    return localDate.toISOString(); // auto converts to UTC
}


 export const getActivityText = (activityType, prayerOwnerName) => {
    const ownerText = prayerOwnerName ? `${prayerOwnerName}'s prayer` : 'your prayer';
    switch (activityType) {
      case 'comment':
        return `commented on ${ownerText}`;
      case 'prayed':
        return `prayed for ${ownerText}`;
      case 'share':
        return `shared ${ownerText}`;
      default:
        return `interacted with ${ownerText}`;
    }
  };

 export const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays}d ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours}h ago`;
    } else {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m ago`;
    }
  };

export const getLatestActivity = (activityType, prayer) => {
    switch (activityType) {
      case 'comment':
        return prayer.comments && prayer.comments.length > 0 
          ? prayer.comments[prayer.comments.length - 1] 
          : null;
      case 'prayed':
        return prayer.isPrayed && prayer.isPrayed.length > 0 
          ? prayer.isPrayed[prayer.isPrayed.length - 1] 
          : null;
      case 'share':
        return prayer.shares && prayer.shares.length > 0 
          ? prayer.shares[prayer.shares.length - 1] 
          : null;
      default:
        return null;
    }
  };

export const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

   export const getUrgencyMeter = (urgency) => {
    // const baseHeights = ['h-3', 'h-4', 'h-5', 'h-6', 'h-7', 'h-8'];
    
    switch (urgency?.toLowerCase()) {
      case "low":
        return {
          bars: [
            { height: 'h-3', color: 'bg-yellow-400', filled: true },
            { height: 'h-4', color: 'bg-yellow-500', filled: true },
            { height: 'h-5', color: 'bg-gray-200', filled: false },
            { height: 'h-6', color: 'bg-gray-200', filled: false },
            { height: 'h-7', color: 'bg-gray-200', filled: false },
            { height: 'h-8', color: 'bg-gray-200', filled: false }
          ]
        };
      case "normal":
      case "medium":
        return {
          bars: [
            { height: 'h-3', color: 'bg-green-400', filled: true },
            { height: 'h-4', color: 'bg-green-500', filled: true },
            { height: 'h-5', color: 'bg-green-500', filled: true },
            { height: 'h-6', color: 'bg-green-600', filled: true },
            { height: 'h-7', color: 'bg-gray-200', filled: false },
            { height: 'h-8', color: 'bg-gray-200', filled: false }
          ]
        };
      case "urgent":
      case "high":
        return {
          bars: [
            { height: 'h-3', color: 'bg-red-400', filled: true },
            { height: 'h-4', color: 'bg-red-500', filled: true },
            { height: 'h-5', color: 'bg-red-500', filled: true },
            { height: 'h-6', color: 'bg-red-600', filled: true },
            { height: 'h-7', color: 'bg-red-600', filled: true },
            { height: 'h-8', color: 'bg-red-700', filled: true }
          ]
        };
      default:
        return {
          bars: [
            { height: 'h-3', color: 'bg-gray-200', filled: false },
            { height: 'h-4', color: 'bg-gray-200', filled: false },
            { height: 'h-5', color: 'bg-gray-200', filled: false },
            { height: 'h-6', color: 'bg-gray-200', filled: false },
            { height: 'h-7', color: 'bg-gray-200', filled: false },
            { height: 'h-8', color: 'bg-gray-200', filled: false }
          ]
        };
    }
  };


    export const getStatusPillStyle = (status) => {
      switch (status) {
        case "Draft":
          return "bg-gray-500 text-white";
        case "Scheduled":
          return "bg-blue-500 text-white";
        case "Submitted":
          return "bg-green-500 text-white";
        case "Answered":
          return "bg-purple-500 text-white";
        default:
          return "bg-gray-400 text-white";
      }
    };


      // Helper function to format timeline activity text
  export const getTimelineActivityText = (activityType, activityData) => {
    switch (activityType) {
      case 'prayer_prayed':
        return 'prayed for this prayer';
      case 'prayer_commented':
        return activityData?.commentText 
          ? `commented: "${activityData.commentText.substring(0, 50)}${activityData.commentText.length > 50 ? '...' : ''}"`
          : 'commented on this prayer';
      case 'comment_reacted':
        return `reacted ${activityData?.reactionEmoji || '❤️'} to a comment`;
      case 'prayer_shared':
        return 'shared this prayer';
      case 'prayer_bookmarked':
        return 'bookmarked this prayer';
      default:
        return 'interacted with this prayer';
    }
  };


    // Helper function to get user name from timeline activity
  export const getTimelineUserName = (activity, currentUser) => {
    // Handle different user data structures
    if (activity.user?.firstname) {
      // Check if it's the current user
      const userId = activity.user._id || activity.user;
      if (userId === currentUser?._id) {
        return 'You';
      }
      return activity.user.firstname;
    }
    if (activity.user?.username) {
      // Check if it's the current user
      const userId = activity.user._id || activity.user;
      if (userId === currentUser?._id) {
        return 'You';
      }
      return activity.user.username;
    }
    if (typeof activity.user === 'string') {
      // User is just an ObjectId reference - check if it's current user
      if (activity.user === currentUser?._id) {
        return 'You';
      }
      return 'Someone';
    }
    return 'Unknown User';
  };


    // Helper function to get timeline activity icon
  export const getTimelineActivityIcon = (activityType, reaction) => {
    switch (activityType) {
      case 'prayer_prayed':
        return '🙏';
      case 'prayer_commented':
        return '💬';
      case 'comment_reacted':
        return `${reaction || ''}`;
      case 'prayer_shared':
        return '🔗';
      case 'prayer_bookmarked':
        return '🔖';
      default:
        return '📝';
    }
  };


    // Helper function to format timeline time
  export const formatTimelineTime = (dateString) => {
      try {
        const now = new Date();
        const date = new Date(dateString);
        
        // Check if the date is valid
        if (isNaN(date.getTime())) {
          return 'Unknown time';
        }
        
        const diffInMs = now - date;
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);
  
        if (diffInDays > 0) {
          return `${diffInDays}d ago`;
        } else if (diffInHours > 0) {
          return `${diffInHours}h ago`;
        } else {
          const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
          return diffInMinutes > 0 ? `${diffInMinutes}m ago` : 'Just now';
        }
      } catch (error) {
        console.error('Error formatting timeline time:', error);
        return 'Unknown time';
      }
    };
  