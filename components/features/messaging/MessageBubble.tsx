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
      {/* Avatar */}
      <div className="w-8 shrink-0 flex items-end">
        {showAvatar ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={senderImage} alt={senderName || "User"} />
            <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
              {getInitials(senderName || "?")}
            </AvatarFallback>
          </Avatar>
        ) : null}
      </div>

      {/* Message content */}
      <div
        className={cn(
          "flex flex-col max-w-[75%] md:max-w-[65%]",
          isCurrentUser ? "items-end" : "items-start"
        )}
      >
        {showName && !isCurrentUser && (
          <span className="text-xs font-medium text-gray-600 px-3 mb-1.5">
            {senderName || "Unknown"}
          </span>
        )}
        
        <div className="relative">
          {/* NEW badge */}
          {isUnread && (
            <div className="absolute -top-2 -left-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm z-10">
              NEW
            </div>
          )}
          
          <div
            className={cn(
              "px-4 py-2.5 rounded-2xl transition-all duration-200",
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
            <p className="whitespace-pre-wrap break-words leading-relaxed text-[15px]">
              {content}
            </p>
            
            {/* Read receipt for sent messages */}
            {isCurrentUser && (
              <div className="flex items-center justify-end gap-1.5 mt-1">
                <span className="text-xs opacity-75">
                  {formatMessageTime(sentAt)}
                </span>
                {isRead ? (
                  <CheckCheck className="h-3.5 w-3.5 opacity-90" aria-label="Read" />
                ) : isDelivered ? (
                  <Check className="h-3.5 w-3.5 opacity-75" aria-label="Delivered" />
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
                isHovered ? "opacity-100" : "opacity-0"
              )}
            >
              {formatMessageTime(sentAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
