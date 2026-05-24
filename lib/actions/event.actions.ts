'use server';

import { connectDB } from "../mongodb";
import Event from "@/database/event.model";
import Booking from "@/database/booking.model";
import User from "@/database/user.model";
import { z } from "zod";
import { v2 as cloudinary } from 'cloudinary';
import { auth } from "../auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createNotificationsForParticipants } from "../utils/notifications";

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
        
        // Get organizerId from session
        const organizerId = session?.user?.id;
        if (!organizerId) {
            throw new Error('User ID not found in session');
        }
                
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
            organizerId: String(organizerId),
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

export const updateEvent = async (slug: string, prevState: CreateEventState, formData: FormData): Promise<CreateEventState> => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect('/login');
    if (session.user.role !== 'organizer') redirect('/');

    await connectDB();

    const existingEvent = await Event.findOne({ slug });
    if (!existingEvent) {
        return { errors: { _form: ['Event not found'] }, success: false, data: null };
    }
    if (existingEvent.organizerId !== String(session.user.id)) {
        return { errors: { _form: ['You are not authorized to edit this event'] }, success: false, data: null };
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
        const file = formData.get('image') as File;
        let imageUrl: string = formData.get('existingImage') as string;

        if (file && file.size > 0) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            imageUrl = await new Promise<string>((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { resource_type: 'image', folder: 'events' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result!.secure_url);
                    }
                ).end(buffer);
            });
        }

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
                data: { ...formValues, image: imageUrl, bookingSlots: data.bookingSlots } as CreateEventInput,
            };
        }

        const { title, description, overview, image, venue, location, date, time, mode, audience, agenda, organizer, tags, bookingSlots } = result.data;
        const agendaArray = JSON.parse(agenda);
        const tagsArray = JSON.parse(tags);

        await Event.findOneAndUpdate(
            { slug, organizerId: String(session.user.id) },
            { title, description, overview, image, venue, location, date, time, mode, audience, agenda: agendaArray, organizer, tags: tagsArray, bookingSlots }
        );

        revalidatePath(`/events/${slug}`);
        revalidatePath('/dashboard');
        revalidatePath('/events');

        try {
            const bookings = await Booking.find({ eventId: existingEvent._id }).lean();
            if (bookings.length > 0) {
                const emails = bookings.map((b) => b.email);
                const users = await User.find({ email: { $in: emails } }).lean();
                const userIds = users.map((u) => u._id.toString());
                await createNotificationsForParticipants({
                    participantUserIds: userIds,
                    type: 'event_updated',
                    message: `"${existingEvent.title}" has been updated. Check the latest details.`,
                    eventId: existingEvent._id.toString(),
                    eventSlug: slug,
                });
            }
        } catch (e) {
            console.error('Failed to create update notifications:', e);
        }

        return { errors: null, success: true, message: 'Event updated successfully', data: null };
    } catch (error) {
        console.error('Error updating event:', error);
        return {
            errors: { _form: [error instanceof Error ? error.message : 'Failed to update event'] },
            success: false,
            data: { ...formValues, image: '', bookingSlots: parseInt(formValues.bookingSlots || '0') } as CreateEventInput,
        };
    }
};

export const deleteEvent = async (eventId: string): Promise<{ success: boolean; message?: string }> => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: 'Not authenticated' };
    if (session.user.role !== 'organizer') return { success: false, message: 'Unauthorized' };

    const connection = await connectDB();
    const dbSession = await connection.startSession();

    try {
        const notificationPayloads: Array<{ userIds: string[]; title: string; slug: string }> = [];

        await dbSession.withTransaction(async () => {
            const event = await Event.findOne({ _id: eventId, organizerId: String(session.user.id) }).session(dbSession);
            if (!event) throw new Error('Event not found or unauthorized');

            const bookings = await Booking.find({ eventId }).session(dbSession).lean();
            if (bookings.length > 0) {
                const emails = bookings.map((b) => b.email);
                const users = await User.find({ email: { $in: emails } }).session(dbSession).lean();
                notificationPayloads.push({
                    userIds: users.map((u) => u._id.toString()),
                    title: event.title,
                    slug: event.slug,
                });
            }

            await Booking.deleteMany({ eventId }).session(dbSession);
            await Event.findByIdAndDelete(eventId).session(dbSession);
        });

        revalidatePath('/dashboard');
        revalidatePath('/events');
        revalidatePath('/');

        const capturedPayload = notificationPayloads[0];
        if (capturedPayload) {
            try {
                await createNotificationsForParticipants({
                    participantUserIds: capturedPayload.userIds,
                    type: 'event_deleted',
                    message: `"${capturedPayload.title}" has been cancelled.`,
                    eventId,
                    eventSlug: capturedPayload.slug,
                });
            } catch (e) {
                console.error('Failed to create deletion notifications:', e);
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting event:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Failed to delete event' };
    } finally {
        await dbSession.endSession();
    }
};