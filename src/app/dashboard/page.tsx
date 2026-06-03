import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { Flame, PenTool, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  // Fetch stats
  const checkins = await prisma.checkin.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true }
  })

  const posts = await prisma.post.findMany({
    where: { checkin: { userId: session.user.id } },
    select: { published: true }
  })

  // Calculate simple streak (consecutive days)
  let streak = 0
  if (checkins.length > 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let currentDate = today
    for (const checkin of checkins) {
      const checkinDate = new Date(checkin.createdAt)
      checkinDate.setHours(0, 0, 0, 0)
      
      const diffTime = Math.abs(currentDate.getTime() - checkinDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0 || diffDays === 1) {
        if (diffDays === 1 || streak === 0) {
           streak++
        }
        currentDate = checkinDate
      } else {
        break
      }
    }
  }

  const generatedCount = posts.length
  const publishedCount = posts.filter(p => p.published).length

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back{session.user.name ? `, ${session.user.name.split(' ')[0]}` : ''}.</h1>
        <p className="text-neutral-500 mt-1">Here is your progress so far.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-6 bg-white rounded-xl border shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-neutral-500">Current Streak</h3>
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold">{streak} days</div>
        </div>
        <div className="p-6 bg-white rounded-xl border shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-neutral-500">Generated Posts</h3>
            <PenTool className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">{generatedCount}</div>
        </div>
        <div className="p-6 bg-white rounded-xl border shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-neutral-500">Published Posts</h3>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">{publishedCount}</div>
        </div>
      </div>

      <div className="mt-8 p-8 bg-neutral-900 rounded-2xl shadow-lg text-center text-white space-y-6">
        <h2 className="text-2xl font-semibold">Ready to update your network?</h2>
        <p className="text-neutral-400">Convert today's work into a professional post.</p>
        <Link 
          href="/dashboard/checkin"
          className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 font-medium text-black transition-colors hover:bg-neutral-200"
        >
          Start Daily Check-in
        </Link>
      </div>
    </div>
  )
}
