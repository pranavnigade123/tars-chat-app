"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useHeartbeat } from "@/lib/hooks/useHeartbeat";

interface HeartbeatProviderProps {
  children: React.ReactNode;
}

export function HeartbeatProvider({ children }: HeartbeatProviderProps) {
  const { isSignedIn } = useAuth();
  useHeartbeat();
  
  // Clear all drafts on logout
  useEffect(() => {
    if (!isSignedIn) {
      // User logged out, clear all draft messages
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('draft_') || key.startsWith('draft_timestamp_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }, [isSignedIn]);
  
  return <>{children}</>;
}