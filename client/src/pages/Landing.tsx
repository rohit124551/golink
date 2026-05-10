import { Link } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeProvider.tsx'
import { Link2, Zap, BarChart2 } from 'lucide-react'

const TECH_STACK = [
  ['Cloudflare Workers', 'Edge redirect engine'],
  ['Cloudflare KV', 'Sub-ms slug cache'],
  ['Supabase', 'Database + auth'],
  ['Vercel', 'Dashboard hosting'],
]

const HOW_IT_WORKS = [
  {
    Icon: Link2,
    title: 'Paste any URL',
    body: 'Get a short link at go.rohitkumarranjan.in/slug — custom or auto-generated.',
  },
  {
    Icon: Zap,
    title: 'Edge redirect',
    body: "Cloudflare Workers resolve slugs at the nearest of 300+ locations globally.",
  },
  {
    Icon: BarChart2,
    title: 'Click analytics',
    body: 'Every click tracked: country, device, referrer, timestamp. No third-party scripts.',
  },
]

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-nav" role="banner">
        <div className="landing-nav__logo">
          <span className="landing-nav__go">go.</span>
          <span className="landing-nav__domain">rohitkumarranjan.in</span>
        </div>
        <div className="landing-nav__actions">
          <ThemeToggle />
          <Link to="/dashboard" className="btn btn-primary btn-sm">Dashboard</Link>
        </div>
      </header>

      <main className="landing-content" id="main-content">
        <section className="landing-hero" aria-label="Introduction">
          <div className="pill">
            <span className="pill-dot" />
            Personal project · Open source
          </div>

          <h1 className="landing-h1">Short links.<br />Full control.</h1>

          <p className="landing-sub">
            A personal URL shortener running on Cloudflare's edge.
            Sub-50ms redirects, click analytics, zero monthly cost.
          </p>

          <div className="landing-pills">
            <span className="pill">⚡ Edge-native</span>
            <span className="pill">📊 Click analytics</span>
            <span className="pill">🔒 Single-user secure</span>
          </div>
        </section>

        <section className="landing-section" aria-label="How it works">
          <div className="landing-cards">
            {HOW_IT_WORKS.map(({ Icon, title, body }) => (
              <div key={title} className="landing-card">
                <div className="landing-card__icon">
                  <Icon size={18} strokeWidth={1.5} />
                </div>
                <h2 className="landing-card__title">{title}</h2>
                <p className="landing-card__body">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-section" aria-label="Tech stack">
          <p className="label-caps" style={{ marginBottom: '12px' }}>Built with</p>
          <div className="landing-stack">
            {TECH_STACK.map(([tool, desc]) => (
              <div key={tool} className="landing-stack__row">
                <span className="landing-stack__tool font-mono">{tool}</span>
                <span className="landing-stack__desc">{desc}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="landing-footer" role="contentinfo">
        <span className="text-tertiary" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
          go.rohitkumarranjan.in
        </span>
        <div className="landing-footer__links">
          <a href="https://rohitkumarranjan.in" target="_blank" rel="noopener noreferrer">Portfolio</a>
          <span className="text-tertiary">·</span>
          <a href="https://github.com/rohitkumarranjan" target="_blank" rel="noopener noreferrer">GitHub</a>
          <span className="text-tertiary">·</span>
          <a href="mailto:contact@rohitkumarranjan.in">Email</a>
        </div>
        <span className="text-tertiary" style={{ fontSize: '12px' }}>Made by Rohit Kumar Ranjan</span>
      </footer>

      <style>{`
        .landing {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .landing-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          background-color: var(--bg-base);
          border-bottom: 1px solid var(--border-subtle);
          backdrop-filter: blur(8px);
        }
        .landing-nav__logo { display: flex; align-items: baseline; gap: 2px; }
        .landing-nav__go { font-family: var(--font-mono); font-size: 16px; font-weight: 600; color: var(--accent-text); }
        .landing-nav__domain { font-size: 13px; color: var(--text-tertiary); }
        .landing-nav__actions { display: flex; align-items: center; gap: 8px; }
        .landing-content {
          flex: 1;
          max-width: 760px;
          margin: 0 auto;
          padding: 0 24px 80px;
          width: 100%;
        }
        .landing-hero {
          padding-top: 80px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding-bottom: 64px;
        }
        .landing-h1 {
          font-size: 42px;
          font-weight: 600;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }
        .landing-sub {
          font-size: 18px;
          color: var(--text-secondary);
          max-width: 480px;
          line-height: 1.6;
        }
        .landing-pills { display: flex; flex-wrap: wrap; gap: 8px; }
        .landing-section { padding-bottom: 56px; }
        .landing-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .landing-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .landing-card__icon { color: var(--accent-text); }
        .landing-card__title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
        .landing-card__body { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
        .landing-stack { display: flex; flex-direction: column; gap: 0; }
        .landing-stack__row {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 16px;
          padding: 10px 0;
          border-bottom: 1px solid var(--border-subtle);
        }
        .landing-stack__row:last-child { border-bottom: none; }
        .landing-stack__tool { font-size: 13px; color: var(--text-primary); }
        .landing-stack__desc { font-size: 13px; color: var(--text-secondary); }
        .landing-footer {
          height: 52px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .landing-footer__links {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-tertiary);
        }
        .landing-footer__links a {
          color: var(--text-tertiary);
          transition: color var(--transition);
        }
        .landing-footer__links a:hover { color: var(--accent-text); }

        @media (max-width: 640px) {
          .landing-h1 { font-size: 28px; }
          .landing-sub { font-size: 15px; }
          .landing-cards { grid-template-columns: 1fr; }
          .landing-stack__row { grid-template-columns: 1fr; gap: 2px; }
          .landing-footer { height: auto; padding: 12px 16px; }
        }
      `}</style>
    </div>
  )
}
