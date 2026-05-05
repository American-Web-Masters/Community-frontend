import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  unreadCount: 0,
  pagination: {
    currentPage: 1,
    totalCount: 0,
    hasNextPage: false,
  },
  loading: false,
  error: null,
  bootstrapped: false,
};

const uniqueById = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const id = item?._id;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

const countUnread = (items) => items.filter((item) => item && item.isRead === false).length;

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotificationsLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
    setNotificationsError: (state, action) => {
      state.error = action.payload || null;
    },
    setNotificationsBootstrapped: (state, action) => {
      state.bootstrapped = Boolean(action.payload);
    },
    setNotificationsPage: (state, action) => {
      const {
        notifications = [],
        pagination = {},
        append = false,
      } = action.payload || {};

      const incoming = Array.isArray(notifications) ? notifications : [];
      state.items = append ? uniqueById([...state.items, ...incoming]) : uniqueById(incoming);
      state.pagination = {
        currentPage: pagination.currentPage || 1,
        totalCount: pagination.totalCount || state.items.length,
        hasNextPage: Boolean(pagination.hasNextPage),
      };
      state.unreadCount = countUnread(state.items);
      state.error = null;
    },
    upsertNotification: (state, action) => {
      const notification = action.payload;
      if (!notification?._id) return;

      const existingIndex = state.items.findIndex((item) => item._id === notification._id);
      if (existingIndex >= 0) {
        state.items[existingIndex] = notification;
      } else {
        state.items.unshift(notification);
      }

      // Keep local list bounded.
      if (state.items.length > 100) {
        state.items = state.items.slice(0, 100);
      }

      state.unreadCount = countUnread(state.items);
    },
    markNotificationReadLocal: (state, action) => {
      const id = action.payload;
      const target = state.items.find((item) => item._id === id);
      if (!target || target.isRead) return;
      target.isRead = true;
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    markAllNotificationsReadLocal: (state) => {
      state.items = state.items.map((item) => ({ ...item, isRead: true }));
      state.unreadCount = 0;
    },
    resetNotifications: () => ({ ...initialState }),
  },
});

export const {
  setNotificationsLoading,
  setNotificationsError,
  setNotificationsBootstrapped,
  setNotificationsPage,
  upsertNotification,
  markNotificationReadLocal,
  markAllNotificationsReadLocal,
  resetNotifications,
} = notificationSlice.actions;

export const selectNotifications = (state) => state.notifications.items;
export const selectNotificationsUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationsPagination = (state) => state.notifications.pagination;
export const selectNotificationsLoading = (state) => state.notifications.loading;
export const selectNotificationsBootstrapped = (state) => state.notifications.bootstrapped;

export default notificationSlice.reducer;
