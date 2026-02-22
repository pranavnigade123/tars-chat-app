import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  isOnline: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function StatusIndicator({ 
  isOnline, 
  size = "md", 
  showLabel = false,
  className 
}: StatusIndicatorProps) {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3", 
    lg: "h-4 w-4"
  };

  const statusText = isOnline ? "Online" : "Offline";
  const statusColor = isOnline ? "bg-green-500" : "bg-gray-400";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div
        className={cn(
          "rounded-full",
          sizeClasses[size],
          statusColor
        )}
        role="status"
        aria-label={statusText}
      />
      {showLabel && (
        <span className="text-xs text-gray-600">
          {statusText}
        </span>
      )}
    </div>
  );
}