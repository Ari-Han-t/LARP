import { openai } from '@ai-sdk/openai'
import { streamText, convertToCoreMessages } from 'ai'
import { auth } from "@/auth"

export const maxDuration = 30

export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { messages } = await req.json()

  const result = await streamText({
    model: openai('gpt-4o'),
    system: `You are LARP, a career journaling assistant. Your goal is to help the user extract the most important details of what they did today to turn it into a LinkedIn post later.
    The user will start by telling you briefly what they did.
    You should ask ONE concise follow up question to get a bit more detail (e.g. "What was the hardest part?", "How long did it take?", "What did you learn?").
    If the user has already provided good detail in 2-3 messages, say "Great! Let's generate your post." and stop asking questions.
    Keep your tone encouraging and professional but brief. Do not generate the LinkedIn post yet.`,
    messages: convertToCoreMessages(messages),
  })

  return result.toDataStreamResponse()
}
