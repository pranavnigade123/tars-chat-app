"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { AnimatedDiv, AnimatedBadge } from "@/components/ui/motion";
import { formatMessageTime } from "@/lib/utils/formatTimestamp";
import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";

interface Reaction {
  emoji: string;
  userId: string;
}

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
  reactions?: Reaction[];
  onReaction?: (emoji: string) => void;
  currentUserId?: string;
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
  reactions = [],
  onReaction,
  currentUserId,
}: MessageBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showNewBadge, setShowNewBadge] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const actionExecutedRef = useRef(false);

  const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

  // Determine if badge should be shown (only for unread messages from other users)
  const shouldShowBadge = useMemo(() => {
    return isUnread && !isCurrentUser;
  }, [isUnread, isCurrentUser]);

  // Group reactions by emoji with counts
  const groupedReactions = useMemo(() => {
    const groups: { [emoji: string]: { count: number; userIds: string[]; hasCurrentUser: boolean } } = {};
    
    reactions.forEach((reaction) => {
      if (!groups[reaction.emoji]) {
        groups[reaction.emoji] = { count: 0, userIds: [], hasCurrentUser: false };
      }
      groups[reaction.emoji].count++;
      groups[reaction.emoji].userIds.push(reaction.userId);
      if (reaction.userId === currentUserId) {
        groups[reaction.emoji].hasCurrentUser = true;
      }
    });
    
    return groups;
  }, [reactions, currentUserId]);

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

  // Handle long press for mobile - show action menu
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isDeleted || isSelectMode) return;
    
    setIsLongPressing(true);
    longPressTimer.current = setTimeout(() => {
      actionExecutedRef.current = false;
      setShowActionMenu(true);
      setIsLongPressing(false);
      // Haptic feedback on supported devices
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
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

  // Handle right-click for desktop - show action menu
  const handleContextMenu = (e: React.MouseEvent) => {
    if (isDeleted || isSelectMode) return;
    
    e.preventDefault();
    actionExecutedRef.current = false;
    setShowActionMenu(true);
  };

  // Handle double-click for quick reactions
  const handleDoubleClick = () => {
    if (isDeleted || isSelectMode) return;
    actionExecutedRef.current = false;
    setShowActionMenu(true);
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
          "flex flex-col max-w-[75%] md:max-w-[65%] relative",
          isCurrentUser ? "items-end" : "items-start"
        )}
      >
        <div className="relative">
          {/* NEW badge - shows for 2 seconds only */}
          {showNewBadge && (
            <AnimatedBadge className="absolute -top-2 -left-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm z-10">
              NEW
            </AnimatedBadge>
          )}
          
          <div
            className={cn(
              "px-3 py-2 rounded-2xl transition-all duration-200 inline-block relative",
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
              isLongPressing && !isDeleted && "scale-95 opacity-80"
            )}
            onDoubleClick={handleDoubleClick}
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
                <p className="whitespace-pre-wrap wrap-break-word leading-relaxed text-[15px]">
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
          </div>
        </div>

        {/* Reaction Display - below message */}
        {Object.keys(groupedReactions).length > 0 && !isDeleted && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "flex flex-wrap gap-1 mt-1",
              isCurrentUser ? "justify-end" : "justify-start"
            )}
          >
            {Object.entries(groupedReactions).map(([emoji, data]) => (
              <button
                key={emoji}
                onClick={() => onReaction?.(emoji)}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all",
                  data.hasCurrentUser
                    ? "bg-blue-100 border border-blue-300 hover:bg-blue-200"
                    : "bg-gray-100 border border-gray-200 hover:bg-gray-200"
                )}
              >
                <span className="text-sm">{emoji}</span>
                <span className={cn(
                  "font-medium",
                  data.hasCurrentUser ? "text-blue-700" : "text-gray-700"
                )}>
                  {data.count}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </div>
      
      {/* Action Menu (Reactions + Delete) - WhatsApp-style */}
      {showActionMenu && (
        <>
          {/* Backdrop */}
          <AnimatedDiv
            variant="fadeIn"
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" 
            onClick={() => setShowActionMenu(false)}
            onTouchEnd={(e) => {
              e.preventDefault();
              setShowActionMenu(false);
            }}
          />
          
          {/* Action Menu */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[340px] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {/* Reactions Bar */}
            <div className="bg-[#2d3748] rounded-full shadow-2xl px-4 py-3 mb-3">
              <div className="flex justify-between items-center gap-2">
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (actionExecutedRef.current) return;
                      actionExecutedRef.current = true;
                      onReaction?.(emoji);
                      setShowActionMenu(false);
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (actionExecutedRef.current) return;
                      actionExecutedRef.current = true;
                      onReaction?.(emoji);
                      setShowActionMenu(false);
                    }}
                    className="text-[32px] hover:scale-125 active:scale-110 transition-transform p-2"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Delete Option - only for current user's messages */}
            {isCurrentUser && (
              <div className="bg-[#2d3748] rounded-2xl shadow-2xl overflow-hidden">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (actionExecutedRef.current) return;
                    actionExecutedRef.current = true;
                    onDelete?.();
                    setShowActionMenu(false);
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (actionExecutedRef.current) return;
                    actionExecutedRef.current = true;
                    onDelete?.();
                    setShowActionMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#374151] active:bg-[#374151] transition-colors text-white"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="font-medium">Delete for you</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatedDiv>
  );
}
