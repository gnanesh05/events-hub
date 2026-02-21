'use client';
import { bookEvent} from "@/lib/actions/booking.actions";
import { useState } from "react";
import posthog from "posthog-js";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";


const BookEvent = ({eventId, slotsBooked, slug}:{eventId:string, slotsBooked:number, slug:string}) => {
    const [submitted, setSubmitted] = useState(false);
    const {data:session} = authClient.useSession();
    const router = useRouter();

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!session?.user?.email){
            console.error('User is not logged in');
            router.push('/login');
            return;
        }
        const {success, message} = await bookEvent(eventId, slug, session.user.email);
        if(success){
            setSubmitted(true);
            posthog.capture('event_booked', {
                eventId: eventId,
                slug: slug,
                email: session?.user?.email,
            });
        }
        else{
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
                    {
                        slotsBooked > 0 ? (
                            <p className="text-lg text-center">Join {slotsBooked} other people who have already registered for this event.</p>
                        ) : (
                            <p className="text-lg text-center">Be the first to register for this event.</p>
                        )
                    }
                    <form onSubmit={handleSubmit}>
                        <button type="submit" className="button-submit">Register</button>
                    </form>
                </div>
            )
        }
    </div>
  )
}

export default BookEvent