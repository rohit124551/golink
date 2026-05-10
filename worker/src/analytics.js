export async function trackClick(slug, request, env) {
  try {
    const ip = request.headers.get('CF-Connecting-IP') || ''
    const ipHash = await hashIP(ip, env.IP_SALT || 'default-salt')
    const country = request.headers.get('CF-IPCountry') || null
    const userAgent = request.headers.get('User-Agent') || ''
    const referrer = request.headers.get('Referer') || null

    const deviceType = getDeviceType(userAgent)
    const browser = getBrowser(userAgent)

    const payload = {
      slug,
      clicked_at: new Date().toISOString(),
      country,
      device_type: deviceType,
      browser,
      referrer,
      ip_hash: ipHash,
    }

    // Write click to Supabase (using service key)
    await fetch(`${env.SUPABASE_URL}/rest/v1/link_clicks`, {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    })

    // Increment click_count on short_links
    await fetch(
      `${env.SUPABASE_URL}/rest/v1/rpc/increment_click_count`,
      {
        method: 'POST',
        headers: {
          apikey: env.SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ p_slug: slug, p_ip_hash: ipHash }),
      }
    )
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
