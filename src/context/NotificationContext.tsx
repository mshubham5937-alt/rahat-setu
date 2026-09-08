import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { Notification } from '../types';
import { DEMO_NOTIFICATIONS } from '../data/demoData';
import { storage } from '../services/persistence';
import { notificationService } from '../services/notificationService';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  addManualNotification: (data: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[] | null>(null);

  useEffect(() => {
    (async () => {
      const saved = await storage.getAll<Notification>('notifications');
      setNotifications(saved && saved.length > 0 ? saved : DEMO_NOTIFICATIONS);
    })();
  }, []);

  const persist = useCallback((next: Notification[]) => {
    setNotifications(next);
    (async () => {
      await storage.clear('notifications');
      for (const n of next) {
        await storage.set('notifications', n.id, n);
      }
    })();
  }, []);

  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  const addManualNotification = useCallback(
    (data: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
      const created = notificationService.create(data);
      persist([created, ...(notifications || [])]);
    },
    [notifications, persist]
  );

  const markAsRead = useCallback(
    (id: string) => {
      if (!notifications) return;
      persist(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
    },
    [notifications, persist]
  );

  const markAllAsRead = useCallback(() => {
    if (!notifications) return;
    persist(notifications.map((n) => ({ ...n, read: true })));
  }, [notifications, persist]);

  const clearAll = useCallback(() => {
    persist([]);
  }, [persist]);

  return (
    <NotificationContext.Provider
      value={{ notifications: notifications || [], unreadCount, addManualNotification, markAsRead, markAllAsRead, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}