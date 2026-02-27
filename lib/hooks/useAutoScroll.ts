import { useEffect, useRef, useState, useCallback } from "react";

const SCROLL_THRESHOLD = 100; // pixels from bottom

interface UseAutoScrollOptions {
  enabled?: boolean;
  threshold?: number;
  conversationId?: string | null;
}

interface UseAutoScrollReturn {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  isAtBottom: boolean;
  showNewMessagesButton: boolean;
  scrollToBottom: (smooth?: boolean) => void;
}

/**
 * Custom hook for smart auto-scroll behavior in message feeds
 * Automatically scrolls to bottom when new messages arrive (if user is at bottom)
 * Shows "New Messages" button when scrolled up
 * 
 * Improved with deterministic scroll behavior:
 * - Single scroll attempt on conversation change
 * - Clean state management
 * - No retry loops or multiple timeouts
 */
export function useAutoScroll(
  messageCount: number,
  options: UseAutoScrollOptions = {}
): UseAutoScrollReturn {
  const { enabled = true, threshold = SCROLL_THRESHOLD, conversationId } = options;
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showNewMessagesButton, setShowNewMessagesButton] = useState(false);
  const previousMessageCountRef = useRef(messageCount);
  const previousConversationIdRef = useRef(conversationId);

  /**
   * Check if user is at the bottom of the scroll container
   */
  const checkIsAtBottom = useCallback(
    (element: HTMLElement): boolean => {
      const { scrollHeight, scrollTop, clientHeight } = element;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      return distanceFromBottom <= threshold;
    },
    [threshold]
  );

  /**
   * Scroll to the bottom of the container
   */
  const scrollToBottom = useCallback((smooth = true) => {
    if (!scrollContainerRef.current) return;

    const element = scrollContainerRef.current;

    if (smooth && "scrollBehavior" in document.documentElement.style) {
      // Use CSS smooth scroll
      element.scrollTo({
        top: element.scrollHeight,
        behavior: "smooth",
      });
    } else {
      // Fallback: instant scroll
      element.scrollTop = element.scrollHeight;
    }

    setShowNewMessagesButton(false);
  }, []);

  /**
   * Throttled scroll handler
   */
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || !enabled) return;

    const atBottom = checkIsAtBottom(scrollContainerRef.current);
    setIsAtBottom(atBottom);

    // Hide button when scrolled to bottom
    if (atBottom) {
      setShowNewMessagesButton(false);
    }
  }, [checkIsAtBottom, enabled]);

  // Reset scroll state AND scroll to bottom when conversation changes
  // Combined into a single effect to avoid ref-update ordering issues
  useEffect(() => {
    const isNewConversation = conversationId !== previousConversationIdRef.current;
    if (!isNewConversation) return;

    // Reset state
    setIsAtBottom(true);
    setShowNewMessagesButton(false);
    previousMessageCountRef.current = 0;

    // Update ref AFTER the check so future renders know it's no longer new
    previousConversationIdRef.current = conversationId;

    // Scroll to bottom if there are messages
    if (!conversationId || messageCount === 0) return;

    // Use requestAnimationFrame to ensure DOM is painted
    const rafId = requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [conversationId, messageCount]);

  // Auto-scroll on new messages (only if user is at bottom)
  useEffect(() => {
    if (!enabled || messageCount === 0) return;

    const hasNewMessages = messageCount > previousMessageCountRef.current;
    previousMessageCountRef.current = messageCount;

    if (!hasNewMessages) return;

    // Check if feed is shorter than viewport (no scrolling needed)
    if (scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      if (scrollHeight <= clientHeight) {
        return;
      }
    }

    if (isAtBottom) {
      // Auto-scroll to bottom
      scrollToBottom(true);
    } else {
      // Show "New Messages" button
      setShowNewMessagesButton(true);
    }
  }, [messageCount, isAtBottom, enabled, scrollToBottom]);

  // Attach scroll listener
  useEffect(() => {
    const element = scrollContainerRef.current;
    if (!element || !enabled) return;

    // Throttle scroll events
    let timeoutId: NodeJS.Timeout;
    const throttledScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    element.addEventListener("scroll", throttledScroll);
    return () => {
      element.removeEventListener("scroll", throttledScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [handleScroll, enabled]);

  // Recalculate on window resize
  useEffect(() => {
    if (!enabled) return;

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (scrollContainerRef.current) {
          const atBottom = checkIsAtBottom(scrollContainerRef.current);
          setIsAtBottom(atBottom);
        }
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, [checkIsAtBottom, enabled]);

  return {
    scrollContainerRef,
    isAtBottom,
    showNewMessagesButton,
    scrollToBottom,
  };
}
