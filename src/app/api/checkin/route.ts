import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const CheckinPayloadSchema = z.object({
  rawInput: z.string().min(1, "rawInput is required").max(10000, "Input too long"),
  messages: z.array(
    z.object({
      role: z.string(),
      content: z.string().max(10000, "Message content too long").optional()
    }).passthrough()
  ).optional()
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  let payload;
  try {
    const rawBody = await req.json()
    payload = CheckinPayloadSchema.parse(rawBody)
  } catch (error) {
    return new Response("Bad Request: Invalid payload", { status: 400 })
  }

  const { rawInput, messages } = payload

  const checkin = await prisma.checkin.create({
    data: {
      userId: session.user.id,
      rawInput,
      ...(messages && Array.isArray(messages) && {
        messages: {
          create: messages.map((m: any) => ({
            role: m.role,
            content: m.content || '',
          }))
        }
      })
    }
  })

  return Response.json({ checkinId: checkin.id })
}
