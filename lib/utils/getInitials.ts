/**
 * Generate initials from a user's name
 * @param name - The user's full name
 * @returns Two-letter uppercase initials
 */
export function getInitials(name: string): string {
  if (!name || name.trim().length === 0) {
    return "?";
  }

  const trimmedName = name.trim();
  const words = trimmedName.split(/\s+/);

  if (words.length >= 2) {
    // First letter of first name + first letter of last name
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  } else {
    // Single word name - use first two letters
    return trimmedName.substring(0, 2).toUpperCase();
  }
}
