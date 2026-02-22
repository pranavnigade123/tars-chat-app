"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/features/navigation/AppHeader";
import { UserList } from "@/components/features/users/UserList";

export default function UsersPage() {
  const { user, isLoaded } = useUser();

  if (isLoaded && !user) {
    redirect("/sign-in");
  }

  if (!isLoaded || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <AppHeader />
      
      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto">
          <UserList currentUserId={user.id} />
        </div>
      </main>
    </div>
  );
}
