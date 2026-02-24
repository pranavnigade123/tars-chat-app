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
      {/* Blurred backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        onTouchEnd={(e) => {
          e.preventDefault();
          onClose();
        }}
      />

      {/* Elevated message clone anchored to the original position */}
      <motion.div
        initial={{ scale: 1, x: 0 }}
        animate={{
          scale: 1.03,
          x: isCurrentUser ? -4 : 4,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed z-[45] pointer-events-none"
        style={{ top: position.rect.top, left: position.rect.left }}
      >
        <div
          className={cn(
            "px-3 py-2 rounded-2xl shadow-xl ring-2",
            isCurrentUser
              ? "bg-blue-600 text-white ring-blue-400/60"
              : "bg-gray-100 text-gray-900 ring-gray-300/80",
            isCurrentUser
              ? cn(
                  !isGroupedWithPrev && "rounded-tr-md",
                  !isGroupedWithNext && "rounded-br-md"
                )
              : cn(
                  !isGroupedWithPrev && "rounded-tl-md",
                  !isGroupedWithNext && "rounded-bl-md"
                )
          )}
        >
          <p className="whitespace-pre-wrap break-words leading-relaxed text-[15px] select-none">
            {content}
          </p>
        </div>
      </motion.div>

      {/* Reaction bar — ABOVE the message */}
      <motion.div
        initial={{ scale: 0.75, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 600, damping: 30 }}
        style={{
          position: "fixed",
          top: position.reactionTop,
          left: position.reactionLeft,
          zIndex: 50,
        }}
        className="bg-[#2d3748] rounded-full shadow-2xl px-3 py-2.5"
        onClick={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-0.5">
          {REACTION_EMOJIS.map((emoji) => (
            <motion.button
              key={emoji}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.25 }}
              onClick={() => handleReaction(emoji)}
              onTouchEnd={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleReaction(emoji);
              }}
              className="text-[28px] p-1.5"
            >
              {emoji}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Action menu — BELOW the message */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: -4 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
          delay: 0.05,
        }}
        style={{
          position: "fixed",
          top: position.actionTop,
          zIndex: 50,
          ...(position.actionRight !== null
            ? { right: position.actionRight }
            : { left: position.actionLeft ?? 0 }),
        }}
        className="bg-[#2d3748] rounded-2xl shadow-2xl overflow-hidden min-w-[160px]"
        onClick={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        {/* Copy — available for all messages */}
        <button
          onClick={handleCopy}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCopy();
          }}
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/10 active:bg-white/10 transition-colors text-white"
        >
          <svg
            className="w-4 h-4 shrink-0"
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
          <span className="text-sm font-medium">Copy</span>
        </button>

        {/* Delete — only for outgoing messages */}
        {isCurrentUser && (
          <>
            <div className="h-px bg-white/10 mx-2" />
            <button
              onClick={handleDelete}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDelete();
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/10 active:bg-white/10 transition-colors text-red-400"
            >
              <svg
                className="w-4 h-4 shrink-0"
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
              <span className="text-sm font-medium">Delete</span>
            </button>
          </>
        )}
      </motion.div>
    </>,
    document.body
  );
}
