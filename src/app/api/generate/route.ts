import { groq } from '@ai-sdk/groq'
import { generateText } from 'ai'
import { z } from 'zod'
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export const maxDuration = 30

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { checkinId } = await req.json()

  if (!checkinId) {
    return new Response("Bad Request", { status: 400 })
  }

  const checkin = await prisma.checkin.findUnique({
    where: { id: checkinId }
  })

  if (!checkin || checkin.userId !== session.user.id) {
    return new Response("Not Found", { status: 404 })
  }

  const { text } = await generateText({
    model: groq('llama-3.3-70b-versatile'),
    prompt: `Convert the following daily update into three different LinkedIn posts. Please return ONLY a valid JSON object with the following exact keys: "professional", "casual", and "linkedinMax". Do not include markdown code blocks or any other text.\n\nDaily Update Conversation:\n${checkin.rawInput}`,
  })

  let object;
  try {
    object = JSON.parse(text.trim());
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    object = match ? JSON.parse(match[0]) : { professional: "Error", casual: "Error", linkedinMax: "Error" };
  }

  // Save the generated posts to database
  const createdPosts = await Promise.all([
    prisma.post.create({
      data: {
        checkinId,
        tone: "professional",
        generatedText: object.professional
      }
    }),
    prisma.post.create({
      data: {
        checkinId,
        tone: "casual",
        generatedText: object.casual
      }
    }),
    prisma.post.create({
      data: {
        checkinId,
        tone: "linkedinMax",
        generatedText: object.linkedinMax
      }
    })
  ])

  return Response.json({ posts: createdPosts })
}
