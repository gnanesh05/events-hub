import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import Event from '@/database/event.model';
import CreateEventForm, { EventDefaultValues } from '@/components/CreateEventForm';
import { updateEvent } from '@/lib/actions/event.actions';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EditEventPage({ params }: Props) {
  const { slug } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');
  if (session.user.role !== 'organizer') redirect('/');

  await connectDB();
  const event = await Event.findOne({ slug }).lean();

  if (!event) redirect('/dashboard');
  if (event.organizerId !== String(session.user.id)) redirect('/dashboard');

  const boundUpdateEvent = updateEvent.bind(null, slug);

  const defaultValues: EventDefaultValues = {
    title: event.title,
    description: event.description,
    overview: event.overview,
    image: event.image,
    venue: event.venue,
    location: event.location,
    date: event.date,
    time: event.time,
    mode: event.mode,
    audience: event.audience,
    agenda: event.agenda.join('\n'),
    organizer: event.organizer,
    tags: event.tags.join(', '),
    bookingSlots: event.bookingSlots,
  };

  return (
    <div>
      <h1 className="text-3xl text-center mb-4 font-bold">Edit Event</h1>
      <CreateEventForm mode="edit" defaultValues={defaultValues} serverAction={boundUpdateEvent} />
    </div>
  );
}
