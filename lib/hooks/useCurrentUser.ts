"use client";

import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function useCurrentUser() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const convexUser = useQuery(api.users.getCurrentUser);
  const syncUser = useMutation(api.users.syncUser);
  const updateStatus = useMutation(api.users.updateOnlineStatus);

  // Sync user on first load if needed
  useEffect(() => {
    if (isClerkLoaded && clerkUser && convexUser === null) {
      // User exists in Clerk but not in Convex - sync them
      syncUser({
        clerkId: clerkUser.id,
        name: clerkUser.fullName || clerkUser.emailAddresses[0]?.emailAddress || "Anonymous User",
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        profileImage: clerkUser.imageUrl,
      });
    }
  }, [isClerkLoaded, clerkUser, convexUser, syncUser]);

  // Update online status on mount - only once when user is first loaded
  useEffect(() => {
    if (convexUser) {
      updateStatus({ onlineStatus: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convexUser?._id]); // Only run when user ID changes

  // Update online status on unmount - only if user is authenticated
  useEffect(() => {
    return () => {
      // Only update status if we have a convex user (meaning we're authenticated)
      if (convexUser && clerkUser) {
        updateStatus({ onlineStatus: false }).catch(() => {
          // Ignore errors on unmount (user might have already signed out)
        });
      }
    };
  }, [convexUser, clerkUser, updateStatus]);

  return {
    clerkUser,
    convexUser,
    isLoading: !isClerkLoaded || convexUser === undefined,
  };
}
