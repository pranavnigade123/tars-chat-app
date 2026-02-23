"use client";

import { ArrowDown } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { AnimatedButton } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

interface NewMessagesButtonProps {
  show: boolean;
  onClick: () => void;
}

export function NewMessagesButton({ show, onClick }: NewMessagesButtonProps) {
  return (
    <AnimatePresence>
      {show && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <AnimatedButton
            onClick={onClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={cn(
              "flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg",
              "transition-colors duration-200",
              "hover:bg-blue-700",
              "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            )}
            aria-label="Scroll to new messages"
          >
            <ArrowDown className="h-4 w-4" />
            <span>New messages</span>
          </AnimatedButton>
        </div>
      )}
    </AnimatePresence>
  );
}
