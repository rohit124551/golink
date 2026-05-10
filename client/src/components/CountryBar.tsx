import { getCountryFlag } from '../lib/utils.ts'

export function CountryBar({ data = [] }: { data?: { name: string, count: number }[] }) {
  const max = data[0]?.count || 1
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {data.map(({ name, count }) => (
        <div key={name} className="country-bar-row">
          <div className="country-bar-label">
            <span>{getCountryFlag(name)}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name === 'Unknown' ? 'Unknown' : name}
            </span>
          </div>
          <div className="country-bar-track">
            <div className="country-bar-fill" style={{ width: `${(count / max) * 100}%` }} />
          </div>
          <span className="country-bar-count">{count}</span>
        </div>
      ))}
      {data.length === 0 && (
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>No data yet</p>
      )}
    </div>
  )
}
