import { useEffect, useRef, useCallback } from "react";
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
  const visibleMessagesRef = useRef<Set<string>>(new Set());
  const onMessageVisibleRef = useRef(onMessageVisible);

  // Keep callback ref in sync without re-creating observer
  useEffect(() => {
    onMessageVisibleRef.current = onMessageVisible;
  }, [onMessageVisible]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute("data-message-id");
            if (messageId && !visibleMessagesRef.current.has(messageId)) {
              visibleMessagesRef.current.add(messageId);
              onMessageVisibleRef.current(messageId as Id<"messages">);
            }
          }
        });
      },
      { threshold }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold]);

  const observeMessage = useCallback((element: HTMLElement | null) => {
    if (element && observerRef.current) {
      observerRef.current.observe(element);
    }
  }, []);

  return { observeMessage };
}
