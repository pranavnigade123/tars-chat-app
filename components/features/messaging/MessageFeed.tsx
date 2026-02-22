"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils/getInitials";
import { formatMessageTime } from "@/lib/utils/formatTimestamp";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import type { Id } from "@/convex/_generated/dataModel";

interface MessageFeedProps {
  conversationId: Id<"conversations">;
  currentUserId: string;
}

export function MessageFeed({ conversationId, currentUserId }: MessageFeedProps) {
  const messages = useQuery(api.messages.getMessages, { conversationId });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages load or new message arrives
  useEffect(() => {
    if (scrollRef.current && messages) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Loading state
  if (messages === undefined) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={cn("mb-4 flex gap-3", i % 2 === 0 ? "" : "flex-row-reverse")}>
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-64" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (messages === null) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600">Failed to load messages</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-gray-600">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === currentUserId;
        const showAvatar =
          index === 0 || messages[index - 1].senderId !== message.senderId;

        return (
          <div
            key={message._id}
            className={cn(
              "flex gap-3",
              isCurrentUser ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar - only show for first message in group */}
            {showAvatar ? (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage
                  src={message.sender?.profileImage}
                  alt={message.sender?.name || "User"}
                />
                <AvatarFallback className="text-xs">
                  {getInitials(message.sender?.name || "?")}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-8 w-8 flex-shrink-0" />
            )}

            {/* Message content */}
            <div
              className={cn(
                "flex flex-col gap-1 max-w-[70%]",
                isCurrentUser ? "items-end" : "items-start"
              )}
            >
              {showAvatar && (
                <span className="text-xs text-gray-600 px-2">
                  {message.sender?.name || "Unknown"}
                </span>
              )}
              <div
                className={cn(
                  "rounded-lg px-4 py-2 break-words",
                  isCurrentUser
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              <span className="text-xs text-gray-500 px-2">
                {formatMessageTime(message.sentAt)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
