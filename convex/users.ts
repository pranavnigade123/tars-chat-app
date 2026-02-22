import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the current authenticated user from Convex
 * Returns null if not authenticated or user not found
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // Get authenticated user from Clerk
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return null;
    }
    
    // Query Convex user by clerkId
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    return user;
  },
});

/**
 * Get a user by their Clerk ID
 */
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    
    return user;
  },
});

/**
 * Get all users who are currently online
 */
export const getOnlineUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_online_status", (q) => q.eq("onlineStatus", true))
      .collect();
    
    return users;
  },
});


/**
 * Sync user data from Clerk to Convex
 * Creates new user if doesn't exist, updates if exists
 */
export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    profileImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    
    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        profileImage: args.profileImage,
        lastSeen: Date.now(),
      });
      
      return existingUser._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        name: args.name,
        email: args.email,
        profileImage: args.profileImage,
        lastSeen: Date.now(),
        onlineStatus: true,
      });
      
      return userId;
    }
  },
});

/**
 * Update the online status of the current user
 */
export const updateOnlineStatus = mutation({
  args: {
    onlineStatus: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // Find user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Update status
    await ctx.db.patch(user._id, {
      onlineStatus: args.onlineStatus,
      lastSeen: Date.now(),
    });
  },
});

/**
 * Delete a user by their Clerk ID
 */
export const deleteUser = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    
    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});
