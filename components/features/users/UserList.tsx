"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { filterUsers, sortUsers } from "@/lib/utils/userFilters";
import { SearchBar } from "./SearchBar";
import { UserListItem } from "./UserListItem";
import { Skeleton } from "@/components/ui/skeleton";
import { NoSearchResultsEmpty } from "@/components/features/empty-states";

interface UserListProps {
  currentUserId: string;
}

export function UserList({ currentUserId }: UserListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const users = useQuery(api.users.getAllUsersExceptCurrentWithStatus, { currentUserId });
  const getOrCreateConversation = useMutation(api.conversations.getOrCreateConversation);

  const filteredAndSortedUsers = useMemo(() => {
    if (!users) return [];
    const filtered = filterUsers(users, debouncedSearchQuery);
    return sortUsers(filtered);
  }, [users, debouncedSearchQuery]);

  const handleUserSelect = async (userId: string) => {
    setSelectedUserId(userId);
    setIsCreatingConversation(true);

    try {
      const conversationId = await getOrCreateConversation({
        participantIds: [currentUserId, userId],
      });
      
      router.push(`/messages?conversationId=${conversationId}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      alert("Failed to start conversation. Please try again.");
    } finally {
      setIsCreatingConversation(false);
    }
  };

  if (users === undefined) {
    return (
      <div className="flex h-full flex-col">
        <div className="p-4">
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="flex-1">
                <Skeleton className="mb-2 h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users === null) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600">Failed to load users</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-gray-600">No other users found</p>
      </div>
    );
  }

  if (filteredAndSortedUsers.length === 0 && searchQuery) {
    return (
      <div className="flex h-full flex-col">
        <div className="p-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search people..."
          />
        </div>
        <div className="flex flex-1 items-center justify-center p-4">
          <NoSearchResultsEmpty
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery("")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search people..."
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {filteredAndSortedUsers.map((user, index) => (
          <UserListItem
            key={user._id}
            user={user}
            onClick={() => handleUserSelect(user.clerkId)}
            isSelected={selectedUserId === user.clerkId}
            index={index}
          />
        ))}
      </div>

      {isCreatingConversation && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="rounded-2xl bg-white px-6 py-4 shadow-lg">
            <p className="text-sm text-gray-600">Starting conversation...</p>
          </div>
        </div>
      )}
    </div>
  );
}
