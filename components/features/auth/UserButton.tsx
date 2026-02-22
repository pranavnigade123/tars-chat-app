"use client";

import { UserButton as ClerkUserButton } from "@clerk/nextjs";

export function UserButton() {
  return (
    <ClerkUserButton
      afterSignOutUrl="/sign-in"
      appearance={{
        elements: {
          avatarBox: "h-10 w-10",
        },
      }}
    />
  );
}
