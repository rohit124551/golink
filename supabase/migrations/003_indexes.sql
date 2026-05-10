-- 003_indexes.sql
-- Run after 002_rls_policies.sql

-- slug lookups are the hot path — must be fast
CREATE UNIQUE INDEX IF NOT EXISTS short_links_slug_idx ON public.short_links (slug);

-- Analytics queries filter by slug + time
CREATE INDEX IF NOT EXISTS link_clicks_slug_idx       ON public.link_clicks (slug);
CREATE INDEX IF NOT EXISTS link_clicks_slug_time_idx  ON public.link_clicks (slug, clicked_at DESC);
CREATE INDEX IF NOT EXISTS link_clicks_ip_hash_idx    ON public.link_clicks (slug, ip_hash);

-- Dashboard: sort by created_at
CREATE INDEX IF NOT EXISTS short_links_created_idx ON public.short_links (created_at DESC);
