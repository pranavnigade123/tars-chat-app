"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ContextMenuPosition } from "@/lib/hooks/useMessageContext";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

interface MessageContextMenuProps {
  isOpen: boolean;
  position: ContextMenuPosition | null;
  isCurrentUser: boolean;
  content: string;
  isGroupedWithPrev: boolean;
  isGroupedWithNext: boolean;
  onClose: () => void;
  onReaction?: (emoji: string) => void;
  onDelete?: () => void;
}

export function MessageContextMenu({
  isOpen,
  position,
  isCurrentUser,
  content,
  isGroupedWithPrev,
  isGroupedWithNext,
  onClose,
  onReaction,
  onDelete,
}: MessageContextMenuProps) {
  const executedRef = useRef(false);

  // Lock body scroll while the context menu is visible
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Reset action-executed guard each time the menu opens
  useEffect(() => {
    if (isOpen) {
      executedRef.current = false;
    }
  }, [isOpen]);

  if (typeof document === "undefined" || !isOpen || !position) return null;

  const handleReaction = (emoji: string) => {
    if (executedRef.current) return;
    executedRef.current = true;
    onReaction?.(emoji);
    onClose();
  };

  const handleCopy = () => {
    if (executedRef.current) return;
    executedRef.current = true;
    navigator.clipboard?.writeText(content).catch((err) => {
      console.error("Failed to copy message:", err);
    });
    onClose();
  };

  const handleDelete = () => {
    if (executedRef.current) return;
    executedRef.current = true;
    onDelete?.();
    onClose();
  };

  return createPortal(
    <>
      {/* Invisible backdrop - just for click handling */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        onTouchEnd={(e) => {
          e.preventDefault();
          onClose();
        }}
      />

      {/* Compact Reaction bar with proper spacing */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 600, damping: 26 }}
        style={{
          position: "fixed",
          top: position.reactionTop,
          left: position.reactionLeft,
          zIndex: 50,
        }}
        className="bg-white dark:bg-[#242424] rounded-full shadow-xl border border-gray-200 dark:border-[#2d2d2d] px-1.5 py-1.5"
        onClick={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-0">
          {REACTION_EMOJIS.map((emoji) => (
            <motion.button
              key={emoji}
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.15 }}
              onClick={() => handleReaction(emoji)}
              onTouchEnd={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleReaction(emoji);
              }}
              className="text-[20px] p-1.5 rounded-full hover:bg-gray-100 active:bg-gray-100 transition-colors"
            >
              {emoji}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Compact Action menu */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 26,
          delay: 0.03,
        }}
        style={{
          position: "fixed",
          top: position.actionTop,
          zIndex: 50,
          ...(position.actionRight !== null
            ? { right: position.actionRight }
            : { left: position.actionLeft ?? 0 }),
        }}
        className="bg-white dark:bg-[#242424] rounded-xl shadow-xl border border-gray-200 dark:border-[#2d2d2d] overflow-hidden min-w-[120px]"
        onClick={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        {/* Copy */}
        <button
          onClick={handleCopy}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCopy();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] active:bg-gray-100 dark:active:bg-[#2e2e2e] transition-colors text-gray-700 dark:text-gray-300"
        >
          <svg
            className="w-3.5 h-3.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span className="text-[13px] font-medium">Copy</span>
        </button>

        {/* Delete */}
        {isCurrentUser && (
          <>
            <div className="h-px bg-gray-200" />
            <button
              onClick={handleDelete}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDelete();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 active:bg-red-100 transition-colors text-red-600"
            >
              <svg
                className="w-3.5 h-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span className="text-[13px] font-medium">Delete</span>
            </button>
          </>
        )}
      </motion.div>
    </>,
    document.body
  );
}
