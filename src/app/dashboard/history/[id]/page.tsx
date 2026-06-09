import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Copy, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export default async function HistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/');
  }

  const { id } = await params;

  // Fetch the specific checkin
  const checkin = await prisma.checkin.findUnique({
    where: { 
      id,
      userId: session.user.id 
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' }
      },
      posts: {
        orderBy: { createdAt: 'asc' }
      },
    },
  });

  if (!checkin) {
    redirect('/dashboard/history');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <Link href="/dashboard/history" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {format(new Date(checkin.createdAt), 'MMMM do, yyyy - h:mm a')}
        </h1>
        <p className="text-neutral-500">Session ID: {checkin.id}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Chat History */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Chat History</h2>
          <div className="bg-white border rounded-xl shadow-sm p-4 h-[600px] overflow-y-auto space-y-4">
            {checkin.messages.length === 0 ? (
              // Legacy support: parse rawInput if no messages exist
              checkin.rawInput.split('\n').map((line, i) => {
                const isUser = line.startsWith('user:');
                const isAssistant = line.startsWith('assistant:');
                if (!isUser && !isAssistant) return null;
                const content = line.replace(/^(user|assistant):\s*/, '');
                if (content === 'undefined' || !content) return null;
                
                return (
                  <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-4 py-3 rounded-2xl max-w-[85%] ${
                      isUser 
                        ? 'bg-neutral-900 text-white rounded-br-none' 
                        : 'bg-neutral-100 text-neutral-900 rounded-bl-none'
                    }`}>
                      {content}
                    </div>
                  </div>
                );
              })
            ) : (
              checkin.messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-3 rounded-2xl max-w-[85%] ${
                    m.role === 'user' 
                      ? 'bg-neutral-900 text-white rounded-br-none' 
                      : 'bg-neutral-100 text-neutral-900 rounded-bl-none'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Generated Posts */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Generated Posts</h2>
          <div className="space-y-4">
            {checkin.posts.length === 0 ? (
              <p className="text-neutral-500 text-sm italic">No posts were generated for this session.</p>
            ) : (
              checkin.posts.map((post) => (
                <div key={post.id} className="bg-white border rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs font-medium uppercase tracking-wider">
                      {post.tone}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap text-sm text-neutral-800 mb-6 bg-neutral-50 p-4 rounded-lg border">
                    {post.generatedText}
                  </div>
                  <a 
                    href={`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(post.generatedText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full justify-center items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Share Again
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
