'use server';

import { Booking, Event } from "@/database";
import { connectDB } from "../mongodb";

export const bookEvent = async (eventId: string, slug: string, email: string) => {
  try {
    await connectDB();
    const event = await Event.findById(eventId);
    if (!event) {
      return { success: false, message: 'Event not found' };
    }
    if (event.bookingSlots <= event.slotsBooked) {
      return { success: false, message: 'Booking slots are full' };
    }
    await Booking.create({ eventId, email });
    await Event.findByIdAndUpdate(eventId, { $inc: { slotsBooked: 1 } });
    return { success: true};
  } catch (error) {
    console.error('Error booking event:', error);
    return { success: false };
  }
};