"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils/getInitials";
import { formatMessageTime } from "@/lib/utils/formatTimestamp";
import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  content: string;
  sentAt: number;
  isCurrentUser: boolean;
  senderName?: string;
  senderImage?: string;
  showAvatar: boolean;
  showName: boolean;
  isGroupedWithPrev: boolean;
  isGroupedWithNext: boolean;
  isRead?: boolean;
  isDelivered?: boolean;
  isUnread?: boolean;
  messageId: string;
}

export function MessageBubble({
  content,
  sentAt,
  isCurrentUser,
  senderName,
  senderImage,
  showAvatar,
  showName,
  isGroupedWithPrev,
  isGroupedWithNext,
  isRead,
  isDelivered,
  isUnread,
  messageId,
}: MessageBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      data-message-id={messageId}
      className={cn(
        "flex gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-300",
        isCurrentUser ? "flex-row-reverse" : "flex-row",
        !isGroupedWithPrev && "mt-6"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar - Hidden for 1v1 chats, will be shown for group chats */}
      {/* Keeping the space for alignment */}
      <div className="w-0 shrink-0" />

      {/* Message content */}
      <div
        className={cn(
          "flex flex-col max-w-[75%] md:max-w-[65%]",
          isCurrentUser ? "items-end" : "items-start"
        )}
      >
        {/* Sender name - Hidden for 1v1, will show for group chats */}
        {/* {showName && !isCurrentUser && (
          <span className="text-xs font-medium text-gray-600 px-3 mb-1.5">
            {senderName || "Unknown"}
          </span>
        )} */}
        
        <div className="relative">
          {/* NEW badge */}
          {isUnread && (
            <div className="absolute -top-2 -left-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm z-10">
              NEW
            </div>
          )}
          
          <div
            className={cn(
              "px-3 py-2 rounded-2xl transition-all duration-200 inline-block",
              isCurrentUser
                ? "bg-blue-600 text-white"
                : isUnread
                ? "bg-blue-50 text-gray-900 ring-1 ring-blue-200"
                : "bg-gray-100 text-gray-900",
              // Rounded corners based on grouping
              isCurrentUser ? (
                cn(
                  !isGroupedWithPrev && "rounded-tr-md",
                  !isGroupedWithNext && "rounded-br-md"
                )
              ) : (
                cn(
                  !isGroupedWithPrev && "rounded-tl-md",
                  !isGroupedWithNext && "rounded-bl-md"
                )
              ),
              isHovered && "shadow-sm"
            )}
          >
            <div className="flex items-end gap-2">
              <p className="whitespace-pre-wrap break-words leading-relaxed text-[15px]">
                {content}
              </p>
              <div className="flex items-center gap-1 shrink-0 self-end pb-[1px]">
                <span className={cn(
                  "text-[10px] leading-none",
                  isCurrentUser ? "text-white/70" : "text-gray-500"
                )}>
                  {formatMessageTime(sentAt)}
                </span>
                {isCurrentUser && (
                  <>
                    {isRead ? (
                      <CheckCheck className="h-3 w-3 text-white/70" aria-label="Read" />
                    ) : isDelivered ? (
                      <Check className="h-3 w-3 text-white/70" aria-label="Delivered" />
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
