# Security Documentation

> Decisions, threat model, and hardening notes for go.rohitkumarranjan.in

---

## Threat Model

This is a personal URL shortener. The realistic threats are:

| Threat | Likelihood | Impact | Mitigated? |
|--------|-----------|--------|-----------|
| Someone brute-forces login | Medium | High | ✅ Rate limit + lockout |
| Open redirect abuse (redirect to phishing) | Medium | High | ✅ URL validation |
| Dashboard access without login | Medium | High | ✅ Supabase RLS + JWT guard |
| Click inflation / analytics abuse | Low | Low | ✅ Bot UA filter + rate limit |
| Slug enumeration | Low | Low | ✅ Slugs are not sequential |
| Raw IP exposure in analytics | Medium | Medium | ✅ SHA-256 hashed IPs only |
| Secret key exposure | Low | Critical | ✅ Env vars / Cloudflare secrets |
| DDoS on redirect endpoint | Low | Medium | ✅ Cloudflare absorbs it |

---

## Auth Security

**Technology**: Supabase Auth (bcrypt + JWT)

- Passwords are bcrypt-hashed by Supabase — never stored in plaintext
- Sessions use short-lived JWTs (1 hour) + refresh tokens
- Signup is **disabled** after initial admin creation — no one else can register
- Login is rate-limited at the Supabase level (5 attempts before cooldown)
- All dashboard API calls require a valid JWT in the `Authorization` header

**Single admin pattern:**
```sql
-- After creating your account, run this to disable signups:
UPDATE auth.config SET enable_signup = false;
```

---

## Row Level Security (RLS)

All Supabase tables have RLS enabled. Policies:

```sql
-- short_links: only authenticated users (your admin) can read/write
CREATE POLICY "admin_only" ON short_links
  USING (auth.role() = 'authenticated');

-- link_clicks: Worker writes using service_role (bypasses RLS)
-- Dashboard reads using authenticated JWT
CREATE POLICY "admin_read_clicks" ON link_clicks
  FOR SELECT USING (auth.role() = 'authenticated');
```

The Worker uses the `service_role` key only for INSERT into `link_clicks`. This key is stored as a Cloudflare secret, never in code.

---

## IP Privacy

Raw IP addresses are **never stored**. The Worker hashes IPs before writing:

```js
async function hashIP(ip) {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + process.env.IP_SALT);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('').slice(0, 16); // truncate to 16 chars
}
```

A salt (`IP_SALT`) is added before hashing so the hash is not reversible even with rainbow tables. The salt is stored as a Cloudflare secret.

This gives us:
- Rough unique click counting (same hashed IP = same person)
- No GDPR/privacy exposure (hash is not PII)

---

## URL Validation (Open Redirect Prevention)

Destination URLs are validated before being stored:

```js
function isValidDestination(url) {
  try {
    const parsed = new URL(url);
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    // Block private IPs (SSRF prevention)
    if (/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)/
        .test(parsed.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}
```

This prevents:
- `javascript:` protocol XSS
- `file:` protocol access
- SSRF via private IP ranges
- Malformed URLs

---

## Slug Validation

Slugs are validated against a strict regex:

```js
const SLUG_PATTERN = /^[a-zA-Z0-9_-]{1,50}$/;
```

This prevents:
- Path traversal (`../etc/passwd`)
- SQL injection via slug (Supabase parameterized queries also handle this)
- XSS via slug
- Excessively long slugs

---

## Rate Limiting

The Worker enforces rate limits using Cloudflare's built-in IP tracking:

```js
// 30 redirect requests per minute per IP
// 5 API requests per minute per IP (for any future API endpoints)
```

Cloudflare's free tier also provides:
- DDoS protection (L3/L4)
- Bot management (basic)
- Automatic HTTPS

---

## Bot Filtering for Analytics

Known bots are excluded from click counts:

```js
const BOT_PATTERNS = [
  /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i,
  /baiduspider/i, /yandexbot/i, /facebookexternalhit/i,
  /twitterbot/i, /linkedinbot/i, /whatsapp/i,
  /curl/i, /wget/i, /python-requests/i, /go-http-client/i,
  /postman/i, /insomnia/i, /axios/i,
];

function isBot(userAgent) {
  if (!userAgent) return true; // No UA = likely bot
  return BOT_PATTERNS.some(p => p.test(userAgent));
}
```

This keeps analytics meaningful — only real human clicks are counted.

---

## Secrets Management

| Secret | Where stored | Never in |
|--------|-------------|----------|
| `SUPABASE_URL` | Cloudflare secret + Vercel env | Code |
| `SUPABASE_ANON_KEY` | Cloudflare secret + Vercel env | Code |
| `SUPABASE_SERVICE_KEY` | Cloudflare secret only | Code, Vercel (not needed there) |
| `IP_SALT` | Cloudflare secret | Code |
| `WEBHOOK_SECRET` | Cloudflare secret | Code |

`.env` files are in `.gitignore`. `.env.example` contains only key names, no values.

---

## HTTPS

- Cloudflare SSL: Full (strict) mode — encrypts both browser→CF and CF→origin
- Vercel: Automatic TLS certificates
- HSTS header set by Cloudflare

---

## Audit Logging

Every link click is logged to `link_clicks` with timestamp. This means:

- You can audit when any link was accessed
- You can detect unusual click patterns (click flooding)
- Supabase logs all auth events (login, failed login)

---

## DevOps / Hardening Checklist

From your Cyber + DevOps background — things to check off:

- [ ] Supabase signup disabled after admin creation
- [ ] RLS enabled on all tables (verify in Supabase Dashboard → Table Editor → RLS)
- [ ] Service role key rotated and stored only in Cloudflare secrets
- [ ] `IP_SALT` set (long random string, 32+ chars)
- [ ] Cloudflare SSL mode set to "Full (strict)"
- [ ] DNSSEC enabled for your domain in Cloudflare
- [ ] Cloudflare WAF enabled (free tier provides basic rules)
- [ ] GitHub repo set to private (personal project)
- [ ] No secrets in git history (`git log --all --full-history -- .env`)
- [ ] Supabase DB password is strong and stored in a password manager
- [ ] Wrangler secrets verified: `wrangler secret list`

---

## Future Hardening (Optional)

- **Cloudflare Turnstile** (free CAPTCHA) on the login page
- **Supabase MFA** — add TOTP as second factor for admin login
- **Webhook signature verification** — verify Supabase webhook payload signatures
- **Content Security Policy** header on the frontend
- **Subresource Integrity** for any CDN-loaded scripts
