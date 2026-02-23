"use client";

import { useEffect, useRef, Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect, useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConversationListHeader } from "@/components/features/navigation/ConversationListHeader";
import { ChatHeader } from "@/components/features/navigation/ChatHeader";
import { ConversationList } from "@/components/features/messaging/ConversationList";
import { MessageBubble } from "@/components/features/messaging/MessageBubble";
import { MessageInputRedesigned } from "@/components/features/messaging/MessageInputRedesigned";
import { NewMessagesButton } from "@/components/features/messaging/NewMessagesButton";
import { NoMessagesEmpty } from "@/components/features/empty-states";
import { Skeleton } from "@/components/ui/skeleton";
import { useAutoScroll } from "@/lib/hooks/useAutoScroll";
import { useMessageVisibility } from "@/lib/hooks/useMessageVisibility";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import { useCallback } from "react";

function MessagesPageContent() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams.get("conversationId") as Id<"conversations"> | null;
  const markMessagesAsRead = useMutation(api.messages.markMessagesAsRead);
  const markMessageAsRead = useMutation(api.messages.markMessageAsRead);
  const scrollToBottomRef = useRef<(() => void) | null>(null);

  // Fetch data
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

  // Bulk mark messages as read
  useEffect(() => {
    if (conversationId) {
      const timeoutId = setTimeout(() => {
        markMessagesAsRead({ conversationId })
          .catch((err) => console.error("Failed to mark messages as read:", err));
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [conversationId, markMessagesAsRead]);

  if (!isLoaded || !user) {
    return (
      <div className="flex h-dvh items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const handleBackToList = () => {
    router.push("/messages");
  };

  const handleMessageSent = () => {
    if (scrollToBottomRef.current) {
      scrollToBottomRef.current();
    }
  };

  // Mobile-first layout: Stack screens, show one at a time
  // Desktop: Side-by-side layout with proper structure
  return (
    <div className="flex h-dvh flex-col lg:flex-row bg-white overflow-hidden">
      {/* Conversation List Screen */}
      <div
        className={cn(
          "flex flex-col h-full lg:w-80 lg:border-r lg:border-gray-100 lg:shrink-0",
          conversationId ? "hidden lg:flex" : "flex"
        )}
      >
        <ConversationListHeader />
        <div className="flex-1 overflow-y-auto">
          <ConversationList selectedConversationId={conversationId} />
        </div>
      </div>

      {/* Chat Screen */}
      {conversationId && (
        <div className="flex flex-col h-full lg:flex-1">
          <ChatHeader
            name={conversation?.otherUser?.name || "Loading..."}
            profileImage={conversation?.otherUser?.profileImage}
            status={conversation?.otherUser?.statusText || ""}
            isOnline={conversation?.otherUser?.isOnline || false}
            onBack={handleBackToList}
          />

          {/* Messages - with proper mobile padding for fixed input */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-4 py-4 bg-white pb-[calc(env(safe-area-inset-bottom)+80px)] lg:pb-4 lg:max-w-4xl lg:mx-auto lg:w-full"
          >
            {messages === undefined ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={cn("flex gap-3", i % 2 === 0 ? "" : "flex-row-reverse")}>
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <Skeleton className="h-20 w-72 rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <NoMessagesEmpty
                otherParticipantName={conversation?.otherUser?.name || "this user"}
              />
            ) : (
              messages.map((message, index) => {
                const isCurrentUser = message.senderId === user.id;
                const prevMessage = index > 0 ? messages[index - 1] : null;
                const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
                
                const showAvatar = !nextMessage || nextMessage.senderId !== message.senderId;
                const showName = !prevMessage || prevMessage.senderId !== message.senderId;
                const isGroupedWithPrev = !!(prevMessage && prevMessage.senderId === message.senderId);
                const isGroupedWithNext = !!(nextMessage && nextMessage.senderId === message.senderId);

                const readBy = message.readBy || [];
                const isRead = isCurrentUser && readBy.length > 1;
                const isDelivered = isCurrentUser;
                const isUnread = !isCurrentUser && !readBy.includes(user.id);

                return (
                  <div
                    key={message._id}
                    ref={(el) => {
                      if (!isCurrentUser && el) {
                        observeMessage(el);
                      }
                    }}
                  >
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
                    />
                  </div>
                );
              })
            )}

            <NewMessagesButton
              show={showNewMessagesButton}
              onClick={() => scrollToBottom(true)}
            />
          </div>

          {/* Input - Fixed to bottom on mobile, static on desktop */}
          <div className="fixed bottom-0 left-0 right-0 lg:static lg:max-w-4xl lg:mx-auto lg:w-full bg-white pb-[env(safe-area-inset-bottom)]">
            <MessageInputRedesigned
              conversationId={conversationId}
              onMessageSent={handleMessageSent}
            />
          </div>
        </div>
      )}
    </div>
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
