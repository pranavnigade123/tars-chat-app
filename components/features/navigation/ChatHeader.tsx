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
      className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        
        <Avatar className="h-9 w-9">
          <AvatarImage src={profileImage} alt={name} />
          <AvatarFallback className="bg-gray-200 text-gray-700 text-sm font-medium">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          {isSelectMode ? (
            <h2 className="font-semibold text-gray-900">
              {selectedCount > 0 ? `${selectedCount} selected` : 'Select messages'}
            </h2>
          ) : (
            <>
              <h2 className="font-semibold text-gray-900 truncate">{name}</h2>
              <p className="text-xs text-gray-500 truncate">{status}</p>
            </>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {isSelectMode && selectedCount > 0 && onBulkDelete && (
            <button
              onClick={onBulkDelete}
              className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 transition-all"
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
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                  : 'hover:bg-gray-100 text-gray-700'
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
