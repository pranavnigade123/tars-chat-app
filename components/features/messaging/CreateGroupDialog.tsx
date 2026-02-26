"use client";

import { useState, useMemo } from "react";
import { Users, Search, ArrowRight, ArrowLeft } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [step, setStep] = useState<1 | 2>(1);
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

  const handleNext = () => {
    if (selectedUsers.size >= 2) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
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
      setStep(1);
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

  const handleClose = () => {
    setStep(1);
    setGroupName("");
    setSelectedUsers(new Set());
    setSearchQuery("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-[380px] max-h-[70vh] flex flex-col p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {step === 1 ? (
          <>
            {/* Step 1: Select Members */}
            <DialogHeader className="px-5 pt-5 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <DialogTitle className="text-lg">Select Members</DialogTitle>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-hidden px-5 space-y-3">
              {/* Search Users */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-users"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="pl-9"
                />
              </div>

              {/* User List */}
              <div className="h-[320px] overflow-y-auto pr-3 -mr-3">
                <div className="space-y-1.5">
                  {filteredUsers.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => handleToggleUser(user.clerkId)}
                      className={cn(
                        "w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left border-2",
                        selectedUsers.has(user.clerkId)
                          ? "bg-blue-50 dark:bg-blue-950/20 border-blue-500 dark:border-blue-400"
                          : "hover:bg-accent border-transparent"
                      )}
                    >
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarImage src={user.profileImage} alt={user.name} />
                        <AvatarFallback className="text-xs">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">
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
              </div>
            </div>

            <DialogFooter className="px-5 py-3 border-t">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                onClick={handleNext}
                disabled={selectedUsers.size < 2}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            {/* Step 2: Enter Group Name */}
            <DialogHeader className="px-5 pt-5 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <DialogTitle className="text-lg">Name Your Group</DialogTitle>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-hidden px-5 space-y-4">
              {/* Group Name Input */}
              <div className="space-y-2">
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name..."
                  autoFocus
                />
              </div>

              {/* Selected Members Summary */}
              <div className="space-y-2">
                <Label>Members ({selectedUsers.size})</Label>
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedUsers).slice(0, 5).map((userId) => {
                    const user = users?.find(u => u.clerkId === userId);
                    return user ? (
                      <Badge key={userId} variant="secondary" className="text-xs">
                        {user.name}
                      </Badge>
                    ) : null;
                  })}
                  {selectedUsers.size > 5 && (
                    <Badge variant="secondary" className="text-xs">
                      +{selectedUsers.size - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="px-5 py-3 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 sm:flex-none"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || isCreating}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isCreating ? "Creating..." : "Create Group"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
