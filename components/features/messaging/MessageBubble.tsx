"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { AnimatedDiv, AnimatedBadge } from "@/components/ui/motion";
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
  isDeleted?: boolean;
  onDelete?: () => void;
  isSelectMode?: boolean;
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
  isDeleted = false,
  onDelete,
  isSelectMode = false,
}: MessageBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showNewBadge, setShowNewBadge] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Determine if badge should be shown (only for unread messages from other users)
  const shouldShowBadge = useMemo(() => {
    return isUnread && !isCurrentUser;
  }, [isUnread, isCurrentUser]);

  // Show NEW badge only once per message (track in localStorage)
  useEffect(() => {
    if (!shouldShowBadge) {
      setShowNewBadge(false);
      return;
    }
    
    const badgeShownKey = `badge_shown_${messageId}`;
    const hasShownBadge = localStorage.getItem(badgeShownKey);
    
    if (!hasShownBadge) {
      setShowNewBadge(true);
      localStorage.setItem(badgeShownKey, 'true');
      
      const timer = setTimeout(() => {
        setShowNewBadge(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [shouldShowBadge, messageId]);

  // Handle long press for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isCurrentUser || isDeleted || isSelectMode) return;
    
    setIsLongPressing(true);
    longPressTimer.current = setTimeout(() => {
      setShowDeleteMenu(true);
      setIsLongPressing(false);
    }, 500);
  };

  const handleTouchEnd = () => {
    setIsLongPressing(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleTouchMove = () => {
    setIsLongPressing(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  // Handle right-click for desktop
  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isCurrentUser || isDeleted || isSelectMode) return;
    
    e.preventDefault();
    setShowDeleteMenu(true);
  };

  return (
    <AnimatedDiv
      variant="fadeInUp"
      data-message-id={messageId}
      className={cn(
        "flex gap-3 group w-full",
        isCurrentUser ? "flex-row-reverse" : "flex-row",
        !isGroupedWithPrev && "mt-6"
      )}
      style={{
        WebkitUserSelect: isCurrentUser && !isDeleted && !isSelectMode ? 'none' : 'auto',
        userSelect: isCurrentUser && !isDeleted && !isSelectMode ? 'none' : 'auto',
        WebkitTouchCallout: 'none'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
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
          {/* NEW badge - shows for 2 seconds only */}
          {showNewBadge && (
            <AnimatedBadge className="absolute -top-2 -left-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm z-10">
              NEW
            </AnimatedBadge>
          )}
          
          <div
            className={cn(
              "px-3 py-2 rounded-2xl transition-all duration-200 inline-block",
              isCurrentUser
                ? "bg-blue-600 text-white"
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
              isHovered && "shadow-sm",
              isDeleted && "bg-gray-50 border border-gray-200",
              isLongPressing && isCurrentUser && !isDeleted && "scale-95 opacity-80"
            )}
          >
            {isDeleted ? (
              // Deleted message state
              <div className="flex items-center gap-2">
                <p className="italic text-gray-500 text-sm">
                  This message was deleted
                </p>
              </div>
            ) : (
              // Normal message
              <div className="flex items-end gap-2">
                <p className="whitespace-pre-wrap break-words leading-relaxed text-[15px]">
                  {content}
                </p>
                <div className="flex items-center gap-1 shrink-0 self-end pb-px">
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
            )}
            
            {/* Delete confirmation menu - centered modal */}
            {showDeleteMenu && (
              <AnimatedDiv
                variant="scaleIn"
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 w-[280px] max-w-[90vw]"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-sm text-gray-800 mb-4 font-medium">Delete this message?</p>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.();
                      setShowDeleteMenu(false);
                    }}
                    className="flex-1 bg-red-500 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-red-600 active:scale-95 transition-all font-medium shadow-sm"
                  >
                    Delete
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteMenu(false);
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-200 active:scale-95 transition-all font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </AnimatedDiv>
            )}
          </div>
        </div>
      </div>
      
      {/* Backdrop when menu is open */}
      {showDeleteMenu && (
        <AnimatedDiv
          variant="fadeIn"
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px]" 
          onClick={() => setShowDeleteMenu(false)}
        />
      )}
    </AnimatedDiv>
  );
}
