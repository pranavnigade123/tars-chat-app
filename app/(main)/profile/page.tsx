"use client";

import { useUser } from "@clerk/nextjs";
import { redirect, usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { BottomNav } from "@/components/features/navigation/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils/getInitials";
import { Mail, User as UserIcon, MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();

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
      <div className="flex h-dvh bg-white overflow-hidden">
        {/* Desktop Vertical Sidebar Navigation - Hidden on Mobile */}
        <div className="hidden lg:flex lg:flex-col lg:w-16 lg:border-r lg:border-gray-200 lg:bg-gray-50 lg:items-center lg:py-4 lg:gap-2">
          <Link
            href="/messages"
            className={cn(
              "flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors gap-1",
              pathname.startsWith("/messages")
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-[10px] font-medium">Chats</span>
          </Link>
          <Link
            href="/users"
            className={cn(
              "flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors gap-1",
              pathname === "/users"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Users className="h-5 w-5" />
            <span className="text-[10px] font-medium">People</span>
          </Link>
          <Link
            href="/profile"
            className={cn(
              "flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors gap-1 mt-auto",
              pathname === "/profile"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <UserIcon className="h-5 w-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between px-4 py-3">
              <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9"
                  }
                }}
              />
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="max-w-2xl mx-auto p-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-semibold">
                    {getInitials(user.fullName || user.username || "?")}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {user.fullName || user.username || "User"}
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
                
                {/* Quick Actions */}
                <div className="w-full pt-6 border-t border-gray-100">
                  <UserButton 
                    appearance={{
                      elements: {
                        rootBox: "w-full",
                        userButtonBox: "w-full",
                        userButtonTrigger: "w-full justify-center px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 shrink-0">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-blue-700 font-semibold uppercase tracking-wide mb-1">Display Name</p>
                    <p className="text-lg text-gray-900 font-semibold">
                      {user.fullName || user.username || "Not set"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-600 shrink-0">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-green-700 font-semibold uppercase tracking-wide mb-1">Email Address</p>
                    <p className="text-lg text-gray-900 font-semibold break-all">
                      {user.primaryEmailAddress?.emailAddress || "Not set"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your profile is managed securely through Clerk. Click the button above to update your personal information, security settings, and preferences.
              </p>
            </div>
          </div>
        </main>
        </div>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />
    </>
  );
}
