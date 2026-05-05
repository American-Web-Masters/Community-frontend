import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notifications';
import {
  markAllNotificationsReadLocal,
  markNotificationReadLocal,
  resetNotifications,
  selectNotificationsLoading,
  selectNotificationsPagination,
  setNotificationsBootstrapped,
  setNotificationsError,
  setNotificationsLoading,
  setNotificationsPage,
  upsertNotification,
} from '../store/notificationSlice';
import { selectIsLoggedIn } from '../store/userSlice';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getSocketAuthToken = () => {
  const candidates = ['token', 'jwt', 'jwtToken', 'accessToken'];
  for (const key of candidates) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }
  return '';
};

export const useNotificationActions = () => {
  const dispatch = useDispatch();
  const loading = useSelector(selectNotificationsLoading);
  const pagination = useSelector(selectNotificationsPagination);

  const refreshNotifications = useCallback(async () => {
    dispatch(setNotificationsLoading(true));

    try {
      const response = await getNotifications({ page: 1, limit: 20 });
      const data = response?.data?.data || {};
      dispatch(
        setNotificationsPage({
          notifications: data.notifications || [],
          pagination: data.pagination || {},
          append: false,
        })
      );
      dispatch(setNotificationsBootstrapped(true));
    } catch (error) {
      dispatch(setNotificationsError(error?.response?.data?.message || 'Failed to fetch notifications'));
    } finally {
      dispatch(setNotificationsLoading(false));
    }
  }, [dispatch]);

  const loadMoreNotifications = useCallback(async () => {
    if (loading || !pagination?.hasNextPage) return;

    dispatch(setNotificationsLoading(true));

    try {
      const nextPage = (pagination?.currentPage || 1) + 1;
      const response = await getNotifications({ page: nextPage, limit: 20 });
      const data = response?.data?.data || {};
      dispatch(
        setNotificationsPage({
          notifications: data.notifications || [],
          pagination: data.pagination || {},
          append: true,
        })
      );
    } catch (error) {
      dispatch(setNotificationsError(error?.response?.data?.message || 'Failed to load more notifications'));
    } finally {
      dispatch(setNotificationsLoading(false));
    }
  }, [dispatch, loading, pagination]);

  const markOneAsRead = useCallback(
    async (notificationId) => {
      if (!notificationId) return;

      dispatch(markNotificationReadLocal(notificationId));

      try {
        await markNotificationRead(notificationId);
      } catch (error) {
        // Sync from server on failure so local state stays correct.
        await refreshNotifications();
        throw error;
      }
    },
    [dispatch, refreshNotifications]
  );

  const markAllAsRead = useCallback(async () => {
    dispatch(markAllNotificationsReadLocal());

    try {
      await markAllNotificationsRead();
    } catch (error) {
      await refreshNotifications();
      throw error;
    }
  }, [dispatch, refreshNotifications]);

  return {
    refreshNotifications,
    loadMoreNotifications,
    markOneAsRead,
    markAllAsRead,
  };
};

export const useNotificationBootstrap = () => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const socketRef = useRef(null);
  const hasConnectedRef = useRef(false);

  const { refreshNotifications } = useNotificationActions();

  useEffect(() => {
    if (!isLoggedIn) {
      dispatch(resetNotifications());
      if (socketRef.current) {
        socketRef.current.off('notification');
        socketRef.current.off('connect');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      hasConnectedRef.current = false;
      return;
    }

    refreshNotifications();

    const token = getSocketAuthToken();
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      auth: token ? { token } : undefined,
      query: token ? { token } : undefined,
    });

    socketRef.current = socket;

    const onConnect = () => {
      if (hasConnectedRef.current) {
        refreshNotifications();
      }
      hasConnectedRef.current = true;
    };

    const onNotification = (notification) => {
      dispatch(upsertNotification(notification));
    };

    socket.on('connect', onConnect);
    socket.on('notification', onNotification);

    return () => {
      socket.off('connect', onConnect);
      socket.off('notification', onNotification);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [dispatch, isLoggedIn, refreshNotifications]);
};
