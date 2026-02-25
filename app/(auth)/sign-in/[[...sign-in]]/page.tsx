"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ThemeToggle } from "@/components/features/navigation/ThemeToggle";

export default function SignInPage() {
  return (
    <>
      {/* Theme Toggle - Fixed top right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <SignIn 
        appearance={{
          baseTheme: dark,
          elements: {
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm font-semibold normal-case",
            card: "shadow-none border-0",
            rootBox: "w-full",
            socialButtonsBlockButton: "border-gray-600 hover:bg-[#2a2a2a] text-sm normal-case",
            formFieldInput: "border-gray-600 focus:border-blue-500 focus:ring-blue-500 text-base lg:text-sm rounded-lg bg-[#1e1e1e]",
            footerActionLink: "text-blue-400 hover:text-blue-300 text-sm font-medium",
            formFieldLabel: "text-sm font-medium text-gray-300",
            identityPreviewText: "text-sm text-gray-300",
            formResendCodeLink: "text-sm text-blue-400",
            dividerLine: "bg-gray-700",
            dividerText: "text-gray-400 text-sm",
            headerTitle: "text-gray-100",
            headerSubtitle: "text-gray-400",
            socialButtonsBlockButtonText: "text-gray-300",
            formFieldInputShowPasswordButton: "text-gray-400 hover:text-gray-300",
            otpCodeFieldInput: "bg-[#1e1e1e] border-gray-600 text-gray-100",
            formFieldAction: "text-blue-400",
            identityPreviewEditButton: "text-blue-400",
            footer: "bg-[#242424]",
            footerActionText: "text-gray-400",
          },
          variables: {
            colorBackground: "#242424",
            colorInputBackground: "#1e1e1e",
            colorInputText: "#f3f4f6",
            colorText: "#f3f4f6",
            colorTextSecondary: "#9ca3af",
            colorPrimary: "#3b82f6",
          }
        }}
        afterSignInUrl="/messages"
      />
    </>
  );
}
