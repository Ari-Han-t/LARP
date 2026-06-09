import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Delete the user
    // Thanks to Prisma's onDelete: Cascade (if configured) or our explicit schema, this should delete related records.
    // Wait, let's explicitly delete related records to be safe if Cascade isn't perfectly set up.
    
    // First, verify user exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Prisma relation cascades are configured on Checkins -> Posts/Messages, and User -> Accounts/Sessions/Checkins.
    // If not cascading, we would delete manually. Let's just delete the user and rely on the cascade.
    // In schema.prisma, relations generally cascade in next-auth.
    await prisma.user.delete({
      where: { id: session.user.id }
    });

    return new NextResponse('Account deleted successfully', { status: 200 });
  } catch (error) {
    console.error('Delete account error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
