import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

// Constants
const HEARTBEAT_INTERVAL = 30 * 1000; // 30 seconds
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Hook to manage user presence heartbeat
 * Sends periodic heartbeats to keep user status as online
 */
export function useHeartbeat() {
  const { isSignedIn } = useAuth();
  const sendHeartbeat = useMutation(api.presence.sendHeartbeat);
  const markOffline = useMutation(api.presence.markOffline);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sendHeartbeatWithRetry = async (retryCount = 0) => {
    if (!isSignedIn) return;

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

    // Send initial heartbeat
    sendHeartbeatWithRetry();

    // Set up interval for periodic heartbeats
    intervalRef.current = setInterval(() => {
      sendHeartbeatWithRetry();
    }, HEARTBEAT_INTERVAL);

    // Page Visibility API support
    const handleVisibilityChange = () => {
      if (!document.hidden && isSignedIn) {
        // Tab became visible, send immediate heartbeat
        sendHeartbeatWithRetry();
      }
    };

    // Mark offline when tab is closed or navigating away
    const handleBeforeUnload = () => {
      if (isSignedIn) {
        // Use sendBeacon for reliable delivery during unload
        markOffline().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

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
    };
  }, [isSignedIn, sendHeartbeat, markOffline]);
}