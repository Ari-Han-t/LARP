import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
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

  const { object } = await generateObject({
    model: openai('gpt-4o'),
    schema: z.object({
      professional: z.string().describe("Clean, concise, and professional version of the post."),
      casual: z.string().describe("Friendly, authentic, and casual version of the post."),
      linkedinMax: z.string().describe("Full thought-leader mode. Engaging, slightly dramatic, use emojis and spacing typical of viral LinkedIn posts."),
    }),
    prompt: `Convert the following daily update into three different LinkedIn posts.\n\nDaily Update Conversation:\n${checkin.rawInput}`,
  })

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
