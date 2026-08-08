/**
 * Purpose
 * -------
 * Singleton MongoDB connection manager for the entire SkillMine application.
 *
 * Responsibilities
 * - Open exactly one Mongoose connection per server process lifetime.
 * - Guard against redundant reconnects across concurrent API route invocations.
 *
 * Used by
 * - Every API route that reads or writes MongoDB data.
 *   Pattern: `await connect()` at the top of each route handler before
 *   any Mongoose model call.
 *
 * Interview Talking Points
 * - Next.js serverless functions can spin up multiple warm instances. Each
 *   instance gets its own module scope, so `isConnected` prevents thrashing
 *   connections within a single instance but does not share state across
 *   instances. Connection pooling at the driver level handles the rest.
 * - `readyState === 1` is the authoritative check; the boolean flag is just a
 *   fast exit to avoid the property lookup overhead on every request.
 *
 * TODO: Set `bufferCommands: false` so Mongoose throws immediately on a model
 * call made before the connection is established, rather than silently queuing.
 *
 * TODO: Replace in-memory singleton with a proper connection-pool config
 * (`maxPoolSize`, `serverSelectionTimeoutMS`) tuned for Vercel's concurrency.
 */

import mongoose from "mongoose";

let isConnected = false;

/**
 * Establishes or reuses the MongoDB connection.
 *
 * Why this exists:
 * Next.js API routes are stateless functions — each invocation could
 * re-import this module on a cold start. Without this guard, every API
 * call in a warm instance would try to open a new connection, exhausting
 * the MongoDB Atlas connection pool.
 */
export async function connect() {
    // `isConnected` is a fast shortcut; `readyState` is the authoritative check
    // in case Mongoose internally reconnected after a transient network drop.
    if (isConnected || mongoose.connection.readyState === 1) {
        return;
    }

    try {
        if (!process.env.MONGO_URL) {
            throw new Error("MONGO_URL is not defined in environment variables.");
        }

        // Set max listeners to avoid warning
        mongoose.connection.setMaxListeners(20);
        
        await mongoose.connect(process.env.MONGO_URL);
        isConnected = true;
        console.log("MONGODB CONNECTED");

    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
}
