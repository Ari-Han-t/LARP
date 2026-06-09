import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { emailFrequency, emailTime, timezone } = body

    if (!emailFrequency || !emailTime) {
      return new Response("Missing fields", { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        emailFrequency,
        emailTime,
        ...(timezone && { timezone })
      }
    })

    return Response.json({ success: true, user })
  } catch (error) {
    console.error("Settings update error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
