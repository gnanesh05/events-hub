'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { deleteEvent } from '@/lib/actions/event.actions';
import { OrganizerEvent } from '@/lib/actions/dashboard.actions';

const EmptyState = ({ isUpcoming }: { isUpcoming: boolean }) => (
  <div className="text-center py-20">
    <p className="text-lg opacity-60">
      {isUpcoming ? "You have no upcoming events." : "No past events yet."}
    </p>
    {isUpcoming && (
      <Link href="/events/create" className="mt-4 inline-block underline opacity-80">
        Create your first event
      </Link>
    )}
  </div>
);

const OrganizerDashboard = ({ events, isUpcoming }: { events: OrganizerEvent[]; isUpcoming: boolean }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = (eventId: string, title: string) => {
    if (!confirm(`Delete "${title}"? This will also cancel all registrations.`)) return;

    startTransition(async () => {
      const result = await deleteEvent(eventId);
      if (result.success) {
        toast.success('Event deleted');
        router.refresh();
      } else {
        toast.error(result.message ?? 'Failed to delete event');
      }
    });
  };

  if (events.length === 0) return <EmptyState isUpcoming={isUpcoming} />;

  return (
    <ul className="events">
      {events.map((event) => (
        <li key={event._id} className="list-none flex flex-col gap-3">
          <div className="relative">
            <Link href={`/events/${event.slug}`}>
              <Image
                src={event.image}
                alt={event.title}
                width={410}
                height={300}
                className="poster"
              />
            </Link>

            <div className="absolute top-2 right-2 flex gap-2">
              {isUpcoming && (
                <button
                  onClick={() => router.push(`/events/${event.slug}/edit`)}
                  title="Edit event"
                  className="p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-colors cursor-pointer"
                >
                  <FiEdit2 size={15} />
                </button>
              )}
              <button
                onClick={() => handleDelete(event._id, event.title)}
                disabled={isPending}
                title="Delete event"
                className="p-2 rounded-lg bg-black/60 hover:bg-red-500/80 text-white backdrop-blur-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                <FiTrash2 size={15} />
              </button>
            </div>
          </div>

          <div className="flex flex-row gap-2 text-gray-50">
            <Image src="/icons/pin.svg" alt="location" width={14} height={14} />
            <p className="text-sm font-light">{event.location}</p>
          </div>

          <p className="text-[20px] font-semibold line-clamp-1">{event.title}</p>

          <div className="flex flex-row flex-wrap items-center gap-4">
            <div className="flex flex-row gap-2">
              <Image src="/icons/calendar.svg" alt="date" width={14} height={14} />
              <p className="text-sm font-light">{event.date}</p>
            </div>
            <div className="flex flex-row gap-2">
              <Image src="/icons/clock.svg" alt="time" width={14} height={14} />
              <p className="text-sm font-light">{event.time}</p>
            </div>
          </div>

          <p className="text-sm text-primary font-medium">
            {event.slotsBooked} / {event.bookingSlots} registered
          </p>
        </li>
      ))}
    </ul>
  );
};

export default OrganizerDashboard;
