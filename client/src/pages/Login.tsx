import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.tsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      const msg = err.message || ''
      if (msg.includes('rate') || msg.includes('many')) {
        setError('Too many attempts. Try again in 60s.')
      } else {
        setError('Invalid credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__header">
          <span className="login-domain">go.rohitkumarranjan.in</span>
          <h1 className="login-title">Admin access</h1>
          <p className="login-sub">This instance is private. One account only.</p>
        </div>

        <div className="divider" />

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="alert alert-error" role="alert">{error}</div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="input-wrapper">
              <input
                id="login-password"
                className="form-input"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                className="input-suffix"
                onClick={() => setShowPass(s => !s)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            id="login-submit"
            className="btn btn-primary btn-lg btn-full"
            type="submit"
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Signing in…</> : 'Sign in'}
          </button>

          <p className="login-hint">
            Forgot your password? Update it in Supabase Auth.
          </p>
        </form>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-base);
          background-image: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 39px,
            var(--border-subtle) 39px,
            var(--border-subtle) 40px
          );
          padding: 24px;
        }
        .login-card {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: 32px;
          width: 100%;
          max-width: 360px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .login-card__header { display: flex; flex-direction: column; gap: 6px; }
        .login-domain {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-tertiary);
        }
        .login-title { font-size: 18px; font-weight: 600; color: var(--text-primary); }
        .login-sub { font-size: 13px; color: var(--text-secondary); }
        .login-form { display: flex; flex-direction: column; gap: 14px; }
        .login-hint {
          font-size: 11px;
          color: var(--text-tertiary);
          text-align: center;
          line-height: 1.5;
        }
      `}</style>
    </div>
  )
}
