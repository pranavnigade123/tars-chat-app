"use client";

import { UserButton } from "@clerk/nextjs";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import Link from "next/link";
import { MessageSquare, Users } from "lucide-react";

export default function Home() {
  const { convexUser, isLoading } = useCurrentUser();

  return (
    <div className="flex min-h-dvh flex-col bg-white overflow-hidden">
      {/* Minimal header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold text-gray-900">Tars Chat</h1>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-9 h-9"
              }
            }}
          />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <div className="rounded-full bg-gray-100 p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <MessageSquare className="h-10 w-10 text-gray-600" />
          </div>
          
          <h2 className="mb-3 text-2xl font-semibold text-gray-900">
            Welcome to Tars Chat
          </h2>
          <p className="mb-10 text-gray-500">
            Start messaging with people
          </p>
          
          {isLoading ? (
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : convexUser ? (
            <div className="space-y-3">
              <Link
                href="/messages"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 px-6 py-3.5 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                <MessageSquare className="h-5 w-5" />
                <span>Messages</span>
              </Link>
              <Link
                href="/users"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-gray-100 px-6 py-3.5 text-gray-900 font-medium hover:bg-gray-200 transition-colors"
              >
                <Users className="h-5 w-5" />
                <span>Find people</span>
              </Link>
            </div>
          ) : (
            <p className="text-gray-500">Loading...</p>
          )}
        </div>
      </main>
    </div>
  );
}
