"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMemo } from "react";

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
          <span className="animate-bounce text-xs" style={{ animationDelay: "0ms" }}>
            ·
          </span>
          <span className="animate-bounce text-xs" style={{ animationDelay: "150ms" }}>
            ·
          </span>
          <span className="animate-bounce text-xs" style={{ animationDelay: "300ms" }}>
            ·
          </span>
        </div>
      </div>
    );
  }

  // Full variant for chat area
  return (
    <div className="px-4 py-2 bg-gray-50 border-t">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="flex gap-1">
          <span className="animate-bounce" style={{ animationDelay: "0ms" }}>
            ·
          </span>
          <span className="animate-bounce" style={{ animationDelay: "150ms" }}>
            ·
          </span>
          <span className="animate-bounce" style={{ animationDelay: "300ms" }}>
            ·
          </span>
        </div>
        <span className="italic">{displayText}</span>
      </div>
      
      {/* ARIA live region for screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {displayText}
      </div>
    </div>
  );
}
