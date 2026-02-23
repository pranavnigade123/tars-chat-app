import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusIndicator } from "@/components/features/presence/StatusIndicator";
import { getInitials } from "@/lib/utils/getInitials";
import { formatLastSeen } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface User {
  _id: string;
  clerkId: string;
  name: string;
  email: string;
  profileImage?: string;
  isOnline?: boolean;
  lastSeen: number;
}

interface UserListItemProps {
  user: User;
  onClick: () => void;
  isSelected?: boolean;
}

export function UserListItem({ user, onClick, isSelected = false }: UserListItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left",
        "hover:bg-gray-50 active:scale-[0.98]",
        isSelected && "bg-blue-50 hover:bg-blue-50"
      )}
    >
      <div className="relative">
        <Avatar className="h-14 w-14">
          <AvatarImage src={user.profileImage} alt={user.name} />
          <AvatarFallback className="bg-gray-200 text-gray-700 text-base font-medium">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <StatusIndicator 
          isOnline={user.isOnline ?? false} 
          size="md" 
          className="absolute bottom-0 right-0 border-2 border-white rounded-full"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate mb-0.5">{user.name}</p>
        <p className="text-sm text-gray-500 truncate">
          {user.isOnline ? "Online" : formatLastSeen(user.lastSeen)}
        </p>
      </div>
    </button>
  );
}
