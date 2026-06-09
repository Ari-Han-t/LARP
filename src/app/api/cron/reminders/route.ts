import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import prisma from '@/lib/prisma';

// This handles the GET request to trigger the cron job
export async function GET(request: Request) {
  // Check authorization headers if needed for security
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // We only need to instantiate Resend if the API key exists
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is missing");
      return NextResponse.json({ message: "No Resend API Key configured" });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const allUsers = await prisma.user.findMany({
      where: {
        email: { not: null },
        emailFrequency: { not: 'never' },
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailFrequency: true,
        emailTime: true,
        timezone: true,
      }
    });

    const now = new Date();
    const usersToEmail = [];

    for (const user of allUsers) {
      try {
        // Get user's local time hour
        const localHour = new Intl.DateTimeFormat('en-US', {
          hour: '2-digit',
          hour12: false,
          timeZone: user.timezone || 'UTC'
        }).format(now);
        
        const preferredHour = user.emailTime.split(':')[0];
        if (localHour !== preferredHour) continue;

        if (user.emailFrequency === 'weekly') {
          const localWeekday = new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            timeZone: user.timezone || 'UTC'
          }).format(now);
          if (localWeekday !== 'Mon') continue;
        }

        // Check if they already checked in "today" in their timezone
        const localDate = new Intl.DateTimeFormat('en-CA', { timeZone: user.timezone || 'UTC' }).format(now);
        
        const lastCheckin = await prisma.checkin.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' }
        });

        if (lastCheckin) {
          const lastCheckinDate = new Intl.DateTimeFormat('en-CA', { timeZone: user.timezone || 'UTC' }).format(lastCheckin.createdAt);
          if (lastCheckinDate === localDate) continue; // Already checked in today
        }

        usersToEmail.push(user);
      } catch (e) {
        console.error(`Timezone parsing failed for user ${user.id}:`, e);
      }
    }

    if (usersToEmail.length === 0) {
      return NextResponse.json({ message: "Everyone is up to date!" });
    }

    // Send emails
    const emails = usersToEmail.map(user => ({
      from: 'LARP <reminders@larp.example.com>', // Use your verified domain
      to: user.email!,
      subject: "Time for your daily LARP check-in! 📝",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hey ${user.name || 'there'}!</h2>
          <p>Don't forget to log your daily progress today. It only takes 30 seconds!</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
             style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; margin-top: 16px;">
            Log Check-in Now
          </a>
        </div>
      `
    }));

    // Resend supports batch sending (up to 100 per batch)
    const { data, error } = await resend.batch.send(emails);

    if (error) {
      console.error(error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "Reminders sent successfully", 
      count: users.length,
      data 
    });

  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
