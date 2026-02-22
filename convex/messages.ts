import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all messages for a conversation
 * Returns messages in chronological order (oldest first)
 */
export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify user is a participant in this conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (!conversation.participants.includes(identity.subject)) {
      throw new Error("Not authorized to view this conversation");
    }

    // Get all non-deleted messages for this conversation
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_and_time", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    // Enrich messages with sender information
    const enrichedMessages = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", message.senderId))
          .unique();

        return {
          ...message,
          sender: sender
            ? {
                _id: sender._id,
                clerkId: sender.clerkId,
                name: sender.name,
                profileImage: sender.profileImage,
              }
            : null,
        };
      })
    );

    return enrichedMessages;
  },
});

/**
 * Send a message in a conversation
 * Validates content and updates conversation's lastMessageAt
 */
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Validate message content
    const trimmedContent = args.content.trim();
    if (!trimmedContent) {
      throw new Error("Message content cannot be empty");
    }

    if (trimmedContent.length > 10000) {
      throw new Error("Message content exceeds maximum length of 10,000 characters");
    }

    // Verify conversation exists and user is a participant
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (!conversation.participants.includes(identity.subject)) {
      throw new Error("Not authorized to send messages in this conversation");
    }

    // Insert the message
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: identity.subject,
      content: trimmedContent,
      sentAt: Date.now(),
      isDeleted: false,
    });

    // Update conversation's lastMessageAt
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
    });

    return messageId;
  },
});
