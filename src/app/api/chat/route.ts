import { groq } from '@ai-sdk/groq'
import { streamText } from 'ai'
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export const maxDuration = 30

export async function POST(req: Request) {
  console.log("=== API CHAT HIT ===")
  const session = await auth()
  console.log("Session:", session)
  
  if (!session?.user) {
    console.log("Unauthorized request")
    return new Response('Unauthorized', { status: 401 })
  }

  const { messages, checkinId } = await req.json()
  console.log("Messages received:", messages.length)

  if (checkinId) {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'user') {
      await prisma.message.create({
        data: {
          checkinId,
          role: 'user',
          content: lastMessage.content || '',
        }
      });
    }
  }

  const result = await streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: `You are LARP, a career journaling assistant. Your goal is to help the user extract the most important details of what they did today to turn it into a LinkedIn post later.
    The user will start by telling you briefly what they did.
    You should ask ONE concise follow up question to get a bit more detail (e.g. "What was the hardest part?", "How long did it take?", "What did you learn?").
    If the user has already provided good detail in 2-3 messages, say "Great! Let's generate your post." and stop asking questions.
    Keep your tone encouraging and professional but brief. Do not generate the LinkedIn post yet.`,
    messages: messages.map((m: any) => ({ 
      role: m.role, 
      content: m.content || (m.parts && m.parts.map((p: any) => p.text).join('')) || ''
    })),
    onFinish: async ({ text }) => {
      if (checkinId) {
        await prisma.message.create({
          data: {
            checkinId,
            role: 'assistant',
            content: text,
          }
        });
      }
    }
  })

  return result.toUIMessageStreamResponse()
}
