"use client";

import { motion } from "framer-motion";
import { MessageBubble } from "./MessageBubble";
import { NoMessagesEmpty } from "@/components/features/empty-states";
import { Skeleton } from "@/components/ui/skeleton";
import { getDateLabel, isDifferentDay } from "@/lib/utils/timestamp";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

interface Message {
  _id: Id<"messages">;
  content: string;
  sentAt: number;
  senderId: string;
  isDeleted: boolean;
  readBy?: string[];
  reactions?: Array<{ emoji: string; userId: string }>;
  sender?: {
    name: string;
    profileImage?: string;
  } | null;
}

interface MessageListProps {
  messages: Message[] | undefined;
  currentUserId: string;
  isGroup: boolean;
  isSelectMode: boolean;
  selectedMessages: Set<Id<"messages">>;
  showSkeleton: boolean;
  conversationName: string;
  onMessageVisible: (element: HTMLElement | null) => void;
  onToggleMessageSelect: (messageId: Id<"messages">) => void;
  onDeleteMessage: (messageId: Id<"messages">) => Promise<void>;
  onReaction: (messageId: Id<"messages">, emoji: string) => Promise<void>;
}

/**
 * MessageList component
 * Renders the list of messages with date separators, skeletons, and empty states
 * Extracted from messages page for better separation of concerns
 */
export function MessageList({
  messages,
  currentUserId,
  isGroup,
  isSelectMode,
  selectedMessages,
  showSkeleton,
  conversationName,
  onMessageVisible,
  onToggleMessageSelect,
  onDeleteMessage,
  onReaction,
}: MessageListProps) {
  // Show skeleton loading state
  if (messages === undefined && showSkeleton) {
    return (
      <div className="space-y-4 mt-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={cn("flex gap-3", i % 2 === 0 ? "" : "flex-row-reverse")}>
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <Skeleton className="h-20 w-72 rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  // Show nothing for first 400ms (handled by parent)
  if (messages === undefined) {
    return null;
  }

  // Show empty state
  if (messages.length === 0) {
    return <NoMessagesEmpty otherParticipantName={conversationName} />;
  }

  // Render messages
  return (
    <div className="space-y-3 mt-auto">
      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === currentUserId;
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;

        // Check if we need to show a date separator
        const showDateSeparator =
          !prevMessage || isDifferentDay(prevMessage.sentAt, message.sentAt);

        const showAvatar = !nextMessage || nextMessage.senderId !== message.senderId;
        const showName = !prevMessage || prevMessage.senderId !== message.senderId;
        const isGroupedWithPrev = !!(prevMessage && prevMessage.senderId === message.senderId);
        const isGroupedWithNext = !!(nextMessage && nextMessage.senderId === message.senderId);

        const readBy = message.readBy || [];
        const isRead = isCurrentUser && readBy.length > 1;
        const isDelivered = isCurrentUser;
        const isUnread = !isCurrentUser && !readBy.includes(currentUserId);

        const handleDelete = async () => {
          try {
            await onDeleteMessage(message._id);
          } catch (error) {
            console.error("Failed to delete message:", error);
            alert("Failed to delete message. Please try again.");
          }
        };

        const handleReaction = async (emoji: string) => {
          try {
            await onReaction(message._id, emoji);
          } catch (error) {
            console.error("Failed to toggle reaction:", error);
          }
        };

        return (
          <div key={message._id}>
            {/* Date Separator */}
            {showDateSeparator && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex items-center justify-center my-4"
              >
                <div className="bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-300 text-xs font-medium px-3 py-1 rounded-full">
                  {getDateLabel(message.sentAt)}
                </div>
              </motion.div>
            )}

            {/* Message Bubble */}
            <div
              ref={(el) => {
                if (!isCurrentUser && el) {
                  onMessageVisible(el);
                }
              }}
              className={cn(
                "flex items-center gap-3",
                isSelectMode && isCurrentUser && "cursor-pointer"
              )}
              onClick={() => {
                if (isSelectMode && isCurrentUser && !message.isDeleted) {
                  onToggleMessageSelect(message._id);
                }
              }}
            >
              {/* Checkbox for multi-select mode */}
              {isSelectMode && isCurrentUser && !message.isDeleted && (
                <div
                  className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0",
                    selectedMessages.has(message._id)
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-300 bg-white"
                  )}
                >
                  {selectedMessages.has(message._id) && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              )}

              <MessageBubble
                messageId={message._id}
                content={message.content}
                sentAt={message.sentAt}
                isCurrentUser={isCurrentUser}
                senderName={message.sender?.name}
                senderImage={message.sender?.profileImage}
                showAvatar={showAvatar}
                showName={showName}
                isGroupedWithPrev={isGroupedWithPrev}
                isGroupedWithNext={isGroupedWithNext}
                isRead={isRead}
                isDelivered={isDelivered}
                isUnread={isUnread}
                isDeleted={message.isDeleted}
                onDelete={handleDelete}
                isSelectMode={isSelectMode}
                reactions={message.reactions || []}
                onReaction={handleReaction}
                currentUserId={currentUserId}
                isGroup={isGroup}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
