import type { TimestampFormat, TimestampInput } from "./timestamp.types";

/**
 * Parse various timestamp formats into Date object
 * @param timestamp - Date object, ISO string, or Unix timestamp (ms)
 * @returns Date object or null for invalid inputs
 */
function parseTimestamp(timestamp: TimestampInput): Date | null {
  if (!timestamp) {
    return null;
  }

  if (timestamp instanceof Date) {
    return isNaN(timestamp.getTime()) ? null : timestamp;
  }

  if (typeof timestamp === "number") {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
  }

  if (typeof timestamp === "string") {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
}

/**
 * Check if a date is today in user's timezone
 */
function isToday(date: Date): boolean {
  const now = new Date();
  // Normalize to start of day for accurate comparison
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return todayStart.getTime() === dateStart.getTime();
}

/**
 * Check if a date is yesterday in user's timezone
 */
function isYesterday(date: Date): boolean {
  const now = new Date();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return yesterday.getTime() === dateStart.getTime();
}

/**
 * Check if a date is within the current week
 */
function isThisWeek(date: Date): boolean {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  return date >= weekStart && date < weekEnd;
}

/**
 * Check if a date is within the current year
 */
function isThisYear(date: Date): boolean {
  const now = new Date();
  return date.getFullYear() === now.getFullYear();
}

/**
 * Format time in 12-hour format with AM/PM
 */
function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Format date without year (e.g., "Feb 15")
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Format full date with year (e.g., "Feb 15, 2023")
 */
function formatFullDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Get day name (e.g., "Monday", "Tuesday")
 */
function getDayName(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
  }).format(date);
}

/**
 * Format relative time (e.g., "just now", "5 minutes ago")
 * Returns null if not applicable for relative format
 */
function formatRelativeTime(date: Date): string | null {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMinutes < 1) {
    return "just now";
  }
  if (diffMinutes === 1) {
    return "1 minute ago";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} minutes ago`;
  }
  if (diffHours === 1) {
    return "1 hour ago";
  }

  // For 2+ hours ago today, return null to fall back to time format
  if (isToday(date)) {
    return null;
  }

  return null; // Fall back to other formats
}

/**
 * Format a timestamp into a human-readable string
 *
 * @param timestamp - Date object, ISO string, or Unix timestamp (ms)
 * @param format - Format type: "message" | "preview" | "relative" | "full"
 * @returns Formatted timestamp string
 */
export function formatTimestamp(
  timestamp: TimestampInput,
  format: TimestampFormat = "message"
): string {
  // Parse timestamp
  const date = parseTimestamp(timestamp);
  if (!date) return "";

  // Handle different format types
  switch (format) {
    case "full":
      return formatFullDate(date) + ", " + formatTime(date);

    case "relative": {
      const relative = formatRelativeTime(date);
      if (relative) return relative;
      // Fall through to message format
    }

    case "message":
      if (isToday(date)) {
        return formatTime(date);
      }
      if (isYesterday(date)) {
        return "Yesterday, " + formatTime(date);
      }
      if (isThisYear(date)) {
        return formatDate(date) + ", " + formatTime(date);
      }
      return formatFullDate(date) + ", " + formatTime(date);

    case "preview":
      if (isToday(date)) {
        return formatTime(date);
      }
      if (isYesterday(date)) {
        return "Yesterday";
      }
      if (isThisWeek(date)) {
        return getDayName(date);
      }
      if (isThisYear(date)) {
        return formatDate(date);
      }
      return formatFullDate(date);

    default:
      return "";
  }
}

// Keep backward compatibility with existing code
export function formatMessageTime(timestamp: number): string {
  return formatTimestamp(timestamp, "message");
}

// Export for use in conversation list (already using this name)
export { formatTimestamp as default };
