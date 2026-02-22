"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ConversationSidebar } from "@/components/features/messaging/ConversationSidebar";
import { MessageFeed } from "@/components/features/messaging/MessageFeed";
import { MessageInput } from "@/components/features/messaging/MessageInput";
import { UserList } from "@/components/features/users/UserList";
import { MessageSquare, Users, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

export default function MessagesPage() {
  const { user, isLoaded } = useUser();
  const [selectedConversationId, setSelectedConversationId] = useState<Id<"conversations"> | null>(null);
  const [activeTab, setActiveTab] = useState<"conversations" | "users">("conversations");
  const [showMobileChat, setShowMobileChat] = useState(false);

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
    setActiveTab("conversations");
    setShowMobileChat(true);
  };

  const handleBackToSidebar = () => {
    setShowMobileChat(false);
  };

  return (
    <div className="flex h-screen">
      <aside className={cn(
        "w-full lg:w-80 xl:w-96 flex flex-col border-r bg-white",
        showMobileChat && "hidden lg:flex"
      )}>
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("conversations")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
              activeTab === "conversations"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            Chats
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
              activeTab === "users"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <Users className="h-4 w-4" />
            Users
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === "conversations" ? (
            <ConversationSidebar
              selectedConversationId={selectedConversationId}
              onSelectConversation={handleSelectConversation}
              onNewChat={() => setActiveTab("users")}
            />
          ) : (
            <UserList
              currentUserId={user.id}
              onConversationCreated={() => {
                setActiveTab("conversations");
                setShowMobileChat(true);
              }}
            />
          )}
        </div>
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
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
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
              <p className="mt-2 text-sm">
                {activeTab === "conversations" 
                  ? "Choose a conversation from the Chats tab"
                  : "Click on a user to start a new conversation"}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
