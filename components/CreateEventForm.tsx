'use client';

import React, { useActionState, useEffect } from 'react';
import { createEvent } from '@/lib/actions/event.actions';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { CreateEventState } from '@/lib/actions/event.actions';


const CreateEventForm = () => {
    // Wrapper action that transforms data before calling the server action
    const transformedAction = async (
        prevState: CreateEventState,
        formData: FormData
    ) => {
        // Convert agenda from newline-separated to JSON array string
        const agendaText = formData.get('agenda') as string;
        if (agendaText) {
            const agendaArray = agendaText.split('\n').filter(item => item.trim());
            formData.set('agenda', JSON.stringify(agendaArray));
        }

        // Convert tags from comma-separated to JSON array string
        const tagsText = formData.get('tags') as string;
        if (tagsText) {
            const tagsArray = tagsText.split(',').map(tag => tag.trim()).filter(tag => tag);
            formData.set('tags', JSON.stringify(tagsArray));
        }

        return createEvent(prevState, formData);
    };

    const [state, formAction, isPending] = useActionState(transformedAction, {
        errors: null,
        data: null,
        success: false,
        message: undefined,
    });
    console.log(state);
    const router = useRouter();

    useEffect(() => {
        if(state.success){
            posthog.capture('event_created', {
                data: state.data,
            });
            router.push('/');
        }
    }, [state.success, router, state.data]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-8">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">        
        <form className="space-y-8" action={formAction}>
          {/* General form error */}
          {state.errors?._form && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
              <p className="text-sm text-red-500">{state.errors._form[0]}</p>
            </div>
          )}
          {/* Two-column grid with cards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Column - Event Information */}
            <div className="space-y-6">
              {/* Basic Information Card */}
              <div className="bg-dark-200/30 backdrop-blur-md rounded-xl p-6 space-y-6 border border-primary/20 shadow-lg shadow-primary/5 transition-all duration-300 hover:border-primary/30 hover:shadow-primary/10">
                <h2 className="text-lg font-semibold text-foreground tracking-tight">Basic Information</h2>
                
                <div className="flex flex-col gap-2">
                  <label htmlFor="title" className="text-sm font-medium text-foreground/80">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    defaultValue={state.data?.title || ''}
                    placeholder="Enter event title"
                    className="bg-dark-200/40 backdrop-blur-sm border border-gray-600/50 rounded-lg px-4 py-2.5 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-200"
                  />
                  {state.errors?.title && (
                    <p className="text-sm text-red-500">{state.errors.title[0]}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="description" className="text-sm font-medium text-foreground/80">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={4}
                    defaultValue={state.data?.description || ''}
                    placeholder="Enter event description"
                    className="bg-dark-200/40 backdrop-blur-sm border border-gray-600/50 rounded-lg px-4 py-2.5 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 resize-none transition-all duration-200"
                  />
                  {state.errors?.description && (
                    <p className="text-sm text-red-500">{state.errors.description[0]}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="overview" className="text-sm font-medium text-foreground/80">
                    Overview
                  </label>
                  <textarea
                    id="overview"
                    name="overview"
                    required
                    rows={4}
                    defaultValue={state.data?.overview || ''}
                    placeholder="Enter event overview"
                    className="bg-dark-200/40 backdrop-blur-sm border border-gray-600/50 rounded-lg px-4 py-2.5 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 resize-none transition-all duration-200"
                  />
                  {state.errors?.overview && (
                    <p className="text-sm text-red-500">{state.errors.overview[0]}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="image" className="text-sm font-medium text-foreground/80">
                    Image
                  </label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    required
                    className="bg-dark-200/40 backdrop-blur-sm border border-gray-600/50 rounded-lg px-4 py-2.5 text-foreground file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/20 file:text-primary hover:file:bg-primary/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-200"
                  />
                  {state.errors?.image && (
                    <p className="text-sm text-red-500">{state.errors.image[0]}</p>
                  )}
                </div>
              </div>

              {/* Content Card */}
              <div className="bg-dark-200/30 backdrop-blur-md rounded-xl p-6 space-y-6 border border-primary/20 shadow-lg shadow-primary/5 transition-all duration-300 hover:border-primary/30 hover:shadow-primary/10">
                <h2 className="text-lg font-semibold text-foreground tracking-tight">Content</h2>
                
                <div className="flex flex-col gap-2">
                  <label htmlFor="agenda" className="text-sm font-medium text-foreground/80">
                    Agenda (one item per line)
                  </label>
                  <textarea
                    id="agenda"
                    name="agenda"
                    required
                    rows={5}
                    defaultValue={state.data?.agenda ? (() => {
                      try {
                        const parsed = JSON.parse(state.data.agenda);
                        return Array.isArray(parsed) ? parsed.join('\n') : state.data.agenda;
                      } catch {
                        return state.data.agenda;
                      }
                    })() : ''}
                    placeholder="Enter agenda items, one per line"
                    className="bg-dark-200/40 backdrop-blur-sm border border-gray-600/50 rounded-lg px-4 py-2.5 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 resize-none transition-all duration-200"
                  />
                  {state.errors?.agenda && (
                    <p className="text-sm text-red-500">{state.errors.agenda[0]}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="tags" className="text-sm font-medium text-foreground/80">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    required
                    defaultValue={state.data?.tags ? (() => {
                      try {
                        const parsed = JSON.parse(state.data.tags);
                        return Array.isArray(parsed) ? parsed.join(', ') : state.data.tags;
                      } catch {
                        return state.data.tags;
                      }
                    })() : ''}
                    placeholder="Enter tags separated by commas"
                    className="bg-dark-200/40 backdrop-blur-sm border border-gray-600/50 rounded-lg px-4 py-2.5 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-200"
                  />
                  {state.errors?.tags && (
                    <p className="text-sm text-red-500">{state.errors.tags[0]}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Event Details */}
            <div className="space-y-6">
              {/* Schedule & Location Card */}
              <div className="bg-dark-200/30 backdrop-blur-md rounded-xl p-6 space-y-6 border border-primary/20 shadow-lg shadow-primary/5 transition-all duration-300 hover:border-primary/30 hover:shadow-primary/10">
                <h2 className="text-lg font-semibold text-foreground tracking-tight">Schedule & Location</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="date" className="text-sm font-medium text-foreground/80">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      required
                      defaultValue={state.data?.date || ''}
                      className="bg-dark-200/40 backdrop-blur-sm border border-gray-600/50 rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-200"
                    />
                    {state.errors?.date && (
                      <p className="text-sm text-red-500">{state.errors.date[0]}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="time" className="text-sm font-medium text-foreground/80">
                      Time
                    </label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      required
                      defaultValue={state.data?.time || ''}
                      className="bg-dark-200/40 backdrop-blur-sm border border-gray-600/50 rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-200"
                    />
                    {state.errors?.time && (
                      <p className="text-sm text-red-500">{state.errors.time[0]}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="mode" className="text-sm font-medium text-foreground/80">
                    Mode
                  </label>
                  <select
                    id="mode"
                    name="mode"
                    required
                    defaultValue={state.data?.mode || ''}
                    className="bg-dark-200/40 backdrop-blur-sm border border-gray-600/50 rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-200"
                  >
                    <option value="">Select mode</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                  {state.errors?.mode && (
                    <p className="text-sm text-red-500">{state.errors.mode[0]}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="venue" className="text-sm font-medium text-foreground/80">
                    Venue
                  </label>
                  <input
                    type="text"
                    id="venue"
                    name="venue"
                    required
                    defaultValue={state.data?.venue || ''}
                    placeholder="Enter venue name"
                    className="bg-dark-200/40 backdrop-blur-sm border border-gray-600/50 rounded-lg px-4 py-2.5 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-200"
                  />
                  {state.errors?.venue && (
                    <p className="text-sm text-red-500">{state.errors.venue[0]}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="location" className="text-sm font-medium text-foreground/80">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    defaultValue={state.data?.location || ''}
                    placeholder="Enter event location"
                    className="bg-dark-200/40 backdrop-blur-sm border border-gray-600/50 rounded-lg px-4 py-2.5 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-200"
                  />
                  {state.errors?.location && (
                    <p className="text-sm text-red-500">{state.errors.location[0]}</p>
                  )}
                </div>
              </div>

              {/* Organizer & Audience Card */}
              <div className="bg-dark-200/30 backdrop-blur-md rounded-xl p-6 space-y-6 border border-primary/20 shadow-lg shadow-primary/5 transition-all duration-300 hover:border-primary/30 hover:shadow-primary/10">
                <h2 className="text-lg font-semibold text-foreground tracking-tight">Organizer & Audience</h2>
                
                <div className="flex flex-col gap-2">
                  <label htmlFor="organizer" className="text-sm font-medium text-foreground/80">
                    Organizer
                  </label>
                  <input
                    type="text"
                    id="organizer"
                    name="organizer"
                    required
                    defaultValue={state.data?.organizer || ''}
                    placeholder="Enter organizer name"
                    className="bg-dark-200/40 backdrop-blur-sm border border-gray-600/50 rounded-lg px-4 py-2.5 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-200"
                  />
                  {state.errors?.organizer && (
                    <p className="text-sm text-red-500">{state.errors.organizer[0]}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="audience" className="text-sm font-medium text-foreground/80">
                    Audience
                  </label>
                  <input
                    type="text"
                    id="audience"
                    name="audience"
                    required
                    defaultValue={state.data?.audience || ''}
                    placeholder="Enter target audience"
                    className="bg-dark-200/40 backdrop-blur-sm border border-gray-600/50 rounded-lg px-4 py-2.5 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-200"
                  />
                  {state.errors?.audience && (
                    <p className="text-sm text-red-500">{state.errors.audience[0]}</p>
                  )}
                </div>
              </div>

              {/* Booking Information Card */}
              <div className="bg-dark-200/30 backdrop-blur-md rounded-xl p-6 space-y-6 border border-primary/20 shadow-lg shadow-primary/5 transition-all duration-300 hover:border-primary/30 hover:shadow-primary/10">
                <h2 className="text-lg font-semibold text-foreground tracking-tight">Booking Information</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="bookingSlots" className="text-sm font-medium text-foreground/80">
                      Booking Slots
                    </label>
                    <input
                      type="number"
                      id="bookingSlots"
                      name="bookingSlots"
                      required
                      min="1"
                      defaultValue={state.data?.bookingSlots || ''}
                      placeholder="Total slots"
                      className="bg-dark-200/40 backdrop-blur-sm border border-gray-600/50 rounded-lg px-4 py-2.5 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-200"
                    />
                    {state.errors?.bookingSlots && (
                      <p className="text-sm text-red-500">{state.errors.bookingSlots[0]}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              className="bg-dark-200/40 backdrop-blur-sm hover:bg-dark-200/60 border border-gray-600/50 hover:border-gray-500/70 cursor-pointer items-center justify-center rounded-lg px-6 py-3 text-base font-semibold text-foreground transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer items-center justify-center rounded-lg px-6 py-3 text-base font-semibold text-black shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200"
            >
              {isPending ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventForm;
