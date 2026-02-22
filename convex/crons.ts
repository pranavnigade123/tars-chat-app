import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Cleanup expired typing states every 5 minutes
crons.interval(
  "cleanup-typing-states",
  { minutes: 5 },
  internal.typingStates.cleanupExpiredTypingStates
);

export default crons;
