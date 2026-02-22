export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Tars Chat</h1>
          <p className="mt-2 text-gray-600">Real-time messaging made simple</p>
        </div>
        {children}
      </div>
    </div>
  );
}
