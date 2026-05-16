import EventCard from '@/components/ui/EventCard'
import { IEvent } from '@/database/event.model'
import { cacheLife } from 'next/cache'

async function Events() {
  'use cache'
  cacheLife('hours')

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events?limit=all`)
  const { events } = await response.json()

  return (
    <section>
      <h1 className="text-center">Explore All Events</h1>
      <p className="text-center mt-5">Browse workshops, hackathons, conferences and more</p>

      <div className="mt-20 space-y-7">
        <ul className="events">
          {events && events.length > 0 && events.map((event: IEvent) => (
            <li key={event.title} className="list-none">
              <EventCard title={event.title} image={event.image} slug={event.slug} location={event.location} date={event.date} time={event.time} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
} 

export default Events