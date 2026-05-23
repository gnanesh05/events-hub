'use server';

import { auth } from "../auth";
import { headers } from "next/headers";
import { connectDB } from "../mongodb";
import Booking from "@/database/booking.model";

export type DashboardEvent = {
  _id: string;
  title: string;
  slug: string;
  image: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  venue: string;
};

export type RegisteredEventsResult = {
  upcoming: DashboardEvent[];
  past: DashboardEvent[];
};

export const getRegisteredEvents = async (): Promise<
  { success: true; data: RegisteredEventsResult } | { success: false; message: string }
> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { success: false, message: 'Not authenticated' };
  }

  await connectDB();

  const today = new Date().toISOString().split('T')[0];

  const bookings = await Booking.find({ email: session.user.email })
    .populate('eventId')
    .lean();

  const upcoming: DashboardEvent[] = [];
  const past: DashboardEvent[] = [];

  for (const booking of bookings) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const event = booking.eventId as any;
    if (!event) continue;

    const eventData: DashboardEvent = {
      _id: event._id.toString(),
      title: event.title,
      slug: event.slug,
      image: event.image,
      location: event.location,
      date: event.date,
      time: event.time,
      mode: event.mode,
      venue: event.venue,
    };

    if (event.date >= today) {
      upcoming.push(eventData);
    } else {
      past.push(eventData);
    }
  }

  upcoming.sort((a, b) => a.date.localeCompare(b.date));
  past.sort((a, b) => b.date.localeCompare(a.date));

  return { success: true, data: { upcoming, past } };
};
