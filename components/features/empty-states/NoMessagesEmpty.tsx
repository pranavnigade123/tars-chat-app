"use client";

import { MessageCircle } from "lucide-react";
import { EmptyState } from "./EmptyState";

interface NoMessagesEmptyProps {
  otherParticipantName: string;
}

export function NoMessagesEmpty({
  otherParticipantName,
}: NoMessagesEmptyProps) {
  return (
    <EmptyState
      icon={<MessageCircle className="h-16 w-16 md:h-20 md:w-20" />}
      title="No messages yet"
      message={`Start your conversation with ${otherParticipantName}`}
    />
  );
}
