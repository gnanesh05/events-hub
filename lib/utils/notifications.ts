import Notification, { NotificationType } from '@/database/notification.model';

type CreateNotificationParams = {
  userId: string;
  type: NotificationType;
  message: string;
  eventId: string;
  eventSlug: string;
};

// Internal utility — not a server action. Called within server actions after
// the main operation succeeds. Wrapped in try/catch at call sites so a
// notification failure never rolls back the primary operation.
export const createNotification = async (params: CreateNotificationParams): Promise<void> => {
  await Notification.create(params);
};

export const createNotificationsForParticipants = async ({
  participantUserIds,
  type,
  message,
  eventId,
  eventSlug,
}: {
  participantUserIds: string[];
  type: NotificationType;
  message: string;
  eventId: string;
  eventSlug: string;
}): Promise<void> => {
  if (participantUserIds.length === 0) return;

  const docs = participantUserIds.map((userId) => ({
    userId,
    type,
    message,
    eventId,
    eventSlug,
    read: false,
  }));

  await Notification.insertMany(docs);
};
