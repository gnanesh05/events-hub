'use server';

import { connectDB } from "../mongodb";
import Event from "@/database/event.model";

export const getSimilarEventsBySlug = async (slug: string) => {
    try{
        await connectDB();
        const event = await Event.findOne({ slug });
        if(!event){
            return [];
        }
        const similarEvents = await Event.find({
            _id: { $ne: event._id },
            tags: { $in: event.tags },
        });
        return similarEvents;
    }
    catch(error){
        console.error('Error fetching similar events:', error);
        return [];
    }
}