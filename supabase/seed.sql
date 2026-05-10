-- seed.sql
-- Edit the email and password before running!
-- Run in Supabase Dashboard → SQL Editor AFTER all migrations

-- Create your admin user (Supabase Auth)
-- Replace with your actual email and a strong password
SELECT auth.sign_up(
  'your@email.com',
  'your-strong-password-here'
);

-- After running, disable signups so nobody else can register:
-- In Supabase Dashboard → Auth → Settings → Disable sign ups  (toggle off)
-- OR run: UPDATE auth.config SET enable_signup = false;

-- Optional: seed a test link
-- INSERT INTO public.short_links (slug, destination_url, is_active, is_custom)
-- VALUES ('github', 'https://github.com/rohitkumarranjan', true, true);
