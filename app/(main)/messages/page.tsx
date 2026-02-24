"use client";

import { useEffect, useRef, Suspense, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { redirect, useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConversationListHeader } from "@/components/features/navigation/ConversationListHeader";
import { ChatHeader } from "@/components/features/navigation/ChatHeader";
import { BottomNav } from "@/components/features/navigation/BottomNav";
import { ConversationList } from "@/components/features/messaging/ConversationList";
import { MessageBubble } from "@/components/features/messaging/MessageBubble";
import { MessageInputRedesigned } from "@/components/features/messaging/MessageInputRedesigned";
import { NewMessagesButton } from "@/components/features/messaging/NewMessagesButton";
import { TypingIndicator } from "@/components/features/messaging/TypingIndicator";
import { NoMessagesEmpty } from "@/components/features/empty-states";
import { Skeleton } from "@/components/ui/skeleton";
import { useAutoScroll } from "@/lib/hooks/useAutoScroll";
import { useMessageVisibility } from "@/lib/hooks/useMessageVisibility";
import { getDateLabel, isDifferentDay } from "@/lib/utils/timestamp";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { MessageSquare, Users, User } from "lucide-react";

function MessagesPageContent() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const conversationId = searchParams.get("conversationId") as Id<"conversations"> | null;
  const markMessagesAsRead = useMutation(api.messages.markMessagesAsRead);
  const markMessageAsRead = useMutation(api.messages.markMessageAsRead);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const toggleReaction = useMutation(api.messages.toggleReaction);
  const scrollToBottomRef = useRef<(() => void) | null>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<Id<"messages">>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [listKey, setListKey] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);

  // Fetch data
  const conversations = useQuery(api.conversations.getUserConversations);
  const messages = useQuery(
    api.messages.getMessages,
    conversationId ? { conversationId } : "skip"
  );
  const conversation = useQuery(
    api.conversations.getConversationById,
    conversationId ? { conversationId } : "skip"
  );

  // Auto-scroll hook
  const {
    scrollContainerRef,
    showNewMessagesButton,
    scrollToBottom,
  } = useAutoScroll(messages?.length ?? 0, {
    conversationId: conversationId,
  });

  // Expose scrollToBottom to parent via ref
  if (scrollToBottomRef) {
    scrollToBottomRef.current = () => scrollToBottom(true);
  }

  // Mark message as read when visible
  const handleMessageVisible = useCallback((messageId: Id<"messages">) => {
    markMessageAsRead({ messageId }).catch((err) => {
      console.error("Failed to mark message as read:", err);
    });
  }, [markMessageAsRead]);

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
      setListKey(prev => prev + 1);
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
        markMessagesAsRead({ conversationId })
          .catch((err) => console.error("Failed to mark messages as read:", err));
      }, 300); // Reduced from 1000ms to 300ms
      return () => clearTimeout(timeoutId);
    }
  }, [conversationId, messages?.length, markMessagesAsRead]);

  // All callbacks must be defined before early return
  const handleBackToList = useCallback(() => {
    router.push("/messages");
  }, [router]);

  const handleMessageSent = useCallback(() => {
    if (scrollToBottomRef.current) {
      scrollToBottomRef.current();
    }
  }, []);

  const handleToggleSelectMode = useCallback(() => {
    setIsSelectMode(!isSelectMode);
    setSelectedMessages(new Set());
  }, [isSelectMode]);

  const handleToggleMessageSelect = useCallback((messageId: Id<"messages">) => {
    setSelectedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  }, []);

  const handleBulkDelete = useCallback(async () => {
    if (selectedMessages.size === 0) return;
    setShowBulkDeleteDialog(true);
  }, [selectedMessages.size]);

  const confirmBulkDelete = useCallback(async () => {
    try {
      await Promise.all(
        Array.from(selectedMessages).map(messageId => 
          deleteMessage({ messageId })
        )
      );
      setSelectedMessages(new Set());
      setIsSelectMode(false);
      setShowBulkDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete messages:", error);
      alert("Failed to delete some messages. Please try again.");
    }
  }, [selectedMessages, deleteMessage]);

  // Early return AFTER all hooks
  if (!isLoaded || !user) {
    return (
      <div className="flex h-dvh items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Mobile-first layout: Stack screens, show one at a time
  // Desktop: Vertical sidebar nav + conversation list + chat
  return (
    <>
      <div className="flex h-dvh bg-white overflow-hidden">
        {/* Desktop Vertical Sidebar Navigation - Hidden on Mobile */}
        <div className="hidden lg:flex lg:flex-col lg:w-16 lg:border-r lg:border-gray-200 lg:bg-gray-50 lg:items-center lg:py-4 lg:gap-2">
          <Link
            href="/messages"
            className={cn(
              "flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors gap-1",
              pathname.startsWith("/messages")
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
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
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Users className="h-5 w-5" />
            <span className="text-[10px] font-medium">People</span>
          </Link>
          <Link
            href="/profile"
            className={cn(
              "flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors gap-1 mt-auto",
              pathname === "/profile"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <User className="h-5 w-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
          {/* Desktop: Always show conversation list */}
          <div className="hidden lg:flex lg:flex-col lg:h-full lg:w-80 lg:border-r lg:border-gray-100 lg:shrink-0">
            <ConversationListHeader />
            <div className="flex-1 overflow-y-auto">
              <ConversationList selectedConversationId={conversationId} />
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
                <ConversationListHeader />
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
                    <ConversationList key={listKey} selectedConversationId={conversationId} />
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
                className="flex flex-col h-full w-full lg:flex-1 lg:bg-gray-50 absolute inset-0 lg:relative bg-white"
              >
            <ChatHeader
              name={conversation?.otherUser?.name || "Loading..."}
              profileImage={conversation?.otherUser?.profileImage}
              status={conversation?.otherUser?.statusText || ""}
              isOnline={conversation?.otherUser?.isOnline || false}
              onBack={handleBackToList}
              onToggleSelectMode={handleToggleSelectMode}
              isSelectMode={isSelectMode}
              selectedCount={selectedMessages.size}
              onBulkDelete={handleBulkDelete}
            />

            {/* Messages - with proper mobile padding for fixed input */}
            <motion.div
              key={`messages-${conversationId}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto px-4 py-4 bg-white pb-[calc(env(safe-area-inset-bottom)+90px)] lg:pb-4"
            >
              {messages === undefined && showSkeleton ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={cn("flex gap-3", i % 2 === 0 ? "" : "flex-row-reverse")}>
                      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                      <Skeleton className="h-20 w-72 rounded-2xl" />
                    </div>
                  ))}
                </div>
              ) : messages === undefined ? (
                // Show nothing for first 400ms
                null
              ) : messages.length === 0 ? (
                <NoMessagesEmpty
                  otherParticipantName={conversation?.otherUser?.name || "this user"}
                />
              ) : (
                <div className="space-y-3">
                  {messages.map((message, index) => {
                    const isCurrentUser = message.senderId === user.id;
                    const prevMessage = index > 0 ? messages[index - 1] : null;
                    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
                    
                    // Check if we need to show a date separator
                    const showDateSeparator = !prevMessage || isDifferentDay(prevMessage.sentAt, message.sentAt);
                    
                    const showAvatar = !nextMessage || nextMessage.senderId !== message.senderId;
                    const showName = !prevMessage || prevMessage.senderId !== message.senderId;
                    const isGroupedWithPrev = !!(prevMessage && prevMessage.senderId === message.senderId);
                    const isGroupedWithNext = !!(nextMessage && nextMessage.senderId === message.senderId);

                    const readBy = message.readBy || [];
                    const isRead = isCurrentUser && readBy.length > 1;
                    const isDelivered = isCurrentUser;
                    const isUnread = !isCurrentUser && !readBy.includes(user.id);

                    const handleDelete = async () => {
                      try {
                        await deleteMessage({ messageId: message._id });
                      } catch (error) {
                        console.error("Failed to delete message:", error);
                        alert("Failed to delete message. Please try again.");
                      }
                    };

                    const handleReaction = async (emoji: string) => {
                      try {
                        await toggleReaction({ messageId: message._id, emoji });
                      } catch (error) {
                        console.error("Failed to toggle reaction:", error);
                      }
                    };

                    return (
                      <div key={message._id}>
                        {/* Date Separator */}
                        {showDateSeparator && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="flex items-center justify-center my-4"
                          >
                            <div className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                              {getDateLabel(message.sentAt)}
                            </div>
                          </motion.div>
                        )}
                        
                        {/* Message Bubble */}
                        <div
                          ref={(el) => {
                            if (!isCurrentUser && el) {
                              observeMessage(el);
                            }
                          }}
                          className={cn(
                            "flex items-center gap-3",
                            isSelectMode && isCurrentUser && "cursor-pointer"
                          )}
                          onClick={() => {
                            if (isSelectMode && isCurrentUser && !message.isDeleted) {
                              handleToggleMessageSelect(message._id);
                            }
                          }}
                        >
                          {/* Checkbox for multi-select mode */}
                          {isSelectMode && isCurrentUser && !message.isDeleted && (
                            <div 
                              className={cn(
                                "w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0",
                                selectedMessages.has(message._id)
                                  ? "bg-blue-600 border-blue-600"
                                  : "border-gray-300 bg-white"
                              )}
                            >
                              {selectedMessages.has(message._id) && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          )}
                          
                          <MessageBubble
                            messageId={message._id}
                            content={message.content}
                            sentAt={message.sentAt}
                            isCurrentUser={isCurrentUser}
                            senderName={message.sender?.name}
                            senderImage={message.sender?.profileImage}
                            showAvatar={showAvatar}
                            showName={showName}
                            isGroupedWithPrev={isGroupedWithPrev}
                            isGroupedWithNext={isGroupedWithNext}
                            isRead={isRead}
                            isDelivered={isDelivered}
                            isUnread={isUnread}
                            isDeleted={message.isDeleted}
                            onDelete={handleDelete}
                            isSelectMode={isSelectMode}
                            reactions={message.reactions || []}
                            onReaction={handleReaction}
                            currentUserId={user.id}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <NewMessagesButton
                show={showNewMessagesButton}
                onClick={() => scrollToBottom(true)}
              />
            </motion.div>

            {/* Typing Indicator - Fixed position above input */}
            <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+68px)] left-0 right-0 lg:bottom-[68px] pointer-events-none z-10">
              <TypingIndicator conversationId={conversationId} />
            </div>

            {/* Input - Fixed to bottom on mobile, static on desktop */}
            <div className="fixed bottom-0 left-0 right-0 lg:static lg:bottom-0 bg-white pb-[env(safe-area-inset-bottom)]">
              <MessageInputRedesigned
                conversationId={conversationId}
                onMessageSent={handleMessageSent}
              />
            </div>
          </motion.div>
            ) : null}
          </AnimatePresence>
          
          {/* Desktop: Empty state when no chat selected */}
          {!conversationId && (
            <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:bg-gray-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center p-8"
              >
                <div className="mb-4">
                  <div className="inline-block rounded-2xl bg-white p-6 shadow-sm">
                    <MessageSquare className="h-12 w-12 text-gray-300" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  Choose a conversation from the list to start messaging
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation - Mobile Only - Hidden when in chat */}
      {!conversationId && <BottomNav />}
      
      {/* Bulk Delete Dialog */}
      {showBulkDeleteDialog && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px]"
            onClick={() => setShowBulkDeleteDialog(false)}
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 w-[280px] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-gray-800 mb-4 font-medium">
              Delete {selectedMessages.size} message{selectedMessages.size > 1 ? 's' : ''}?
            </p>
            <div className="flex gap-2">
              <button
                onClick={confirmBulkDelete}
                className="flex-1 bg-red-500 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-red-600 active:scale-95 transition-all font-medium shadow-sm"
              >
                Delete
              </button>
              <button
                onClick={() => setShowBulkDeleteDialog(false)}
                className="flex-1 bg-gray-100 text-gray-700 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-200 active:scale-95 transition-all font-medium"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </>
  );
}


export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-dvh items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    }>
      <MessagesPageContent />
    </Suspense>
  );
}
