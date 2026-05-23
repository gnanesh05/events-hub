'use server';

import { auth } from '../auth';
import { headers } from 'next/headers';
import { connectDB } from '../mongodb';
import Notification, { INotification } from '@/database/notification.model';

export type NotificationData = {
  _id: string;
  type: INotification['type'];
  message: string;
  eventSlug: string;
  read: boolean;
  createdAt: string;
};

export type NotificationsResult = {
  notifications: NotificationData[];
  unreadCount: number;
};

export const getNotifications = async (): Promise<
  { success: true; data: NotificationsResult } | { success: false; message: string }
> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, message: 'Not authenticated' };

  await connectDB();

  const notifications = await Notification.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const data: NotificationData[] = notifications.map((n) => ({
    _id: n._id.toString(),
    type: n.type,
    message: n.message,
    eventSlug: n.eventSlug,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }));

  const unreadCount = data.filter((n) => !n.read).length;

  return { success: true, data: { notifications: data, unreadCount } };
};

export const markAsRead = async (notificationId: string): Promise<void> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return;

  await connectDB();
  await Notification.findOneAndUpdate(
    { _id: notificationId, userId: session.user.id },
    { read: true }
  );
};

export const markAllAsRead = async (): Promise<void> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return;

  await connectDB();
  await Notification.updateMany({ userId: session.user.id, read: false }, { read: true });
};
