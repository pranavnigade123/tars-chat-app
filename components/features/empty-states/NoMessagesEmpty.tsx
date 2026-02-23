"use client";

import { MessageCircle } from "lucide-react";

interface NoMessagesEmptyProps {
  otherParticipantName: string;
}

export function NoMessagesEmpty({
  otherParticipantName,
}: NoMessagesEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[60vh]">
      <div className="rounded-full bg-gray-100 p-6 mb-6">
        <MessageCircle className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No messages yet
      </h3>
      <p className="text-sm text-gray-500 max-w-xs">
        Say hi to {otherParticipantName}
      </p>
    </div>
  );
}
