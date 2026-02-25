"use client";

import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "./ThemeToggle";

export function ConversationListHeader() {
  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#2d2d2d]">
      <div className="flex items-center justify-between px-4 py-3 h-[60px]">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Messages</h1>
        <div className="flex items-center gap-2">
          {/* Mobile: Show ThemeToggle */}
          <div className="lg:hidden">
            <ThemeToggle />
          </div>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-9 h-9"
              }
            }}
          />
        </div>
      </div>
    </header>
  );
}
