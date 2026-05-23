'use server';

import { auth } from "../auth";
import { headers } from "next/headers";
import { connectDB } from "../mongodb";
import Booking from "@/database/booking.model";
import Event from "@/database/event.model";

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

export type OrganizerEvent = {
  _id: string;
  title: string;
  slug: string;
  image: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  venue: string;
  description: string;
  overview: string;
  audience: string;
  organizer: string;
  agenda: string[];
  tags: string[];
  bookingSlots: number;
  slotsBooked: number;
};

export type OrganizerEventsResult = { upcoming: OrganizerEvent[]; past: OrganizerEvent[] };

export const getOrganizerEvents = async (): Promise<
  { success: true; data: OrganizerEventsResult } | { success: false; message: string }
> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== 'organizer') {
    return { success: false, message: 'Unauthorized' };
  }

  await connectDB();

  const today = new Date().toISOString().split('T')[0];

  const rawEvents = await Event.find({ organizerId: String(session.user.id) }).lean();

  const upcoming = rawEvents
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  const past = rawEvents
    .filter((e) => e.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));

  const toOrganizerEvent = (e: (typeof rawEvents)[number]): OrganizerEvent => ({
    _id: e._id.toString(),
    title: e.title,
    slug: e.slug,
    image: e.image,
    location: e.location,
    date: e.date,
    time: e.time,
    mode: e.mode,
    venue: e.venue,
    description: e.description,
    overview: e.overview,
    audience: e.audience,
    organizer: e.organizer,
    agenda: e.agenda,
    tags: e.tags,
    bookingSlots: e.bookingSlots,
    slotsBooked: e.slotsBooked,
  });

  return {
    success: true,
    data: {
      upcoming: upcoming.map(toOrganizerEvent),
      past: past.map(toOrganizerEvent),
    },
  };
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
