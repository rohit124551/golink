import { supabase } from './supabase.ts'

export async function fetchLinks() {
  const { data, error } = await supabase
    .from('short_links')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchLink(slug: string) {
  const { data, error } = await supabase
    .from('short_links')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}

export async function createLink(payload: any) {
  const { data, error } = await supabase
    .from('short_links')
    .insert([payload])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateLink(slug: string, payload: any) {
  const { data, error } = await supabase
    .from('short_links')
    .update(payload)
    .eq('slug', slug)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteLink(slug: string) {
  const { error } = await supabase
    .from('short_links')
    .delete()
    .eq('slug', slug)
  if (error) throw error
}

export async function toggleLink(slug: string, isActive: boolean) {
  return updateLink(slug, { is_active: isActive })
}

export async function fetchClicksForSlug(slug: string, days = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from('link_clicks')
    .select('*')
    .eq('slug', slug)
    .gte('clicked_at', since.toISOString())
    .order('clicked_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchRecentClicks(slug: string, limit = 50) {
  const { data, error } = await supabase
    .from('link_clicks')
    .select('clicked_at, country, device_type, browser, referrer, ip_address')
    .eq('slug', slug)
    .order('clicked_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function fetchDashboardStats() {
  const [linksResult, clicksResult] = await Promise.all([
    supabase.from('short_links').select('id, is_active, click_count', { count: 'exact' }),
    supabase
      .from('link_clicks')
      .select('clicked_at', { count: 'exact' })
      .gte('clicked_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ])

  const links = linksResult.data || []
  const totalClicks = links.reduce((sum, l) => sum + (l.click_count || 0), 0)
  const activeLinks = links.filter(l => l.is_active).length
  const clicksToday = clicksResult.count || 0

  return {
    totalLinks: links.length,
    totalClicks,
    activeLinks,
    clicksToday,
  }
}
