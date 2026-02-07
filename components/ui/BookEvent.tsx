'use client';

import { bookEvent } from "@/lib/actions/booking.actions";
import { useState } from "react";
import posthog from "posthog-js";


const BookEvent = ({eventId, slug}:{eventId:string, slug:string}) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const {success, message} = await bookEvent(eventId, slug, email);
        if(success){
            setSubmitted(true);
            posthog.capture('event_booked', {
                eventId: eventId,
                slug: slug,
                email: email,
            });
        }
        else{
            console.error(message);
            posthog.captureException(message);
        }
    }
  return (
    <div id="book-event">
        {
            submitted ? (
                <p className="text-sm">Thank you for registering!</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email Address</label>
                        <input 
                         type="email"
                         id="email" 
                         placeholder="Enter your email address"
                         value={email} 
                         onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <button type="submit" className="button-submit">Register</button>
                </form>
            )
        }
    </div>
  )
}

export default BookEvent