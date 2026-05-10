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

        // 3. Detect Analytics Details (Browser/Device)
        const userAgent = navigator.userAgent
        const referrer = document.referrer || 'Direct'
        const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent)
        const deviceType = isMobile ? 'Mobile' : 'Desktop'
        
        let browser = 'Other'
        if (userAgent.includes('Chrome')) browser = 'Chrome'
        else if (userAgent.includes('Firefox')) browser = 'Firefox'
        else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari'
        else if (userAgent.includes('Edge')) browser = 'Edge'

        // 4. Fetch IP and Country (using a free API)
        let ip = 'Unknown'
        let country = 'Unknown'
        try {
          const ipRes = await fetch('https://ipapi.co/json/').then(r => r.json())
          ip = ipRes.ip || 'Unknown'
          country = ipRes.country_name || 'Unknown'
        } catch (e) {
          console.warn('Could not fetch IP details:', e)
        }

        // 5. Track click with full details
        await supabase.rpc('increment_click_count', { 
          p_slug: slug,
          p_ip_hash: ip, // Use real IP as hash for accurate unique clicks!
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
