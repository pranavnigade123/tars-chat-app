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

    // Get all messages for this conversation (including deleted ones)
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_and_time", (q) =>
        q.eq("conversationId", args.conversationId)
      )
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
      readBy: [identity.subject], // Sender has read their own message
    });

    // Update conversation's lastMessageAt
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
    });

    return messageId;
  },
});

/**
 * Mark all messages in a conversation as read by the current user
 * Only marks messages sent by other participants
 */
export const markMessagesAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify conversation exists and user is a participant
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (!conversation.participants.includes(identity.subject)) {
      throw new Error("Not authorized to access this conversation");
    }

    // Get all unread messages in this conversation (not sent by current user)
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_and_time", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    // Mark messages as read if not already read by current user
    let markedCount = 0;
    for (const message of messages) {
      // Skip messages sent by current user
      if (message.senderId === identity.subject) {
        continue;
      }

      // Handle migration: readBy might be undefined for old messages
      const readBy = message.readBy || [];
      
      // Skip if already read by current user
      if (readBy.includes(identity.subject)) {
        continue;
      }

      // Add current user to readBy array
      await ctx.db.patch(message._id, {
        readBy: [...readBy, identity.subject],
      });
      markedCount++;
    }

    return { markedCount };
  },
});

/**
 * Mark a single message as read by the current user
 * Used when message becomes visible in viewport
 */
export const markMessageAsRead = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { success: false };
    }

    // Get message
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      return { success: false };
    }

    // Skip if current user is sender
    if (message.senderId === identity.subject) {
      return { success: false };
    }

    // Handle migration: readBy might be undefined for old messages
    const readBy = message.readBy || [];
    
    // Skip if already read by current user
    if (readBy.includes(identity.subject)) {
      return { success: false, alreadyRead: true };
    }

    // Add current user to readBy array
    await ctx.db.patch(args.messageId, {
      readBy: [...readBy, identity.subject],
    });

    return { success: true };
  },
});

/**
 * Get unread message count for a conversation
 * Returns count of messages not read by current user
 */
export const getUnreadCount = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return 0;
    }

    // Verify conversation exists and user is a participant
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.participants.includes(identity.subject)) {
      return 0;
    }

    // Get all messages in this conversation
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_and_time", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    // Count unread messages (not sent by current user and not read by current user)
    let unreadCount = 0;
    for (const message of messages) {
      // Skip messages sent by current user
      if (message.senderId === identity.subject) {
        continue;
      }

      // Handle migration: readBy might be undefined for old messages
      const readBy = message.readBy || [];
      
      // Count if not read by current user
      if (!readBy.includes(identity.subject)) {
        unreadCount++;
      }
    }

    return unreadCount;
  },
});

/**
 * Soft delete a message (only the sender can delete their own messages)
 */
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the message
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Verify the user is the sender
    if (message.senderId !== identity.subject) {
      throw new Error("Not authorized to delete this message");
    }

    // Soft delete the message
    await ctx.db.patch(args.messageId, {
      isDeleted: true,
    });

    return { success: true };
  },
});

/**
 * Toggle a reaction on a message
 * If user already reacted with this emoji, remove it. Otherwise, add it.
 */
export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Validate emoji is one of the allowed reactions
    const allowedEmojis = ["👍", "❤️", "😂", "😮", "😢"];
    if (!allowedEmojis.includes(args.emoji)) {
      throw new Error("Invalid emoji reaction");
    }

    // Get the message
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Get current reactions (handle migration)
    const reactions = message.reactions || [];

    // Check if user already reacted with this emoji
    const existingReactionIndex = reactions.findIndex(
      (r) => r.emoji === args.emoji && r.userId === identity.subject
    );

    let newReactions;
    if (existingReactionIndex >= 0) {
      // Remove the reaction
      newReactions = reactions.filter((_, index) => index !== existingReactionIndex);
    } else {
      // Add the reaction
      newReactions = [...reactions, { emoji: args.emoji, userId: identity.subject }];
    }

    // Update the message
    await ctx.db.patch(args.messageId, {
      reactions: newReactions,
    });

    return { success: true, added: existingReactionIndex < 0 };
  },
});
