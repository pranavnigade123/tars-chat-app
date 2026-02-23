"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { BottomNav } from "@/components/features/navigation/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils/getInitials";
import { Mail, User as UserIcon } from "lucide-react";

export default function ProfilePage() {
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
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-semibold">
                    {getInitials(user.fullName || user.username || "?")}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                  {user.fullName || user.username || "User"}
                </h2>
                <p className="text-gray-500 text-sm">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>

              {/* Info Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                    <UserIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">Username</p>
                    <p className="text-sm text-gray-900 font-medium">
                      {user.username || user.fullName || "Not set"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">Email</p>
                    <p className="text-sm text-gray-900 font-medium">
                      {user.primaryEmailAddress?.emailAddress || "Not set"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Management */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
              <p className="text-sm text-gray-600 mb-4">
                Manage your account settings and preferences using Clerk.
              </p>
              <UserButton 
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    userButtonBox: "w-full",
                    userButtonTrigger: "w-full justify-start px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  }
                }}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />
    </>
  );
}
