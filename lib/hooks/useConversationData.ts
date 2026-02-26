import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * Custom hook to fetch conversation-related data
 * Centralizes all data fetching logic for the messages page
 */
export function useConversationData(
  conversationId: Id<"conversations"> | null,
  enabled: boolean = true
) {
  const conversations = useQuery(
    api.conversations.getUserConversations,
    enabled ? {} : "skip"
  );
  const messages = useQuery(
    api.messages.getMessages,
    enabled && conversationId ? { conversationId } : "skip"
  );
  const conversation = useQuery(
    api.conversations.getConversationById,
    enabled && conversationId ? { conversationId } : "skip"
  );

  return {
    conversations,
    messages,
    conversation,
    isLoading: {
      conversations: conversations === undefined,
      messages: messages === undefined,
      conversation: conversation === undefined,
    },
  };
}
