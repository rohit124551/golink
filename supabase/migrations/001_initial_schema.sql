-- 001_initial_schema.sql
-- Run this first in Supabase Dashboard → SQL Editor

-- Short links table
CREATE TABLE public.short_links (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL,
  destination_url text NOT NULL,
  is_active       boolean NOT NULL DEFAULT true,
  is_custom       boolean NOT NULL DEFAULT false,
  expires_at      timestamptz,
  click_count     integer NOT NULL DEFAULT 0,
  unique_clicks   integer NOT NULL DEFAULT 0,
  last_clicked_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Link clicks table
CREATE TABLE public.link_clicks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL REFERENCES public.short_links(slug) ON DELETE CASCADE,
  clicked_at  timestamptz NOT NULL DEFAULT now(),
  referrer    text,
  country     text,
  device_type text,
  browser     text,
  ip_hash     text
);

-- RPC: increment click count + unique clicks
CREATE OR REPLACE FUNCTION public.increment_click_count(p_slug text, p_ip_hash text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_unique boolean;
BEGIN
  -- Check if this ip_hash has clicked before
  SELECT NOT EXISTS (
    SELECT 1 FROM public.link_clicks
    WHERE slug = p_slug AND ip_hash = p_ip_hash
    AND clicked_at > now() - interval '30 days'
  ) INTO is_unique;

  UPDATE public.short_links
  SET
    click_count     = click_count + 1,
    unique_clicks   = unique_clicks + (CASE WHEN is_unique THEN 1 ELSE 0 END),
    last_clicked_at = now()
  WHERE slug = p_slug;
END;
$$;
