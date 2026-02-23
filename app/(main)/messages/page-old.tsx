"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect, useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppHeader } from "@/components/features/navigation/AppHeader";
import { ConversationSidebar } from "@/components/features/messaging/ConversationSidebar";
import { MessageFeed } from "@/components/features/messaging/MessageFeed";
import { MessageInput } from "@/components/features/messaging/MessageInput";
import { TypingIndicator } from "@/components/features/messaging/TypingIndicator";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

export default function MessagesPage() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams.get("conversationId") as Id<"conversations"> | null;
  const markMessagesAsRead = useMutation(api.messages.markMessagesAsRead);
  const scrollToBottomRef = useRef<(() => void) | null>(null);

  // Handle redirect after all hooks
  useEffect(() => {
    if (isLoaded && !user) {
      redirect("/sign-in");
    }
  }, [isLoaded, user]);

  // Bulk mark messages as read when conversation opens
  useEffect(() => {
    if (conversationId) {
      // Delay to ensure user has actually seen the conversation
      const timeoutId = setTimeout(() => {
        markMessagesAsRead({ conversationId })
          .catch((err) => console.error("Failed to mark messages as read:", err));
      }, 1000); // 1 second delay

      return () => clearTimeout(timeoutId);
    }
  }, [conversationId, markMessagesAsRead]);

  if (!isLoaded || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const handleBackToSidebar = () => {
    router.push("/messages");
  };

  const handleMessageSent = () => {
    // Scroll to bottom when user sends a message
    if (scrollToBottomRef.current) {
      scrollToBottomRef.current();
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <AppHeader />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - slides in/out on mobile using transform */}
        <aside 
          className={cn(
            "w-full lg:w-80 xl:w-96 flex flex-col border-r bg-white absolute lg:relative h-full z-10 lg:z-0 transition-transform duration-300",
            conversationId ? "-translate-x-full lg:translate-x-0" : "translate-x-0"
          )}
          role="complementary"
          aria-label="Conversations sidebar"
        >
          <ConversationSidebar
            selectedConversationId={conversationId}
          />
        </aside>

        {/* Main chat area - always rendered, slides in/out on mobile */}
        <main 
          className={cn(
            "flex-1 flex flex-col absolute lg:relative h-full w-full lg:w-auto transition-transform duration-300",
            conversationId ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          )}
          role="main"
          aria-label="Chat area"
        >
          {conversationId ? (
            <>
              <div className="lg:hidden flex items-center gap-3 border-b bg-white px-4 py-3">
                <button
                  onClick={handleBackToSidebar}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <h2 className="font-medium text-gray-900">Chat</h2>
              </div>
              
              <MessageFeed
                conversationId={conversationId}
                currentUserId={user.id}
                scrollToBottomRef={scrollToBottomRef}
              />
              <TypingIndicator conversationId={conversationId} />
              <MessageInput 
                conversationId={conversationId}
                onMessageSent={handleMessageSent}
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center bg-gray-50">
              <div className="text-center text-gray-500 px-4">
                <p className="text-lg">Select a conversation to start messaging</p>
                <p className="mt-2 text-sm">Choose a conversation from the sidebar</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
