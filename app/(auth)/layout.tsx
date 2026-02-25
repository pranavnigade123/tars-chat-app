import { MessageSquare } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-white dark:bg-[#1a1a1a]">
      {/* Left Side - Branding & Info */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-[#1e1e1e] dark:to-[#242424] p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <div className="rounded-lg bg-white dark:bg-[#2a2a2a] p-2">
              <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white dark:text-gray-100">Tars Chat</h1>
          </div>
          
          <div className="max-w-md">
            <h2 className="text-4xl font-bold text-white dark:text-gray-100 mb-6 leading-tight">
              Connect with anyone, anywhere
            </h2>
            <p className="text-lg text-blue-100 dark:text-gray-400 leading-relaxed mb-8">
              Experience seamless real-time communication with a modern, intuitive interface built for today's conversations.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-500 dark:bg-[#2a2a2a] p-1 mt-1">
                  <svg className="h-4 w-4 text-white dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white dark:text-gray-100 font-semibold mb-1">Real-time messaging</h3>
                  <p className="text-blue-100 dark:text-gray-400 text-sm">Instant delivery with typing indicators</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-500 dark:bg-[#2a2a2a] p-1 mt-1">
                  <svg className="h-4 w-4 text-white dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white dark:text-gray-100 font-semibold mb-1">Secure & private</h3>
                  <p className="text-blue-100 dark:text-gray-400 text-sm">Enterprise-grade security for your conversations</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-500 dark:bg-[#2a2a2a] p-1 mt-1">
                  <svg className="h-4 w-4 text-white dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white dark:text-gray-100 font-semibold mb-1">Always available</h3>
                  <p className="text-blue-100 dark:text-gray-400 text-sm">Access from any device, anytime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-blue-100 dark:text-gray-500 text-sm">
          © 2026 Tars Chat. Built for seamless communication.
        </div>
      </div>
      
      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gray-50 dark:bg-[#1e1e1e]">
        {children}
      </div>
    </div>
  );
}
