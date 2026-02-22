"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils/getInitials";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfileProps {
  showOnlineStatus?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export function UserProfile({
  showOnlineStatus = false,
  size = "md",
}: UserProfileProps) {
  const { user: clerkUser } = useUser();
  const convexUser = useQuery(api.users.getCurrentUser);

  // Handle loading state
  if (!clerkUser || convexUser === undefined) {
    return <UserProfileSkeleton size={size} />;
  }

  // Handle error state
  if (convexUser === null) {
    return <UserProfileError />;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={convexUser.profileImage} alt={convexUser.name} />
          <AvatarFallback>{getInitials(convexUser.name)}</AvatarFallback>
        </Avatar>
        {showOnlineStatus && convexUser.onlineStatus && (
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
        )}
      </div>
      <div className="flex flex-col">
        <p className="text-sm font-medium">{convexUser.name}</p>
        {showOnlineStatus && (
          <p className="text-xs text-gray-500">
            {convexUser.onlineStatus ? "Online" : "Offline"}
          </p>
        )}
      </div>
    </div>
  );
}

function UserProfileSkeleton({ size }: { size: "sm" | "md" | "lg" }) {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className={`rounded-full ${sizeClasses[size]}`} />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

function UserProfileError() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
        <span className="text-sm text-red-600">!</span>
      </div>
      <div>
        <p className="text-sm font-medium text-red-600">Error loading profile</p>
        <button
          onClick={() => window.location.reload()}
          className="text-xs text-red-500 hover:underline"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
