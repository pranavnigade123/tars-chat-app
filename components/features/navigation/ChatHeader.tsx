"use client";

import { motion } from "framer-motion";
import { ArrowLeft, CheckSquare, Trash2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils/getInitials";

interface ChatHeaderProps {
  name: string;
  profileImage?: string;
  status: string;
  isOnline: boolean;
  isGroup?: boolean;
  memberCount?: number;
  onBack: () => void;
  onToggleSelectMode?: () => void;
  isSelectMode?: boolean;
  selectedCount?: number;
  onBulkDelete?: () => void;
}

export function ChatHeader({ 
  name, 
  profileImage, 
  status, 
  isOnline,
  isGroup = false,
  memberCount = 0,
  onBack,
  onToggleSelectMode,
  isSelectMode = false,
  selectedCount = 0,
  onBulkDelete
}: ChatHeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="sticky top-0 z-10 bg-white/80 dark:bg-[#1e1e1e]/95 backdrop-blur-md border-b border-gray-100 dark:border-[#2d2d2d]"
    >
      <div className="flex items-center gap-3 px-4 py-3 h-[60px]">
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-full transition-colors"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>
        
        {!isGroup && (
          <Avatar className="h-9 w-9">
            <AvatarImage src={profileImage} alt={name} />
            <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
        )}
        
        {isGroup && (
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
            {getInitials(name)}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {isSelectMode ? (
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              {selectedCount > 0 ? `${selectedCount} selected` : 'Select messages'}
            </h2>
          ) : (
            <>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{name}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {isGroup ? `${memberCount} members` : status}
              </p>
            </>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {isSelectMode && selectedCount > 0 && onBulkDelete && (
            <button
              onClick={onBulkDelete}
              className="p-2 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 active:scale-95 transition-all"
              aria-label="Delete selected messages"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
          
          {onToggleSelectMode && (
            <button
              onClick={onToggleSelectMode}
              className={`p-2 rounded-full transition-all ${
                isSelectMode 
                  ? 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2e2e2e]' 
                  : 'hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-gray-300'
              }`}
              aria-label={isSelectMode ? "Cancel selection" : "Select messages"}
            >
              {isSelectMode ? (
                <X className="h-5 w-5" />
              ) : (
                <CheckSquare className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
