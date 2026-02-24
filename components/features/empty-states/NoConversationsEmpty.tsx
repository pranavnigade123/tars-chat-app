"use client";

import { motion } from "framer-motion";
import { MessageSquare, Users, Sparkles } from "lucide-react";
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center p-8 sm:p-12 text-center min-h-[60vh]"
    >
      {/* Illustration */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
        className="relative mb-8"
      >
        <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100 p-8 sm:p-10">
          <MessageSquare className="h-16 w-16 sm:h-20 sm:w-20 text-blue-600" strokeWidth={1.5} />
        </div>
        <div className="absolute -top-2 -right-2 rounded-full bg-yellow-400 p-2 shadow-lg">
          <Sparkles className="h-5 w-5 text-white" fill="currentColor" />
        </div>
      </motion.div>
      
      {/* Content */}
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
        Your inbox is empty
      </h3>
      <p className="text-sm sm:text-base text-gray-600 mb-8 max-w-sm leading-relaxed">
        Start meaningful conversations with people. Connect, chat, and build relationships.
      </p>
      
      {/* Action */}
      <button
        onClick={handleStartConversation}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/30"
      >
        <Users className="h-4 w-4" />
        <span>Find People to Chat</span>
      </button>
      
      {/* Helper text */}
      <p className="mt-6 text-xs text-gray-400">
        Browse users and start your first conversation
      </p>
    </motion.div>
  );
}
