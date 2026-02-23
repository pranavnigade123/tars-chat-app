import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <SignIn 
      appearance={{
        elements: {
          formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm font-semibold normal-case",
          card: "shadow-none",
          rootBox: "w-full",
          socialButtonsBlockButton: "border-gray-300 hover:bg-gray-50 text-sm normal-case",
          formFieldInput: "border-gray-300 focus:border-blue-600 focus:ring-blue-600 text-base lg:text-sm rounded-lg",
          footerActionLink: "text-blue-600 hover:text-blue-700 text-sm font-medium",
          formFieldLabel: "text-sm font-medium text-gray-700",
          identityPreviewText: "text-sm",
          formResendCodeLink: "text-sm",
          dividerLine: "bg-gray-200",
          dividerText: "text-gray-500 text-sm",
        }
      }}
      afterSignInUrl="/messages"
    />
  );
}
