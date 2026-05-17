'use client';

import { cancelBooking } from "@/lib/actions/booking.actions";
import { useState } from "react";
import { toast } from "sonner";

const CancelBooking = ({ eventId, slug, email }: { eventId: string; slug: string; email: string }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleCancel = async () => {
        setIsLoading(true);
        const { success, message } = await cancelBooking(eventId, slug, email);
        setIsLoading(false);
        if (success) {
            toast.success('Booking cancelled successfully');
        } else {
            toast.error(message || 'Failed to cancel booking');
        }
    };

    return (
        <div id="book-event" className="mt-5">
            <div className="flex flex-row gap-3 justify-center items-center">
                <p className="text-lg text-center">Change of mind?</p>
                <form onSubmit={(e) => { e.preventDefault(); handleCancel(); }}>
                    <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm rounded-lg cursor-pointer border border-red-500/50 text-red-400 bg-transparent hover:bg-red-500/10 transition-colors">
                        {isLoading ? 'Cancelling...' : 'Cancel'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CancelBooking;
