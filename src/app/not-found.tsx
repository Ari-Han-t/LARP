import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <FileQuestion className="w-16 h-16 text-gray-400 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        We couldn't find the page you were looking for. It might have been moved or deleted.
      </p>
      <Link 
        href="/"
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Return Home
      </Link>
    </div>
  )
}
