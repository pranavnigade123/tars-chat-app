"use client";

import { UserProfile } from "@/components/features/auth/UserProfile";
import { UserButton } from "@/components/features/auth/UserButton";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

export default function Home() {
  const { convexUser, isLoading } = useCurrentUser();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Tars Chat</h1>
          <UserButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Welcome to Tars Chat!
          </h2>
          <p className="mb-8 text-gray-600">
            Real-time messaging application
          </p>
          
          {isLoading ? (
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : convexUser ? (
            <div className="rounded-lg bg-white p-6 shadow-md">
              <p className="mb-4 text-sm text-gray-600">You are logged in as:</p>
              <UserProfile showOnlineStatus size="lg" />
            </div>
          ) : (
            <p className="text-gray-600">Loading user data...</p>
          )}
        </div>
      </main>
    </div>
  );
}
