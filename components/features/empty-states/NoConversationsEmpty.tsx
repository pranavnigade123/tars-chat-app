"use client";

import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

interface NoConversationsEmptyProps {
  onStartConversation: () => void;
}

export function NoConversationsEmpty({
  onStartConversation,
}: NoConversationsEmptyProps) {
  const router = useRouter();

  const handleStartConversation = () => {
    router.push("/users");
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[60vh]">
      <div className="rounded-full bg-gray-100 p-6 mb-6">
        <MessageSquare className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No messages yet
      </h3>
      <p className="text-sm text-gray-500 mb-8 max-w-xs">
        Start a conversation with someone
      </p>
      <button
        onClick={handleStartConversation}
        className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
      >
        Find people
      </button>
    </div>
  );
}
