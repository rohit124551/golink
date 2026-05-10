# Deploy Guide — Worker (Cloudflare)

> Backend: Cloudflare Worker + KV
> Handles: All `/:slug` redirect requests globally at edge

---

## Prerequisites

- A Cloudflare account (free) at cloudflare.com
- Your domain `rohitkumarranjan.in` added to Cloudflare
- Node.js 18+
- Wrangler CLI (Cloudflare's deploy tool)
- Supabase project URL and anon key

---

## Step 1 — Install Wrangler

```bash
npm install -g wrangler
wrangler login
```

This opens a browser window. Authorize with your Cloudflare account.

---

## Step 2 — Clone and install

```bash
cd golink/worker
npm install
```

---

## Step 3 — Create Cloudflare KV namespace

KV is Cloudflare's key-value store. We use it to cache slug → URL lookups so the Worker doesn't call Supabase on every redirect.

```bash
# Create production KV namespace
wrangler kv:namespace create "GOLINK_CACHE"

# Create preview KV namespace (for local dev)
wrangler kv:namespace create "GOLINK_CACHE" --preview
```

Both commands output an `id`. Copy them — you'll need them in the next step.

---

## Step 4 — Configure wrangler.toml

Edit `worker/wrangler.toml`:

```toml
name = "golink-worker"
main = "src/index.js"
compatibility_date = "2024-01-01"

[vars]
SITE_URL = "https://go.rohitkumarranjan.in"

[[kv_namespaces]]
binding = "GOLINK_CACHE"
id = "YOUR_PRODUCTION_KV_ID_HERE"
preview_id = "YOUR_PREVIEW_KV_ID_HERE"

[triggers]
routes = [
  { pattern = "go.rohitkumarranjan.in/*", zone_name = "rohitkumarranjan.in" }
]
```

Replace `YOUR_PRODUCTION_KV_ID_HERE` and `YOUR_PREVIEW_KV_ID_HERE` with the IDs from Step 3.

---

## Step 5 — Set secrets (never in code)

Secrets are encrypted and injected at runtime. Run these one by one:

```bash
wrangler secret put SUPABASE_URL
# Paste: https://YOUR_PROJECT_ID.supabase.co

wrangler secret put SUPABASE_ANON_KEY
# Paste: eyJ... (your anon key)

wrangler secret put SUPABASE_SERVICE_KEY
# Paste: eyJ... (your service_role key — for write operations)
```

> The service_role key is needed for the Worker to write click analytics to Supabase. Keep it secret — never commit it.

---

## Step 6 — Test locally

```bash
wrangler dev
```

The Worker runs locally at `http://localhost:8787`.

Test a redirect:
```bash
# First create a test link in your dashboard, then:
curl -I http://localhost:8787/test-slug
# Should return: HTTP/1.1 301 Moved Permanently
# Location: https://your-destination-url.com
```

---

## Step 7 — Deploy to Cloudflare

```bash
wrangler deploy
```

Output will confirm:
```
✅ Deployed golink-worker
   go.rohitkumarranjan.in/*
```

---

## Step 8 — Configure DNS for Worker route

In Cloudflare Dashboard → DNS → Records:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| AAAA | `go` | `100::` | **ON** (Proxied — orange cloud) |

> The `100::` is a dummy IPv6 address. Since the route is proxied, Cloudflare intercepts the request before it reaches the dummy address. The Worker handles everything.

> If you already added a CNAME for `go` pointing to Vercel (from DEPLOY_CLIENT.md), **remove it** — the Worker route takes priority for `/:slug` paths, and Vercel handles `/`, `/login`, `/dashboard`.

---

## Routing Logic — How it works

Cloudflare routes requests based on the path:

```
go.rohitkumarranjan.in/          → Vercel (React app)
go.rohitkumarranjan.in/login     → Vercel (React app)
go.rohitkumarranjan.in/dashboard → Vercel (React app)
go.rohitkumarranjan.in/:slug     → Cloudflare Worker
```

The Worker's `index.js` checks the path first:
- If path is `/`, `/login`, or `/dashboard` → pass through to Vercel (fetch from origin)
- Anything else → treat as a slug → lookup → redirect

---

## Step 9 — Verify live

```bash
# Test redirect
curl -I https://go.rohitkumarranjan.in/github
# Expected: 301 → https://github.com/rohitkumarranjan

# Test 404
curl -I https://go.rohitkumarranjan.in/doesnotexist
# Expected: 404

# Test expired link (set an expiry in dashboard first)
curl -I https://go.rohitkumarranjan.in/expired-slug
# Expected: 410 Gone
```

---

## Step 10 — Set up KV cache invalidation

When you update or delete a link in the dashboard, the KV cache must be cleared for that slug. This happens automatically via a Supabase database webhook:

1. Supabase Dashboard → Database → Webhooks
2. Create webhook on `short_links` table, events: `UPDATE`, `DELETE`
3. URL: `https://golink-worker.YOUR_SUBDOMAIN.workers.dev/cache-invalidate`
4. Add header: `Authorization: Bearer YOUR_WEBHOOK_SECRET`

Set the webhook secret:
```bash
wrangler secret put WEBHOOK_SECRET
# Paste your chosen secret string
```

---

## Monitoring

View real-time logs:
```bash
wrangler tail
```

View analytics in Cloudflare Dashboard → Workers → golink-worker → Analytics:
- Requests per day
- CPU time
- Error rate

---

## Updating the Worker

Any time you change Worker code:

```bash
wrangler deploy
```

Zero downtime. Cloudflare deploys globally in ~15 seconds.

---

## Troubleshooting

**Worker not triggering (requests going to Vercel instead)**
- Check route pattern in `wrangler.toml` matches your domain exactly
- Check DNS record for `go` is proxied (orange cloud), not DNS-only

**KV cache returning stale data**
- Manually clear a key: `wrangler kv:key delete --namespace-id=YOUR_ID "slug:github"`
- Or just wait — cache TTL is 60 seconds

**Supabase connection refused from Worker**
- Check `SUPABASE_URL` secret has no trailing slash
- Check Supabase project is not paused (free tier pauses after 1 week inactivity)

**401 from Supabase in Worker logs**
- Service key may have expired or been rotated. Re-run `wrangler secret put SUPABASE_SERVICE_KEY`

**Rate limit errors**
- Worker has a 30 req/min per-IP rate limit. Adjust in `security.js` if needed.
