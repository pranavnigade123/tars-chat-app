import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserList } from "@/components/features/users/UserList";

export default async function UsersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex h-screen flex-col lg:flex-row">
      {/* User List Sidebar - Responsive */}
      <aside className="flex h-full w-full flex-col border-r bg-white lg:w-80 xl:w-96">
        {/* Header */}
        <header className="border-b px-4 py-4 lg:px-6">
          <h1 className="text-xl font-semibold text-gray-900">Users</h1>
          <p className="text-sm text-gray-600">Select a user to start a conversation</p>
        </header>

        {/* User List */}
        <div className="flex-1 overflow-hidden">
          <UserList currentUserId={userId} />
        </div>
      </aside>

      {/* Main Content Area - Hidden on mobile, shown on desktop */}
      <main className="hidden flex-1 items-center justify-center bg-gray-50 lg:flex">
        <div className="text-center text-gray-500">
          <p className="text-lg">Select a user to start chatting</p>
          <p className="mt-2 text-sm">Choose someone from the list to begin a conversation</p>
        </div>
      </main>
    </div>
  );
}
