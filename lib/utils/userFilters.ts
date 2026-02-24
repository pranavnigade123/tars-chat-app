interface User {
  _id: string;
  clerkId: string;
  name: string;
  email: string;
  profileImage?: string;
  isOnline?: boolean;
  lastSeen: number;
}

/**
 * Filter users by search query (case-insensitive substring matching)
 */
export function filterUsers(users: User[], query: string): User[] {
  if (!query.trim()) {
    return users;
  }

  const lowerQuery = query.toLowerCase();
  return users.filter((user) =>
    user.name.toLowerCase().includes(lowerQuery) ||
    user.email.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Sort users by online status (online first) and then alphabetically by name
 */
export function sortUsers(users: User[]): User[] {
  return [...users].sort((a, b) => {
    // Online users first
    const aOnline = a.isOnline ?? false;
    const bOnline = b.isOnline ?? false;
    if (aOnline !== bOnline) {
      return aOnline ? -1 : 1;
    }
    
    // Then alphabetically by name
    return a.name.localeCompare(b.name);
  });
}
