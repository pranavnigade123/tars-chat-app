import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

const TYPING_TIMEOUT = 3000; // 3 seconds in milliseconds
const CLEANUP_AGE = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Set or update typing state for the current user in a conversation
 */
export const setTypingState = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (!conversation.participants.includes(identity.subject)) {
      throw new Error("Not authorized: user is not a member of this conversation");
    }

    const existingState = await ctx.db
      .query("typingStates")
      .withIndex("by_conversation_and_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", user._id)
      )
      .unique();

    if (existingState) {
      await ctx.db.patch(existingState._id, {
        lastTypingAt: Date.now(),
      });
    } else {
      await ctx.db.insert("typingStates", {
        userId: user._id,
        conversationId: args.conversationId,
        lastTypingAt: Date.now(),
      });
    }

    return { success: true };
  },
});

/**
 * Clear typing state for the current user in a conversation
 */
export const clearTypingState = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const typingState = await ctx.db
      .query("typingStates")
      .withIndex("by_conversation_and_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", user._id)
      )
      .unique();

    if (typingState) {
      await ctx.db.delete(typingState._id);
    }

    return { success: true };
  },
});

/**
 * Get active typing states for a conversation
 * Returns users who are currently typing (excluding the current user)
 */
export const getTypingState = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.participants.includes(identity.subject)) {
      return [];
    }

    const typingStates = await ctx.db
      .query("typingStates")
      .withIndex("by_conversation_and_user", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const now = Date.now();
    const activeTypingStates = typingStates.filter(
      (state) =>
        state.userId !== user._id &&
        now - state.lastTypingAt < TYPING_TIMEOUT
    );

    const typingUsers = await Promise.all(
      activeTypingStates.map(async (state) => {
        const typingUser = await ctx.db.get(state.userId);
        return {
          userId: state.userId,
          name: typingUser?.name || "Unknown",
          lastTypingAt: state.lastTypingAt,
        };
      })
    );

    return typingUsers;
  },
});

/**
 * Get typing status for multiple conversations in one query
 * Returns array of { conversationId, isTyping }
 */
export const getTypingStatesForConversations = query({
  args: {
    conversationIds: v.array(v.id("conversations")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [] as Array<{ conversationId: string; isTyping: boolean }>;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [] as Array<{ conversationId: string; isTyping: boolean }>;
    }

    const uniqueConversationIds = Array.from(new Set(args.conversationIds));
    const now = Date.now();
    const results: Array<{ conversationId: string; isTyping: boolean }> = [];

    for (const conversationId of uniqueConversationIds) {
      const conversation = await ctx.db.get(conversationId);
      if (!conversation || !conversation.participants.includes(identity.subject)) {
        continue;
      }

      const typingStates = await ctx.db
        .query("typingStates")
        .withIndex("by_conversation_and_user", (q) =>
          q.eq("conversationId", conversationId)
        )
        .collect();

      const isTyping = typingStates.some(
        (state) => state.userId !== user._id && now - state.lastTypingAt < TYPING_TIMEOUT
      );

      results.push({
        conversationId: conversationId as string,
        isTyping,
      });
    }

    return results;
  },
});

/**
 * Cleanup expired typing states (run via cron)
 * Deletes typing states older than 5 minutes
 */
export const cleanupExpiredTypingStates = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const cutoffTime = now - CLEANUP_AGE;

    const oldStates = await ctx.db
      .query("typingStates")
      .withIndex("by_lastTypingAt")
      .filter((q) => q.lt(q.field("lastTypingAt"), cutoffTime))
      .collect();

    for (const state of oldStates) {
      await ctx.db.delete(state._id);
    }

    console.log(`Cleaned up ${oldStates.length} expired typing states`);
    return { deletedCount: oldStates.length };
  },
});
