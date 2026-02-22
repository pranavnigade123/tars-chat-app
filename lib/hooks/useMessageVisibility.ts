import { useEffect, useRef, useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";

interface UseMessageVisibilityOptions {
  onMessageVisible: (messageId: Id<"messages">) => void;
  threshold?: number;
}

export function useMessageVisibility({
  onMessageVisible,
  threshold = 0.5,
}: UseMessageVisibilityOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [visibleMessages, setVisibleMessages] = useState<Set<string>>(new Set());

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute("data-message-id");
            if (messageId && !visibleMessages.has(messageId)) {
              setVisibleMessages((prev) => new Set(prev).add(messageId));
              onMessageVisible(messageId as Id<"messages">);
            }
          }
        });
      },
      { threshold }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [onMessageVisible, threshold, visibleMessages]);

  const observeMessage = (element: HTMLElement | null) => {
    if (element && observerRef.current) {
      observerRef.current.observe(element);
    }
  };

  return { observeMessage };
}
