"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@/components/features/auth/UserButton";
import { MessageSquare, Users, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-white">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-6">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
          >
            <Home className="h-5 w-5" />
            <span className="hidden sm:inline">Tars Chat</span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/messages"
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/messages"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Messages</span>
            </Link>
            <Link
              href="/users"
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/users"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </Link>
          </nav>
        </div>

        <UserButton />
      </div>
    </header>
  );
}
