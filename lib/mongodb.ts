import mongoose, { Mongoose } from 'mongoose';

/**
 * Global interface to extend NodeJS global type with mongoose connection cache
 * This prevents TypeScript errors when accessing the cached connection
 */
declare global {
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  } | undefined;
}

/**
 * MongoDB connection string from environment variables
 * Falls back to a default local connection string if MONGODB_URI is not set
 */
const MONGODB_URI: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Cached connection object to prevent multiple connections during development
 * In Next.js, during development, the module can be reloaded multiple times,
 * which would create multiple connections without this caching mechanism.
 */
const cached: {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
} = global.mongoose || { conn: null, promise: null };

// Store the cached connection in global scope to persist across hot reloads
if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connects to MongoDB using Mongoose
 * Uses connection caching to prevent multiple connections in development
 * 
 * @returns {Promise<Mongoose>} A promise that resolves to the Mongoose connection instance
 * @throws {Error} If the connection fails
 */
async function connectDB(): Promise<Mongoose> {
  // If we already have a cached connection, return it immediately
  if (cached.conn) {
    return cached.conn;
  }

  // If we don't have a connection promise, create one
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false, // Disable mongoose buffering
    };

    // Create the connection promise
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance: Mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongooseInstance;
    }).catch((error: Error) => {
      console.error('❌ MongoDB connection error:', error);
      // Reset the promise on error so we can retry
      cached.promise = null;
      throw error;
    });
  }

  try {
    // Wait for the connection promise to resolve
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset the promise on error
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

/**
 * Disconnects from MongoDB
 * Useful for cleanup in tests or when shutting down the application
 * 
 * @returns {Promise<void>} A promise that resolves when disconnected
 */
async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('✅ MongoDB disconnected');
  }
}

export { connectDB, disconnectDB };
export default connectDB;

