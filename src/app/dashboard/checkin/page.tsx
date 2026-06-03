"use client"

import { useChat } from 'ai/react'
import { useState } from 'react'
import { Send, Loader2, PenTool } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CheckinPage() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content: 'What did you do today?'
      }
    ]
  })

  const isReadyToGenerate = messages.length >= 4 || messages[messages.length - 1]?.content.includes("Let's generate your post")

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      // Save the raw input and proceed to generation view
      const rawInput = messages.map(m => `${m.role}: ${m.content}`).join('\n')
      
      const res = await fetch('/api/checkin', {
        method: 'POST',
        body: JSON.stringify({ rawInput })
      })
      
      const data = await res.json()
      if (data.checkinId) {
        router.push(`/dashboard/generate?checkinId=${data.checkinId}`)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[80vh]">
      <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-xl bg-white shadow-sm mb-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-3 rounded-2xl max-w-[85%] ${
              m.role === 'user' 
                ? 'bg-neutral-900 text-white rounded-br-none' 
                : 'bg-neutral-100 text-neutral-900 rounded-bl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-neutral-100 text-neutral-900 rounded-bl-none flex gap-1">
              <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            className="flex-1 rounded-full border border-neutral-300 px-6 py-4 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            value={input}
            onChange={handleInputChange}
            placeholder={isReadyToGenerate ? "You can keep chatting, or generate your post now..." : "I built..."}
            disabled={isLoading || isGenerating}
          />
          <button
            type="submit"
            disabled={isLoading || !input || isGenerating}
            className="rounded-full w-14 h-14 bg-neutral-900 flex items-center justify-center text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors"
          >
            <Send className="h-5 w-5 ml-1" />
          </button>
        </form>

        {isReadyToGenerate && (
          <div className="absolute -top-16 left-0 right-0 flex justify-center">
             <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 animate-in slide-in-from-bottom-4"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenTool className="h-4 w-4" />}
                Generate LinkedIn Post
              </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Since I used PenTool, I need to import it. Let me just add it.
