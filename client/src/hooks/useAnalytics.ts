import { useQuery } from '@tanstack/react-query'
import { fetchClicksForSlug, fetchRecentClicks, fetchDashboardStats } from '../lib/api.ts'
import { buildClickTimeline, groupByField, getReferrerDomain } from '../lib/utils.ts'

export function useAnalytics(slug: string, days = 30) {
  const { data: clicks = [], isLoading: clicksLoading } = useQuery({
    queryKey: ['clicks', slug, days],
    queryFn: () => fetchClicksForSlug(slug, days),
    enabled: !!slug,
  })

  const { data: recentClicks = [], isLoading: recentLoading } = useQuery({
    queryKey: ['recentClicks', slug],
    queryFn: () => fetchRecentClicks(slug),
    enabled: !!slug,
  })

  const timeline = buildClickTimeline(clicks, days)
  const byCountry = groupByField(clicks, 'country')
  const byDevice = groupByField(clicks, 'device_type')
  const byBrowser = groupByField(clicks, 'browser')
  const byReferrer = groupByField(
    clicks.map((c: any) => ({ referrer: getReferrerDomain(c.referrer) })),
    'referrer'
  )

  const uniqueClicks = new Set(clicks.map((c: any) => c.ip_hash).filter(Boolean)).size

  return {
    timeline,
    byCountry,
    byDevice,
    byBrowser,
    byReferrer,
    recentClicks,
    totalClicks: clicks.length,
    uniqueClicks,
    isLoading: clicksLoading || recentLoading,
  }
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    staleTime: 60_000,
  })
}
