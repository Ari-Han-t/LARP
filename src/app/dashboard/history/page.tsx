import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, LayoutTemplate } from 'lucide-react';

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/');
  }

  // Fetch all checkins for the user with related data
  const checkins = await prisma.checkin.findMany({
    where: { userId: session.user.id },
    include: {
      messages: true,
      posts: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">History</h1>
        <p className="text-neutral-500">View your past check-ins, chats, and generated posts.</p>
      </div>

      {checkins.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center shadow-sm">
          <p className="text-neutral-500">You haven't logged any check-ins yet.</p>
          <Link href="/dashboard/checkin" className="mt-4 inline-block text-blue-600 font-medium hover:underline">
            Start your first check-in
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {checkins.map((checkin) => (
            <Link 
              key={checkin.id} 
              href={`/dashboard/history/${checkin.id}`}
              className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="text-sm text-neutral-500">
                  {formatDistanceToNow(new Date(checkin.createdAt), { addSuffix: true })}
                </div>
              </div>
              <div className="line-clamp-2 text-neutral-900 font-medium mb-6">
                {checkin.rawInput}
              </div>
              
              <div className="flex gap-4 text-sm text-neutral-500">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  <span>
                    {checkin.messages.length > 0 
                      ? checkin.messages.length 
                      : checkin.rawInput.split('\n').filter(l => (l.startsWith('user:') || l.startsWith('assistant:')) && !l.includes('undefined')).length} messages
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <LayoutTemplate className="h-4 w-4" />
                  <span>{checkin.posts.length} posts</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
