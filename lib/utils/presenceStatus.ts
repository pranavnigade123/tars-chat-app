/**
 * Presence status utilities
 * Provides consistent computation of online status from lastSeen timestamp
 */

// Thresholds for presence status
const ACTIVE_NOW_THRESHOLD = 2 * 60 * 1000; // 2 minutes
const RECENTLY_ACTIVE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
export const OFFLINE_THRESHOLD = 60 * 1000; // 60 seconds (for heartbeat system)

export interface PresenceStatus {
  isOnline: boolean;
  statusText: string;
}

/**
 * Compute presence status from lastSeen timestamp
 * Returns consistent online status and status text
 * 
 * @param lastSeen - Timestamp of last activity
 * @returns PresenceStatus object with isOnline and statusText
 */
export function computePresenceStatus(lastSeen: number): PresenceStatus {
  const now = Date.now();
  const timeSinceLastSeen = now - lastSeen;

  if (timeSinceLastSeen < ACTIVE_NOW_THRESHOLD) {
    return {
      isOnline: true,
      statusText: "Active now",
    };
  }

  if (timeSinceLastSeen < RECENTLY_ACTIVE_THRESHOLD) {
    return {
      isOnline: false,
      statusText: "Recently active",
    };
  }

  return {
    isOnline: false,
    statusText: "Offline",
  };
}

/**
 * Check if user is online based on lastSeen timestamp
 * Used by heartbeat system
 * 
 * @param lastSeen - Timestamp of last activity
 * @returns true if user is considered online
 */
export function isUserOnline(lastSeen: number): boolean {
  return Date.now() - lastSeen < OFFLINE_THRESHOLD;
}
