export async function trackClick(slug, request, env) {
  try {
    const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0'
    const country = request.headers.get('CF-IPCountry') || 'Unknown'
    const userAgent = request.headers.get('User-Agent') || ''
    const referrer = request.headers.get('Referer') || 'Direct'

    const deviceType = getDeviceType(userAgent)
    const browser = getBrowser(userAgent)

    // Extract UTM parameters or Query Params for better tracking
    const url = new URL(request.url)
    const utmSource = url.searchParams.get('utm_source') || url.searchParams.get('utm') || url.searchParams.get('ref')
    const finalReferrer = utmSource ? `Campaign: ${utmSource}` : (referrer || 'Direct')

    console.log(`Tracking click - IP: ${ip}, Country: ${country}, Referrer: ${finalReferrer}`)

    // Call the unified RPC that handles both stats and detailed logging
    const response = await fetch(
      `${env.SUPABASE_URL}/rest/v1/rpc/increment_click_count`,
      {
        method: 'POST',
        headers: {
          apikey: env.SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          p_slug: slug, 
          p_ip_hash: ip,
          p_country: country,
          p_device_type: deviceType,
          p_browser: browser,
          p_referrer: finalReferrer
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Supabase RPC Error (${response.status}):`, errorText)
    } else {
      console.log(`Successfully tracked click for /${slug}`)
    }
  } catch (err) {
    console.error('Analytics error:', err)
  }
}

async function hashIP(ip, salt) {
  const encoder = new TextEncoder()
  const data = encoder.encode(ip + salt)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16)
}

function getDeviceType(ua) {
  if (/mobile|android|iphone|ipad|ipod/i.test(ua)) return 'mobile'
  if (/tablet/i.test(ua)) return 'tablet'
  return 'desktop'
}

function getBrowser(ua) {
  if (/Edg\//i.test(ua)) return 'Edge'
  if (/OPR\//i.test(ua)) return 'Opera'
  if (/Chrome\//i.test(ua)) return 'Chrome'
  if (/Firefox\//i.test(ua)) return 'Firefox'
  if (/Safari\//i.test(ua)) return 'Safari'
  return 'Other'
}
