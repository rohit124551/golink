import { useState } from 'react'
import { Modal } from './ui/Modal.tsx'
import { isValidUrl, isValidSlug, SITE_URL } from '../lib/utils.ts'

const INITIAL = { destination_url: '', slug: '', expires_at: '', is_active: true }

interface CreateLinkModalProps {
  onClose: () => void
  onSave: (payload: any) => Promise<void>
  initial?: any
  isLoading: boolean
}

export function CreateLinkModal({ onClose, onSave, initial = null, isLoading }: CreateLinkModalProps) {
  const isEdit = !!initial
  const [form, setForm] = useState(initial
    ? { destination_url: initial.destination_url, slug: initial.slug, expires_at: initial.expires_at?.slice(0, 10) || '', is_active: initial.is_active }
    : INITIAL
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (key: string, val: any) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.destination_url) e.destination_url = 'Destination URL is required.'
    else if (!isValidUrl(form.destination_url)) e.destination_url = 'Must be a valid http:// or https:// URL.'
    if (form.slug && !isValidSlug(form.slug)) e.slug = 'Only letters, numbers, hyphens, underscores. Max 50 chars.'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    try {
      await onSave({
        destination_url: form.destination_url,
        slug: form.slug || undefined,
        expires_at: form.expires_at || null,
        is_active: form.is_active,
      })
      onClose()
    } catch (err: any) {
      setErrors({ form: err.message || 'Something went wrong.' })
    }
  }

  return (
    <Modal
      title={isEdit ? 'Edit link' : 'New link'}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} type="button">Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isLoading} type="button">
            {isLoading ? <><span className="spinner" /> Saving…</> : isEdit ? 'Save changes' : 'Create link'}
          </button>
        </>
      }
    >
      {errors.form && <div className="alert alert-error" role="alert">{errors.form}</div>}

      <div className="form-group">
        <label className="form-label" htmlFor="modal-url">Destination URL *</label>
        <input
          id="modal-url"
          className={`form-input ${errors.destination_url ? 'input-error' : ''}`}
          type="url"
          placeholder="https://example.com/very/long/url"
          value={form.destination_url}
          onChange={e => set('destination_url', e.target.value)}
          autoFocus
        />
        {errors.destination_url && <span className="form-error">{errors.destination_url}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="modal-slug">Custom slug <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span></label>
        <div className="input-prefix-group">
          <span className="input-prefix">{SITE_URL.replace('https://', '')}/</span>
          <input
            id="modal-slug"
            className="input-prefix-field"
            type="text"
            placeholder="my-link"
            value={form.slug}
            onChange={e => set('slug', e.target.value)}
            disabled={isEdit}
          />
        </div>
        {errors.slug
          ? <span className="form-error">{errors.slug}</span>
          : <span className="form-hint">Leave empty to auto-generate a 5-character slug.</span>
        }
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="modal-expiry">Expiry date <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span></label>
        <input
          id="modal-expiry"
          className="form-input"
          type="date"
          value={form.expires_at}
          onChange={e => set('expires_at', e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
        />
        <span className="form-hint">Link will return 410 Gone after this date.</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label className="toggle" htmlFor="modal-active">
          <input
            id="modal-active"
            type="checkbox"
            checked={form.is_active}
            onChange={e => set('is_active', e.target.checked)}
          />
          <span className="toggle-slider" />
        </label>
        <span className="form-label" style={{ margin: 0 }}>Active</span>
      </div>
    </Modal>
  )
}
