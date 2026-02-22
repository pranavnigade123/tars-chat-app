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
        isOnline: false,
      });
      
      return userId;
    }
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

/**
 * Get all users except current user with their online status
 */
export const getAllUsersExceptCurrentWithStatus = query({
  args: {
    currentUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("clerkId"), args.currentUserId))
      .collect();
    
    // Add computed isOnline field
    const OFFLINE_THRESHOLD = 60 * 1000; // 60 seconds
    const now = Date.now();
    
    return users.map(user => ({
      ...user,
      isOnline: now - user.lastSeen < OFFLINE_THRESHOLD,
    }));
  },
});