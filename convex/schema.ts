import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    profileImage: v.optional(v.string()),
    lastSeen: v.number(),
    onlineStatus: v.boolean(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_online_status", ["onlineStatus"]),
  
  conversations: defineTable({
    conversationId: v.string(),
    participants: v.array(v.string()),
    createdAt: v.number(),
    lastMessageAt: v.optional(v.number()),
  })
    .index("by_conversation_id", ["conversationId"])
    .index("by_participants", ["participants"]),
});
