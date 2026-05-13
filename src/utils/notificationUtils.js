export const actorLabel = (actor) => {
  if (!actor) return 'Someone';
  const fullName = [actor.firstname, actor.lastname].filter(Boolean).join(' ').trim();
  return fullName || actor.username || 'Someone';
};

const aggregateSuffix = (count) => {
  const total = Number(count) || 1;
  if (total <= 1) return '';
  const others = Math.max(total - 1, 0);
  return ` and ${others} other${others === 1 ? '' : 's'}`;
};

export const buildNotificationText = (notification) => {
  const first = actorLabel(notification?.actors?.[0]);
  const suffix = aggregateSuffix(notification?.count);

  switch (notification?.type) {
    case 'PRAYER_LIKED':
      return `${first}${suffix} liked your prayer`;
    case 'PRAYER_COMMENTED':
      return `${first}${suffix} commented on your prayer`;
    case 'COMMENT_REPLIED':
      return `${first}${suffix} replied to your comment`;
    case 'PRAYER_SHARED':
      return `${first}${suffix} shared your prayer`;
    case 'COMMUNITY_POST':
      return `${first}${suffix} posted in your community`;
    case 'COMMUNITY_JOIN':
      return `${first}${suffix} joined your community`;
    case 'FORUM_REPLY':
      return `${first}${suffix} interacted on your forum thread`;
    case 'MESSAGE_RECEIVED':
      return `${first}${suffix} sent you a message`;
    case 'SUBSCRIPTION_CREATED':
      return `${first}${suffix} created a subscription`;
    default:
      return `${first}${suffix} sent a notification`;
  }
};

export const getNotificationTargetPath = (notification, currentUsername) => {
  const type = notification?.type;
  const entityType = notification?.entityType;
  const metadata = notification?.metadata || {};

  const prayerId = metadata?.prayerId || notification?.entityId;
  const communityId = metadata?.communityId || notification?.entityId;
  const forumId = metadata?.forumId || notification?.entityId;

  if (type === 'MESSAGE_RECEIVED') {
    if (metadata?.scope === 'group') {
      return metadata?.communityId
        ? `/messages?chat=group&community=${encodeURIComponent(metadata.communityId)}`
        : '/messages?chat=group';
    }

    return metadata?.senderId
      ? `/messages?chat=direct&user=${encodeURIComponent(metadata.senderId)}`
      : '/messages';
  }

  if (
    type === 'PRAYER_LIKED' ||
    type === 'PRAYER_COMMENTED' ||
    type === 'PRAYER_SHARED' ||
    type === 'COMMENT_REPLIED' ||
    entityType === 'PRAYER' ||
    entityType === 'COMMENT'
  ) {
    // When clicking a prayer notification, go to the prayer context via home feed
    return prayerId ? `/?prayer=${encodeURIComponent(prayerId)}` : '/';
  }

  if (type === 'COMMUNITY_POST' || type === 'COMMUNITY_JOIN' || entityType === 'COMMUNITY') {
    return communityId ? `/communities/${communityId}` : '/communities';
  }

  if (type === 'FORUM_REPLY' || entityType === 'FORUM') {
    return forumId ? `/help-center?forum=${encodeURIComponent(forumId)}` : '/help-center';
  }

  if (type === 'SUBSCRIPTION_CREATED' || entityType === 'SUBSCRIPTION') {
    return currentUsername ? `/profile/${currentUsername}` : '/';
  }

  return '/updates';
};

export const getNotificationDateGroup = (createdAt) => {
  if (!createdAt) return 'Older';

  const now = new Date();
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return 'Older';

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (date >= startOfToday) return 'Today';
  if (date >= startOfYesterday) return 'Yesterday';
  return 'Older';
};

export const formatNotificationTime = (createdAt) => {
  if (!createdAt) return 'Just now';

  const now = new Date();
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return 'Just now';

  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'now';
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
  if (diffMinutes < 10080) return `${Math.floor(diffMinutes / 1440)}d`;

  return date.toLocaleDateString();
};
