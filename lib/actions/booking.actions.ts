'use server';

import { Booking } from "@/database";
import { connectDB } from "../mongodb";

export const bookEvent = async (eventId: string, slug: string, email: string) => {
  try {
    await connectDB();
    await Booking.create({ eventId, email });
    return { success: true};
  } catch (error) {
    console.error('Error booking event:', error);
    return { success: false };
  }
};