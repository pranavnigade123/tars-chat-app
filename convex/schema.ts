import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    profileImage: v.optional(v.string()),
    lastSeen: v.number(),
    isOnline: v.boolean(),
    onlineStatus: v.optional(v.boolean()), // Temporary for cleanup
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_last_seen", ["lastSeen"]),
  
  conversations: defineTable({
    conversationId: v.string(),
    participants: v.array(v.string()),
    createdAt: v.number(),
    lastMessageAt: v.optional(v.number()),
    isGroup: v.optional(v.boolean()),
    groupName: v.optional(v.string()),
    groupImage: v.optional(v.string()),
    createdBy: v.optional(v.string()), // Clerk ID of group creator
  })
    .index("by_conversation_id", ["conversationId"]),
  
  // Junction table: allows efficient lookup of conversations by user
  // Eliminates the need for full table scans when fetching a user's conversations
  conversationMembers: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(), // Clerk ID
  })
    .index("by_user", ["userId"])
    .index("by_conversation", ["conversationId"])
    .index("by_user_and_conversation", ["userId", "conversationId"]),
  
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(),
    content: v.string(),
    sentAt: v.number(),
    isDeleted: v.boolean(),
    readBy: v.optional(v.array(v.string())), // Array of clerk IDs who have read this message
    reactions: v.optional(v.array(v.object({
      emoji: v.string(), // The emoji (👍, ❤️, 😂, 😮, 😢)
      userId: v.string(), // Clerk ID of user who reacted
    }))),
  })
    .index("by_conversation_and_time", ["conversationId", "sentAt"])
    .index("by_sender", ["senderId"]),
  typingStates: defineTable({
    userId: v.id("users"),
    conversationId: v.id("conversations"),
    lastTypingAt: v.number(),
  })
    .index("by_conversation_and_user", ["conversationId", "userId"])
    .index("by_lastTypingAt", ["lastTypingAt"]),
});
