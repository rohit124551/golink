# Deploy Guide — Client (Vercel)

> Frontend: React + Vite → Vercel
> Domain: `go.rohitkumarranjan.in`

---

## Prerequisites

- Node.js 18+
- A Vercel account (free) at vercel.com
- Your Supabase project URL and anon key
- Domain `rohitkumarranjan.in` managed in Cloudflare DNS

---

## Step 1 — Clone and install

```bash
git clone https://github.com/rohitkumarranjan/golink.git
cd golink/client
npm install
```

---

## Step 2 — Set up environment variables locally

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
VITE_SITE_URL=https://go.rohitkumarranjan.in
```

You get these values from:
- Supabase Dashboard → Settings → API

---

## Step 3 — Run locally to verify

```bash
npm run dev
```

Visit `http://localhost:5173`. You should see the landing page.

---

## Step 4 — Set up Supabase database

Run migrations in order in Supabase Dashboard → SQL Editor:

```bash
# Run these files in order:
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_indexes.sql
```

Then seed the admin user:

```bash
supabase/seed.sql
```

> The seed file creates your admin account. Edit the email + password in it before running.

---

## Step 5 — Configure Supabase Auth

In Supabase Dashboard → Authentication → Settings:

1. Set **Site URL** to `https://go.rohitkumarranjan.in`
2. Add redirect URL: `https://go.rohitkumarranjan.in/dashboard`
3. Disable **Email confirmations** (since this is single-user, you don't need this)
4. Disable **New user signups** — set `SIGNUP_DISABLED=true` in Auth settings so no one else can register

---

## Step 6 — Deploy to Vercel

### Option A — Vercel CLI (recommended)

```bash
npm install -g vercel
vercel login
vercel --prod
```

Follow the prompts:
- Project name: `golink`
- Root directory: `client`
- Build command: `npm run build` (auto-detected)
- Output directory: `dist` (auto-detected)

### Option B — Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Set root directory to `client`
4. Add env vars (Step 7 below) before deploying

---

## Step 7 — Add environment variables in Vercel

In Vercel Dashboard → Project → Settings → Environment Variables:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://YOUR_PROJECT_ID.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` |
| `VITE_SITE_URL` | `https://go.rohitkumarranjan.in` |

Set all three for: Production, Preview, Development.

---

## Step 8 — Add custom domain in Vercel

1. Vercel Dashboard → Project → Settings → Domains
2. Add: `go.rohitkumarranjan.in`
3. Vercel will show you a CNAME record to add

---

## Step 9 — Configure DNS in Cloudflare

In Cloudflare Dashboard → DNS → Records, add:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `go` | `cname.vercel-dns.com` | **OFF** (DNS only) |

> Important: Set proxy to **DNS only (grey cloud)** for Vercel to handle SSL.

Wait 1–5 minutes for DNS propagation.

---

## Step 10 — Verify deployment

Visit `https://go.rohitkumarranjan.in`:
- You should see the landing page
- Visit `/login` — you should see the login form
- Login with your admin credentials
- You should be redirected to `/dashboard`

---

## Ongoing — Automatic deploys

Every push to `main` branch on GitHub will auto-deploy to Vercel. No manual action needed.

---

## Troubleshooting

**White screen / 404 on refresh**
- Add `vercel.json` to `client/` root:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Auth redirect not working**
- Double-check Site URL and redirect URLs in Supabase Auth settings

**Env vars not showing up**
- Vercel requires a redeploy after adding env vars. Trigger one manually from the dashboard.

**CORS errors**
- Supabase anon key is correct but check Supabase Dashboard → API → Allowed origins. Add `https://go.rohitkumarranjan.in`.
