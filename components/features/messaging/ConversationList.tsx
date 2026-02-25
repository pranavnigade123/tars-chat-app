"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedButton, AnimatedBadge } from "@/components/ui/motion";
import { getInitials } from "@/lib/utils/getInitials";
import { formatTimestamp } from "@/lib/utils/formatTimestamp";
import { truncateMessage } from "@/lib/utils/truncateMessage";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import { NoConversationsEmpty, NoSearchResultsEmpty } from "@/components/features/empty-states";

interface ConversationListProps {
  selectedConversationId: Id<"conversations"> | null;
  searchQuery?: string;
  onSearchChange: (query: string) => void;
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
  index: number;
}

function ConversationItem({ conversation, isSelected, index }: ConversationItemProps) {
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
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: "easeOut",
      }}
    >
      <AnimatedButton
      onClick={handleClick}
      scaleOnTap={true}
      scaleOnHover={false}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left rounded-xl",
        isSelected 
          ? "bg-gray-50" 
          : "hover:bg-gray-50/50"
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="h-11 w-11">
          <AvatarImage
            src={conversation.otherUser.profileImage}
            alt={conversation.otherUser.name}
          />
          <AvatarFallback className="bg-gray-200 text-gray-700 text-sm font-medium">
            {getInitials(conversation.otherUser.name)}
          </AvatarFallback>
        </Avatar>
        {isOnline && (
          <div 
            className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"
            aria-label="Online"
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <h3 className={cn(
            "font-semibold truncate text-sm",
            hasUnread ? "text-gray-900" : "text-gray-800"
          )}>
            {conversation.otherUser.name}
          </h3>
          {conversation.latestMessage && !isTyping && (
            <span className="text-[11px] text-gray-500 shrink-0">
              {formatTimestamp(conversation.latestMessage.sentAt, "preview")}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <p className={cn(
            "text-xs truncate flex-1",
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
            <AnimatedBadge className="shrink-0 min-w-[18px] h-[18px] px-1.5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-semibold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </AnimatedBadge>
          )}
        </div>
      </div>
    </AnimatedButton>
    </motion.div>
  );
}

export function ConversationList({ selectedConversationId, searchQuery = "", onSearchChange }: ConversationListProps) {
  const conversations = useQuery(api.conversations.getUserConversations);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter conversations by user name or message content
  const filteredConversations = useMemo(() => {
    if (!conversations || !debouncedSearchQuery.trim()) return conversations;
    
    const query = debouncedSearchQuery.toLowerCase().trim();
    return conversations.filter((conversation) => {
      const nameMatch = conversation.otherUser.name.toLowerCase().includes(query);
      const messageMatch = conversation.latestMessage?.content.toLowerCase().includes(query);
      return nameMatch || messageMatch;
    });
  }, [conversations, debouncedSearchQuery]);

  if (conversations === undefined) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4">
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-14 w-14 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
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

  // Show empty state when search has no results
  if (filteredConversations && filteredConversations.length === 0 && searchQuery.trim()) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-4">
          <NoSearchResultsEmpty
            searchQuery={searchQuery}
            onClearSearch={() => onSearchChange("")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {(filteredConversations || conversations).map((conversation, index) => (
          <ConversationItem
            key={conversation._id}
            conversation={conversation}
            isSelected={selectedConversationId === conversation._id}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
