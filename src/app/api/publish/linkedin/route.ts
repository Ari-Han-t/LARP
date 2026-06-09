import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { postId } = await req.json();

    if (!postId) {
      return new NextResponse('Bad Request: Missing postId', { status: 400 });
    }

    // Get the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { checkin: true }
    });

    if (!post || post.checkin.userId !== session.user.id) {
      return new NextResponse('Not Found or Unauthorized', { status: 404 });
    }

    // Get the user's LinkedIn account
    const linkedInAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'linkedin',
      }
    });

    if (!linkedInAccount || !linkedInAccount.access_token || !linkedInAccount.providerAccountId) {
      return NextResponse.json(
        { error: 'LinkedIn account not connected' },
        { status: 400 }
      );
    }

    // Call LinkedIn API to publish
    // LinkedIn UGC Post API requires the author URN (providerAccountId)
    const linkedInUrn = `urn:li:person:${linkedInAccount.providerAccountId}`;

    const linkedinResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${linkedInAccount.access_token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: linkedInUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: post.generatedText,
            },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    });

    if (!linkedinResponse.ok) {
      const errorData = await linkedinResponse.text();
      console.error('LinkedIn API Error:', errorData);
      return NextResponse.json(
        { error: 'Failed to publish to LinkedIn', details: errorData },
        { status: 502 }
      );
    }

    const linkedInData = await linkedinResponse.json();

    // Mark post as published
    await prisma.post.update({
      where: { id: postId },
      data: { published: true }
    });

    return NextResponse.json({ 
      success: true, 
      linkedInPostId: linkedInData.id 
    });

  } catch (error) {
    console.error('Error publishing to LinkedIn:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
