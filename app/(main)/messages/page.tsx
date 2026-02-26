"use client";

import { useEffect, Suspense, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { redirect, useSearchParams, usePathname } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConversationListHeader } from "@/components/features/navigation/ConversationListHeader";
import { ChatHeader } from "@/components/features/navigation/ChatHeader";
import { BottomNav } from "@/components/features/navigation/BottomNav";
import { ThemeToggle } from "@/components/features/navigation/ThemeToggle";
import { ConversationList } from "@/components/features/messaging/ConversationList";
import { MessageList } from "@/components/features/messaging/MessageList";
import { MessageInputRedesigned } from "@/components/features/messaging/MessageInputRedesigned";
import { TypingIndicator } from "@/components/features/messaging/TypingIndicator";
import { CreateGroupDialog } from "@/components/features/messaging/CreateGroupDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useMessageVisibility } from "@/lib/hooks/useMessageVisibility";
import { useConversationData } from "@/lib/hooks/useConversationData";
import { useMessageSelection } from "@/lib/hooks/useMessageSelection";
import { useConversationNavigation } from "@/lib/hooks/useConversationNavigation";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { MessageSquare, Users, User } from "lucide-react";

function MessagesPageContent() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const conversationId = searchParams.get("conversationId") as Id<"conversations"> | null;

  // Custom hooks for data and logic
  const { conversations, messages, conversation } = useConversationData(
    conversationId,
    isLoaded && !!user
  );
  const {
    isSelectMode,
    selectedMessages,
    showBulkDeleteDialog,
    toggleSelectMode,
    toggleMessageSelect,
    openBulkDeleteDialog,
    confirmBulkDelete,
    closeBulkDeleteDialog,
  } = useMessageSelection();
  const { navigateToConversation, navigateToList } = useConversationNavigation();

  // Mutations
  const markMessagesAsRead = useMutation(api.messages.markMessagesAsRead);
  const markMessageAsRead = useMutation(api.messages.markMessageAsRead);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const toggleReaction = useMutation(api.messages.toggleReaction);

  // Local state
  const [listKey, setListKey] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);

  // Scroll container ref for manual scroll control
  const scrollContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (node && conversationId) {
      // Scroll to bottom on mount or conversation change
      requestAnimationFrame(() => {
        node.scrollTop = node.scrollHeight;
      });
    }
  }, [conversationId]);

  // Mark message as read when visible
  const handleMessageVisible = useCallback(
    (messageId: Id<"messages">) => {
      markMessageAsRead({ messageId }).catch((err) => {
        console.error("Failed to mark message as read:", err);
      });
    },
    [markMessageAsRead]
  );

  const { observeMessage } = useMessageVisibility({
    onMessageVisible: handleMessageVisible,
    threshold: 0.5,
  });

  // Handle redirect
  useEffect(() => {
    if (isLoaded && !user) {
      redirect("/sign-in");
    }
  }, [isLoaded, user]);

  // Trigger list animation when returning to conversation list
  useEffect(() => {
    if (!conversationId) {
      setListKey((prev) => prev + 1);
    }
  }, [conversationId]);

  // Delay skeleton display - only show after 400ms
  useEffect(() => {
    if (messages === undefined) {
      const timer = setTimeout(() => setShowSkeleton(true), 400);
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(false);
    }
  }, [messages]);

  // Bulk mark messages as read when conversation opens or new messages arrive
  useEffect(() => {
    if (conversationId && messages) {
      const timeoutId = setTimeout(() => {
        markMessagesAsRead({ conversationId }).catch((err) =>
          console.error("Failed to mark messages as read:", err)
        );
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [conversationId, messages?.length, markMessagesAsRead]);

  // Callbacks
  const handleGroupCreated = useCallback(
    (newConversationId: string) => {
      navigateToConversation(newConversationId);
    },
    [navigateToConversation]
  );

  const handleDeleteMessage = useCallback(
    async (messageId: Id<"messages">) => {
      await deleteMessage({ messageId });
    },
    [deleteMessage]
  );

  const handleReaction = useCallback(
    async (messageId: Id<"messages">, emoji: string) => {
      await toggleReaction({ messageId, emoji });
    },
    [toggleReaction]
  );

  // Early return AFTER all hooks
  if (!isLoaded || !user) {
    return (
      <div className="flex h-dvh items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Get conversation name for empty state
  const conversationName = conversation?.isGroup
    ? conversation.groupName || "this group"
    : (conversation as any)?.otherUser?.name || "this user";

  // Mobile-first layout: Stack screens, show one at a time
  // Desktop: Vertical sidebar nav + conversation list + chat
  return (
    <>
      <div className="flex h-dvh bg-white dark:bg-[#1a1a1a] overflow-hidden">
        {/* Desktop Vertical Sidebar Navigation - Hidden on Mobile */}
        <div className="hidden lg:flex lg:flex-col lg:w-16 lg:border-r lg:border-gray-200 dark:lg:border-[#2d2d2d] lg:bg-gray-50 dark:lg:bg-[#1e1e1e] lg:items-center lg:py-4 lg:gap-2">
          <Link
            href="/messages"
            className={cn(
              "flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors gap-1",
              pathname.startsWith("/messages")
                ? "bg-blue-100 dark:bg-[#2a2a2a] text-blue-600 dark:text-gray-200"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
            )}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-[10px] font-medium">Chats</span>
          </Link>
          <Link
            href="/users"
            className={cn(
              "flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors gap-1",
              pathname === "/users"
                ? "bg-blue-100 dark:bg-[#2a2a2a] text-blue-600 dark:text-gray-200"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
            )}
          >
            <Users className="h-5 w-5" />
            <span className="text-[10px] font-medium">People</span>
          </Link>

          {/* Theme Toggle below Chats and People */}
          <ThemeToggle />

          <Link
            href="/profile"
            className={cn(
              "flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors gap-1 mt-auto",
              pathname === "/profile"
                ? "bg-blue-100 dark:bg-[#2a2a2a] text-blue-600 dark:text-gray-200"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
            )}
          >
            <User className="h-5 w-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
          {/* Desktop: Always show conversation list */}
          <div className="hidden lg:flex lg:flex-col lg:h-full lg:w-80 lg:border-r lg:border-gray-100 dark:lg:border-[#2d2d2d] lg:shrink-0">
            <ConversationListHeader onCreateGroup={() => setShowCreateGroupDialog(true)} />
            <div className="flex-1 overflow-y-auto">
              <ConversationList
                selectedConversationId={conversationId}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
          </div>

          {/* Mobile: Animated screens */}
          <AnimatePresence mode="wait" initial={true}>
            {!conversationId ? (
              <motion.div
                key="conversation-list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
                className="flex flex-col h-full w-full absolute inset-0 lg:hidden"
              >
                <ConversationListHeader onCreateGroup={() => setShowCreateGroupDialog(true)} />
                <div className="flex-1 overflow-y-auto pb-20">
                  {conversations === undefined ? (
                    <div className="flex flex-col">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-4 py-4">
                          <Skeleton className="h-14 w-14 rounded-full shrink-0" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ConversationList
                      key={listKey}
                      selectedConversationId={conversationId}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                    />
                  )}
                </div>
              </motion.div>
            ) : conversationId ? (
              <motion.div
                key={conversationId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{
                  type: "spring",
                  stiffness: 600,
                  damping: 35,
                }}
                className="flex flex-col h-full w-full lg:flex-1 lg:bg-gray-50 dark:lg:bg-[#1a1a1a] absolute inset-0 lg:relative bg-white dark:bg-[#1a1a1a]"
              >
                <ChatHeader
                  name={
                    conversation?.isGroup
                      ? conversation.groupName || "Group"
                      : (conversation as any)?.otherUser?.name || "Loading..."
                  }
                  profileImage={
                    conversation?.isGroup ? undefined : (conversation as any)?.otherUser?.profileImage
                  }
                  status={
                    conversation?.isGroup ? "" : (conversation as any)?.otherUser?.statusText || ""
                  }
                  isOnline={
                    conversation?.isGroup ? false : (conversation as any)?.otherUser?.isOnline || false
                  }
                  isGroup={conversation?.isGroup || false}
                  memberCount={(conversation as any)?.memberCount || 0}
                  onBack={navigateToList}
                  onToggleSelectMode={toggleSelectMode}
                  isSelectMode={isSelectMode}
                  selectedCount={selectedMessages.size}
                  onBulkDelete={openBulkDeleteDialog}
                />

                {/* Messages - with proper mobile padding for fixed input */}
                <motion.div
                  key={`messages-${conversationId}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  ref={scrollContainerRef}
                  className="flex-1 overflow-y-auto px-4 py-4 bg-white dark:bg-[#1a1a1a] pb-[calc(env(safe-area-inset-bottom)+100px)] lg:pb-6 flex flex-col"
                  style={{
                    overflowAnchor: "none",
                  }}
                >
                  <MessageList
                    messages={messages}
                    currentUserId={user.id}
                    isGroup={conversation?.isGroup || false}
                    isSelectMode={isSelectMode}
                    selectedMessages={selectedMessages}
                    showSkeleton={showSkeleton}
                    conversationName={conversationName}
                    onMessageVisible={observeMessage}
                    onToggleMessageSelect={toggleMessageSelect}
                    onDeleteMessage={handleDeleteMessage}
                    onReaction={handleReaction}
                  />
                </motion.div>

                {/* Typing Indicator - In the space between messages and input */}
                <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+90px)] left-0 right-0 lg:bottom-[100px] pointer-events-none z-10">
                  <TypingIndicator conversationId={conversationId} />
                </div>

                {/* Input - Fixed to bottom on mobile, static on desktop */}
                <div className="fixed bottom-0 left-0 right-0 lg:static lg:bottom-0 bg-white dark:bg-[#1a1a1a] pb-[env(safe-area-inset-bottom)]">
                  <MessageInputRedesigned conversationId={conversationId} onMessageSent={() => {}} />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Desktop: Empty state when no chat selected */}
          {!conversationId && (
            <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:bg-gray-50 dark:lg:bg-[#1a1a1a]">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center p-8"
              >
                <div className="mb-4">
                  <div className="inline-block rounded-2xl bg-white dark:bg-[#242424] p-6 shadow-sm">
                    <MessageSquare
                      className="h-12 w-12 text-gray-300 dark:text-gray-600"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Select a conversation
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                  Choose a conversation from the list to start messaging
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation - Mobile Only - Hidden when in chat */}
      {!conversationId && <BottomNav />}

      {/* Create Group Dialog */}
      <CreateGroupDialog
        isOpen={showCreateGroupDialog}
        onClose={() => setShowCreateGroupDialog(false)}
        onGroupCreated={handleGroupCreated}
      />

      {/* Bulk Delete Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={closeBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Messages</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedMessages.size} message
              {selectedMessages.size > 1 ? "s" : ""}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      }
    >
      <MessagesPageContent />
    </Suspense>
  );
}
