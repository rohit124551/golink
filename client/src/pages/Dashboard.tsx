import { useState, useMemo } from 'react'
import { Plus, Search, Link as LinkIcon } from 'lucide-react'
import { Sidebar } from '../components/Sidebar.tsx'
import { StatCard } from '../components/StatCard.tsx'
import { LinkRow, LinkCard } from '../components/LinkRow.tsx'
import { CreateLinkModal } from '../components/CreateLinkModal.tsx'
import { Toast } from '../components/ui/Toast.tsx'
import { SkeletonRow, StatCardSkeleton } from '../components/ui/Skeleton.tsx'
import { useLinks } from '../hooks/useLinks.ts'
import { useToast } from '../hooks/useToast.ts'
import { useDashboardStats } from '../hooks/useAnalytics.ts'

export default function Dashboard() {
  const { links, isLoading, createLink, updateLink, deleteLink, toggleLink, isCreating } = useLinks()
  const { data: stats } = useDashboardStats()
  const { toasts, toast } = useToast()
  const [showModal, setShowModal] = useState(false)
  const [editLink, setEditLink] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!search) return links
    const q = search.toLowerCase()
    return links.filter((l: any) =>
      l.slug.toLowerCase().includes(q) ||
      l.destination_url.toLowerCase().includes(q)
    )
  }, [links, search])

  const handleCreate = async (payload: any) => {
    await createLink(payload)
    toast.success('Link created!')
    setShowModal(false)
  }

  const handleUpdate = async (payload: any) => {
    await updateLink({ slug: editLink.slug, payload })
    toast.success('Link updated!')
    setEditLink(null)
  }

  const handleDelete = async (slug: string) => {
    if (!confirmDelete) { setConfirmDelete(slug); return }
    try {
      await deleteLink(slug)
      toast.success('Link deleted.')
    } catch {
      toast.error('Failed to delete link.')
    } finally {
      setConfirmDelete(null)
    }
  }

  const handleToggle = async ({ slug, isActive }: { slug: string, isActive: boolean }) => {
    try {
      await toggleLink({ slug, isActive })
      toast.info(isActive ? 'Link enabled.' : 'Link disabled.')
    } catch {
      toast.error('Failed to update link.')
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <div className="page-header">
          <div className="page-header__left">
            <h2 className="page-title">Links</h2>
            <span className="page-subtitle">{links.length} total</span>
          </div>
          <div className="page-header__actions">
            <button
              id="new-link-btn"
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <Plus size={15} /> New link
            </button>
          </div>
        </div>

        <div className="page-body">
          <div className="stats-grid">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            ) : (
              <>
                <StatCard label="Total links" value={stats?.totalLinks ?? links.length} />
                <StatCard label="Total clicks" value={(stats?.totalClicks ?? 0).toLocaleString()} />
                <StatCard
                  label="Clicks today"
                  value={(stats?.clicksToday ?? 0).toLocaleString()}
                  up={stats?.clicksToday > 0}
                  meta={stats?.clicksToday > 0 ? 'since midnight' : undefined}
                />
                <StatCard
                  label="Active links"
                  value={stats?.activeLinks ?? links.filter((l: any) => l.is_active).length}
                />
              </>
            )}
          </div>

          <div className="search-wrapper">
            <Search size={14} className="search-icon" />
            <input
              id="link-search"
              className="search-input"
              type="search"
              placeholder="Search slugs or URLs…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="table-wrapper dash-table">
            <table>
              <thead>
                <tr>
                  <th>Slug</th>
                  <th>Destination</th>
                  <th style={{ textAlign: 'right' }}>Clicks</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ width: '48px' }} />
                </tr>
              </thead>
              <tbody>
                {isLoading && Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={6} />)}
                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <LinkIcon size={32} className="empty-state__icon" />
                        <p className="empty-state__text">
                          {search ? 'No links match your search.' : 'No links yet. Create your first short link.'}
                        </p>
                        {!search && (
                          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                            <Plus size={13} /> New link
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
                {!isLoading && filtered.map((link: any) => (
                  <LinkRow
                    key={link.slug}
                    link={link}
                    onEdit={setEditLink}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                    toast={toast}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="dash-cards">
            {filtered.map((link: any) => (
              <LinkCard
                key={link.slug}
                link={link}
                onEdit={setEditLink}
                onDelete={handleDelete}
                onToggle={handleToggle}
                toast={toast}
              />
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <CreateLinkModal
          onClose={() => setShowModal(false)}
          onSave={handleCreate}
          isLoading={isCreating}
        />
      )}
      {editLink && (
        <CreateLinkModal
          onClose={() => setEditLink(null)}
          onSave={handleUpdate}
          initial={editLink}
          isLoading={false}
        />
      )}

      <Toast toasts={toasts} />

      <style>{`
        .dash-table { display: block; }
        .dash-cards { display: none; }
        @media (max-width: 768px) {
          .dash-table { display: none; }
          .dash-cards { display: block; }
        }
      `}</style>
    </div>
  )
}
