'use client';
import { bookEvent} from "@/lib/actions/booking.actions";
import { useState } from "react";
import posthog from "posthog-js";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";


const BookEvent = ({eventId, slotsBooked, bookingSlots, slug}:{eventId:string, slotsBooked:number, bookingSlots:number, slug:string}) => {
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const {data:session} = authClient.useSession();
    const router = useRouter();

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!session?.user?.email){
            console.error('User is not logged in');
            router.push('/login');
            return;
        }
        setIsLoading(true);
        const {success, message} = await bookEvent(eventId, slug, session.user.email);
        setIsLoading(false);
        if(success){
            setSubmitted(true);
            toast.success('Event booked successfully!');
            posthog.capture('event_booked', {
                eventId: eventId,
                slug: slug,
                email: session?.user?.email,
            });
        }
        else{
            toast.error(message || 'Failed to book event');
            console.error(message);
            posthog.captureException(message);
        }
    }
  return (
    <div id="book-event">
           <h2 className="text-xl font-bold text-center">Book Your Spot</h2>
        {
            submitted ? (
                <p className="text-lg">Thank you for registering!</p>
            ) : (
                <div className="flex flex-col gap-3">
                    <p className="text-lg text-center">
                        {slotsBooked > 0
                            ? `${slotsBooked} of ${bookingSlots} spots taken — ${bookingSlots - slotsBooked} left`
                            : `Be the first to register! ${bookingSlots} spots available.`
                        }
                    </p>
                    <form onSubmit={handleSubmit}>
                        <button type="submit" disabled={isLoading} className="button-submit">{isLoading ? 'Registering...' : 'Register'}</button>
                    </form>
                </div>
            )
        }
    </div>
  )
}

export default BookEvent