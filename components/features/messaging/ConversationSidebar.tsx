"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils/getInitials";
import { formatTimestamp } from "@/lib/utils/formatTimestamp";
import { truncateMessage } from "@/lib/utils/truncateMessage";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

interface ConversationSidebarProps {
  selectedConversationId: Id<"conversations"> | null;
  onSelectConversation: (conversationId: Id<"conversations">) => void;
  onNewChat: () => void;
}

export function ConversationSidebar({
  selectedConversationId,
  onSelectConversation,
  onNewChat,
}: ConversationSidebarProps) {
  const conversations = useQuery(api.conversations.getUserConversations);

  if (conversations === undefined) {
    return (
      <div className="flex h-full flex-col border-r bg-white">
        <div className="border-b p-4">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="mb-2 flex items-center gap-3 p-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="mb-2 h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (conversations === null) {
    return (
      <div className="flex h-full flex-col items-center justify-center border-r bg-white p-4">
        <p className="text-gray-600">Failed to load conversations</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-full flex-col border-r bg-white">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        </div>
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-center text-gray-600">
            No conversations yet
            <br />
            <span className="text-sm">Start a chat from the users tab</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col border-r bg-white">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <button
            onClick={onNewChat}
            className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
            title="Start new chat"
          >
            <Plus className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <button
            key={conversation._id}
            onClick={() => onSelectConversation(conversation._id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 transition-colors text-left hover:bg-gray-50",
              selectedConversationId === conversation._id && "bg-blue-50 hover:bg-blue-100"
            )}
          >
            <Avatar>
              <AvatarImage
                src={conversation.otherUser.profileImage}
                alt={conversation.otherUser.name}
              />
              <AvatarFallback>
                {getInitials(conversation.otherUser.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-medium text-gray-900 truncate">
                  {conversation.otherUser.name}
                </p>
                {conversation.latestMessage && (
                  <span className="text-xs text-gray-500 shrink-0">
                    {formatTimestamp(conversation.latestMessage.sentAt)}
                  </span>
                )}
              </div>
              {conversation.latestMessage && (
                <p className="text-sm text-gray-600 truncate">
                  {truncateMessage(conversation.latestMessage.content, 50)}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
