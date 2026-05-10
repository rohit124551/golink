import { formatDistanceToNow, format, parseISO, startOfDay, eachDayOfInterval, subDays } from 'date-fns'

export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://go.rohitkumarranjan.in'

const SLUG_CHARSET = 'abcdefghijklmnopqrstuvwxyz0123456789'
export function generateSlug(length = 5) {
  return Array.from({ length }, () => SLUG_CHARSET[Math.floor(Math.random() * SLUG_CHARSET.length)]).join('')
}

export function isValidSlug(slug: string) {
  return /^[a-zA-Z0-9_-]{1,50}$/.test(slug)
}

export function isValidUrl(url: string) {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

export function relativeTime(dateStr?: string) {
  if (!dateStr) return '—'
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true })
  } catch {
    return '—'
  }
}

export function formatDate(dateStr?: string, fmt = 'MMM d, yyyy') {
  if (!dateStr) return '—'
  try {
    return format(parseISO(dateStr), fmt)
  } catch {
    return '—'
  }
}

export function formatDateTime(dateStr?: string) {
  if (!dateStr) return '—'
  try {
    return format(parseISO(dateStr), 'MMM d, HH:mm:ss')
  } catch {
    return '—'
  }
}

export function buildClickTimeline(clicks: any[], days = 30) {
  const now = new Date()
  const start = subDays(now, days)
  const days_arr = eachDayOfInterval({ start, end: now })

  const countByDay: Record<string, number> = {}
  for (const click of clicks) {
    const day = startOfDay(parseISO(click.clicked_at)).toISOString()
    countByDay[day] = (countByDay[day] || 0) + 1
  }

  return days_arr.map(day => ({
    date: format(day, 'MMM d'),
    clicks: countByDay[startOfDay(day).toISOString()] || 0,
  }))
}

export function groupByField(items: any[], field: string) {
  const map: Record<string, number> = {}
  for (const item of items) {
    const key = item[field] || 'Unknown'
    map[key] = (map[key] || 0) + 1
  }
  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }))
}

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function truncate(str: string, max = 40) {
  if (!str) return '—'
  return str.length > max ? str.slice(0, max) + '…' : str
}

export function getStoredTheme() {
  const stored = localStorage.getItem('golink-theme')
  if (stored) return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme: string) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('golink-theme', theme)
}

const FLAG_MAP: Record<string, string> = {
  IN: '🇮🇳', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷',
  JP: '🇯🇵', CA: '🇨🇦', AU: '🇦🇺', BR: '🇧🇷', SG: '🇸🇬',
  NL: '🇳🇱', SE: '🇸🇪', NO: '🇳🇴', KR: '🇰🇷', CN: '🇨🇳',
}
export function getCountryFlag(code: string) {
  return FLAG_MAP[code] || '🌐'
}

export function getReferrerDomain(referrer?: string) {
  if (!referrer) return 'Direct / unknown'
  try {
    return new URL(referrer).hostname.replace('www.', '')
  } catch {
    return referrer
  }
}
