import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

// Constants - Optimized for very fast presence updates
const HEARTBEAT_INTERVAL = 5 * 1000; // 5 seconds (very fast updates)
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Hook to manage user presence heartbeat
 * Sends periodic heartbeats to keep user status as online
 * Optimized for fast and consistent presence updates
 */
export function useHeartbeat() {
  const { isSignedIn } = useAuth();
  const sendHeartbeat = useMutation(api.presence.sendHeartbeat);
  const markOffline = useMutation(api.presence.markOffline);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnloadingRef = useRef(false);

  const sendHeartbeatWithRetry = async (retryCount = 0) => {
    if (!isSignedIn || isUnloadingRef.current) return;

    try {
      await sendHeartbeat();
    } catch (error) {
      console.error("Heartbeat failed:", error);
      
      // Retry with exponential backoff
      if (retryCount < MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        retryTimeoutRef.current = setTimeout(() => {
          sendHeartbeatWithRetry(retryCount + 1);
        }, delay);
      }
    }
  };

  useEffect(() => {
    if (!isSignedIn) {
      // Clear interval if user is not signed in
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Send initial heartbeat immediately
    sendHeartbeatWithRetry();

    // Set up interval for periodic heartbeats
    intervalRef.current = setInterval(() => {
      sendHeartbeatWithRetry();
    }, HEARTBEAT_INTERVAL);

    // Page Visibility API support — mark offline when tab hidden, online when visible
    const handleVisibilityChange = () => {
      if (!isSignedIn) return;
      if (document.hidden) {
        // Tab hidden — mark offline immediately for fast detection
        markOffline().catch(() => {});
      } else {
        // Tab visible again — send immediate heartbeat to come back online
        isUnloadingRef.current = false;
        sendHeartbeatWithRetry();
      }
    };

    // Mark offline when tab is closed or navigating away
    const handleBeforeUnload = () => {
      isUnloadingRef.current = true;
      if (isSignedIn) {
        markOffline().catch(() => {});
      }
    };

    // Additional cleanup on page hide (more reliable than beforeunload on mobile)
    const handlePageHide = () => {
      isUnloadingRef.current = true;
      if (isSignedIn) {
        markOffline().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [isSignedIn, sendHeartbeat, markOffline]);
}
