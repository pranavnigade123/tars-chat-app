"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { filterUsers, sortUsers } from "@/lib/utils/userFilters";
import { SearchBar } from "./SearchBar";
import { UserListItem } from "./UserListItem";
import { Skeleton } from "@/components/ui/skeleton";

interface UserListProps {
  currentUserId: string;
}

export function UserList({ currentUserId }: UserListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  // Debounce search query to avoid excessive filtering
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch all users except current user
  const users = useQuery(api.users.getAllUsersExceptCurrent, {
    currentUserId,
  });

  // Mutation to create or get conversation
  const getOrCreateConversation = useMutation(api.conversations.getOrCreateConversation);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    if (!users) return [];
    const filtered = filterUsers(users, debouncedSearchQuery);
    return sortUsers(filtered);
  }, [users, debouncedSearchQuery]);

  // Handle user selection
  const handleUserSelect = async (userId: string) => {
    setSelectedUserId(userId);
    setIsCreatingConversation(true);

    try {
      const conversationId = await getOrCreateConversation({
        participantIds: [currentUserId, userId],
      });
      
      // TODO: Navigate to conversation page when implemented
      console.log("Conversation created/retrieved:", conversationId);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      // TODO: Show error toast
    } finally {
      setIsCreatingConversation(false);
    }
  };

  // Loading state
  if (users === undefined) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b bg-white p-4">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="mb-3 flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
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

  // Error state
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

  // Empty state
  if (users.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-gray-600">No other users found</p>
      </div>
    );
  }

  // No search results
  if (filteredAndSortedUsers.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b bg-white p-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search users..."
          />
        </div>
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-gray-600">No users match your search</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search bar */}
      <div className="border-b bg-white p-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search users..."
        />
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredAndSortedUsers.map((user) => (
          <UserListItem
            key={user._id}
            user={user}
            onClick={() => handleUserSelect(user.clerkId)}
            isSelected={selectedUserId === user.clerkId}
          />
        ))}
      </div>

      {/* Loading overlay */}
      {isCreatingConversation && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
          <div className="rounded-lg bg-white p-4 shadow-lg">
            <p className="text-sm text-gray-600">Starting conversation...</p>
          </div>
        </div>
      )}
    </div>
  );
}
