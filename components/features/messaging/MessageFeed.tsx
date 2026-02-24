"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils/getInitials";
import { formatMessageTime } from "@/lib/utils/formatTimestamp";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import { NoMessagesEmpty } from "@/components/features/empty-states";
import { useAutoScroll } from "@/lib/hooks/useAutoScroll";
import { NewMessagesButton } from "./NewMessagesButton";
import { useState, useCallback } from "react";
import { Check, CheckCheck } from "lucide-react";
import { useMessageVisibility } from "@/lib/hooks/useMessageVisibility";

interface MessageFeedProps {
  conversationId: Id<"conversations">;
  currentUserId: string;
  scrollToBottomRef?: React.MutableRefObject<(() => void) | null>;
}

export function MessageFeed({ conversationId, currentUserId, scrollToBottomRef }: MessageFeedProps) {
  const messages = useQuery(api.messages.getMessages, { conversationId });
  const conversation = useQuery(api.conversations.getConversationById, { conversationId });
  const markMessageAsRead = useMutation(api.messages.markMessageAsRead);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  
  const {
    scrollContainerRef,
    showNewMessagesButton,
    scrollToBottom,
  } = useAutoScroll(messages?.length ?? 0, {
    conversationId: conversationId,
  });

  // Expose scrollToBottom to parent via ref
  if (scrollToBottomRef) {
    scrollToBottomRef.current = () => scrollToBottom(true);
  }

  // Mark message as read when it becomes visible
  const handleMessageVisible = useCallback((messageId: Id<"messages">) => {
    markMessageAsRead({ messageId }).catch((err) => {
      console.error("Failed to mark message as read:", err);
    });
  }, [markMessageAsRead]);

  const { observeMessage } = useMessageVisibility({
    onMessageVisible: handleMessageVisible,
    threshold: 0.5,
  });

  if (messages === undefined) {
    return (
      <div className="flex h-full flex-col bg-gradient-to-b from-gray-50 to-white">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={cn("flex gap-2", i % 2 === 0 ? "" : "flex-row-reverse")}>
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-20 w-72 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (messages === null) {
    return (
      <div className="flex h-full items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-white">
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

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-white">
        <NoMessagesEmpty
          otherParticipantName={conversation?.otherUser?.name || "this user"}
        />
      </div>
    );
  }

  return (
    <div 
      ref={scrollContainerRef} 
      className="relative flex-1 overflow-y-auto p-4 space-y-1 bg-gradient-to-b from-gray-50 to-white"
    >
      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === currentUserId;
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
        
        const showAvatar = !nextMessage || nextMessage.senderId !== message.senderId;
        const showName = !prevMessage || prevMessage.senderId !== message.senderId;
        const isGroupedWithPrev = prevMessage && prevMessage.senderId === message.senderId;
        const isGroupedWithNext = nextMessage && nextMessage.senderId === message.senderId;

        // Check if message is read by the other user (for sent messages)
        // Handle migration: readBy might be undefined for old messages
        const readBy = message.readBy || [];
        const isRead = isCurrentUser && readBy.length > 1; // More than just the sender
        const isDelivered = isCurrentUser; // All sent messages are delivered
        
        // Check if this is an unread message received by current user
        const isUnread = !isCurrentUser && !readBy.includes(currentUserId);

        return (
          <div
            key={message._id}
            ref={(el) => {
              // Only observe messages from other users
              if (!isCurrentUser && el) {
                observeMessage(el);
              }
            }}
            data-message-id={message._id}
            className={cn(
              "flex gap-2 group",
              isCurrentUser ? "flex-row-reverse" : "flex-row",
              !isGroupedWithPrev && "mt-4"
            )}
            onMouseEnter={() => setHoveredMessageId(message._id)}
            onMouseLeave={() => setHoveredMessageId(null)}
          >
            <div className="w-8 shrink-0 flex items-end">
              {showAvatar ? (
                <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                  <AvatarImage
                    src={message.sender?.profileImage}
                    alt={message.sender?.name || "User"}
                  />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                    {getInitials(message.sender?.name || "?")}
                  </AvatarFallback>
                </Avatar>
              ) : null}
            </div>

            <div
              className={cn(
                "flex flex-col max-w-[75%] md:max-w-[65%]",
                isCurrentUser ? "items-end" : "items-start"
              )}
            >
              {showName && !isCurrentUser && (
                <span className="text-xs font-medium text-gray-700 px-3 mb-1">
                  {message.sender?.name || "Unknown"}
                </span>
              )}
              
              <div className="relative group/message">
                {/* NEW badge for unread messages */}
                {isUnread && (
                  <div className="absolute -top-2 -left-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md z-10">
                    NEW
                  </div>
                )}
                
                <div
                  className={cn(
                    "px-4 py-2.5 shadow-sm transition-all duration-200",
                    isCurrentUser
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                      : isUnread
                      ? "bg-blue-50 text-gray-900 border-2 border-blue-400 ring-2 ring-blue-100"
                      : "bg-white text-gray-900 border border-gray-200",
                    // Rounded corners based on grouping
                    isCurrentUser ? (
                      cn(
                        "rounded-2xl",
                        !isGroupedWithPrev && "rounded-tr-md",
                        !isGroupedWithNext && "rounded-br-md"
                      )
                    ) : (
                      cn(
                        "rounded-2xl",
                        !isGroupedWithPrev && "rounded-tl-md",
                        !isGroupedWithNext && "rounded-bl-md"
                      )
                    ),
                    hoveredMessageId === message._id && "shadow-md scale-[1.02]"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words leading-relaxed">
                    {message.content}
                  </p>
                  
                  {/* Read receipt for sent messages */}
                  {isCurrentUser && (
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-xs opacity-70">
                        {formatMessageTime(message.sentAt)}
                      </span>
                      {isRead ? (
                        <CheckCheck className="h-3.5 w-3.5 opacity-90" aria-label="Read" />
                      ) : isDelivered ? (
                        <Check className="h-3.5 w-3.5 opacity-70" aria-label="Delivered" />
                      ) : null}
                    </div>
                  )}
                </div>
                
                {/* Timestamp on hover for received messages */}
                {!isCurrentUser && (
                  <div
                    className={cn(
                      "absolute -bottom-5 text-xs text-gray-500 transition-opacity duration-200 whitespace-nowrap",
                      "left-0",
                      hoveredMessageId === message._id ? "opacity-100" : "opacity-0"
                    )}
                  >
                    {formatMessageTime(message.sentAt)}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      <NewMessagesButton
        show={showNewMessagesButton}
        onClick={() => scrollToBottom(true)}
      />
    </div>
  );
}
