import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        accounts: true,
        checkins: {
          include: {
            messages: true,
            posts: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Set appropriate headers for downloading a JSON file
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="larp_data_export_${new Date().toISOString().split('T')[0]}.json"`);
    headers.set('Content-Type', 'application/json');

    return new NextResponse(JSON.stringify(user, null, 2), {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Export error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
