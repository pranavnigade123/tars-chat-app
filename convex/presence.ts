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
 * Updates lastSeen timestamp (online status computed from this)
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
      // User not synced yet from webhook - this is expected on first login
      // Return success to avoid error spam in console
      return { success: false, reason: "User not synced yet" };
    }
    
    // Update user's lastSeen timestamp
    // Online status is computed from lastSeen in queries
    await ctx.db.patch(user._id, {
      lastSeen: Date.now(),
    });
    
    return { success: true };
  },
});

/**
 * Mark user as offline immediately
 * Called when tab is closed or user navigates away
 */
export const markOffline = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { success: false };
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    if (!user) return { success: false };
    
    // Set lastSeen to past to mark as offline
    await ctx.db.patch(user._id, {
      lastSeen: Date.now() - (10 * 60 * 1000), // 10 minutes ago
    });
    
    return { success: true };
  },
});