import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Event, { IEvent } from '@/database/event.model';

interface RouteParams {
  params: {
    slug: string;
  };
}

/**
 * Normalize slug to match database format
 * Decodes URL-encoded strings and converts to slug format (lowercase, hyphens)
 */
function normalizeSlug(slug: string): string {
  // Decode URL-encoded characters (e.g., %20 -> space)
  const decoded = decodeURIComponent(slug);
  
  // Convert to slug format: lowercase, replace spaces/special chars with hyphens
  return decoded
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * GET API route to fetch event details by slug
 * 
 * @param req - Next.js request object
 * @param params - Route parameters containing dynamic route parameters
 * @returns JSON response with event data or error message
 */
export async function GET(
  req: NextRequest,
  {params}: RouteParams
): Promise<NextResponse> {
  try {
    // Extract slug from route parameters
    const { slug } = await params;

    // Validate slug parameter
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      return NextResponse.json(
        { message: 'Invalid slug parameter. Slug is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    // Normalize slug (decode URL encoding and convert to database format)
    const normalizedSlug = normalizeSlug(slug);

    // Connect to MongoDB
    await connectDB();

    // Query event by normalized slug
    const event: IEvent | null = await Event.findOne({
      slug: normalizedSlug,
    });

    // Handle event not found
    if (!event) {
      return NextResponse.json(
        { message: `Event with slug "${normalizedSlug}" not found.` },
        { status: 404 }
      );
    }

    // Return successful response with event data
    return NextResponse.json(
      {
        message: 'Event fetched successfully',
        event: event,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle unexpected errors
    console.error('Error fetching event by slug:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch event',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

