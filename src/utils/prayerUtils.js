export function localInputToUTC(localString) {
    // localString example: "2025-11-17T22:15"
    const [datePart, timePart] = localString.split("T");

    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    // Create a date in LOCAL time (not UTC)
    const localDate = new Date(year, month - 1, day, hour, minute);

    return localDate.toISOString(); // auto converts to UTC
}


 export const getActivityText = (activityType) => {
    switch (activityType) {
      case 'comment':
        return 'commented on your prayer';
      case 'prayed':
        return 'prayed for your prayer';
      case 'share':
        return 'shared your prayer';
      default:
        return 'interacted with your prayer';
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