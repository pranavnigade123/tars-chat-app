"use client";

import { useState, useCallback, useRef } from "react";

export interface ContextMenuPosition {
  rect: {
    top: number;
    left: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
  };
  reactionTop: number;
  reactionLeft: number;
  actionTop: number;
  /** Distance from the right edge of the viewport (for current-user messages) */
  actionRight: number | null;
  /** Distance from the left edge of the viewport (for incoming messages) */
  actionLeft: number | null;
}

const REACTION_BAR_HEIGHT = 44;
const REACTION_BAR_WIDTH = 200;
const VIEWPORT_MARGIN = 16;
const REACTION_GAP = 26; // Increased gap for reaction bar above message
const ACTION_GAP = 12; // Smaller gap for action menu below message

export function useMessageContext(isCurrentUser: boolean) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<ContextMenuPosition | null>(null);
  const actionExecutedRef = useRef(false);

  const open = useCallback(
    (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Reaction bar: default above the message; flip below if not enough room
      let reactionTop = rect.top - REACTION_BAR_HEIGHT - REACTION_GAP;
      if (reactionTop < VIEWPORT_MARGIN) {
        reactionTop = rect.bottom + REACTION_GAP;
      }

      // Horizontal alignment of reaction bar
      let reactionLeft = isCurrentUser
        ? rect.right - REACTION_BAR_WIDTH
        : rect.left;
      reactionLeft = Math.max(
        VIEWPORT_MARGIN,
        Math.min(reactionLeft, vw - REACTION_BAR_WIDTH - VIEWPORT_MARGIN)
      );

      // Action menu: below message with smaller gap
      const actionTop = Math.min(rect.bottom + ACTION_GAP, vh - 120 - VIEWPORT_MARGIN);

      // Align action menu edge with message edge
      const actionRight = isCurrentUser ? vw - rect.right : null;
      const actionLeft = isCurrentUser ? null : rect.left;

      actionExecutedRef.current = false;
      setMenuPosition({
        rect: {
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
        },
        reactionTop,
        reactionLeft,
        actionTop,
        actionRight,
        actionLeft,
      });
      setIsOpen(true);
    },
    [isCurrentUser]
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setMenuPosition(null);
  }, []);

  /** Run an action exactly once, then close the menu. */
  const executeAction = useCallback(
    (fn: () => void) => {
      if (actionExecutedRef.current) return;
      actionExecutedRef.current = true;
      fn();
      close();
    },
    [close]
  );

  return { isOpen, menuPosition, open, close, executeAction };
}
