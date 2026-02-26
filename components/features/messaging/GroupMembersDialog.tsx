"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { getInitials } from "@/lib/utils/getInitials";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

interface GroupMembersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: Id<"conversations">;
  groupName: string;
}

export function GroupMembersDialog({
  isOpen,
  onClose,
  conversationId,
  groupName,
}: GroupMembersDialogProps) {
  const members = useQuery(
    api.conversations.getGroupMembers,
    isOpen ? { conversationId } : "skip"
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            {groupName}
          </DialogTitle>
          <DialogDescription className="sr-only">
            View all members of this group
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1">
          {/* Member count */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {members ? `${members.length} members` : "Loading..."}
          </p>

          {/* Members list */}
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {members === undefined ? (
              // Loading skeleton
              <>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </>
            ) : members.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No members found
              </p>
            ) : (
              members.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#222222] transition-colors"
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.profileImage} alt={member.name} />
                      <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    {member.isOnline && (
                      <div
                        className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-[#1a1a1a]"
                        aria-label="Online"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        member.isCurrentUser
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-900 dark:text-gray-100"
                      )}
                    >
                      {member.name}
                      {member.isCurrentUser && (
                        <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                          (You)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {member.isOnline ? "Active now" : "Offline"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
