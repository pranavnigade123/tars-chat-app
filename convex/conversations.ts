import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate a deterministic conversation ID from two user IDs
 * Ensures the same ID is generated regardless of parameter order
 */
export function generateConversationId(userId1: string, userId2: string): string {
  const sortedIds = [userId1, userId2].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
}

/**
 * Get or create a conversation between two users
 * Uses deterministic conversation ID to prevent duplicates
 */
export const getOrCreateConversation = mutation({
  args: {
    participantIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate participants array
    if (args.participantIds.length !== 2) {
      throw new Error("Conversation must have exactly 2 participants");
    }

    const [userId1, userId2] = args.participantIds;

    // Validate both users exist
    const user1 = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId1))
      .unique();

    const user2 = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId2))
      .unique();

    if (!user1 || !user2) {
      throw new Error("One or both users not found");
    }

    // Generate deterministic conversation ID
    const conversationId = generateConversationId(userId1, userId2);

    // Check if conversation already exists
    const existingConversation = await ctx.db
      .query("conversations")
      .withIndex("by_conversation_id", (q) => q.eq("conversationId", conversationId))
      .unique();

    if (existingConversation) {
      return existingConversation._id;
    }

    // Create new conversation
    try {
      const newConversationId = await ctx.db.insert("conversations", {
        conversationId,
        participants: args.participantIds,
        createdAt: Date.now(),
      });

      return newConversationId;
    } catch (error) {
      // Handle race condition - conversation might have been created by another request
      const retryConversation = await ctx.db
        .query("conversations")
        .withIndex("by_conversation_id", (q) => q.eq("conversationId", conversationId))
        .unique();

      if (retryConversation) {
        return retryConversation._id;
      }

      throw error;
    }
  },
});
