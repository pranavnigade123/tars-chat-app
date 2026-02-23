"use client";

import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils/getInitials";

interface ChatHeaderProps {
  name: string;
  profileImage?: string;
  status: string;
  isOnline: boolean;
  onBack: () => void;
}

export function ChatHeader({ name, profileImage, status, isOnline, onBack }: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
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
          <h2 className="font-semibold text-gray-900 truncate">{name}</h2>
          <p className="text-xs text-gray-500 truncate">{status}</p>
        </div>
      </div>
    </header>
  );
}
