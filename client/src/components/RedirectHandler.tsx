import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import NotFound from '../pages/NotFound'

export default function RedirectHandler() {
  const { slug } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function performRedirect() {
      if (!slug) return

      try {
        const { data, error } = await supabase
          .from('short_links')
          .select('destination_url, is_active, expires_at')
          .eq('slug', slug)
          .single()

        if (error || !data) {
          setError(true)
          setLoading(false)
          return
        }

        const now = new Date()
        const isExpired = data.expires_at && new Date(data.expires_at) < now
        
        if (!data.is_active || isExpired) {
          setError(true)
          setLoading(false)
          return
        }

        await supabase.rpc('increment_click_count', { 
          p_slug: slug,
          p_ip_hash: 'frontend-redirect' 
        })

        window.location.href = data.destination_url
      } catch (err) {
        console.error('Redirect error:', err)
        setError(true)
        setLoading(false)
      }
    }

    performRedirect()
  }, [slug])

  if (error) {
    return <NotFound />
  }

  return (
    <div className="empty-state" style={{ height: '100vh' }}>
      <div className="spinner" style={{ width: '32px', height: '32px' }} />
      <p className="text-secondary" style={{ marginTop: '16px' }}>Redirecting you...</p>
    </div>
  )
}
