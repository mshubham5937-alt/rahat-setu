import type { Notification } from '../types';

let counter = 1;

export const notificationService = {
  create(data: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification {
    return {
      ...data,
      id: `notif-${Date.now()}-${counter++}`,
      createdAt: new Date(),
      read: false,
    };
  },
};