'use client'
import Link from 'next/link'
import Image from 'next/image'
import posthog from 'posthog-js'

interface EventCardProps {
  title: string
  image: string
  slug: string
  location: string
  date: string
  time: string
  mode?: string
}

const EventCard = ({ title, image, slug, location, date, time, mode }: EventCardProps) => {
  const handleEventClick = () => {
    posthog.capture('event_card_clicked', {
      event_title: title,
      event_slug: slug,
      event_location: location,
      event_date: date,
    });
  };

  return (
    <Link href={decodeURIComponent(`/events/${slug}`)} className="event-card group" onClick={handleEventClick}>
      <div className="poster-wrapper">
        <Image src={image} alt={title} width={410} height={300} className="poster" />
        {mode && <span className="mode-badge">{mode}</span>}
      </div>
      <div className="card-meta">
        <Image src="/icons/pin.svg" alt="location" width={14} height={14} />
        <span>{location}</span>
      </div>
      <p className="card-title">{title}</p>
      <div className="card-datetime">
        <div>
          <Image src="/icons/calendar.svg" alt="date" width={14} height={14} />
          <span>{date}</span>
        </div>
        <div>
          <Image src="/icons/clock.svg" alt="time" width={14} height={14} />
          <span>{time}</span>
        </div>
      </div>
    </Link>
  )
}

export default EventCard
