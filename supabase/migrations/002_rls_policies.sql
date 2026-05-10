-- 002_rls_policies.sql
-- Run after 001_initial_schema.sql

-- Enable RLS on both tables
ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_clicks  ENABLE ROW LEVEL SECURITY;

-- short_links: only authenticated admin can read/write
CREATE POLICY "admin_only_short_links"
  ON public.short_links
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- link_clicks: admin can read, Worker writes via service_role (bypasses RLS)
CREATE POLICY "admin_read_clicks"
  ON public.link_clicks
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Disable signups after you create your account:
-- UPDATE auth.config SET enable_signup = false;
-- Or use Supabase Dashboard → Auth → Settings → Disable signups
