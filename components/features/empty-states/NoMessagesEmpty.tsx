"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

interface NoMessagesEmptyProps {
  otherParticipantName: string;
}

export function NoMessagesEmpty({
  otherParticipantName,
}: NoMessagesEmptyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center p-8 text-center min-h-[50vh]"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="mb-4"
      >
        <div className="rounded-2xl bg-gray-100 p-5">
          <MessageCircle className="h-10 w-10 text-gray-400" strokeWidth={1.5} />
        </div>
      </motion.div>
      
      {/* Content */}
      <h3 className="text-base font-semibold text-gray-900 mb-2">
        No messages yet
      </h3>
      <p className="text-sm text-gray-500 max-w-xs">
        Start the conversation with {otherParticipantName}
      </p>
    </motion.div>
  );
}
