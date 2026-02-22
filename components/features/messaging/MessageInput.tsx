"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Send } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

interface MessageInputProps {
  conversationId: Id<"conversations">;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const sendMessage = useMutation(api.messages.sendMessage);

  const handleSend = async () => {
    const trimmedContent = content.trim();
    
    // Validate content
    if (!trimmedContent) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      await sendMessage({
        conversationId,
        content: trimmedContent,
      });

      // Clear input and focus
      setContent("");
      textareaRef.current?.focus();
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter, new line on Shift+Enter
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-white p-4">
      {error && (
        <div className="mb-2 rounded-lg bg-red-50 p-2 text-sm text-red-600">
          {error}
        </div>
      )}
      
      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={isSending}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          style={{
            minHeight: "42px",
            maxHeight: "120px",
          }}
        />
        
        <button
          onClick={handleSend}
          disabled={isSending || !content.trim()}
          className="flex h-[42px] w-[42px] items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      
      <p className="mt-1 text-xs text-gray-500">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}
