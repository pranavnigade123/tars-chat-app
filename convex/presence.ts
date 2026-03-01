import { mutation } from "./_generated/server";

// Constants for presence system - Optimized for very fast updates
const OFFLINE_THRESHOLD = 10 * 1000; // 10 seconds (very fast offline detection)

/**
 * Helper function to determine if a user is online based on lastSeen timestamp
 * Note: This is used by the heartbeat system. For UI presence status,
 * use computePresenceStatus from lib/utils/presenceStatus.ts
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
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    if (!user) {
      return { success: false, reason: "User not synced yet" };
    }
    
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
    
    await ctx.db.patch(user._id, {
      lastSeen: Date.now() - (10 * 60 * 1000), // 10 minutes ago
    });
    
    return { success: true };
  },
});