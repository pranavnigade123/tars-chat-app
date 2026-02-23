"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Users, Zap, Shield, Clock } from "lucide-react";

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  // Redirect logged-in users to messages
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/messages");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading while checking auth
  if (!isLoaded) {
    return (
      <div className="flex h-dvh items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Don't render landing page if user is signed in (will redirect)
  if (isSignedIn) {
    return (
      <div className="flex h-dvh items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-600 p-2">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Tars Chat</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            <span>Real-time messaging</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-4">
            Connect instantly with
            <span className="text-blue-600"> anyone, anywhere</span>
          </h2>
          
          <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
            Experience seamless real-time communication with a modern, intuitive interface.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-3 mb-12 sm:mb-16 px-4">
            <Link
              href="/sign-in"
              className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
            >
              Get Started
            </Link>
          </div>

          {/* Mock Chat Preview - Simplified for mobile */}
          <div className="max-w-3xl mx-auto rounded-xl sm:rounded-2xl border border-gray-200 bg-gray-50 p-2 sm:p-4 shadow-xl">
            <div className="bg-white rounded-lg sm:rounded-xl overflow-hidden">
              {/* Mock Header */}
              <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200 bg-gray-50">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100"></div>
                <div className="flex-1">
                  <div className="h-3 sm:h-4 w-20 sm:w-24 bg-gray-200 rounded mb-1"></div>
                  <div className="h-2 sm:h-3 w-12 sm:w-16 bg-gray-100 rounded"></div>
                </div>
              </div>
              {/* Mock Messages */}
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 bg-white min-h-[160px] sm:min-h-[200px]">
                <div className="flex gap-2">
                  <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-200 shrink-0"></div>
                  <div className="bg-gray-100 rounded-2xl px-3 py-2 max-w-[70%]">
                    <div className="h-2.5 sm:h-3 w-24 sm:w-32 bg-gray-300 rounded"></div>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <div className="bg-blue-600 rounded-2xl px-3 py-2 max-w-[70%]">
                    <div className="h-2.5 sm:h-3 w-28 sm:w-40 bg-blue-500 rounded"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-200 shrink-0"></div>
                  <div className="bg-gray-100 rounded-2xl px-3 py-2 max-w-[70%]">
                    <div className="h-2.5 sm:h-3 w-36 sm:w-48 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Everything you need
            </h3>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Built with modern technology for seamless messaging
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="rounded-lg sm:rounded-xl bg-blue-100 p-2.5 sm:p-3 w-fit mb-3 sm:mb-4">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Real-time Messaging</h4>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Instant delivery with typing indicators and read receipts.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="rounded-lg sm:rounded-xl bg-green-100 p-2.5 sm:p-3 w-fit mb-3 sm:mb-4">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Secure & Private</h4>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Protected with enterprise-grade security. Chat with confidence.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-200 hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
              <div className="rounded-lg sm:rounded-xl bg-purple-100 p-2.5 sm:p-3 w-fit mb-3 sm:mb-4">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Always Available</h4>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Access from any device, anytime. Seamless sync everywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Built With Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 sm:mb-6">
            Built with modern technology
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 text-gray-400">
            <span className="text-base sm:text-lg font-semibold">Next.js</span>
            <span className="text-base sm:text-lg font-semibold">Convex</span>
            <span className="text-base sm:text-lg font-semibold">Clerk</span>
            <span className="text-base sm:text-lg font-semibold">TypeScript</span>
            <span className="text-base sm:text-lg font-semibold">Tailwind</span>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
            Ready to get started?
          </h3>
          <p className="text-base sm:text-lg text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Join thousands of users already chatting. Sign up now and start connecting.
          </p>
          <Link
            href="/sign-in"
            className="inline-block px-6 sm:px-8 py-3 sm:py-4 text-base font-semibold text-blue-600 bg-white hover:bg-gray-50 rounded-xl transition-colors shadow-xl"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center text-xs sm:text-sm text-gray-500">
          <p>© 2026 Tars Chat. Built for seamless communication.</p>
        </div>
      </footer>
    </div>
  );
}
