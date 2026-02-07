import { IEvent } from '@/database/event.model';
import { getSimilarEventsBySlug } from '@/lib/actions/event.actions';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import BookEvent from '@/components/ui/BookEvent';
import EventCard from '@/components/ui/EventCard';

const EventDetailItem = ({icon, label, alt}:{icon:string, label:string, alt:string}) => {
    return (
      <div className="flex-row-gap-2 items-center">
        <Image src={icon} alt={alt} width={17} height={17} />
        <span>{label}</span>
      </div>
    )
  }
  
  const EventAgenda = ({agendaItems}:{agendaItems:string[]}) => {
    return (
      <div className="agenda">
        <h2>Agenda</h2>
        <ul>
          {agendaItems.map((item:string, index:number)=>(
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    )
  }
  
  const EventTags = ({tags}:{tags:string[]}) => {
    return (
      <div className="flex flex-row-gap-2 gap-1.5 flex-wrap">
       
          {tags.map((tag:string)=>(
            <div className="pill" key={tag}>{tag}</div>
          ))}
      </div>
    )
  }
  
const EventDetails = async ({params}:{params:Promise<{slug:string}>}) => {
    const {slug} = await params;
    let event;
    try{
      const request= await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${slug}`,{
        next: {
          revalidate: 60,
        },
      });
      if(!request.ok){
        if(request.status === 404){
          return notFound();
        }
        throw new Error('Failed to fetch event details');
      }
      const response = await request.json();
      event= response.event;
  
      if(!event){
        return notFound();
      }
    }
    catch(error){
      console.error('Error fetching event details:', error);
      return notFound();
    }
   
    const {description,title,image, overview, location,date,time, mode, audience, agenda, organizer, tags}= event;
    const similarEvents :IEvent[] = await getSimilarEventsBySlug(slug);
    const booking = 10;
    return (
      <section id="event">
        <div className="header">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
  
        <div className="details">
          <div className="content">
              <Image src={image} alt={title} width={800} height={800} className="banner" />
              <section className="flex-col-gap-2">
                <h2>Overview</h2>
                <p>{overview}</p>
              </section>
  
              <section className="flex-col-gap-2">
                <h2>Event Details</h2>
                <EventDetailItem icon="/icons/calendar.svg" label={date} alt="calendar" />
                <EventDetailItem icon="/icons/clock.svg" label={time} alt="time" />
                <EventDetailItem icon="/icons/pin.svg" label={location} alt="location" />
                <EventDetailItem icon="/icons/mode.svg" label={mode} alt="mode" />
                <EventDetailItem icon="/icons/audience.svg" label={audience} alt="audience" />
  
              </section>
              <EventAgenda agendaItems={agenda} />
  
              <section className="flex-col-gap-2">
                <h2>About theOrganizer</h2>
                <p>{organizer}</p>
              </section>
  
              <EventTags tags={tags} />
          </div>
          <aside className="booking">
            <div className="signup-card">
              <h2>Book Your Spot</h2>
              {
                booking > 0 ? (
                  <p className="text-sm">
                    Join {booking} other people who have already registered for this event.
                  </p>
                ) : (
                  <p className="text-sm">
                    Be the first to register for this event.
                  </p>
                )
              }
              <BookEvent eventId={event._id.toString()} slug={slug} />
            </div>
          </aside>
        </div>
       <div className="flex w-full flex-col gap-4 pt-20">
        <h2>Similar Events</h2>
        <div className="events">
          {
            similarEvents.length > 0 && similarEvents.map((event:IEvent)=>(
              <EventCard key={event._id.toString()} title={event.title} image={event.image} slug={event.slug} location={event.location} date={event.date} time={event.time} />
            ))
          }
        </div>
       </div>
      </section>
    )
}

export default EventDetails