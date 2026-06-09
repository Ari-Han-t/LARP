import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">LARP.</Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-neutral-500 hover:text-black transition-colors">
              Home
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-neutral-500 hover:text-black transition-colors">
              Dashboard
            </Link>
            <a href="/dashboard/history" className="text-sm font-medium text-neutral-500 hover:text-black transition-colors">
              History
            </a>
            <a href="/dashboard/settings" className="text-sm font-medium text-neutral-500 hover:text-black transition-colors">
              Settings
            </a>
            <span className="text-sm font-medium text-neutral-300">|</span>
            <span className="text-sm font-medium text-neutral-500">
              {session.user.email}
            </span>
            <form
              action={async () => {
                "use server"
                const { signOut } = await import("@/auth")
                await signOut({ redirectTo: "/" })
              }}
            >
              <button className="text-sm font-medium text-neutral-600 hover:text-black transition-colors">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
