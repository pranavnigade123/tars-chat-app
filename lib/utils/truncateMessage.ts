/**
 * Truncate a message to a specified length and add ellipsis
 */
export function truncateMessage(message: string, maxLength: number = 50): string {
  if (!message) {
    return "";
  }

  if (message.length <= maxLength) {
    return message;
  }

  return message.substring(0, maxLength).trim() + "...";
}
