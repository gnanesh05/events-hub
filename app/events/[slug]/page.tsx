import EventDetails from '@/components/EventDetails';

const EventDetailsPage = async ({params}:{params:Promise<{slug:string}>}) => {
   return (
      <EventDetails params={params} />
  );
  
}

export default EventDetailsPage