import { Link } from 'react-router-dom'
import { Link as LinkIcon, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 bg-[#1A1A1A] rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-[#2A2A2A]">
        <LinkIcon className="w-8 h-8 text-[#666]" />
      </div>
      
      <h1 className="text-4xl font-bold text-white mb-3">Link Not Found</h1>
      <p className="text-[#888] text-lg max-w-md mb-8 leading-relaxed">
        This link may be broken, expired, disabled by the owner, or it might not exist at all.
      </p>
      
      <Link 
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-gray-100 transition-colors"
      >
        <Home className="w-4 h-4" />
        Return to Homepage
      </Link>
    </div>
  )
}
