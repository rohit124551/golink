# go.rohitkumarranjan.in — Personal URL Shortener

> A production-grade, self-hosted URL shortener with analytics, built on Cloudflare Workers + Supabase. Personal project by [Rohit Kumar Ranjan](https://rohitkumarranjan.in).

[![Personal Project](https://img.shields.io/badge/type-personal%20project-blueviolet)](https://rohitkumarranjan.in)
[![Stack](https://img.shields.io/badge/stack-Cloudflare%20Workers%20%2B%20Supabase%20%2B%20Vercel-orange)](https://rohitkumarranjan.in)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Status](https://img.shields.io/badge/status-active-brightgreen)](https://go.rohitkumarranjan.in)

---

## What This Is

A fully personal URL shortener running at `go.rohitkumarranjan.in`. It lets me:

- Create short links like `go.rohitkumarranjan.in/github` → my GitHub
- Track clicks, referrers, countries, and devices per link
- Enable/disable links, set expiry dates, edit destinations
- View analytics per-link and across the whole dashboard
- Log in securely via email + password (single admin)

This is **not** a multi-user SaaS. It is a personal tool, purpose-built for my own use and portfolio.

---

## Live Demo

| URL | Description |
|-----|-------------|
| `go.rohitkumarranjan.in` | Landing page (public) |
| `go.rohitkumarranjan.in/dashboard` | Admin dashboard (auth required) |
| `go.rohitkumarranjan.in/:slug` | Redirect endpoint (public) |

---

## Architecture

```
User browser
    │
    ▼
go.rohitkumarranjan.in (Cloudflare DNS)
    │
    ├──→ / or /login or /dashboard
    │         └──→ Vercel (React frontend)
    │
    └──→ /:slug (any short link)
              └──→ Cloudflare Worker (edge redirect)
                        │
                        ├──→ Cloudflare KV (cache — slug → url)
                        └──→ Supabase (source of truth + analytics)
                                    │
                                    └──→ api.ipify.org (IP lookup for analytics)
```

### Why this split?

- **Cloudflare Worker** handles all redirects. It runs at 300+ edge locations globally — redirects are sub-50ms anywhere in the world. No cold starts.
- **Cloudflare KV** caches active slugs so the Worker doesn't need to call Supabase on every hit. Cache TTL is 60 seconds.
- **Supabase** is the source of truth. All link management, analytics, and auth data lives here.
- **Vercel** serves the React dashboard and landing page. These are not latency-sensitive.

---

## Project Structure

```
golink/
├── client/                         # React + Vite frontend (Vercel)
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                 # Reusable design system components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── Table.jsx
│   │   │   ├── LinkCard.jsx        # Single link row in dashboard
│   │   │   ├── AnalyticsChart.jsx  # Click chart (recharts)
│   │   │   ├── CreateLinkModal.jsx # Create/edit link form
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx         # Public index page
│   │   │   ├── Login.jsx           # Auth page
│   │   │   ├── Dashboard.jsx       # Main admin view
│   │   │   └── LinkDetail.jsx      # Per-link analytics
│   │   ├── lib/
│   │   │   ├── supabase.js         # Supabase client + auth helpers
│   │   │   ├── api.js              # API calls to Supabase REST
│   │   │   └── utils.js            # Slug gen, date format, copy helpers
│   │   ├── hooks/
│   │   │   ├── useAuth.js          # Auth state + redirect guard
│   │   │   ├── useLinks.js         # Links CRUD with optimistic updates
│   │   │   └── useAnalytics.js     # Analytics queries
│   │   ├── styles/
│   │   │   ├── globals.css         # CSS variables, reset, theme tokens
│   │   │   └── theme.css           # Light/dark mode definitions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── worker/                         # Cloudflare Worker (Wrangler)
│   ├── src/
│   │   ├── index.js                # Main worker entrypoint + routing
│   │   ├── redirect.js             # Core slug lookup + redirect logic
│   │   ├── analytics.js            # Click tracking (async, non-blocking)
│   │   ├── geo.js                  # IP → country via CF headers
│   │   └── security.js             # Rate limiting + bot detection
│   └── wrangler.toml               # Cloudflare Worker config
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql  # short_links + link_clicks tables
│   │   ├── 002_rls_policies.sql    # Row Level Security policies
│   │   └── 003_indexes.sql         # Performance indexes
│   └── seed.sql                    # Initial admin user seed
│
├── docs/
│   ├── DEPLOY_CLIENT.md            # Step-by-step Vercel deploy guide
│   ├── DEPLOY_SERVER.md            # Step-by-step Cloudflare Worker deploy guide
│   └── SECURITY.md                 # Security decisions documented
│
├── .env.example                    # All required env vars documented
├── README.md                       # This file
└── LICENSE
```

---

## Database Schema

### `short_links`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Auto-generated |
| `slug` | text (UNIQUE) | The short keyword, e.g. `github` |
| `destination_url` | text | Full URL to redirect to |
| `is_active` | boolean | Toggle without deleting |
| `is_custom` | boolean | `true` if user chose the slug |
| `expires_at` | timestamptz | Null = never expires |
| `click_count` | integer | Total click counter |
| `unique_clicks` | integer | Rough unique (by hashed IP) |
| `last_clicked_at` | timestamptz | Most recent click timestamp |
| `created_at` | timestamptz | Creation timestamp |

### `link_clicks`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Auto-generated |
| `slug` | text | Foreign key to `short_links.slug` |
| `clicked_at` | timestamptz | Click timestamp |
| `referrer` | text | HTTP Referer header |
| `country` | text | From Cloudflare CF-IPCountry header |
| `device_type` | text | `mobile` / `desktop` / `bot` |
| `browser` | text | Parsed from User-Agent |
| `ip_hash` | text | SHA-256 of IP — never store raw IP |

> **Privacy note:** Raw IP addresses are never stored. The Worker hashes the IP with SHA-256 before writing to the database, making analytics possible without storing PII.

---

## Security Design

| Concern | Solution |
|---------|----------|
| Admin auth | Supabase Auth (bcrypt passwords, JWT sessions) |
| RLS | Row Level Security on all tables — dashboard reads require valid JWT |
| IP privacy | IPs hashed with SHA-256 before storage — no raw IPs in DB |
| Bot filtering | User-Agent check in Worker — known bots don't count as clicks |
| Rate limiting | Cloudflare Worker rate limits: 30 redirect req/min per IP |
| HTTPS | Enforced everywhere — Cloudflare SSL + Vercel SSL |
| Secrets | All credentials in env vars / Cloudflare secrets — never in code |
| Open redirect | Only absolute URLs allowed. URL validated against allowlist patterns |
| Slug injection | Slugs validated against `^[a-zA-Z0-9_-]{1,50}$` |

---

## Analytics Tracked

Per click:
- Timestamp
- Country (from Cloudflare `CF-IPCountry` header — zero API cost)
- Device type (mobile/desktop — from User-Agent)
- Browser (Chrome/Firefox/Safari/etc)
- Referrer domain
- Hashed IP (for rough unique counting)

Per link summary:
- Total clicks
- Unique clicks (estimated)
- Last clicked
- Clicks over time (daily/weekly/monthly chart)
- Top countries breakdown
- Top referrers

---

## Environment Variables

```env
# client/.env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# worker/wrangler.toml (secrets set via `wrangler secret put`)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
KV_NAMESPACE_ID=xxxx          # Cloudflare KV binding
```

---

## Deploying

See:
- [`docs/DEPLOY_CLIENT.md`](docs/DEPLOY_CLIENT.md) — Vercel frontend deploy
- [`docs/DEPLOY_SERVER.md`](docs/DEPLOY_SERVER.md) — Cloudflare Worker deploy

---

## Tech Stack

| Layer | Tool | Why |
|-------|------|-----|
| Redirect engine | Cloudflare Workers | Edge-native, zero cold starts, 100k req/day free |
| Slug cache | Cloudflare KV | Sub-ms reads at edge |
| Database | Supabase (PostgreSQL) | Auth, RLS, REST API, free tier |
| Frontend | React + Vite | Familiar, fast HMR, easy Vercel deploy |
| Hosting | Vercel | Free, automatic previews, custom domain |
| DNS + CDN | Cloudflare | Free, global, DDoS protection |

---

## Personal Project Notice

This is a personal project by **Rohit Kumar Ranjan**. It is open source (MIT) for learning and portfolio purposes. It is not a multi-user SaaS and has no plans to become one.

- Portfolio: [rohitkumarranjan.in](https://rohitkumarranjan.in)
- Email: contact@rohitkumarranjan.in
- GitHub: [@rohitkumarranjan](https://github.com/rohitkumarranjan)

---

## License

MIT — do whatever you want, attribution appreciated.
