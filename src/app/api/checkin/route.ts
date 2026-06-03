import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { rawInput } = await req.json()

  if (!rawInput) {
    return new Response("Bad Request", { status: 400 })
  }

  const checkin = await prisma.checkin.create({
    data: {
      userId: session.user.id,
      rawInput,
    }
  })

  return Response.json({ checkinId: checkin.id })
}
