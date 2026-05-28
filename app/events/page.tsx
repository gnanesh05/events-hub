import { Suspense } from 'react';
import { searchEvents, getFilterOptions, SearchFilters } from '@/lib/actions/search.actions';
import SearchEvents from '@/components/search/SearchEvents';
import PageHeader from '@/components/ui/PageHeader';

interface Props {
  searchParams: Promise<Record<string, string>>;
}

const EventsResultsSkeleton = () => (
  <div className="flex flex-col gap-4 mt-10">
    <div className="h-11 w-full bg-white/10 rounded-xl animate-pulse" />
    <div className="flex gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-10 w-28 bg-white/10 rounded-lg animate-pulse" />
      ))}
    </div>
    <ul className="events mt-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="list-none space-y-3">
          <div className="h-[300px] w-full bg-white/10 rounded-lg animate-pulse" />
          <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-white/10 rounded animate-pulse" />
        </li>
      ))}
    </ul>
  </div>
);

async function EventsResults({ searchParams }: Props) {
  const params = await searchParams;

  const filters: SearchFilters = {
    query: params.q,
    tags: params.tags,
    date: params.date,
    location: params.location,
    mode: params.mode,
  };

  const [events, filterOptions] = await Promise.all([
    searchEvents(filters),
    getFilterOptions(),
  ]);

  return <SearchEvents events={events} filterOptions={filterOptions} />;
}

export default function EventsPage({ searchParams }: Props) {
  return (
    <section>
      <PageHeader title="Explore All Events" subtitle="Browse workshops, hackathons, conferences and more" />

      <Suspense fallback={<EventsResultsSkeleton />}>
        <EventsResults searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
