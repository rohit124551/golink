const CACHE_TTL = 60 // seconds

export async function handleRedirect(slug, env) {
  console.log(`Checking slug: ${slug}`)
  // 1. Check KV cache first
  const cached = await env.GOLINK_CACHE.get(`slug:${slug}`, { type: 'json' })
  if (cached) {
    console.log(`Cache hit for slug: ${slug}`, cached)
    if (cached.expired) return { expired: true }
    if (!cached.is_active) return { disabled: true }
    return { url: cached.destination_url }
  }

  console.log(`Cache miss for slug: ${slug}, fetching from Supabase...`)
  console.log(`Using URL: ${env.SUPABASE_URL}`)
  console.log(`Service Key length: ${env.SUPABASE_SERVICE_KEY?.length || 0}`)

  // 2. Fallback to Supabase
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/short_links?slug=eq.${encodeURIComponent(slug)}&select=slug,destination_url,is_active,expires_at`,
    {
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      },
    }
  )

  if (!res.ok) {
    const errorText = await res.text()
    console.error(`Supabase fetch failed: ${res.status} ${res.statusText}`, errorText)
    return null
  }

  const data = await res.json()
  console.log(`Supabase response data:`, data)
  const link = data?.[0]

  if (!link) return null

  // 3. Check expiry
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    await env.GOLINK_CACHE.put(`slug:${slug}`, JSON.stringify({ expired: true }), { expirationTtl: CACHE_TTL })
    return { expired: true }
  }

  // 4. Check active
  if (!link.is_active) {
    await env.GOLINK_CACHE.put(`slug:${slug}`, JSON.stringify({ is_active: false }), { expirationTtl: CACHE_TTL })
    return { disabled: true }
  }

  // 5. Cache and return
  await env.GOLINK_CACHE.put(
    `slug:${slug}`,
    JSON.stringify({ destination_url: link.destination_url, is_active: true }),
    { expirationTtl: CACHE_TTL }
  )

  return { url: link.destination_url }
}
