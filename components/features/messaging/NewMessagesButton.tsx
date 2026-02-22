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
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
      <button
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        className={cn(
          "flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xl",
          "transition-all duration-300",
          "hover:shadow-2xl hover:scale-105",
          "active:scale-95",
          "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
          "animate-in fade-in slide-in-from-bottom-4 duration-300",
          "border-2 border-white"
        )}
        aria-label="Scroll to new messages"
      >
        <ArrowDown className="h-4 w-4 animate-bounce" />
        <span>New Messages</span>
      </button>
    </div>
  );
}
