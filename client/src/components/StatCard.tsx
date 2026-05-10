import { TrendingUp } from 'lucide-react'

interface StatCardProps {
  label: string
  value?: string | number
  meta?: string
  up?: boolean
}

export function StatCard({ label, value, meta, up }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value ?? '—'}</div>
      {meta && (
        <div className="stat-card__meta">
          {up && <TrendingUp size={11} className="stat-card__up" />}
          <span>{meta}</span>
        </div>
      )}
    </div>
  )
}
