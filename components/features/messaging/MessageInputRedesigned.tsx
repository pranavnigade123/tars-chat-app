"use client";

import { useState, useRef, KeyboardEvent, useCallback, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Send } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { useDebounce } from "@/lib/hooks/useDebouncedCallback";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  conversationId: Id<"conversations">;
  onMessageSent?: () => void;
}

export function MessageInputRedesigned({ conversationId, onMessageSent }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const sendMessage = useMutation(api.messages.sendMessage);
  const setTypingState = useMutation(api.typingStates.setTypingState);
  const clearTypingState = useMutation(api.typingStates.clearTypingState);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  }, [content]);

  // Debounced typing state update
  const debouncedSetTyping = useCallback(() => {
    setTypingState({ conversationId }).catch((err) => {
      console.error("Failed to set typing state:", err);
    });
  }, [conversationId, setTypingState]);

  const debouncedTyping = useDebounce(debouncedSetTyping, 300);

  // Clear typing state after 3 seconds of inactivity
  const handleTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    debouncedTyping();
    typingTimeoutRef.current = setTimeout(() => {
      clearTypingState({ conversationId }).catch(() => {});
    }, 3000);
  }, [conversationId, clearTypingState, debouncedTyping]);

  // Cleanup on unmount or conversation change
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      clearTypingState({ conversationId }).catch(() => {});
    };
  }, [conversationId, clearTypingState]);

  // Load draft message from localStorage
  useEffect(() => {
    if (!conversationId) return;
    
    const draftKey = `draft_${conversationId}`;
    const draftTimestampKey = `draft_timestamp_${conversationId}`;
    const savedDraft = localStorage.getItem(draftKey);
    const savedTimestamp = localStorage.getItem(draftTimestampKey);
    
    if (savedDraft && savedTimestamp) {
      const draftAge = Date.now() - parseInt(savedTimestamp, 10);
      const DRAFT_EXPIRY = 5 * 60 * 1000;
      
      if (draftAge < DRAFT_EXPIRY) {
        setContent(savedDraft);
      } else {
        localStorage.removeItem(draftKey);
        localStorage.removeItem(draftTimestampKey);
        setContent("");
      }
    } else {
      setContent("");
    }
    
    setError(null);
    setFailedMessage(null);
  }, [conversationId]);

  // Save draft to localStorage
  useEffect(() => {
    if (!conversationId) return;
    
    const draftKey = `draft_${conversationId}`;
    const draftTimestampKey = `draft_timestamp_${conversationId}`;
    
    const timeoutId = setTimeout(() => {
      if (content.trim()) {
        localStorage.setItem(draftKey, content);
        localStorage.setItem(draftTimestampKey, Date.now().toString());
      } else {
        localStorage.removeItem(draftKey);
        localStorage.removeItem(draftTimestampKey);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [content, conversationId]);

  const handleSend = async () => {
    const trimmedContent = content.trim();
    
    if (!trimmedContent) return;

    setIsSending(true);
    setError(null);

    try {
      await clearTypingState({ conversationId });
      await sendMessage({ conversationId, content: trimmedContent });

      setContent("");
      setFailedMessage(null);
      
      const draftKey = `draft_${conversationId}`;
      const draftTimestampKey = `draft_timestamp_${conversationId}`;
      localStorage.removeItem(draftKey);
      localStorage.removeItem(draftTimestampKey);
      
      textareaRef.current?.focus();
      onMessageSent?.();
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message.");
      setFailedMessage(trimmedContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleRetry = () => {
    if (failedMessage) {
      setContent(failedMessage);
      setFailedMessage(null);
      setError(null);
      setTimeout(() => handleSend(), 100);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    clearTypingState({ conversationId }).catch(() => {});
  };

  return (
    <div className="p-4 bg-white border-t border-gray-100">
      {error && (
        <div className="mb-3 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠</span>
            <span>{error}</span>
          </div>
          {failedMessage && (
            <button
              onClick={handleRetry}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      )}
      
      <div 
        className={cn(
          "flex items-end gap-2 rounded-2xl bg-gray-50 px-4 py-3 transition-all duration-200",
          isFocused && "bg-white ring-2 ring-blue-500 shadow-sm"
        )}
      >
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder="Message..."
          disabled={isSending}
          rows={1}
          className="flex-1 resize-none bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed max-h-[120px] text-[15px]"
        />
        
        <button
          onClick={handleSend}
          disabled={isSending || !content.trim()}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 shrink-0",
            content.trim() && !isSending
              ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          )}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
