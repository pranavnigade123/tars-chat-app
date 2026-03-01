import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the current authenticated user from Convex
 * Returns null if not authenticated or user not found
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return null;
    }
    
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
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    
    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        profileImage: args.profileImage,
        lastSeen: Date.now(),
      });
      
      return existingUser._id;
    } else {
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
    
    const ACTIVE_NOW_THRESHOLD = 10 * 1000; // 10 seconds (very fast offline detection)
    const now = Date.now();
    
    return users.map(user => ({
      ...user,
      isOnline: now - user.lastSeen < ACTIVE_NOW_THRESHOLD,
    }));
  },
});

/**
 * Get all users except current user (for group creation)
 */
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    
    const users = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("clerkId"), identity.subject))
      .collect();
    
    const ACTIVE_NOW_THRESHOLD = 10 * 1000; // 10 seconds (very fast offline detection)
    const now = Date.now();
    
    return users.map(user => ({
      ...user,
      isOnline: now - user.lastSeen < ACTIVE_NOW_THRESHOLD,
    }));
  },
});