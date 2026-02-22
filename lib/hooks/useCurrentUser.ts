"use client";

import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function useCurrentUser() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const convexUser = useQuery(api.users.getCurrentUser);
  const syncUser = useMutation(api.users.syncUser);

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

  return {
    clerkUser,
    convexUser,
    isLoading: !isClerkLoaded || convexUser === undefined,
  };
}
