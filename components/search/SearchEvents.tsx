'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { debounce } from '@/lib/utils/debounce';
import { FiSearch, FiX } from 'react-icons/fi';
import EventCard from '@/components/ui/EventCard';
import { FilterOptions, SearchEventResult } from '@/lib/actions/search.actions';

interface Props {
  events: SearchEventResult[];
  filterOptions: FilterOptions;
}

const DATE_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'this-week', label: 'This week' },
  { value: 'this-month', label: 'This month' },
  { value: 'past', label: 'Past' },
];

const MODE_OPTIONS = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'hybrid', label: 'Hybrid' },
];

const SearchEvents = ({ events, filterOptions }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get('q') ?? '';
  const date = searchParams.get('date') ?? '';
  const location = searchParams.get('location') ?? '';
  const mode = searchParams.get('mode') ?? '';
  const tags = searchParams.get('tags') ?? '';

  const [inputValue, setInputValue] = useState(q);

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`/events?${params.toString()}`);
  }, [searchParams, router]);

  const toggleTag = useCallback((tag: string) => {
    const current = tags ? tags.split(',') : [];
    const next = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    updateParam('tags', next.join(','));
  }, [tags, updateParam]);

  const clearAll = useCallback(() => {
    setInputValue('');
    router.replace('/events');
  }, [router]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: string) => updateParam('q', value), 300),
    [updateParam]
  );

  useEffect(() => {
    debouncedSearch(inputValue);
  }, [inputValue, debouncedSearch]);

  // Sync input if URL param is cleared externally (e.g. clear all)
  useEffect(() => {
    setInputValue(q);
  }, [q]);

  const activeTags = tags ? tags.split(',') : [];
  const hasActiveFilters = !!(q || date || location || mode || tags);

  return (
    <div className="flex flex-col gap-4 mt-10">
      {/* Row 1 (desktop): search + filters — Row 2 (mobile): filters wrap below */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search input — grows to fill available space */}
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={18} />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search by title, description or organiser..."
            className="w-full bg-dark-200/40 border border-gray-600/50 rounded-xl pl-11 pr-10 py-2.5 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
          />
          {inputValue && (
            <button
              onClick={() => setInputValue('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-80 cursor-pointer"
            >
              <FiX size={16} />
            </button>
          )}
        </div>

        {/* Date */}
        <select
          value={date}
          onChange={(e) => updateParam('date', e.target.value)}
          className="search-filter-select"
        >
          <option value="">All dates</option>
          {DATE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Location */}
        <select
          value={location}
          onChange={(e) => updateParam('location', e.target.value)}
          className="search-filter-select"
        >
          <option value="">All locations</option>
          {filterOptions.locations.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        {/* Mode */}
        <select
          value={mode}
          onChange={(e) => updateParam('mode', e.target.value)}
          className="search-filter-select"
        >
          <option value="">All modes</option>
          {MODE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          >
            <FiX size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Tag chips */}
      {filterOptions.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filterOptions.tags.map((tag) => {
            const active = activeTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                  active
                    ? 'bg-primary/20 border-primary/60 text-primary'
                    : 'bg-dark-200/40 border-gray-600/40 text-foreground/60 hover:border-gray-500/60 hover:text-foreground/80'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      )}

      {/* Results */}
      <div className="mt-4">
        {events.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <p className="text-lg">No events found</p>
            {hasActiveFilters && (
              <button onClick={clearAll} className="mt-3 text-sm underline cursor-pointer">
                Clear filters
              </button>
            )}
          </div>
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
    </div>
  );
};

export default SearchEvents;
