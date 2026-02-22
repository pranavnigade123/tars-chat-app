import { cn } from "@/lib/utils";

interface OnlineStatusIndicatorProps {
  online: boolean;
  className?: string;
}

export function OnlineStatusIndicator({ online, className }: OnlineStatusIndicatorProps) {
  return (
    <div
      className={cn(
        "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white",
        online ? "bg-green-500" : "bg-gray-400",
        className
      )}
      aria-label={online ? "Online" : "Offline"}
    />
  );
}
