import { mutation } from "./_generated/server";

// Constants for presence system
const OFFLINE_THRESHOLD = 60 * 1000; // 60 seconds in milliseconds

/**
 * Helper function to determine if a user is online based on lastSeen timestamp
 */
export function isUserOnline(lastSeen: number): boolean {
  return Date.now() - lastSeen < OFFLINE_THRESHOLD;
}

/**
 * Send a heartbeat to update the user's presence status
 * Updates lastSeen timestamp and sets isOnline to true
 */
export const sendHeartbeat = mutation({
  args: {},
  handler: async (ctx) => {
    // Verify user authentication
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // Find user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Update user's presence
    await ctx.db.patch(user._id, {
      lastSeen: Date.now(),
      isOnline: true,
    });
    
    return { success: true };
  },
});