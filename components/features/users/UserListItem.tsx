import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusIndicator } from "@/components/features/presence/StatusIndicator";
import { AnimatedButton } from "@/components/ui/motion";
import { motion } from "framer-motion";
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
  index: number;
}

export function UserListItem({ user, onClick, isSelected = false, index }: UserListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: "easeOut",
      }}
    >
      <AnimatedButton
        onClick={onClick}
        scaleOnTap={true}
        scaleOnHover={false}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left",
          "hover:bg-gray-50 dark:hover:bg-[#222222]",
          isSelected && "bg-blue-50 dark:bg-[#2a2a2a] hover:bg-blue-50 dark:hover:bg-[#2a2a2a]"
        )}
      >
        <div className="relative shrink-0">
          <Avatar className="h-11 w-11">
            <AvatarImage src={user.profileImage} alt={user.name} />
            <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <StatusIndicator 
            isOnline={user.isOnline ?? false} 
            size="md" 
            className="absolute bottom-0 right-0 border-2 border-white dark:border-[#121212] rounded-full"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-gray-100 truncate mb-0.5 text-sm">{user.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {user.isOnline ? "Online" : formatLastSeen(user.lastSeen)}
          </p>
        </div>
      </AnimatedButton>
    </motion.div>
  );
}
