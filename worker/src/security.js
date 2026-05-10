const BOT_PATTERNS = [
  /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i,
  /baiduspider/i, /yandexbot/i, /facebookexternalhit/i,
  /twitterbot/i, /linkedinbot/i, /whatsapp/i,
  /curl/i, /wget/i, /python-requests/i, /go-http-client/i,
  /postman/i, /insomnia/i, /axios/i, /node-fetch/i,
  /ahrefs/i, /semrush/i, /mj12bot/i,
]

export function isBot(userAgent) {
  if (!userAgent) return true
  return BOT_PATTERNS.some(p => p.test(userAgent))
}

export function isValidSlug(slug) {
  return /^[a-zA-Z0-9_-]{1,50}$/.test(slug)
}

// Rate limiting using Cloudflare's native rate limit API
// (Handled via wrangler.toml rate_limits config)
