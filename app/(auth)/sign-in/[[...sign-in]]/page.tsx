"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ThemeToggle } from "@/components/features/navigation/ThemeToggle";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function SignInPage() {
  const { theme } = useTheme();
  
  return (
    <>
      {/* Theme Toggle - Fixed top right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <SignIn 
        appearance={{
          baseTheme: theme === "dark" ? dark : undefined,
          elements: {
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm font-semibold normal-case",
            card: "shadow-none border-0",
            rootBox: "w-full",
            socialButtonsBlockButton: theme === "dark" ? "border-gray-600 hover:bg-[#2a2a2a] text-sm normal-case" : "text-sm normal-case",
            formFieldInput: theme === "dark" 
              ? "border-gray-600 focus:border-blue-500 focus:ring-blue-500 text-base lg:text-sm rounded-lg bg-[#1e1e1e]"
              : "text-base lg:text-sm rounded-lg",
            footerActionLink: theme === "dark" ? "text-blue-400 hover:text-blue-300 text-sm font-medium" : "text-sm font-medium",
            formFieldLabel: theme === "dark" ? "text-sm font-medium text-gray-300" : "text-sm font-medium",
            identityPreviewText: theme === "dark" ? "text-sm text-gray-300" : "text-sm",
            formResendCodeLink: theme === "dark" ? "text-sm text-blue-400" : "text-sm",
            dividerLine: theme === "dark" ? "bg-gray-700" : undefined,
            dividerText: theme === "dark" ? "text-gray-400 text-sm" : "text-sm",
            headerTitle: theme === "dark" ? "text-gray-100" : undefined,
            headerSubtitle: theme === "dark" ? "text-gray-400" : undefined,
            socialButtonsBlockButtonText: theme === "dark" ? "text-gray-300" : undefined,
            formFieldInputShowPasswordButton: theme === "dark" ? "text-gray-400 hover:text-gray-300" : undefined,
            otpCodeFieldInput: theme === "dark" ? "bg-[#1e1e1e] border-gray-600 text-gray-100" : undefined,
            formFieldAction: theme === "dark" ? "text-blue-400" : undefined,
            identityPreviewEditButton: theme === "dark" ? "text-blue-400" : undefined,
            footer: theme === "dark" ? "bg-[#242424]" : undefined,
            footerActionText: theme === "dark" ? "text-gray-400" : undefined,
          },
          variables: theme === "dark" ? {
            colorBackground: "#242424",
            colorInputBackground: "#1e1e1e",
            colorInputText: "#f3f4f6",
            colorText: "#f3f4f6",
            colorTextSecondary: "#9ca3af",
            colorPrimary: "#3b82f6",
          } : undefined
        }}
        afterSignInUrl="/messages"
      />
    </>
  );
}
