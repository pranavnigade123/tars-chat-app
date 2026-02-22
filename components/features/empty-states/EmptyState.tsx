import { cn } from "@/lib/utils";

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  action?: EmptyStateAction;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  message,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className
      )}
      role="status"
      aria-label={title}
    >
      <div className="mb-4 text-gray-400" aria-hidden="true">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-gray-600">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            action.variant === "secondary"
              ? "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500"
              : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
