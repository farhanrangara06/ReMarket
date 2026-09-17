import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as notificationService from '../services/notificationService';

export const useNotifications = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await notificationService.getUnreadCount();
      setUnreadCount(data.unreadCount);
    } catch {
      // Silently fail for badge polling
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async (params = {}) => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const response = await notificationService.getNotifications(params);
      setNotifications(response.data);
      if (response.pagination?.unreadCount !== undefined) {
        setUnreadCount(response.pagination.unreadCount);
      }
      return response;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const markRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
    setUnreadCount(0);
    setNotifications([]);
  }, [isAuthenticated, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markRead,
    markAllRead,
  };
};
