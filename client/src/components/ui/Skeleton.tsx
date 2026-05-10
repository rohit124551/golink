export function Skeleton({ width = '100%', height = '16px', className = '' }: { width?: string, height?: string, className?: string }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '12px 16px' }}>
          <Skeleton height="14px" width={i === 0 ? '140px' : i === cols - 1 ? '60px' : '80px'} />
        </td>
      ))}
    </tr>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <Skeleton height="12px" width="80px" />
      <Skeleton height="28px" width="60px" />
      <Skeleton height="10px" width="100px" />
    </div>
  )
}
