"use client";

import { UserButton } from "@clerk/nextjs";

export function ConversationListHeader() {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "w-9 h-9"
            }
          }}
        />
      </div>
    </header>
  );
}
