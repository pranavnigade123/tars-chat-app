/**
 * Format a timestamp into a human-readable string
 * Returns different formats based on how recent the timestamp is
 */
export function formatTimestamp(timestamp: number): string {
  if (!timestamp || timestamp <= 0) {
    return "";
  }

  const now = Date.now();
  const date = new Date(timestamp);
  const diff = now - timestamp;

  // Today - show time
  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Yesterday
  if (diff < 48 * 60 * 60 * 1000) {
    return "Yesterday";
  }

  // This week - show day name
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }

  // Older - show date
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Format a timestamp for message display (more detailed)
 */
export function formatMessageTime(timestamp: number): string {
  if (!timestamp || timestamp <= 0) {
    return "";
  }

  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
