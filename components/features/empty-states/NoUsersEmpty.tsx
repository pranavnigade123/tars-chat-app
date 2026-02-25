"use client";

import { Users, UserPlus } from "lucide-react";

export function NoUsersEmpty() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
      {/* Icon */}
      <div className="mb-4">
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-5">
          <Users className="h-10 w-10 text-blue-500 dark:text-blue-400" strokeWidth={1.5} />
        </div>
      </div>
      
      {/* Content */}
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
        No users yet
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
        There are no other users on the platform yet. Share the app with others to start chatting!
      </p>
      
      {/* Visual indicator */}
      <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
        <UserPlus className="h-4 w-4" />
        <span>Waiting for users to join</span>
      </div>
    </div>
  );
}
