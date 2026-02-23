"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { UserList } from "@/components/features/users/UserList";
import { BottomNav } from "@/components/features/navigation/BottomNav";

export default function UsersPage() {
  const { user, isLoaded } = useUser();

  if (isLoaded && !user) {
    redirect("/sign-in");
  }

  if (!isLoaded || !user) {
    return (
      <div className="flex h-dvh items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-dvh flex-col bg-white overflow-hidden">
        {/* Minimal Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-xl font-semibold text-gray-900">People</h1>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9"
                }
              }}
            />
          </div>
        </header>
        
        <main className="flex-1 overflow-hidden pb-20 lg:pb-0">
          <div className="h-full max-w-4xl mx-auto">
            <UserList currentUserId={user.id} />
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />
    </>
  );
}
