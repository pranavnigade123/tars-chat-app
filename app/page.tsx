"use client";

import { AppHeader } from "@/components/features/navigation/AppHeader";
import { UserProfile } from "@/components/features/auth/UserProfile";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import Link from "next/link";

export default function Home() {
  const { convexUser, isLoading } = useCurrentUser();

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />

      <main className="flex flex-1 items-center justify-center bg-gray-50">
        <div className="text-center px-4">
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
            <div className="space-y-6">
              <div className="rounded-lg bg-white p-6 shadow-md">
                <p className="mb-4 text-sm text-gray-600">You are logged in as:</p>
                <UserProfile showOnlineStatus size="lg" />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/messages"
                  className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  My Messages
                </Link>
                <Link
                  href="/users"
                  className="inline-block rounded-lg bg-white border-2 border-blue-600 px-6 py-3 text-blue-600 font-medium hover:bg-blue-50 transition-colors"
                >
                  Browse Users
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Loading user data...</p>
          )}
        </div>
      </main>
    </div>
  );
}
