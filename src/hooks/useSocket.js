import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

/**
 * Custom hook for managing Socket.IO connection
 * Authentication is handled via cookies (withCredentials: true)
 * @returns {Object} { socket, isConnected, onlineUsers }
 */
export const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    // Get socket URL from environment or use default
    const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    console.log('Initializing socket connection to:', SOCKET_URL);

    // Initialize socket connection with cookie-based authentication
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
      
      // If server disconnected, attempt to reconnect
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error.message);
      setIsConnected(false);
      
      // Handle authentication errors
      if (error.message.includes('Authentication') || error.message.includes('jwt')) {
        console.error('Authentication error - token may be invalid or expired');
      }
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Receive initial list of online users when connecting
    socket.on('users:online-list', ({ userIds }) => {
      console.log('📋 Received online users list:', userIds);
      setOnlineUsers(new Set(userIds));
    });

    // Listen for individual user coming online
    socket.on('user:online', ({ userId }) => {
      console.log(`👤 User ${userId} is online`);
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    // Listen for user going offline
    socket.on('user:offline', ({ userId }) => {
      console.log(`👤 User ${userId} is offline`);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up socket connection');
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.off('error');
        socket.off('users:online-list');
        socket.off('user:online');
        socket.off('user:offline');
        socket.disconnect();
      }
    };
  }, []);

  return { 
    socket: socketRef.current, 
    isConnected,
    onlineUsers
  };
};

export default useSocket;
