import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { MessageSquare, ArrowLeft } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="flex min-h-dvh bg-white overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-blue-700 p-12 flex-col justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to home</span>
          </Link>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/20 backdrop-blur-sm p-3">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Tars Chat</h1>
          </div>
          
          <div className="space-y-4 max-w-md">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Welcome back to seamless conversations
            </h2>
            <p className="text-lg text-blue-100">
              Sign in to continue your conversations and stay connected with everyone.
            </p>
          </div>
        </div>

        <div className="text-blue-100 text-sm">
          © 2026 Tars Chat. Built for seamless communication.
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex-1 flex items-start sm:items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-md py-4 sm:py-0">
          {/* Mobile Header */}
          <div className="lg:hidden mb-6 sm:mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 sm:mb-6">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium text-sm sm:text-base">Back to home</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="rounded-lg bg-blue-600 p-1.5 sm:p-2">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tars Chat</h1>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Welcome back</h2>
            <p className="text-sm sm:text-base text-gray-600">Sign in to continue your conversations</p>
          </div>

          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm font-semibold",
                card: "shadow-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "border-gray-300 hover:bg-gray-50 text-sm",
                formFieldInput: "border-gray-300 focus:border-blue-600 focus:ring-blue-600 text-sm",
                footerActionLink: "text-blue-600 hover:text-blue-700 text-sm",
                formFieldLabel: "text-sm",
                identityPreviewText: "text-sm",
                formResendCodeLink: "text-sm",
              }
            }}
            afterSignInUrl="/messages"
          />
        </div>
      </div>
    </div>
  );
}
