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

        // 3. Detect Analytics Details (Browser/Device/OS)
        const ua = navigator.userAgent
        const referrer = document.referrer || 'Direct'
        
        // Better Browser Detection
        let browser = 'Other'
        if (ua.includes('Firefox')) browser = 'Firefox'
        else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser'
        else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera'
        else if (ua.includes('Trident')) browser = 'IE'
        else if (ua.includes('Edge')) browser = 'Edge'
        else if (ua.includes('Chrome')) browser = 'Chrome'
        else if (ua.includes('Safari')) browser = 'Safari'

        const deviceType = /iPhone|iPad|iPod|Android/i.test(ua) ? 'Mobile' : 'Desktop'

        // 4. Fetch IP and Country (using a more reliable combo)
        let ip = 'Unknown'
        let country = 'Unknown'
        try {
          // Use cloudflare's trace as a fallback or a more open API
          const res = await fetch('https://ipapi.co/json/')
          if (res.ok) {
            const data = await res.json()
            ip = data.ip || 'Unknown'
            country = data.country_name || 'Unknown'
          }
        } catch (e) {
          console.warn('IP lookup failed:', e)
        }

        // 5. Track click with full details
        await supabase.rpc('increment_click_count', { 
          p_slug: slug,
          p_ip_hash: ip,
          p_device_type: deviceType,
          p_browser: browser,
          p_referrer: referrer,
          p_country: country
        })

        // 6. Redirect!
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
