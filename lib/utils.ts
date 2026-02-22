import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a timestamp into a human-readable "last seen" string
 * Examples: "Just now", "5 minutes ago", "2 hours ago", "Yesterday", "Jan 15"
 */
export function formatLastSeen(timestamp: number): string {
  if (!timestamp || timestamp <= 0) {
    return "Unknown";
  }

  const now = Date.now();
  const diff = now - timestamp;
  
  // Less than 1 minute
  if (diff < 60 * 1000) {
    return "Just now";
  }
  
  // Less than 1 hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }
  
  // Less than 24 hours
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }
  
  // Less than 48 hours (yesterday)
  if (diff < 48 * 60 * 60 * 1000) {
    return "Yesterday";
  }
  
  // Less than 7 days
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days} days ago`;
  }
  
  // Format as date
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
