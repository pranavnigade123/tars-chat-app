"use client";

import { useUser } from "@clerk/nextjs";
import { redirect, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/features/navigation/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils/getInitials";
import { MessageSquare, Users, CheckCircle, Calendar } from "lucide-react";
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
      <div className="flex h-dvh items-center justify-center bg-white dark:bg-[#1a1a1a]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-dvh bg-white dark:bg-[#1a1a1a] overflow-hidden">
        {/* Desktop Vertical Sidebar Navigation - Hidden on Mobile */}
        <div className="hidden lg:flex lg:flex-col lg:w-16 lg:border-r lg:border-gray-200 dark:lg:border-[#2d2d2d] lg:bg-gray-50 dark:lg:bg-[#1e1e1e] lg:items-center lg:py-4 lg:gap-2">
          <Link
            href="/messages"
            className={cn(
              "flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors gap-1",
              pathname.startsWith("/messages")
                ? "bg-blue-100 dark:bg-[#2a2a2a] text-blue-600 dark:text-gray-200"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
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
                ? "bg-blue-100 dark:bg-[#2a2a2a] text-blue-600 dark:text-gray-200"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
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
                ? "bg-blue-100 dark:bg-[#2a2a2a] text-blue-600 dark:text-gray-200"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
            )}
          >
            <Users className="h-5 w-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {/* Header */}
          <header className="sticky top-0 z-10 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#2d2d2d]">
            <div className="flex items-center justify-between px-4 py-3">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Profile</h1>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="max-w-2xl mx-auto p-4 lg:p-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-[#242424] rounded-2xl border border-gray-200 dark:border-[#2d2d2d] p-6 lg:p-8 mb-4 lg:mb-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 lg:h-24 lg:w-24 mb-3 lg:mb-4">
                  <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xl lg:text-2xl font-semibold">
                    {getInitials(user.fullName || user.username || "?")}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1 lg:mb-2">
                  {user.fullName || user.username || "User"}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-xs lg:text-sm">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 lg:p-6 border border-blue-200">
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-blue-600 mb-2 lg:mb-3">
                    <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <p className="text-[10px] lg:text-xs text-blue-700 font-semibold uppercase tracking-wide mb-1">Status</p>
                  <p className="text-sm lg:text-base text-gray-900 font-semibold">Active</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 lg:p-6 border border-green-200">
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-green-600 mb-2 lg:mb-3">
                    <Calendar className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <p className="text-[10px] lg:text-xs text-green-700 font-semibold uppercase tracking-wide mb-1">Joined</p>
                  <p className="text-sm lg:text-base text-gray-900 font-semibold">
                    {new Date(user.createdAt!).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white dark:bg-[#242424] rounded-2xl border border-gray-200 dark:border-[#2d2d2d] p-4 lg:p-6 mb-4 lg:mb-6">
              <h3 className="text-xs lg:text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 lg:mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/messages"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors group"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">My Conversations</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">View all your chats</p>
                  </div>
                </Link>
                
                <Link
                  href="/users"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors group"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Find People</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Start new conversations</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-gray-50 dark:bg-[#1e1e1e] rounded-2xl p-4 lg:p-6 border border-gray-200 dark:border-[#2d2d2d]">
              <h3 className="text-xs lg:text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1.5 lg:mb-2">About TARS Chat</h3>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                A modern, real-time messaging platform built for seamless communication. Connect with friends, colleagues, and communities instantly.
              </p>
            </div>
          </div>
        </main>
        </motion.div>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />
    </>
  );
}
