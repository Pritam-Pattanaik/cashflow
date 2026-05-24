import { create } from 'zustand';
import type { Notification } from '../types';
import api from '../lib/api';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const response: any = await api.get('/api/notifications?limit=20');
      set({ notifications: response.data || response || [], loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response: any = await api.get('/api/notifications/unread-count');
      set({ unreadCount: response.count || 0 });
    } catch (err) {}
  },

  markAsRead: async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      set({
        notifications: get().notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, get().unreadCount - 1),
      });
    } catch (err) {}
  },

  markAllAsRead: async () => {
    try {
      await api.patch('/api/notifications/read-all');
      set({
        notifications: get().notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      });
    } catch (err) {}
  },
}));
