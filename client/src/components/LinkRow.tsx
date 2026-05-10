import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, MoreHorizontal, ExternalLink, Edit2, Power, Trash2 } from 'lucide-react'
import { copyToClipboard, relativeTime, truncate, SITE_URL } from '../lib/utils.ts'

function StatusBadge({ link }: { link: any }) {
  const now = new Date()
  if (link.expires_at && new Date(link.expires_at) < now)
    return <span className="badge badge-danger">Expired</span>
  if (!link.is_active)
    return <span className="badge badge-muted">Disabled</span>
  return <span className="badge badge-success">Active</span>
}

function ActionMenu({ link, onEdit, onDelete, onToggle, onCopy }: any) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const act = (fn: () => void) => { setOpen(false); fn() }

  return (
    <div className="dropdown" ref={ref}>
      <button
        className="btn btn-ghost btn-icon"
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}
        aria-label="Actions"
      >
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <div className="dropdown-menu">
          <button className="dropdown-item" onClick={() => act(onCopy)}>
            <Copy size={13} /> Copy link
          </button>
          <button className="dropdown-item" onClick={() => act(onEdit)}>
            <Edit2 size={13} /> Edit
          </button>
          <button className="dropdown-item" onClick={() => act(() => window.open(`${SITE_URL}/${link.slug}`, '_blank'))}>
            <ExternalLink size={13} /> Open link
          </button>
          <div className="dropdown-divider" />
          <button className="dropdown-item" onClick={() => act(() => onToggle(!link.is_active))}>
            <Power size={13} /> {link.is_active ? 'Disable' : 'Enable'}
          </button>
          <button className="dropdown-item dropdown-item-danger" onClick={() => act(onDelete)}>
            <Trash2 size={13} /> Delete
          </button>
        </div>
      )}
    </div>
  )
}

export function LinkRow({ link, onEdit, onDelete, onToggle, toast }: any) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const shortUrl = `${SITE_URL}/${link.slug}`

  const handleCopy = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    const ok = await copyToClipboard(shortUrl)
    if (ok) {
      setCopied(true)
      toast?.success('Copied!')
      setTimeout(() => setCopied(false), 1500)
    }
  }

  const handleRowClick = () => navigate(`/dashboard/links/${link.slug}`)

  return (
    <tr onClick={handleRowClick}>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="td-mono" title={shortUrl}>{link.slug}</span>
          <button
            className="btn btn-ghost btn-icon"
            style={{ width: '20px', height: '20px' }}
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy short link'}
            aria-label="Copy short link"
          >
            <Copy size={11} color={copied ? 'var(--success)' : undefined} />
          </button>
        </div>
      </td>
      <td>
        <span className="td-truncate" title={link.destination_url}>
          {truncate(link.destination_url, 45)}
        </span>
      </td>
      <td className="td-right">{(link.click_count || 0).toLocaleString()}</td>
      <td><StatusBadge link={link} /></td>
      <td className="td-muted">{relativeTime(link.created_at)}</td>
      <td onClick={e => e.stopPropagation()}>
        <ActionMenu
          link={link}
          onEdit={() => onEdit(link)}
          onDelete={() => onDelete(link.slug)}
          onToggle={(active: boolean) => onToggle({ slug: link.slug, isActive: active })}
          onCopy={handleCopy}
        />
      </td>
    </tr>
  )
}

export function LinkCard({ link, onEdit, onDelete, onToggle, toast }: any) {
  const navigate = useNavigate()
  const shortUrl = `${SITE_URL}/${link.slug}`

  const handleCopy = async () => {
    const ok = await copyToClipboard(shortUrl)
    if (ok) toast?.success('Copied!')
  }

  return (
    <div
      className="card"
      style={{ cursor: 'pointer', marginBottom: '8px' }}
      onClick={() => navigate(`/dashboard/links/${link.slug}`)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent-text)', fontWeight: 600 }}>
            /{link.slug}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {truncate(link.destination_url, 50)}
          </div>
        </div>
        <StatusBadge link={link} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
          {(link.click_count || 0).toLocaleString()} clicks · {relativeTime(link.created_at)}
        </span>
        <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); handleCopy() }}>
          <Copy size={11} /> Copy
        </button>
      </div>
    </div>
  )
}
