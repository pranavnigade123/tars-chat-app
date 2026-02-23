import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Cleanup expired typing states every 1 minute
crons.interval(
  "cleanup-typing-states",
  { minutes: 1 },
  internal.typingStates.cleanupExpiredTypingStates
);

export default crons;
