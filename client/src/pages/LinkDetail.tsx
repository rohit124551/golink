import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Copy, Edit2, Power, Trash2 } from 'lucide-react'
import { Sidebar } from '../components/Sidebar.tsx'
import { StatCard } from '../components/StatCard.tsx'
import { ClickChart } from '../components/ClickChart.tsx'
import { CountryBar } from '../components/CountryBar.tsx'
import { CreateLinkModal } from '../components/CreateLinkModal.tsx'
import { Toast } from '../components/ui/Toast.tsx'
import { Skeleton, StatCardSkeleton } from '../components/ui/Skeleton.tsx'
import { useAnalytics } from '../hooks/useAnalytics.ts'
import { useLinks } from '../hooks/useLinks.ts'
import { useToast } from '../hooks/useToast.ts'
import { useQuery } from '@tanstack/react-query'
import { fetchLink } from '../lib/api.ts'
import { copyToClipboard, relativeTime, truncate, formatDateTime, getCountryFlag, getReferrerDomain, SITE_URL } from '../lib/utils.ts'

const RANGE_OPTIONS = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: 'All time', value: 365 },
]

export default function LinkDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { toasts, toast } = useToast()
  const [range, setRange] = useState(30)
  const [editOpen, setEditOpen] = useState(false)

  const { data: link, isLoading: linkLoading } = useQuery({
    queryKey: ['link', slug],
    queryFn: () => fetchLink(slug!),
    enabled: !!slug,
  })

  const { timeline, byCountry, byReferrer, recentClicks, totalClicks, uniqueClicks, isLoading: analyticsLoading } =
    useAnalytics(slug!, range)

  const { updateLink, deleteLink, toggleLink } = useLinks()

  const shortUrl = `${SITE_URL}/${slug}`

  const handleCopy = async () => {
    const ok = await copyToClipboard(shortUrl)
    if (ok) toast.success('Copied!')
  }

  const handleToggle = async () => {
    try {
      await toggleLink({ slug: slug!, isActive: !link?.is_active })
      toast.info(link?.is_active ? 'Link disabled.' : 'Link enabled.')
    } catch {
      toast.error('Failed to update link.')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete /${slug}? This cannot be undone.`)) return
    try {
      await deleteLink(slug!)
      toast.success('Link deleted.')
      navigate('/dashboard')
    } catch {
      toast.error('Failed to delete link.')
    }
  }

  const handleUpdate = async (payload: any) => {
    await updateLink({ slug: slug!, payload })
    toast.success('Link updated!')
    setEditOpen(false)
  }

  const clickRate = totalClicks > 0 ? Math.round((uniqueClicks / totalClicks) * 100) : 0

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <div className="page-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div className="page-header__left">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')} style={{ marginBottom: '4px', paddingLeft: 0 }}>
              <ArrowLeft size={14} /> Links
            </button>
            {linkLoading ? (
              <Skeleton height="28px" width="120px" />
            ) : (
              <h1 className="page-title" style={{ fontFamily: 'var(--font-mono)', fontSize: '24px' }}>/{slug}</h1>
            )}
            {link && (
              <a
                href={link.destination_url}
                target="_blank"
                rel="noopener noreferrer"
                className="page-subtitle"
                style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}
              >
                {truncate(link.destination_url, 60)}
              </a>
            )}
          </div>
          <div className="page-header__actions" style={{ flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
              <Copy size={13} /> Copy short link
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditOpen(true)}>
              <Edit2 size={13} /> Edit
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleToggle}>
              <Power size={13} /> {link?.is_active ? 'Disable' : 'Enable'}
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>

        <div className="page-body">
          <div className="stats-grid">
            {analyticsLoading ? (
              Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            ) : (
              <>
                <StatCard label="Total clicks" value={totalClicks.toLocaleString()} />
                <StatCard label="Unique clicks" value={uniqueClicks.toLocaleString()} />
                <StatCard label="Click rate" value={`${clickRate}%`} meta="unique / total" />
                <StatCard
                  label="Last clicked"
                  value={link?.last_clicked_at ? relativeTime(link.last_clicked_at) : '—'}
                />
              </>
            )}
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Clicks over time</h3>
              <div className="range-tabs">
                {RANGE_OPTIONS.map(({ label, value }) => (
                  <button
                    key={value}
                    className={`range-tab ${range === value ? 'active' : ''}`}
                    onClick={() => setRange(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {analyticsLoading
              ? <Skeleton height="220px" />
              : <ClickChart data={timeline} />
            }
          </div>

          <div className="detail-grid">
            <div className="card">
              <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>Top countries</h3>
              {analyticsLoading
                ? <Skeleton height="120px" />
                : <CountryBar data={byCountry.map(({ name, count }) => ({ name, count }))} />
              }
            </div>

            <div className="card">
              <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>Top referrers</h3>
              {analyticsLoading ? (
                <Skeleton height="120px" />
              ) : byReferrer.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>No data yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {byReferrer.map(({ name, count }) => (
                    <div key={name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-tertiary)', marginLeft: '12px', flexShrink: 0 }}>{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>Recent clicks</h3>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>IP Address</th>
                    <th>Country</th>
                    <th>Device</th>
                    <th>Browser</th>
                    <th>Referrer</th>
                  </tr>
                </thead>
                <tbody>
                  {recentClicks.length === 0 && !analyticsLoading && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '24px' }}>No clicks recorded yet</td></tr>
                  )}
                  {recentClicks.map((click: any, i: number) => (
                    <tr key={i} style={{ cursor: 'default' }}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {formatDateTime(click.clicked_at)}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        {click.ip_address || '—'}
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        {click.country
                          ? <>{getCountryFlag(click.country)} {click.country}</>
                          : <span style={{ color: 'var(--text-tertiary)' }}>—</span>
                        }
                      </td>
                      <td style={{ fontSize: '12px', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                        {click.device_type || <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {click.browser || <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {getReferrerDomain(click.referrer)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {editOpen && link && (
        <CreateLinkModal
          onClose={() => setEditOpen(false)}
          onSave={handleUpdate}
          initial={link}
          isLoading={false}
        />
      )}

      <Toast toasts={toasts} />

      <style>{`
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 768px) {
          .detail-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
