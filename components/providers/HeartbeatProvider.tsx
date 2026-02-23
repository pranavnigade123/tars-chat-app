"use client";

import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useHeartbeat } from "@/lib/hooks/useHeartbeat";

interface HeartbeatProviderProps {
  children: React.ReactNode;
}

export function HeartbeatProvider({ children }: HeartbeatProviderProps) {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const syncUser = useMutation(api.users.syncUser);
  useHeartbeat();
  
  // Sync user to Convex on mount (fallback if webhook fails)
  useEffect(() => {
    if (isSignedIn && user) {
      syncUser({
        clerkId: user.id,
        name: user.fullName || user.primaryEmailAddress?.emailAddress || "Anonymous User",
        email: user.primaryEmailAddress?.emailAddress || "",
        profileImage: user.imageUrl,
      }).catch((err) => {
        console.error("Failed to sync user:", err);
      });
    }
  }, [isSignedIn, user, syncUser]);
  
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