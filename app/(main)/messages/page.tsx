"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect, useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/features/navigation/AppHeader";
import { ConversationSidebar } from "@/components/features/messaging/ConversationSidebar";
import { MessageFeed } from "@/components/features/messaging/MessageFeed";
import { MessageInput } from "@/components/features/messaging/MessageInput";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

export default function MessagesPage() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const conversationIdFromUrl = searchParams.get("conversationId");
  
  const [selectedConversationId, setSelectedConversationId] = useState<Id<"conversations"> | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Set conversation from URL parameter
  useEffect(() => {
    if (conversationIdFromUrl) {
      setSelectedConversationId(conversationIdFromUrl as Id<"conversations">);
      setShowMobileChat(true);
    }
  }, [conversationIdFromUrl]);

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

  const handleSelectConversation = (id: Id<"conversations">) => {
    setSelectedConversationId(id);
    setShowMobileChat(true);
  };

  const handleBackToSidebar = () => {
    setShowMobileChat(false);
  };

  return (
    <div className="flex h-screen flex-col">
      <AppHeader />
      
      <div className="flex flex-1 overflow-hidden">
        <aside className={cn(
          "w-full lg:w-80 xl:w-96 flex flex-col border-r bg-white",
          showMobileChat && "hidden lg:flex"
        )}>
          <ConversationSidebar
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
          />
        </aside>

        <main className={cn(
          "flex-1 flex flex-col",
          !showMobileChat && "hidden lg:flex",
          showMobileChat && "flex"
        )}>
          {selectedConversationId ? (
            <>
              <div className="lg:hidden flex items-center gap-3 border-b bg-white px-4 py-3">
                <button
                  onClick={handleBackToSidebar}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <h2 className="font-medium text-gray-900">Chat</h2>
              </div>
              
              <MessageFeed
                conversationId={selectedConversationId}
                currentUserId={user.id}
              />
              <MessageInput conversationId={selectedConversationId} />
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
