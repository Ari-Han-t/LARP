"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, Copy, Check, Upload, CheckCircle2, Image as ImageIcon } from "lucide-react"
import { supabase } from "@/lib/supabase"

type Post = {
  id: string
  tone: string
  generatedText: string
}

function GenerateContent() {
  const searchParams = useSearchParams()
  const checkinId = searchParams.get("checkinId")
  
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [published, setPublished] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!checkinId) return

    const generatePosts = async () => {
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          body: JSON.stringify({ checkinId })
        })
        const data = await res.json()
        if (data.posts) {
          setPosts(data.posts)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    generatePosts()
  }, [checkinId])

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }



  const handlePublish = async () => {
    if (!selectedPostId) return
    const post = posts.find(p => p.id === selectedPostId)
    if (!post) return
    
    // Open LinkedIn feed with prefilled text
    const text = encodeURIComponent(post.generatedText)
    window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${text}`, '_blank')
    setPublished(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${checkinId}/${fileName}`

    try {
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath)
        
      setUploadedUrl(publicUrl)
    } catch (error) {
      console.error('Error uploading image: ', error)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        <p className="text-neutral-500 font-medium animate-pulse">Crafting your LinkedIn posts...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Generated Posts</h1>
        <p className="text-neutral-500 mt-1">Select the tone that best fits your style today.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div 
            key={post.id} 
            className={`flex flex-col p-6 rounded-2xl border-2 transition-all cursor-pointer bg-white ${
              selectedPostId === post.id ? 'border-neutral-900 shadow-md scale-[1.02]' : 'border-neutral-200 hover:border-neutral-300'
            }`}
            onClick={() => setSelectedPostId(post.id)}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold capitalize text-neutral-900">{post.tone === 'linkedinMax' ? 'LinkedIn Max' : post.tone}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  copyToClipboard(post.id, post.generatedText)
                }}
                className="text-neutral-400 hover:text-neutral-900 p-1"
              >
                {copiedId === post.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            {selectedPostId === post.id ? (
              <textarea
                className="flex-1 w-full mt-4 p-3 border rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px] resize-y"
                value={post.generatedText}
                onChange={(e) => {
                  const newText = e.target.value;
                  setPosts(posts.map(p => p.id === post.id ? { ...p, generatedText: newText } : p));
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="flex-1 whitespace-pre-wrap text-sm text-neutral-700">
                {post.generatedText}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedPostId && (
        <div className="animate-in fade-in slide-in-from-bottom-4 pt-8 border-t space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Attach Media (Optional)</h2>
          
          {uploadedUrl ? (
            <div className="border border-neutral-200 rounded-2xl p-4 flex items-center gap-4 bg-white">
              <div className="h-16 w-16 bg-neutral-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img src={uploadedUrl} alt="Uploaded media" className="object-cover h-full w-full" />
              </div>
              <div>
                <p className="font-medium">Image attached successfully</p>
                <p className="text-sm text-neutral-500">This image will be included in your post.</p>
              </div>
              <button onClick={() => setUploadedUrl(null)} className="ml-auto text-sm text-red-500 hover:underline">Remove</button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-neutral-300 rounded-2xl p-12 flex flex-col items-center justify-center text-neutral-500 hover:bg-neutral-50 transition-colors cursor-pointer group">
              <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileUpload} disabled={uploading} />
              {uploading ? (
                <Loader2 className="h-8 w-8 mb-2 text-neutral-400 animate-spin" />
              ) : (
                <Upload className="h-8 w-8 mb-2 text-neutral-400 group-hover:text-blue-500 transition-colors" />
              )}
              <p className="font-medium">{uploading ? 'Uploading...' : 'Click to upload or drag and drop'}</p>
              <p className="text-sm">PNG, JPG up to 5MB</p>
            </label>
          )}

          <div className="flex justify-end pt-4">
            <button 
              onClick={handlePublish}
              disabled={published}
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-medium shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {published ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Published!
                </>
              ) : (
                "Open in LinkedIn"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin"/></div>}>
      <GenerateContent />
    </Suspense>
  )
}
