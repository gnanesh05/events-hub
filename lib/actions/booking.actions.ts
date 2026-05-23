'use server';

import { Booking, Event } from "@/database";
import { connectDB } from "../mongodb";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { auth } from "../auth";
import { headers } from "next/headers";
import { createNotification } from "../utils/notifications";

export const bookEvent = async (eventId: string, slug: string, email: string) => {
  const authSession = await auth.api.getSession({ headers: await headers() });
  if (!authSession) {
    return { success: false, message: 'You must be logged in to book an event' };
  }
  if (authSession.user.role === 'organizer') {
    return { success: false, message: 'Organizers cannot book events' };
  }

  const connection = await connectDB();
  const dbSession = await connection.startSession();

  try {
    let result: { success: boolean; message?: string; event?: { organizerId: string; title: string } } = { success: false };

    await dbSession.withTransaction(async () => {
      const event = await Event.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(eventId), $expr: { $lt: ["$slotsBooked", "$bookingSlots"] } },
        { $inc: { slotsBooked: 1 } },
        { new: true, session: dbSession }
      );

      if (!event) {
        const exists = await Event.findById(eventId).session(dbSession);
        result = exists
          ? { success: false, message: 'Booking slots are full' }
          : { success: false, message: 'Event not found' };
        await dbSession.abortTransaction();
        return;
      }

      const name = authSession.user.name ?? email;
      await Booking.create([{ eventId, email, name }], { session: dbSession });
      result = { success: true, event: { organizerId: event.organizerId, title: event.title } };
    });

    if (result.success && result.event) {
      revalidatePath(`/events/${slug}`);

      try {
        await createNotification({
          userId: result.event.organizerId,
          type: 'new_booking',
          message: `${authSession.user.name ?? email} registered for "${result.event.title}"`,
          eventId,
          eventSlug: slug,
        });
      } catch (e) {
        console.error('Failed to create booking notification:', e);
      }
    }

    return { success: result.success, message: result.message };
  } catch (error) {
    console.error('Error booking event:', error);
    if ((error as { code?: number }).code === 11000) {
      return { success: false, message: 'You have already booked this event' };
    }
    return { success: false, message: 'Failed to book event' };
  } finally {
    await dbSession.endSession();
  }
};

export const cancelBooking = async (eventId: string, slug: string, email: string) => {
  const authSession = await auth.api.getSession({ headers: await headers() });
  const connection = await connectDB();
  const session = await connection.startSession();

  try {
    let result: { success: boolean; message?: string; organizerId?: string; eventTitle?: string } = { success: false };

    await session.withTransaction(async () => {
      const event = await Event.findByIdAndUpdate(
        eventId,
        { $inc: { slotsBooked: -1 } },
        { session, new: true }
      );

      if (!event) {
        result = { success: false, message: 'Event not found' };
        await session.abortTransaction();
        return;
      }

      const booking = await Booking.findOneAndDelete({ eventId, email }, { session });
      if (!booking) {
        result = { success: false, message: 'Booking not found' };
        await session.abortTransaction();
        return;
      }

      result = { success: true, organizerId: event.organizerId, eventTitle: event.title };
    });

    if (result.success) {
      revalidatePath(`/events/${slug}`);

      if (result.organizerId && authSession) {
        try {
          await createNotification({
            userId: result.organizerId,
            type: 'booking_cancelled',
            message: `${authSession.user.name ?? email} cancelled registration for "${result.eventTitle}"`,
            eventId,
            eventSlug: slug,
          });
        } catch (e) {
          console.error('Failed to create cancellation notification:', e);
        }
      }
    }

    return { success: result.success, message: result.message };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return { success: false, message: 'Failed to cancel booking' };
  } finally {
    await session.endSession();
  }
};

export const hasUserBookedEvent = async (eventId: string, email: string) => {
  try {
    await connectDB();
    const booking = await Booking.findOne({ eventId, email });
    return booking ? true : false;
  } catch (error) {
    console.error('Error checking if user has booked event:', error);
    return false;
  }
};
