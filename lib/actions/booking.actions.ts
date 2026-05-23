'use server';

import { Booking, Event } from "@/database";
import { connectDB } from "../mongodb";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { auth } from "../auth";
import { headers } from "next/headers";

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
    let result: { success: boolean; message?: string } = { success: false };

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

      await Booking.create([{ eventId, email }], { session: dbSession });
      result = { success: true };
    });

    if (result.success) {
      revalidatePath(`/events/${slug}`);
    }

    return result;
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
  const connection = await connectDB();
  const session = await connection.startSession();

  try {
    let result: { success: boolean; message?: string } = { success: false };

    await session.withTransaction(async () => {
      const booking = await Booking.findOneAndDelete({ eventId, email }, { session });
      if (!booking) {
        result = { success: false, message: 'Booking not found' };
        await session.abortTransaction();
        return;
      }

      await Event.findByIdAndUpdate(eventId, { $inc: { slotsBooked: -1 } }, { session });
      result = { success: true };
    });

    if (result.success) {
      revalidatePath(`/events/${slug}`);
    }

    return result;
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