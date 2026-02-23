"use client";

import { MessageCircle, Send } from "lucide-react";

interface NoMessagesEmptyProps {
  otherParticipantName: string;
}

export function NoMessagesEmpty({
  otherParticipantName,
}: NoMessagesEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center min-h-[60vh]">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="rounded-3xl bg-gradient-to-br from-green-50 to-green-100 p-8 sm:p-10">
          <MessageCircle className="h-16 w-16 sm:h-20 sm:w-20 text-green-600" strokeWidth={1.5} />
        </div>
        <div className="absolute -bottom-2 -right-2 rounded-full bg-blue-600 p-2 shadow-lg">
          <Send className="h-4 w-4 text-white" />
        </div>
      </div>
      
      {/* Content */}
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
        Start the conversation
      </h3>
      <p className="text-sm sm:text-base text-gray-600 mb-4 max-w-sm leading-relaxed">
        Say hello to <span className="font-semibold text-gray-900">{otherParticipantName}</span> and break the ice!
      </p>
      
      {/* Suggestions */}
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        <div className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full">
          👋 Hey there!
        </div>
        <div className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full">
          How's it going?
        </div>
        <div className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full">
          Nice to meet you
        </div>
      </div>
    </div>
  );
}
