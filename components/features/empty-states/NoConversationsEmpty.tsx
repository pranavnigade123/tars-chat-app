"use client";

import { motion } from "framer-motion";
import { MessageSquare, Users } from "lucide-react";
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center p-8 sm:p-12 text-center min-h-[60vh]"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="mb-6"
      >
        <div className="rounded-2xl bg-gray-100 dark:bg-[#2a2a2a] p-6">
          <MessageSquare className="h-12 w-12 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
        </div>
      </motion.div>
      
      {/* Content */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        No conversations yet
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
        Start a conversation with someone from your contacts
      </p>
      
      {/* Action */}
      <button
        onClick={handleStartConversation}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
      >
        <Users className="h-4 w-4" />
        <span>Browse People</span>
      </button>
    </motion.div>
  );
}
