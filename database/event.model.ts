import mongoose, { Schema, Model, Document } from 'mongoose';

/**
 * TypeScript interface for Event document
 */
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: 'online' | 'offline' | 'hybrid';
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema for Event
 */
const EventSchema: Schema<IEvent> = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: 'Title cannot be empty',
      },
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: 'Description cannot be empty',
      },
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: 'Overview cannot be empty',
      },
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: 'Image cannot be empty',
      },
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: 'Venue cannot be empty',
      },
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: 'Location cannot be empty',
      },
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      trim: true,
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
      trim: true,
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      enum: {
        values: ['online', 'offline', 'hybrid'],
        message: 'Mode must be one of: online, offline, hybrid',
      },
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: 'Audience cannot be empty',
      },
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: (value: string[]) => Array.isArray(value) && value.length > 0,
        message: 'Agenda must be a non-empty array',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: 'Organizer cannot be empty',
      },
    },
    tags: {
      type: [String],
      required: [true, 'Tags are required'],
      validate: {
        validator: (value: string[]) => Array.isArray(value) && value.length > 0,
        message: 'Tags must be a non-empty array',
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * Generate URL-friendly slug from title
 * Converts to lowercase, replaces spaces with hyphens, removes special characters
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Normalize date to ISO format (YYYY-MM-DD)
 * Accepts various date formats and converts to ISO
 */
function normalizeDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateString}`);
  }
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
}

/**
 * Normalize time to consistent format (HH:MM AM/PM or 24-hour format)
 * Standardizes time format for consistency
 */
function normalizeTime(timeString: string): string {
  const trimmed = timeString.trim();
  // If already in a standard format, return as is
  // Otherwise, attempt to parse and format
  const timeRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i;
  const match = trimmed.match(timeRegex);
  
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const period = match[3]?.toUpperCase();
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }
  
  // If no match, return trimmed string (assumes already in correct format)
  return trimmed;
}

/**
 * Pre-save hook: Generate slug from title (only if title changed)
 * Normalize date to ISO format and time to consistent format
 */
EventSchema.pre('save', function (this: IEvent) {
  // Generate slug only if title is modified or slug doesn't exist
  if (this.isModified('title') || !this.slug) {
    this.slug = generateSlug(this.title);
  }

  // Normalize date to ISO format if date is modified
  if (this.isModified('date')) {
    try {
      this.date = normalizeDate(this.date);
    } catch (error) {
      throw error;
    }
  }

  // Normalize time format if time is modified
  if (this.isModified('time')) {
    this.time = normalizeTime(this.time);
  }
});

// Note: Unique index on slug is already created by the schema definition (unique: true)

/**
 * Event model
 */
const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;

