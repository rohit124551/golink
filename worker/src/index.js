import { handleRedirect } from './redirect.js'
import { trackClick } from './analytics.js'
import { isBot } from './security.js'
import { isValidSlug } from './security.js'

const PASSTHROUGH_PATHS = new Set(['/', '/login', '/dashboard'])
const DASHBOARD_PREFIX = '/dashboard/'

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname

    // Let React app handle these paths
    if (
      PASSTHROUGH_PATHS.has(path) ||
      path.startsWith(DASHBOARD_PREFIX) ||
      path.startsWith('/assets/') ||
      path.startsWith('/static/')
    ) {
      return fetch(request)
    }

    // Cache invalidation endpoint (called by Supabase webhook)
    if (path === '/cache-invalidate' && request.method === 'POST') {
      return handleCacheInvalidate(request, env)
    }

    // Slug redirect
    const slug = path.slice(1)

    if (!slug || !isValidSlug(slug)) {
      return new Response('Not found', { status: 404 })
    }

    const result = await handleRedirect(slug, env)

    if (!result) {
      return new Response('Link not found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      })
    }

    if (result.expired) {
      return new Response('Gone — this link has expired', {
        status: 410,
        headers: { 'Content-Type': 'text/plain' },
      })
    }

    if (result.disabled) {
      return new Response('This link is disabled', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      })
    }

    // Fire analytics asynchronously — don't block the redirect
    const userAgent = request.headers.get('User-Agent') || ''
    if (!isBot(userAgent)) {
      env.ctx?.waitUntil(trackClick(slug, request, env))
    }

    return Response.redirect(result.url, 301)
  },
}

async function handleCacheInvalidate(request, env) {
  const authHeader = request.headers.get('Authorization') || ''
  if (authHeader !== `Bearer ${env.WEBHOOK_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const slug = body?.record?.slug || body?.old_record?.slug

  if (slug) {
    await env.GOLINK_CACHE.delete(`slug:${slug}`)
  }

  return new Response('OK', { status: 200 })
}
