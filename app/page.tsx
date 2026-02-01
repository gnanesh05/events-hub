import ExploreButton from "@/components/ui/Button/ExploreButton"
import EventCard from "@/components/ui/EventCard"
import { IEvent } from "@/database/event.model"
import { cacheLife } from "next/cache";
async function Home() {
  'use cache';
  cacheLife('hours');
  const response= await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events`);
  const {events}= await response.json();
 
  return (
    <section>
      <h1 className="text-center">The Hub for every event <br/> you can&apos;t miss</h1>
      <p className="text-center mt-5">Workshops, Hackathons, Conferences and more</p>

      <ExploreButton />

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>
        <ul className="events">
          {events && events.length > 0 && events.map((event:IEvent)=>(
            <li key={event.title} className="list-none">
              <EventCard title={event.title} image={event.image} slug={event.slug} location={event.location} date={event.date} time={event.time} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Home