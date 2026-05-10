import { Link as LinkIcon } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="empty-state" style={{ height: '100vh', padding: '0' }}>
      <div className="w-16 h-16 bg-elevated rounded-lg flex items-center justify-center mb-4" 
           style={{ 
             width: '64px', 
             height: '64px', 
             backgroundColor: 'var(--bg-elevated)', 
             borderRadius: 'var(--radius-lg)',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             marginBottom: '16px',
             border: '1px solid var(--border-subtle)'
           }}>
        <LinkIcon size={32} style={{ color: 'var(--text-tertiary)' }} />
      </div>
      
      <h1 className="page-title" style={{ fontSize: '24px', marginBottom: '8px' }}>Link Not Found</h1>
      <p className="text-secondary" style={{ maxWidth: '320px', fontSize: '14px', lineHeight: '1.6' }}>
        This link may be broken, expired, disabled by the owner, or it might not exist at all.
      </p>
    </div>
  )
}
