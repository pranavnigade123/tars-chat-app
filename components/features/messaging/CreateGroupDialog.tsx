"use client";

import { useState, useMemo } from "react";
import { Users, Search } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils/getInitials";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/lib/hooks/useDebounce";

interface CreateGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (conversationId: string) => void;
}

export function CreateGroupDialog({ isOpen, onClose, onGroupCreated }: CreateGroupDialogProps) {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  const users = useQuery(api.users.getAllUsers);
  const createGroup = useMutation(api.conversations.createGroupConversation);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter users by search query
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!debouncedSearchQuery.trim()) return users;
    
    const query = debouncedSearchQuery.toLowerCase().trim();
    return users.filter((user) => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }, [users, debouncedSearchQuery]);

  const handleToggleUser = (userId: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.size < 2) return;
    
    setIsCreating(true);
    try {
      const conversationId = await createGroup({
        participantIds: Array.from(selectedUsers),
        groupName: groupName.trim(),
      });
      
      onGroupCreated(conversationId);
      
      // Reset form
      setGroupName("");
      setSelectedUsers(new Set());
      setSearchQuery("");
      onClose();
    } catch (error) {
      console.error("Failed to create group:", error);
      alert("Failed to create group. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-xl">Create Group</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-6 space-y-4">
          {/* Group Name Input */}
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
              className="text-base"
            />
          </div>

          {/* Selected Users Count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Selected: {selectedUsers.size} {selectedUsers.size === 1 ? 'member' : 'members'}
              </span>
              {selectedUsers.size > 0 && selectedUsers.size < 2 && (
                <Badge variant="destructive" className="text-xs">
                  Min 2 required
                </Badge>
              )}
            </div>
          </div>

          {/* Search Users */}
          <div className="space-y-2">
            <Label htmlFor="search-users">Add Members</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-users"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="pl-9 text-base"
              />
            </div>
          </div>

          {/* User List */}
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleToggleUser(user.clerkId)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left border-2",
                    selectedUsers.has(user.clerkId)
                      ? "bg-blue-50 dark:bg-blue-950/20 border-blue-500 dark:border-blue-400"
                      : "hover:bg-accent border-transparent"
                  )}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={user.profileImage} alt={user.name} />
                    <AvatarFallback className="text-sm">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  {selectedUsers.has(user.clerkId) && (
                    <div className="h-5 w-5 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedUsers.size < 2 || isCreating}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isCreating ? "Creating..." : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
