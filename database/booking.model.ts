import mongoose, { Schema, Model, Document, Types } from 'mongoose';
import Event, { IEvent } from './event.model';

/**
 * TypeScript interface for Booking document
 */
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema for Booking
 */
const BookingSchema: Schema<IBooking> = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      index: true, // Index for faster queries on eventId
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (value: string): boolean {
          // Email validation regex
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * Pre-save hook: Verify that the referenced event exists
 * Throws an error if the event does not exist, preventing orphaned bookings
 */
BookingSchema.pre('save', async function (this: IBooking) {
  const event: IEvent | null = await Event.findById(this.eventId);
  if (!event) {
    throw new Error(`Event with ID ${this.eventId} does not exist`);
  }
});

// Index on eventId and createdAt for faster queries
BookingSchema.index({eventId:1, createdAt:-1});
// Index on email for faster queries
BookingSchema.index({ email: 1 });
// Index on eventId and email for faster queries
BookingSchema.index({ eventId: 1, email: 1 }, { unique: true, name: 'eventId_email_unique' });

/**
 * Booking model
 */
const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;

