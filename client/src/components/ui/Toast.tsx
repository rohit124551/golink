export function Toast({ toasts }: { toasts: Array<{ id: number; message: string; type: string }> }) {
  if (!toasts.length) return null
  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} role="alert">
          {t.message}
        </div>
      ))}
    </div>
  )
}
