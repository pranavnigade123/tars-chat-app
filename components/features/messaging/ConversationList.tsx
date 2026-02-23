"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedButton, AnimatedBadge } from "@/components/ui/motion";
import { getInitials } from "@/lib/utils/getInitials";
import { formatTimestamp } from "@/lib/utils/formatTimestamp";
import { truncateMessage } from "@/lib/utils/truncateMessage";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import { NoConversationsEmpty } from "@/components/features/empty-states";

interface ConversationListProps {
  selectedConversationId: Id<"conversations"> | null;
}

interface ConversationItemProps {
  conversation: {
    _id: Id<"conversations">;
    otherUser: {
      name: string;
      profileImage?: string;
      clerkId: string;
      isOnline: boolean;
    };
    latestMessage?: {
      content: string;
      sentAt: number;
    } | null;
  };
  isSelected: boolean;
}

function ConversationItem({ conversation, isSelected }: ConversationItemProps) {
  const router = useRouter();
  const typingUsers = useQuery(api.typingStates.getTypingState, {
    conversationId: conversation._id,
  });
  
  const unreadCount = useQuery(api.messages.getUnreadCount, {
    conversationId: conversation._id,
  });

  const isTyping = typingUsers && typingUsers.length > 0;
  const isOnline = conversation.otherUser.isOnline;
  const hasUnread = typeof unreadCount === 'number' && unreadCount > 0;

  const handleClick = () => {
    router.push(`/messages?conversationId=${conversation._id}`);
  };

  return (
    <AnimatedButton
      onClick={handleClick}
      scaleOnTap={true}
      scaleOnHover={false}
      className={cn(
        "w-full flex items-center gap-4 px-4 py-4 transition-colors text-left",
        isSelected 
          ? "bg-gray-50" 
          : "hover:bg-gray-50/50"
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="h-14 w-14">
          <AvatarImage
            src={conversation.otherUser.profileImage}
            alt={conversation.otherUser.name}
          />
          <AvatarFallback className="bg-gray-200 text-gray-700 text-base font-medium">
            {getInitials(conversation.otherUser.name)}
          </AvatarFallback>
        </Avatar>
        {isOnline && (
          <div 
            className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-white"
            aria-label="Online"
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <h3 className={cn(
            "font-semibold truncate text-[15px]",
            hasUnread ? "text-gray-900" : "text-gray-800"
          )}>
            {conversation.otherUser.name}
          </h3>
          {conversation.latestMessage && !isTyping && (
            <span className="text-xs text-gray-500 shrink-0">
              {formatTimestamp(conversation.latestMessage.sentAt, "preview")}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <p className={cn(
            "text-sm truncate flex-1",
            hasUnread ? "text-gray-900 font-medium" : "text-gray-500"
          )}>
            {isTyping ? (
              <span className="text-blue-600 italic">typing...</span>
            ) : conversation.latestMessage ? (
              truncateMessage(conversation.latestMessage.content, 60)
            ) : (
              <span className="text-gray-400">No messages yet</span>
            )}
          </p>
          
          {hasUnread && (
            <AnimatedBadge className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-semibold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </AnimatedBadge>
          )}
        </div>
      </div>
    </AnimatedButton>
  );
}

export function ConversationList({ selectedConversationId }: ConversationListProps) {
  const conversations = useQuery(api.conversations.getUserConversations);

  if (conversations === undefined) {
    return (
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
    );
  }

  if (conversations === null) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-gray-600 mb-4">Failed to load conversations</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return <NoConversationsEmpty onStartConversation={() => {}} />;
  }

  return (
    <div className="flex flex-col">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation._id}
          conversation={conversation}
          isSelected={selectedConversationId === conversation._id}
        />
      ))}
    </div>
  );
}
