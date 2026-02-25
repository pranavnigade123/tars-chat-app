"use client";

import { useState, useRef, KeyboardEvent, useCallback, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Send, Smile } from "lucide-react";
import { AnimatedButton } from "@/components/ui/motion";
import type { Id } from "@/convex/_generated/dataModel";
import { useDebounce } from "@/lib/hooks/useDebouncedCallback";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

// Dynamically import emoji picker to reduce bundle size
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
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

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showEmojiPicker]);

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

    // Clear typing state immediately before sending
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    clearTypingState({ conversationId }).catch(() => {});

    // Clear input immediately for better UX (fast messaging)
    const messageToSend = trimmedContent;
    setContent("");
    setIsSending(true);
    setError(null);

    try {
      await sendMessage({ conversationId, content: messageToSend });

      setFailedMessage(null);
      
      const draftKey = `draft_${conversationId}`;
      const draftTimestampKey = `draft_timestamp_${conversationId}`;
      localStorage.removeItem(draftKey);
      localStorage.removeItem(draftTimestampKey);
      
      onMessageSent?.();
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message.");
      setFailedMessage(messageToSend);
      // Restore content on failure
      setContent(messageToSend);
    } finally {
      setIsSending(false);
      // Keep focus on textarea after sending
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
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

  // Click handler for wrapper to focus textarea
  const handleWrapperClick = () => {
    textareaRef.current?.focus();
  };

  const handleEmojiClick = (emojiData: any) => {
    setContent((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="p-3 lg:p-4 bg-gray-50 dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-[#2d2d2d]">
      {error && (
        <div className="mb-2 lg:mb-3 rounded-xl bg-red-50 border border-red-100 p-2.5 lg:p-3 text-sm text-red-700 flex items-center justify-between">
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
        onClick={handleWrapperClick}
        className={cn(
          "flex items-center gap-3 rounded-3xl bg-white dark:bg-[#242424] border border-gray-200 dark:border-[#2d2d2d] px-4 py-2.5 lg:px-5 lg:py-3 transition-all duration-200 cursor-text shadow-sm relative",
          isFocused && "ring-2 ring-blue-500 dark:ring-blue-400 border-blue-500 dark:border-blue-400 shadow-md"
        )}
      >
        {/* Emoji Picker Popup */}
        {showEmojiPicker && (
          <div 
            ref={emojiPickerRef}
            className="absolute bottom-full left-0 mb-2 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width={320}
              height={400}
              previewConfig={{ showPreview: false }}
              searchPlaceHolder="Search emoji..."
              skinTonesDisabled
            />
          </div>
        )}

        {/* Emoji Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowEmojiPicker(!showEmojiPicker);
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
          aria-label="Add emoji"
        >
          <Smile className="h-5 w-5 lg:h-6 lg:w-6" />
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
          placeholder="Message..."
          disabled={isSending}
          rows={1}
          className="flex-1 resize-none bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed max-h-[120px] text-base lg:text-[15px] leading-relaxed"
        />
        
        <AnimatedButton
          onClick={handleSend}
          disabled={isSending || !content.trim()}
          scaleOnHover={!!(content.trim() && !isSending)}
          className={cn(
            "flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-full transition-colors duration-200 shrink-0",
            content.trim() && !isSending
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          )}
          aria-label="Send message"
        >
          <Send className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
        </AnimatedButton>
      </div>
    </div>
  );
}
