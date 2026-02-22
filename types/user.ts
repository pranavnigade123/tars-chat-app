import { Doc, Id } from "@/convex/_generated/dataModel";

export type User = Doc<"users">;

export interface UserProfile {
  id: Id<"users">;
  clerkId: string;
  name: string;
  email: string;
  profileImage?: string;
  lastSeen: number;
  onlineStatus: boolean;
}

export interface UserSyncData {
  clerkId: string;
  name: string;
  email: string;
  profileImage?: string;
}
