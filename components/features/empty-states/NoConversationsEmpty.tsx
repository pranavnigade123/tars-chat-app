"use client";

import { MessageSquare } from "lucide-react";
import { EmptyState } from "./EmptyState";

interface NoConversationsEmptyProps {
  onStartConversation: () => void;
}

export function NoConversationsEmpty({
  onStartConversation,
}: NoConversationsEmptyProps) {
  return (
    <EmptyState
      icon={<MessageSquare className="h-16 w-16 md:h-20 md:w-20" />}
      title="No conversations yet"
      message="Start a conversation with someone to begin chatting"
      action={{
        label: "Start a Conversation",
        onClick: onStartConversation,
      }}
    />
  );
}
