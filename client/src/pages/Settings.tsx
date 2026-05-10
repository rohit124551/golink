import { Sidebar } from '../components/Sidebar.tsx'

export default function Settings() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div className="page-header__left">
            <h2 className="page-title">Settings</h2>
            <span className="page-subtitle">Coming soon</span>
          </div>
        </div>
        <div className="page-body">
          <div className="empty-state">
            <p className="empty-state__text">Global account and domain settings will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
