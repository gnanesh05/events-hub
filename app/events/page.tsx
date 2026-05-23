import { Suspense } from 'react';
import { searchEvents, getFilterOptions, SearchFilters } from '@/lib/actions/search.actions';
import SearchEvents from '@/components/search/SearchEvents';

interface Props {
  searchParams: Promise<Record<string, string>>;
}

async function EventsPage({ searchParams }: Props) {
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

  return (
    <section>
      <h1 className="text-center">Explore All Events</h1>
      <p className="text-center mt-5">Browse workshops, hackathons, conferences and more</p>

      <Suspense>
        <SearchEvents events={events} filterOptions={filterOptions} />
      </Suspense>
    </section>
  );
}

export default EventsPage;
