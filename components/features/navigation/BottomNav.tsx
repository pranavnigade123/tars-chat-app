"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/messages",
      label: "Chats",
      icon: MessageSquare,
      isActive: pathname.startsWith("/messages"),
    },
    {
      href: "/users",
      label: "People",
      icon: Users,
      isActive: pathname === "/users",
    },
    {
      href: "/profile",
      label: "Profile",
      icon: User,
      isActive: pathname === "/profile",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                item.isActive
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700 active:text-gray-900"
              )}
            >
              <Icon className={cn("h-6 w-6", item.isActive && "fill-blue-600")} />
              <span className={cn("text-xs font-medium", item.isActive && "font-semibold")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
