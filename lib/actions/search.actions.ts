'use server';

import { connectDB } from '../mongodb';
import Event from '@/database/event.model';

export type SearchEventResult = {
  _id: string;
  title: string;
  slug: string;
  image: string;
  location: string;
  date: string;
  time: string;
  mode: string;
};

export type FilterOptions = {
  locations: string[];
  tags: string[];
};

export type SearchFilters = {
  query?: string;
  tags?: string;
  date?: string;
  location?: string;
  mode?: string;
};

const buildDateFilter = (date: string) => {
  const today = new Date().toISOString().split('T')[0];
  const addDays = (days: number) =>
    new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  if (date === 'upcoming') return { $gte: today };
  if (date === 'this-week') return { $gte: today, $lte: addDays(7) };
  if (date === 'this-month') return { $gte: today, $lte: addDays(30) };
  if (date === 'past') return { $lt: today };
  return null;
};

export const searchEvents = async (filters: SearchFilters): Promise<SearchEventResult[]> => {
  await connectDB();

  const filter: Record<string, unknown> = {};

  if (filters.query?.trim()) {
    filter.$or = [
      { title: { $regex: filters.query.trim(), $options: 'i' } },
      { description: { $regex: filters.query.trim(), $options: 'i' } },
      { organizer: { $regex: filters.query.trim(), $options: 'i' } },
    ];
  }

  if (filters.tags) {
    filter.tags = { $in: filters.tags.split(',').map((t) => t.trim()) };
  }

  if (filters.location) filter.location = filters.location;
  if (filters.mode) filter.mode = filters.mode;

  if (filters.date) {
    const dateFilter = buildDateFilter(filters.date);
    if (dateFilter) filter.date = dateFilter;
  }

  const events = await Event.find(filter)
    .sort({ date: 1 })
    .select('title slug image location date time mode')
    .lean();

  return events.map((e) => ({
    _id: e._id.toString(),
    title: e.title,
    slug: e.slug,
    image: e.image,
    location: e.location,
    date: e.date,
    time: e.time,
    mode: e.mode,
  }));
};

export const getFilterOptions = async (): Promise<FilterOptions> => {
  await connectDB();
  const [locations, tags] = await Promise.all([
    Event.distinct('location'),
    Event.distinct('tags'),
  ]);
  return {
    locations: (locations as string[]).sort(),
    tags: (tags as string[]).sort(),
  };
};
