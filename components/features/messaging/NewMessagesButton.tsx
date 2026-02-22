"use client";

import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewMessagesButtonProps {
  show: boolean;
  onClick: () => void;
}

export function NewMessagesButton({ show, onClick }: NewMessagesButtonProps) {
  if (!show) return null;

  return (
    <div className="absolute bottom-4 right-4 z-10">
      <button
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        className={cn(
          "flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg",
          "transition-all duration-200",
          "hover:bg-blue-700 hover:shadow-xl",
          "active:scale-95",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "animate-in fade-in slide-in-from-bottom-2"
        )}
        aria-label="Scroll to new messages"
      >
        <ArrowDown className="h-4 w-4" />
        <span>New Messages</span>
      </button>
    </div>
  );
}
