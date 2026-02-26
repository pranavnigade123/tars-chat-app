import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * Custom hook to manage message selection and bulk operations
 * Handles selection mode, selected messages, and bulk delete
 */
export function useMessageSelection() {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<Id<"messages">>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const deleteMessage = useMutation(api.messages.deleteMessage);

  const toggleSelectMode = useCallback(() => {
    setIsSelectMode((prev) => !prev);
    setSelectedMessages(new Set());
  }, []);

  const toggleMessageSelect = useCallback((messageId: Id<"messages">) => {
    setSelectedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  }, []);

  const openBulkDeleteDialog = useCallback(() => {
    if (selectedMessages.size === 0) return;
    setShowBulkDeleteDialog(true);
  }, [selectedMessages.size]);

  const confirmBulkDelete = useCallback(async () => {
    try {
      await Promise.all(
        Array.from(selectedMessages).map((messageId) =>
          deleteMessage({ messageId })
        )
      );
      setSelectedMessages(new Set());
      setIsSelectMode(false);
      setShowBulkDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete messages:", error);
      throw error;
    }
  }, [selectedMessages, deleteMessage]);

  const closeBulkDeleteDialog = useCallback(() => {
    setShowBulkDeleteDialog(false);
  }, []);

  return {
    isSelectMode,
    selectedMessages,
    showBulkDeleteDialog,
    toggleSelectMode,
    toggleMessageSelect,
    openBulkDeleteDialog,
    confirmBulkDelete,
    closeBulkDeleteDialog,
  };
}
