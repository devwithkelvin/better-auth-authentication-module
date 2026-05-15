import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Karibu sana</h1>
      <p className="text-gray-600">Welcome back, {session.user.name}!</p>
      {session.user.image && (
        <img
          src={session.user.image}
          alt="avatar"
          className="w-16 h-16 rounded-full"
        />
      )}
      <p className="text-sm text-gray-400">{session.user.email}</p>

    </div>
  );
}