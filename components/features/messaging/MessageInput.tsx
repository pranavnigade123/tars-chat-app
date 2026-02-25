"use client";

import { useState, useRef, KeyboardEvent, useCallback, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Send, Smile, AlertCircle } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { useDebounce } from "@/lib/hooks/useDebouncedCallback";
import { cn } from "@/lib/utils";

const MAX_MESSAGE_LENGTH = 5000;

interface MessageInputProps {
  conversationId: Id<"conversations">;
  onMessageSent?: () => void;
}

export function MessageInput({ conversationId, onMessageSent }: MessageInputProps) {
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
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing state
    debouncedTyping();

    // Set new timeout to clear typing state after 3 seconds
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

  // Load draft message from localStorage when conversation changes
  useEffect(() => {
    if (!conversationId) return;
    
    const draftKey = `draft_${conversationId}`;
    const draftTimestampKey = `draft_timestamp_${conversationId}`;
    const savedDraft = localStorage.getItem(draftKey);
    const savedTimestamp = localStorage.getItem(draftTimestampKey);
    
    if (savedDraft && savedTimestamp) {
      const draftAge = Date.now() - parseInt(savedTimestamp, 10);
      const DRAFT_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds
      
      if (draftAge < DRAFT_EXPIRY) {
        // Draft is still valid
        setContent(savedDraft);
      } else {
        // Draft expired, clear it
        localStorage.removeItem(draftKey);
        localStorage.removeItem(draftTimestampKey);
        setContent("");
      }
    } else {
      setContent("");
    }
    
    // Clear error and failed message when switching conversations
    setError(null);
    setFailedMessage(null);
  }, [conversationId]);

  // Save draft to localStorage when content changes (debounced)
  useEffect(() => {
    if (!conversationId) return;
    
    const draftKey = `draft_${conversationId}`;
    const draftTimestampKey = `draft_timestamp_${conversationId}`;
    
    // Debounce the save to avoid too many localStorage writes
    const timeoutId = setTimeout(() => {
      if (content.trim()) {
        localStorage.setItem(draftKey, content);
        localStorage.setItem(draftTimestampKey, Date.now().toString());
      } else {
        localStorage.removeItem(draftKey);
        localStorage.removeItem(draftTimestampKey);
      }
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [content, conversationId]);

  const handleSend = async () => {
    const trimmedContent = content.trim();
    
    if (!trimmedContent) {
      return;
    }

    // Validate message length
    if (trimmedContent.length > MAX_MESSAGE_LENGTH) {
      setError(`Message is too long (${trimmedContent.length.toLocaleString()}/${MAX_MESSAGE_LENGTH.toLocaleString()} characters)`);
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      await clearTypingState({ conversationId });
      
      await sendMessage({
        conversationId,
        content: trimmedContent,
      });

      setContent("");
      setFailedMessage(null);
      
      // Clear draft from localStorage
      const draftKey = `draft_${conversationId}`;
      const draftTimestampKey = `draft_timestamp_${conversationId}`;
      localStorage.removeItem(draftKey);
      localStorage.removeItem(draftTimestampKey);
      
      textareaRef.current?.focus();
      
      // Trigger scroll to bottom after sending
      onMessageSent?.();
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message.");
      setFailedMessage(trimmedContent); // Save for retry
    } finally {
      setIsSending(false);
    }
  };

  const handleRetry = () => {
    if (failedMessage) {
      setContent(failedMessage);
      setFailedMessage(null);
      setError(null);
      // Auto-send after setting content
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
    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    // Clear typing state when input loses focus
    clearTypingState({ conversationId }).catch(() => {});
  };

  return (
    <div className="border-t dark:border-[#2d2d2d] bg-white dark:bg-[#1a1a1a] px-4 py-3 shadow-sm">
      {error && (
        <div className="mb-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-3 text-sm text-red-600 dark:text-red-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-red-500 dark:text-red-400">⚠</span>
            {error}
          </div>
          {failedMessage && (
            <button
              onClick={handleRetry}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      )}
      
      {/* Character count warning */}
      {content.length > MAX_MESSAGE_LENGTH * 0.9 && (
        <div className={cn(
          "mb-3 rounded-xl border p-3 text-sm flex items-center gap-2",
          content.length > MAX_MESSAGE_LENGTH
            ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400"
            : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400"
        )}>
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            {content.length > MAX_MESSAGE_LENGTH ? (
              <>Message exceeds maximum length by {(content.length - MAX_MESSAGE_LENGTH).toLocaleString()} characters</>
            ) : (
              <>Approaching character limit: {content.length.toLocaleString()}/{MAX_MESSAGE_LENGTH.toLocaleString()}</>
            )}
          </span>
        </div>
      )}
      
      <div 
        className={cn(
          "flex items-end gap-2 rounded-2xl border-2 bg-gray-50 dark:bg-[#1e1e1e] px-4 py-2 transition-all duration-200",
          isFocused ? "border-blue-500 dark:border-blue-400 bg-white dark:bg-[#242424] shadow-md" : "border-gray-200 dark:border-[#2d2d2d]",
          content.length > MAX_MESSAGE_LENGTH && "border-red-300 dark:border-red-600"
        )}
      >
        <button
          type="button"
          className="mb-1 p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Emoji (coming soon)"
        >
          <Smile className="h-5 w-5" />
        </button>
        
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
          placeholder="Type a message..."
          disabled={isSending}
          rows={1}
          className="flex-1 resize-none bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed max-h-[120px] py-1"
        />
        
        <button
          onClick={handleSend}
          disabled={isSending || !content.trim() || content.length > MAX_MESSAGE_LENGTH}
          className={cn(
            "mb-1 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
            content.trim() && !isSending && content.length <= MAX_MESSAGE_LENGTH
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
              : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
          )}
          title={content.length > MAX_MESSAGE_LENGTH ? "Message too long" : "Send message"}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      
      <div className="mt-2 flex items-center justify-between px-1">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-[#2d2d2d] rounded text-xs">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-[#2d2d2d] rounded text-xs">Shift+Enter</kbd> for new line
        </p>
        {content.length > 0 && (
          <p className={cn(
            "text-xs",
            content.length > MAX_MESSAGE_LENGTH 
              ? "text-red-600 dark:text-red-400 font-medium" 
              : content.length > MAX_MESSAGE_LENGTH * 0.9
              ? "text-amber-600 dark:text-amber-400"
              : "text-gray-400 dark:text-gray-500"
          )}>
            {content.length.toLocaleString()}/{MAX_MESSAGE_LENGTH.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
