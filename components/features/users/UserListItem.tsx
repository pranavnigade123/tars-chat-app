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
  isOnline: boolean;
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
        "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
        "hover:bg-gray-100",
        isSelected && "bg-blue-50 hover:bg-blue-100"
      )}
    >
      <div className="relative">
        <Avatar>
          <AvatarImage src={user.profileImage} alt={user.name} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <StatusIndicator 
          isOnline={user.isOnline} 
          size="md" 
          className="absolute -bottom-1 -right-1 border-2 border-white rounded-full"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{user.name}</p>
        <p className="text-sm text-gray-500 truncate">
          {user.isOnline ? "Online" : formatLastSeen(user.lastSeen)}
        </p>
      </div>
    </button>
  );
}
