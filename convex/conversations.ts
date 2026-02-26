import { mutation, query } from "./_generated/server";
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


/**
 * Get conversation details by ID
 * Returns conversation with participant info
 */
export const getConversationById = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      return null;
    }

    // Verify user is a participant
    if (!conversation.participants.includes(identity.subject)) {
      throw new Error("Not authorized to view this conversation");
    }

    // Handle group conversations
    if (conversation.isGroup) {
      return {
        ...conversation,
        isGroup: true,
        groupName: conversation.groupName,
        memberCount: conversation.participants.length,
      };
    }

    // Handle 1-on-1 conversations
    // Get the other participant
    const otherParticipantId = conversation.participants.find(
      (id) => id !== identity.subject
    );

    if (!otherParticipantId) {
      return null;
    }

    // Get other participant's user info
    const otherUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", otherParticipantId))
      .unique();

    if (!otherUser) {
      return null;
    }

    // Compute online status from lastSeen
    // Note: This logic is duplicated here because Convex backend cannot import from lib/
    // Keep in sync with lib/utils/presenceStatus.ts
    const ACTIVE_NOW_THRESHOLD = 2 * 60 * 1000; // 2 minutes
    const RECENTLY_ACTIVE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    const timeSinceLastSeen = now - otherUser.lastSeen;
    
    let statusText = "Offline";
    let isOnline = false;
    
    if (timeSinceLastSeen < ACTIVE_NOW_THRESHOLD) {
      statusText = "Active now";
      isOnline = true;
    } else if (timeSinceLastSeen < RECENTLY_ACTIVE_THRESHOLD) {
      statusText = "Recently active";
      isOnline = false;
    }

    return {
      ...conversation,
      isGroup: false,
      otherUser: {
        _id: otherUser._id,
        clerkId: otherUser.clerkId,
        name: otherUser.name,
        profileImage: otherUser.profileImage,
        isOnline: isOnline,
        statusText: statusText,
      },
    };
  },
});

/**
 * Get all conversations for the current user
 * Returns conversations with participant info and latest message preview
 */
export const getUserConversations = query({
  args: {},
  handler: async (ctx) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get all conversations where user is a participant
    const allConversations = await ctx.db.query("conversations").collect();
    
    const conversations = allConversations.filter((conv) =>
      conv.participants.includes(identity.subject)
    );

    // Enrich conversations with participant info and latest message
    const enrichedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        // Handle group conversations
        if (conversation.isGroup) {
          // Get latest message for this conversation
          const latestMessage = await ctx.db
            .query("messages")
            .withIndex("by_conversation_and_time", (q) =>
              q.eq("conversationId", conversation._id)
            )
            .order("desc")
            .first();

          return {
            ...conversation,
            isGroup: true,
            groupName: conversation.groupName,
            memberCount: conversation.participants.length,
            latestMessage: latestMessage
              ? {
                  content: latestMessage.content,
                  sentAt: latestMessage.sentAt,
                  senderId: latestMessage.senderId,
                }
              : null,
          };
        }

        // Handle 1-on-1 conversations
        // Get the other participant
        const otherParticipantId = conversation.participants.find(
          (id) => id !== identity.subject
        );

        if (!otherParticipantId) {
          return null;
        }

        // Get other participant's user info
        const otherUser = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", otherParticipantId))
          .unique();

        if (!otherUser) {
          return null;
        }

        // Get latest message for this conversation
        const latestMessage = await ctx.db
          .query("messages")
          .withIndex("by_conversation_and_time", (q) =>
            q.eq("conversationId", conversation._id)
          )
          .order("desc")
          .first();

        // Compute online status from lastSeen
        // Note: This logic is duplicated here because Convex backend cannot import from lib/
        // Keep in sync with lib/utils/presenceStatus.ts
        const ACTIVE_NOW_THRESHOLD = 2 * 60 * 1000; // 2 minutes
        const RECENTLY_ACTIVE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
        const now = Date.now();
        const timeSinceLastSeen = now - otherUser.lastSeen;
        
        let statusText = "Offline";
        let isOnline = false;
        
        if (timeSinceLastSeen < ACTIVE_NOW_THRESHOLD) {
          statusText = "Active now";
          isOnline = true;
        } else if (timeSinceLastSeen < RECENTLY_ACTIVE_THRESHOLD) {
          statusText = "Recently active";
          isOnline = false;
        }

        return {
          ...conversation,
          isGroup: false,
          otherUser: {
            _id: otherUser._id,
            clerkId: otherUser.clerkId,
            name: otherUser.name,
            profileImage: otherUser.profileImage,
            isOnline: isOnline,
            statusText: statusText,
          },
          latestMessage: latestMessage
            ? {
                content: latestMessage.content,
                sentAt: latestMessage.sentAt,
                senderId: latestMessage.senderId,
              }
            : null,
        };
      })
    );

    // Filter out null values and sort by lastMessageAt
    const validConversations = enrichedConversations.filter(
      (conv) => conv !== null
    );

    return validConversations.sort((a, b) => {
      const aTime = a.lastMessageAt || a.createdAt;
      const bTime = b.lastMessageAt || b.createdAt;
      return bTime - aTime;
    });
  },
});


/**
 * Create a group conversation
 */
export const createGroupConversation = mutation({
  args: {
    participantIds: v.array(v.string()),
    groupName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Validate participants array (minimum 2 participants + creator)
    if (args.participantIds.length < 2) {
      throw new Error("Group must have at least 2 other participants");
    }

    // Ensure creator is in participants
    const allParticipants = Array.from(new Set([identity.subject, ...args.participantIds]));

    // Validate all users exist
    for (const userId of allParticipants) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
        .unique();

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }
    }

    // Generate unique conversation ID for group
    const conversationId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create new group conversation
    const newConversationId = await ctx.db.insert("conversations", {
      conversationId,
      participants: allParticipants,
      createdAt: Date.now(),
      isGroup: true,
      groupName: args.groupName,
      createdBy: identity.subject,
    });

    return newConversationId;
  },
});

/**
 * Get all members of a group conversation
 * Returns member details with online status
 */
export const getGroupMembers = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Verify user is a participant
    if (!conversation.participants.includes(identity.subject)) {
      throw new Error("Not authorized to view this conversation");
    }

    // Verify it's a group conversation
    if (!conversation.isGroup) {
      throw new Error("Not a group conversation");
    }

    // Get all member details
    const members = await Promise.all(
      conversation.participants.map(async (clerkId) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
          .unique();

        if (!user) {
          return null;
        }

        // Compute online status from lastSeen
        const ACTIVE_NOW_THRESHOLD = 2 * 60 * 1000; // 2 minutes
        const now = Date.now();
        const timeSinceLastSeen = now - user.lastSeen;
        const isOnline = timeSinceLastSeen < ACTIVE_NOW_THRESHOLD;

        return {
          _id: user._id,
          clerkId: user.clerkId,
          name: user.name,
          profileImage: user.profileImage,
          isOnline: isOnline,
          isCurrentUser: clerkId === identity.subject,
        };
      })
    );

    // Filter out null values and return
    return members.filter((member) => member !== null);
  },
});
