import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getRegisteredEvents, DashboardEvent } from '@/lib/actions/dashboard.actions';
import EventCard from '@/components/ui/EventCard';

type Tab = 'upcoming' | 'past';

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

const EmptyState = ({ tab }: { tab: Tab }) => (
  <div className="text-center py-20">
    <p className="text-lg opacity-60">
      {tab === 'upcoming'
        ? "You have no upcoming events."
        : "You haven't attended any events yet."}
    </p>
    <Link href="/events" className="mt-4 inline-block underline opacity-80">
      Browse events
    </Link>
  </div>
);

export default async function DashboardPage({ searchParams }: Props) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const result = await getRegisteredEvents();
  if (!result.success) redirect('/login');

  const { upcoming, past } = result.data;

  const { tab: tabParam } = await searchParams;
  const activeTab: Tab = tabParam === 'past' ? 'past' : 'upcoming';
  const events: DashboardEvent[] = activeTab === 'upcoming' ? upcoming : past;

  return (
    <section>
      <h1 className="text-center">My Events</h1>
      <h4 className="text-center mt-5 font-bold">Events you&apos;ve registered for</h4>

      <div className="flex justify-center gap-6 mt-10">
        <Link
          href="?tab=upcoming"
          className={`tab-link ${activeTab === 'upcoming' ? 'tab-active' : ''}`}
        >
          Upcoming ({upcoming.length})
        </Link>
        <Link
          href="?tab=past"
          className={`tab-link ${activeTab === 'past' ? 'tab-active' : ''}`}
        >
          Past ({past.length})
        </Link>
      </div>

      <div className="mt-14">
        {events.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <ul className="events">
            {events.map((event) => (
              <li key={event._id} className="list-none">
                <EventCard
                  title={event.title}
                  image={event.image}
                  slug={event.slug}
                  location={event.location}
                  date={event.date}
                  time={event.time}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
