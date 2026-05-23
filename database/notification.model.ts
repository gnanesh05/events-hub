import mongoose, { Schema, Model, Document } from 'mongoose';

export type NotificationType = 'new_booking' | 'booking_cancelled' | 'event_updated' | 'event_deleted';

export interface INotification extends Document {
  userId: string;
  type: NotificationType;
  message: string;
  eventId: string;
  eventSlug: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ['new_booking', 'booking_cancelled', 'event_updated', 'event_deleted'],
    },
    message: { type: String, required: true },
    eventId: { type: String, required: true },
    eventSlug: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// TTL index — MongoDB auto-deletes documents 30 days after createdAt
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
// Compound index for fast per-user queries sorted by date
NotificationSchema.index({ userId: 1, createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
