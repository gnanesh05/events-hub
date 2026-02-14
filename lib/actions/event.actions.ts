'use server';

import { connectDB } from "../mongodb";
import Event from "@/database/event.model";
import { z } from "zod";
import { v2 as cloudinary } from 'cloudinary';
import { auth } from "../auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";

//schema
const createEventSchema = z.object({
    title: z.string().min(1, {message: 'Title is required'}),
    description: z.string().min(1, {message: 'Description is required'}),
    overview: z.string().min(1, {message: 'Overview is required'}),
    image: z.string().min(1, {message: 'Image is required'}),
    venue: z.string().min(1, {message: 'Venue is required'}),
    location: z.string().min(1, {message: 'Location is required'}),
    date: z.string().min(1, {message: 'Date is required'}),
    time: z.string().min(1, {message: 'Time is required'}),
    mode: z.enum(['online', 'offline', 'hybrid'], {message: 'Mode is required'}),
    audience: z.string().min(1, {message: 'Audience is required'}),
    agenda: z.string().min(1, {message: 'Agenda is required'}),
    organizer: z.string().min(1, {message: 'Organizer is required'}),
    tags: z.string().min(1, {message: 'Tags are required'}),
    bookingSlots: z.number().min(1, {message: 'Booking slots are required'}),
});

//types
type CreateEventInput = z.infer<typeof createEventSchema>;
export type CreateEventState = {
    errors: Record<string, string[]> | null;
    data: CreateEventInput | null;
    success: boolean;
    message?: string;
}
export const createEvent = async (prevState: CreateEventState, formData: FormData): Promise<CreateEventState> => {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if(!session){
        console.log('No session found');
        redirect('/login');
    }
    if(session?.user?.role !== 'organizer'){
       console.log('User is not an organizer');
       redirect('/');
    }
    
    const formValues = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        overview: formData.get('overview') as string,
        venue: formData.get('venue') as string,
        location: formData.get('location') as string,
        date: formData.get('date') as string,
        time: formData.get('time') as string,
        mode: formData.get('mode') as string,
        audience: formData.get('audience') as string,
        organizer: formData.get('organizer') as string,
        agenda: formData.get('agenda') as string,
        tags: formData.get('tags') as string,
        bookingSlots: formData.get('bookingSlots') as string,
    };

    try {
        // Get image as File
        const file = formData.get('image') as File;
        if (!file || file.size === 0) {
            return { 
                errors: { image: ['Image is required'] }, 
                success: false, 
                data: {
                    ...formValues,
                    image: '',
                    bookingSlots: parseInt(formValues.bookingSlots || '0'),
                } as CreateEventInput
            };
        }

        // Upload image to Cloudinary
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const imageUrl = await new Promise<string>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: 'image',
                    folder: 'events',
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result!.secure_url);
                    }
                }
            ).end(buffer);
        });

        const data = {
            ...formValues,
            image: imageUrl,
            bookingSlots: parseInt(formValues.bookingSlots || '0'),
        };

        const result = createEventSchema.safeParse(data);
        if (!result.success) {
            return { 
                errors: result.error.flatten().fieldErrors, 
                success: false, 
                data: {
                    ...formValues,
                    image: imageUrl, // Keep uploaded image URL even on validation error
                    bookingSlots: data.bookingSlots,
                } as CreateEventInput
            };
        }

        const { title, description, overview, image, venue, location, date, time, mode, audience, agenda, organizer, tags, bookingSlots } = result.data;
        
        // Parse agenda and tags from JSON strings to arrays for database
        const agendaArray = JSON.parse(agenda);
        const tagsArray = JSON.parse(tags);
        
        await connectDB();
        
        // Convert organizerId to ObjectId
        const organizerId = session?.user?.id;
        if (!organizerId) {
            throw new Error('User ID not found in session');
        }
        
        // Convert string ID to MongoDB ObjectId
        const organizerObjectId = new Types.ObjectId(organizerId);
                
        await Event.create({ 
            title, 
            description, 
            overview, 
            image, 
            venue, 
            location, 
            date, 
            time, 
            mode, 
            audience, 
            agenda: agendaArray, 
            organizer, 
            tags: tagsArray, 
            bookingSlots,
            slotsBooked: 0, // Default to 0
            organizerId: organizerObjectId,
        });
        
        revalidatePath('/');    
        return { 
            errors: null,
            success: true, 
            message: 'Event created successfully',
            data: null,
        };
       
    } catch (error) {
        console.error('Error creating event:', error);

        return { 
            errors: { 
                _form: [error instanceof Error ? error.message : 'Failed to create event'] 
            }, 
            success: false, 
            data: {
                ...formValues,
                image: '', // No image URL on error
                bookingSlots: parseInt(formValues.bookingSlots || '0'),
            } as CreateEventInput
        };
    }
}


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