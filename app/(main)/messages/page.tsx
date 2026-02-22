"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ConversationSidebar } from "@/components/features/messaging/ConversationSidebar";
import { MessageFeed } from "@/components/features/messaging/MessageFeed";
import { MessageInput } from "@/components/features/messaging/MessageInput";
import type { Id } from "@/convex/_generated/dataModel";

export default function MessagesPage() {
  const { user, isLoaded } = useUser();
  const [selectedConversationId, setSelectedConversationId] = useState<Id<"conversations"> | null>(null);

  // Redirect if not authenticated
  if (isLoaded && !user) {
    redirect("/sign-in");
  }

  if (!isLoaded || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Conversation Sidebar - responsive */}
      <aside className="w-full lg:w-80 xl:w-96">
        <ConversationSidebar
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
        />
      </aside>

      {/* Message Area */}
      <main className="hidden lg:flex flex-1 flex-col">
        {selectedConversationId ? (
          <>
            <MessageFeed
              conversationId={selectedConversationId}
              currentUserId={user.id}
            />
            <MessageInput conversationId={selectedConversationId} />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <p className="text-lg">Select a conversation to start messaging</p>
              <p className="mt-2 text-sm">Choose a conversation from the sidebar</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
