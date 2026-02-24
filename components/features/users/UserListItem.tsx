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
          "w-full flex items-center gap-3 p-3 lg:gap-4 lg:p-4 rounded-xl transition-colors text-left",
          "hover:bg-gray-50",
          isSelected && "bg-blue-50 hover:bg-blue-50"
        )}
      >
        <div className="relative">
          <Avatar className="h-12 w-12 lg:h-14 lg:w-14">
            <AvatarImage src={user.profileImage} alt={user.name} />
            <AvatarFallback className="bg-gray-200 text-gray-700 text-sm lg:text-base font-medium">
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
          <p className="font-semibold text-gray-900 truncate mb-0.5 text-sm lg:text-base">{user.name}</p>
          <p className="text-xs lg:text-sm text-gray-500 truncate">
            {user.isOnline ? "Online" : formatLastSeen(user.lastSeen)}
          </p>
        </div>
      </AnimatedButton>
    </motion.div>
  );
}
