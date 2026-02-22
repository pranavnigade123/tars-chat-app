"use client";

import { useHeartbeat } from "@/lib/hooks/useHeartbeat";

interface HeartbeatProviderProps {
  children: React.ReactNode;
}

export function HeartbeatProvider({ children }: HeartbeatProviderProps) {
  useHeartbeat();
  return <>{children}</>;
}