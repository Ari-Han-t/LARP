import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Attempt a simple query to the database
    const userCount = await prisma.user.count();
    return NextResponse.json({ status: 'Database connected!', userCount });
  } catch (error: any) {
    console.error('Database connection failed:', error);
    return NextResponse.json({ status: 'Database connection failed', error: error.message }, { status: 500 });
  }
}
