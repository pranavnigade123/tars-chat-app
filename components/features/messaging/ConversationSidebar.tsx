"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils/getInitials";
import { formatTimestamp } from "@/lib/utils/formatTimestamp";
import { truncateMessage } from "@/lib/utils/truncateMessage";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";
import { NoConversationsEmpty } from "@/components/features/empty-states";
import { TypingIndicator } from "./TypingIndicator";

interface ConversationSidebarProps {
  selectedConversationId: Id<"conversations"> | null;
  onSelectConversation: (conversationId: Id<"conversations">) => void;
}

interface ConversationItemProps {
  conversation: {
    _id: Id<"conversations">;
    otherUser: {
      name: string;
      profileImage: string;
      clerkId: string;
      isOnline: boolean;
    };
    latestMessage?: {
      content: string;
      sentAt: number;
    };
  };
  isSelected: boolean;
  onSelect: () => void;
}

function ConversationItem({ conversation, isSelected, onSelect }: ConversationItemProps) {
  const typingUsers = useQuery(api.typingStates.getTypingState, {
    conversationId: conversation._id,
  });
  
  const unreadCount = useQuery(api.messages.getUnreadCount, {
    conversationId: conversation._id,
  });

  const isTyping = typingUsers && typingUsers.length > 0;
  const isOnline = conversation.otherUser.isOnline;
  const hasUnread = unreadCount && unreadCount > 0;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 p-3 transition-all duration-200 text-left relative group",
        isSelected 
          ? "bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500" 
          : hasUnread
          ? "bg-blue-50/30 hover:bg-blue-50/50 border-l-4 border-transparent"
          : "hover:bg-gray-50 border-l-4 border-transparent"
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
          <AvatarImage
            src={conversation.otherUser.profileImage}
            alt={conversation.otherUser.name}
          />
          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-medium">
            {getInitials(conversation.otherUser.name)}
          </AvatarFallback>
        </Avatar>
        {/* Online status indicator */}
        {isOnline && (
          <div 
            className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"
            title="Online"
          />
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <p className={cn(
            "font-semibold truncate transition-colors",
            isSelected ? "text-blue-900" : "text-gray-900"
          )}>
            {conversation.otherUser.name}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            {conversation.latestMessage && !isTyping && (
              <span className={cn(
                "text-xs font-medium",
                hasUnread ? "text-blue-600" : "text-gray-500"
              )}>
                {formatTimestamp(conversation.latestMessage.sentAt)}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            {isTyping ? (
              <TypingIndicator conversationId={conversation._id} variant="compact" />
            ) : (
              conversation.latestMessage && (
                <p className={cn(
                  "text-sm truncate",
                  hasUnread ? "text-gray-900 font-semibold" : "text-gray-600"
                )}>
                  {truncateMessage(conversation.latestMessage.content, 50)}
                </p>
              )
            )}
          </div>
          
          {/* Unread badge - inline with message preview */}
          {hasUnread && (
            <div className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export function ConversationSidebar({
  selectedConversationId,
  onSelectConversation,
}: ConversationSidebarProps) {
  const conversations = useQuery(api.conversations.getUserConversations);

  if (conversations === undefined) {
    return (
      <div className="flex h-full flex-col border-r bg-white">
        <div className="border-b p-4">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="mb-2 flex items-center gap-3 p-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="mb-2 h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (conversations === null) {
    return (
      <div className="flex h-full flex-col items-center justify-center border-r bg-white p-4">
        <p className="text-gray-600">Failed to load conversations</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-full flex-col bg-white">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <Link
              href="/users"
              className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
              title="Start new chat"
            >
              <Plus className="h-5 w-5 text-gray-600" />
            </Link>
          </div>
        </div>
        <NoConversationsEmpty
          onStartConversation={() => {
            window.location.href = "/users";
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white shadow-sm">
      <div className="border-b bg-gradient-to-r from-gray-50 to-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          <Link
            href="/users"
            className="rounded-xl p-2 hover:bg-blue-50 transition-all duration-200 hover:shadow-sm group"
            title="Start new chat"
          >
            <Plus className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation._id}
            conversation={conversation}
            isSelected={selectedConversationId === conversation._id}
            onSelect={() => onSelectConversation(conversation._id)}
          />
        ))}
      </div>
    </div>
  );
}
