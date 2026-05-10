# UI/UX Design Prompt — go.rohitkumarranjan.in

Use this prompt verbatim in v0.dev, Lovable, or Cursor to generate the frontend.

---

## PROMPT

Build a production-grade personal URL shortener web app called **GoLink** for `go.rohitkumarranjan.in`. This is a solo developer's personal project — not a SaaS, not a startup. The UI should feel like a senior engineer's internal tool: confident, minimal, precise. Think Vercel's dashboard crossed with Linear's density. No marketing fluff, no hero illustrations, no gradient blobs.

---

### Design System

**Typography**
- Font: Inter (weights: 400, 500, 600 only — never 700+)
- Base: 14px / 1.5 line-height
- Monospace (slugs, URLs): `JetBrains Mono` or `Fira Code`

**Color palette — dual light/dark theme**

The palette must feel sharp in both modes. Use CSS variables for everything. No hardcoded hex in components.

```css
:root {
  /* Surfaces */
  --bg-base: #ffffff;
  --bg-surface: #f8f8f7;
  --bg-elevated: #f2f1ef;
  --bg-overlay: rgba(0,0,0,0.04);

  /* Borders */
  --border-subtle: rgba(0,0,0,0.07);
  --border-default: rgba(0,0,0,0.12);
  --border-strong: rgba(0,0,0,0.2);

  /* Text */
  --text-primary: #111110;
  --text-secondary: #6f6e6a;
  --text-tertiary: #9d9c97;
  --text-mono: #111110;

  /* Brand accent — one color, used sparingly */
  --accent: #4f46e5;          /* indigo */
  --accent-hover: #4338ca;
  --accent-subtle: #eef2ff;
  --accent-text: #4338ca;

  /* Semantic */
  --success: #16a34a;
  --success-subtle: #f0fdf4;
  --danger: #dc2626;
  --danger-subtle: #fef2f2;
  --warning: #d97706;
  --warning-subtle: #fffbeb;
  --muted: #9d9c97;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 10px;

  /* Shadow */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04);
}

[data-theme="dark"] {
  --bg-base: #111110;
  --bg-surface: #1a1a18;
  --bg-elevated: #222220;
  --bg-overlay: rgba(255,255,255,0.04);

  --border-subtle: rgba(255,255,255,0.06);
  --border-default: rgba(255,255,255,0.1);
  --border-strong: rgba(255,255,255,0.18);

  --text-primary: #ededec;
  --text-secondary: #9d9c97;
  --text-tertiary: #6f6e6a;
  --text-mono: #d4d4d0;

  --accent: #6366f1;
  --accent-hover: #818cf8;
  --accent-subtle: rgba(99,102,241,0.12);
  --accent-text: #818cf8;

  --success: #22c55e;
  --success-subtle: rgba(22,163,74,0.12);
  --danger: #f87171;
  --danger-subtle: rgba(220,38,38,0.12);
  --warning: #fbbf24;
  --warning-subtle: rgba(217,119,6,0.12);
}
```

**Component rules**
- Buttons: flat, no shadows. Border-radius: `var(--radius-md)`. Use `border: 1px solid var(--border-default)` for secondary buttons.
- Inputs: background `var(--bg-surface)`, border `var(--border-default)`, focus ring `2px solid var(--accent)` with `1px offset`.
- Cards: background `var(--bg-surface)`, border `1px solid var(--border-subtle)`, radius `var(--radius-lg)`, no shadow on cards unless elevated.
- Tables: zebra-stripe with `var(--bg-overlay)`. No external borders on table rows — only a bottom border `var(--border-subtle)`.
- No gradients anywhere. No border glow. No box-shadow on interactive states — use border color change instead.
- Transitions: `150ms ease` for hover/focus. Never longer.

---

### Pages to Build

---

#### 1. Landing Page (`/`)

**Purpose**: Public-facing index. Explains what this tool is. Converts visitors into appreciating it's a personal project.

**Layout**: Full-width, single column, max-width 760px centered.

**Sections (top to bottom):**

**Header / Nav** (sticky, height 52px)
- Left: Logo — monospace text `go.` in accent color + `rohitkumarranjan.in` in secondary text. No icon.
- Right: Theme toggle (sun/moon icon, no label) + `Dashboard` button (primary, small)
- Border-bottom: `var(--border-subtle)`. Background: `var(--bg-base)` with `backdrop-filter: blur(8px)` when scrolled.

**Hero** (padding-top: 80px)
- Badge above headline: small pill, border `var(--border-default)`, text `Personal project · Open source`. Monospace font. Accent dot before text.
- Headline (h1, 42px, weight 600): `Short links. Full control.`
- Subheadline (18px, `var(--text-secondary)`, max-width 480px): `A personal URL shortener running on Cloudflare's edge. Sub-50ms redirects, click analytics, zero monthly cost.`
- Two stat pills inline below subheadline:
  - `⚡ Edge-native` (Cloudflare Workers)
  - `📊 Click analytics`
  - `🔒 Single-user secure`
  - Style: small rounded pill, `var(--bg-elevated)` background, `var(--border-default)` border, 12px text
- No CTA button — this is personal, not a product. Just the stats.

**How it works** (3 cards, horizontal row on desktop, stacked on mobile)
- Card 1: Icon (link), Title: `Paste any URL`, Body: `Get a short link at go.rohitkumarranjan.in/slug — custom or auto-generated.`
- Card 2: Icon (zap), Title: `Edge redirect`, Body: `Cloudflare Workers resolve slugs at the nearest of 300+ locations globally.`
- Card 3: Icon (bar-chart), Title: `Click analytics`, Body: `Every click tracked: country, device, referrer, timestamp. No third-party scripts.`
- Card style: `var(--bg-surface)` background, `1px solid var(--border-subtle)` border, padding 20px, radius `var(--radius-lg)`.

**Tech stack section** (simple 2-column list, no cards)
```
Cloudflare Workers    Edge redirect engine
Cloudflare KV         Sub-ms slug cache
Supabase              Database + auth
Vercel                Dashboard hosting
```
Label: `Built with` in tertiary text. Items in two columns, monospace font for the left column.

**Footer** (minimal, border-top, 52px height)
- Left: `go.rohitkumarranjan.in` in tertiary text
- Center: links — `Portfolio` · `GitHub` · `Email` — in tertiary text, hover accent
- Right: `Made by Rohit Kumar Ranjan`
- No copyright. No year. No legal. This is personal.

---

#### 2. Login Page (`/login`)

**Purpose**: Admin authentication. One person uses this. Make it feel secure and intentional — not a generic form.

**Layout**: Full screen. Centered card. Vertically centered.

**Card** (width: 360px, padding: 32px, `var(--bg-surface)` background, `var(--border-default)` border, `var(--radius-lg)` radius):

- Top of card: small monospace label `go.rohitkumarranjan.in` in tertiary text
- Heading (18px, weight 600): `Admin access`
- Subtext (13px, secondary): `This instance is private. One account only.`
- Divider (subtle, `var(--border-subtle)`)
- Email input (full width, label above: `Email`)
- Password input (full width, label above: `Password`, show/hide toggle inside input)
- Sign in button (full width, primary, height 38px): `Sign in`
- Below button, small text in tertiary: `Forgot your password? Update it in Supabase Auth.` — no link, just information.
- No "remember me", no "sign up", no social auth. This is intentional minimalism.

**States:**
- Loading: button shows spinner + `Signing in...`
- Error: inline error below the form in a small danger-colored box, never a toast. Text: `Invalid credentials.` or `Too many attempts. Try again in 60s.`

**Background**: `var(--bg-base)`. A single thin horizontal line grid pattern using `var(--border-subtle)` at 5% opacity — achieved with CSS background-image, not an SVG. Gives depth without decoration.

---

#### 3. Dashboard (`/dashboard`)

**Purpose**: Main admin view. Manage all links. View top-level analytics summary. This is where you live.

**Layout**: Sidebar + main content. Sidebar 220px fixed, collapsible on mobile.

**Sidebar**
- Logo at top: same as landing nav
- Navigation items (with icons from Lucide): `Dashboard` (home), `Links` (link), `Analytics` (bar-chart), `Settings` (settings)
- Active state: `var(--bg-elevated)` background, left border `2px solid var(--accent)`, text `var(--text-primary)`.
- Bottom of sidebar: user info — email address in small tertiary text, theme toggle, logout button.
- Sidebar background: `var(--bg-surface)`, right border: `var(--border-subtle)`.

**Top bar** (main content area)
- Left: Page title — `Links` (h2, 18px, weight 600)
- Right: `New link` button (primary, with `+` icon)

**Analytics summary strip** (4 cards, horizontal row, below top bar)
Each stat card: compact, border `var(--border-subtle)`, padding 16px, radius `var(--radius-lg)`, background `var(--bg-surface)`.
- `Total links` — number in large monospace
- `Total clicks` — number in large monospace
- `Clicks today` — number with a green up-arrow if > yesterday
- `Active links` — number with badge

**Links table** (below stats)
Columns:
1. **Slug** — `go.rohitkumarranjan.in/github` — full short URL in monospace, copyable (click copies, shows "Copied" toast for 1.5s)
2. **Destination** — truncated to 40 chars, hover shows full URL in a tooltip
3. **Clicks** — right-aligned, number
4. **Status** — badge: `Active` (success subtle) / `Disabled` (muted) / `Expired` (danger subtle)
5. **Created** — relative date (e.g. `3 days ago`)
6. **Actions** — three-dot menu: `Copy link`, `Edit`, `View analytics`, `Toggle active`, `Delete`

Table behavior:
- Clicking a row opens the link detail page
- Sortable columns (clicks, created)
- Search bar above table: filters slugs and destinations in real time (client-side, no API call)
- Empty state: centered, icon, text: `No links yet. Create your first short link.`, button.

**Create / Edit Link modal** (triggered by "New link" or "Edit")
Modal width: 480px, background `var(--bg-base)`, border `var(--border-default)`, radius `var(--radius-lg)`.

Fields:
- **Destination URL** (required): full-width input, placeholder `https://example.com/very/long/url`
- **Custom slug** (optional): inline with prefix label `go.rohitkumarranjan.in/` greyed out, input for slug. Below: `Leave empty to auto-generate a 5-character slug.`
- **Expiry date** (optional): date picker, placeholder `Never`. Small hint: `Link will return 410 after this date.`
- **Active** toggle: on by default

Submit button: `Create link` / `Save changes`
Validation: inline, below each field. Never a generic "Form has errors" message.

---

#### 4. Link Analytics Page (`/dashboard/links/:slug`)

**Purpose**: Deep analytics for one link.

**Header**: 
- Back arrow → `Links`
- Title: monospace slug in large text: `/github`
- Destination URL below (secondary, truncated)
- Row of action buttons: `Copy short link`, `Edit`, `Toggle active`, `Delete`

**Stats row** (same style as dashboard summary strip):
- Total clicks, Unique clicks, Click rate (unique/total), Last clicked (relative time)

**Click chart** (main visual element)
- Line chart (recharts), showing clicks per day for last 30 days
- X-axis: dates. Y-axis: click count. Clean axis lines, no grid background.
- Hover tooltip: date + click count, styled as `var(--bg-elevated)` with border.
- Range selector: `7 days` / `30 days` / `All time` — small pill tabs above chart.
- Chart accent color: `var(--accent)`.

**Analytics breakdown** (two columns below chart)

Left column — **Top countries** (horizontal bar chart, simple)
- Flag emoji + country name + bar + count
- Maximum 10 rows
- Bar color: `var(--accent-subtle)` with `var(--accent)` fill

Right column — **Top referrers**
- Domain name + count, simple list
- `Direct / unknown` for no-referrer clicks
- Maximum 10 rows

Bottom — **Recent clicks** (table)
Columns: Timestamp · Country · Device · Browser · Referrer
Compact rows, 12px font. No pagination — last 50 clicks. Shows `—` for unknown values.

---

### Global Behaviors

**Theme toggle**
- Stores preference in `localStorage`
- Respects `prefers-color-scheme` on first visit
- Toggle is a simple icon button (sun / moon) — no label, no animation
- Switching applies `data-theme="dark"` to `<html>` element

**Toast notifications**
- Bottom-right corner
- Auto-dismiss after 3 seconds
- Types: success (green left border), error (red left border), info (accent left border)
- Text only — no icons in toasts. Keep them small.
- Stack vertically if multiple.

**Loading states**
- Skeleton loading on tables and charts — not spinners. Match the shape of the content.
- Skeleton: `var(--bg-elevated)` animated with a subtle shimmer (CSS animation, left-to-right, 1.5s loop).

**Empty states**
- Center-aligned in their container
- Simple icon (from Lucide), one line of text, optional action button
- No illustrations, no confetti, no lottie animations.

**Error states**
- Inline in forms: small red text below the field
- Page-level errors: a simple alert bar below the top bar, dismissible
- Network errors: toast

**Mobile (< 768px)**
- Sidebar collapses to a bottom tab bar (4 icons, no labels)
- Links table collapses to cards (slug + destination + clicks + action button per card)
- Charts remain full-width, readable

---

### Implementation Notes

**Stack**: React 18 + Vite. No Next.js (this deploys to Vercel as a SPA).

**Routing**: React Router v6. Protected routes redirect to `/login` if no Supabase session.

**State**: React Query for server state (links, analytics). No Redux.

**Auth flow**:
1. App loads → check Supabase session
2. If session exists → redirect `/` and `/login` to `/dashboard`
3. If no session → protect `/dashboard` and `/dashboard/*`, redirect to `/login`

**Charts**: recharts. No D3. No chart.js.

**Icons**: Lucide React. Not heroicons, not fontawesome.

**Dates**: date-fns. Format relative dates (`3 days ago`) and chart axis labels.

**Copy to clipboard**: `navigator.clipboard.writeText`. Show "Copied!" tooltip for 1.5 seconds, then revert.

**No UI library** (no shadcn, no MUI, no Chakra). Build components from scratch using the design system above. This produces cleaner code and better control.

---

### File structure to generate

```
client/src/
├── components/
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Badge.jsx
│   │   ├── Modal.jsx
│   │   ├── Toast.jsx
│   │   ├── Skeleton.jsx
│   │   └── Tooltip.jsx
│   ├── Sidebar.jsx
│   ├── Navbar.jsx
│   ├── LinkRow.jsx
│   ├── LinkCard.jsx          (mobile)
│   ├── StatCard.jsx
│   ├── ClickChart.jsx
│   ├── CountryBar.jsx
│   └── CreateLinkModal.jsx
├── pages/
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   └── LinkDetail.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useLinks.js
│   └── useAnalytics.js
├── lib/
│   ├── supabase.js
│   └── utils.js
└── styles/
    ├── globals.css
    └── theme.css
```

---

### What NOT to do

- No gradient backgrounds
- No hero illustrations or 3D graphics
- No excessive animation (links flying in, counters counting up, etc.)
- No confetti on link creation
- No marketing copy anywhere in the dashboard
- No "Powered by" badges
- No cookie banners or GDPR popups (single user, no tracking of others)
- No placeholder stock photos
- No dark cards on dark backgrounds (ensure contrast always)
- No color-only status indicators — always pair color with text label or icon

---

This is a tool built by a developer, for themselves. It should feel like the tools senior engineers build when they get tired of bad ones.
