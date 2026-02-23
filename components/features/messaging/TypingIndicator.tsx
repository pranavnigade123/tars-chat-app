"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMemo } from "react";
import { motion } from "framer-motion";

interface TypingIndicatorProps {
  conversationId: Id<"conversations">;
  variant?: "full" | "compact";
}

export function TypingIndicator({ conversationId, variant = "full" }: TypingIndicatorProps) {
  const typingUsers = useQuery(api.typingStates.getTypingState, {
    conversationId,
  });

  const displayText = useMemo(() => {
    if (!typingUsers || typingUsers.length === 0) return null;
    
    if (typingUsers.length === 1) {
      return `${typingUsers[0].name} is typing...`;
    }
    
    if (typingUsers.length === 2) {
      return `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`;
    }
    
    return "Multiple people are typing...";
  }, [typingUsers]);

  if (!displayText) return null;

  // Compact variant for conversation list
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1.5 text-sm text-blue-600">
        <span className="italic">typing</span>
        <div className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="text-xs"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            >
              ·
            </motion.span>
          ))}
        </div>
      </div>
    );
  }

  // Full variant for chat area - Small fixed position indicator
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
      className="px-4 pb-1"
    >
      <div className="flex gap-3">
        {/* Empty space for alignment (where avatar would be) */}
        <div className="w-0 shrink-0" />
        
        {/* Small typing bubble */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="inline-block px-3 py-2 bg-blue-50 rounded-2xl rounded-tl-md border border-blue-100"
        >
          <div className="flex items-center gap-1">
            {/* Smaller animated dots */}
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* ARIA live region for screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {displayText}
      </div>
    </motion.div>
  );
}
