'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email atau password salah. Silakan coba lagi.')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="login-page">
      {/* Left Panel */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="#e40000"/>
              <path d="M12 24C12 17.373 17.373 12 24 12C30.627 12 36 17.373 36 24C36 30.627 30.627 36 24 36" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="24" cy="24" r="4" fill="white"/>
              <path d="M24 16V12M24 36V32M32 24H36M12 24H16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h1 className="login-brand-name">Telkom Indonesia</h1>
            <p className="login-brand-sub">Wilayah Sulawesi Bagian Selatan</p>
          </div>
        </div>

        <div className="login-hero">
          <h2>Sistem Monitoring<br/>Kinerja Pelayanan<br/>Pelanggan Enterprise</h2>
          <p>Platform terpadu untuk memantau, mengelola, dan menganalisis kinerja layanan pelanggan enterprise secara real-time.</p>
        </div>

        <div className="login-stats">
          <div className="login-stat">
            <span className="login-stat-value">100+</span>
            <span className="login-stat-label">Pelanggan Enterprise</span>
          </div>
          <div className="login-stat-divider"/>
          <div className="login-stat">
            <span className="login-stat-value">99.9%</span>
            <span className="login-stat-label">Uptime SLA</span>
          </div>
          <div className="login-stat-divider"/>
          <div className="login-stat">
            <span className="login-stat-value">24/7</span>
            <span className="login-stat-label">Monitoring</span>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="login-right">
        <div className="login-form-wrap">
          <div className="login-form-header">
            <h2>Selamat Datang</h2>
            <p>Masuk ke akun Anda untuk mengakses dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {error && (
              <div className="alert alert-danger" style={{ marginBottom: 16 }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <div style={{ position: 'relative' }}>
                <svg className="form-icon-left" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: 40 }}
                  placeholder="admin@telkom.co.id"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <svg className="form-icon-left" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: 40 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 8 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/>
                  </svg>
                  Memproses...
                </>
              ) : 'Masuk'}
            </button>
          </form>

          <div className="login-demo-accounts">
            <p className="login-demo-title">Akun Demo</p>
            <div className="login-demo-grid">
              <div className="login-demo-card" onClick={() => { setEmail('admin@telkom.co.id'); setPassword('admin123') }}>
                <span className="login-demo-role admin">Admin</span>
                <span className="login-demo-email">admin@telkom.co.id</span>
              </div>
              <div className="login-demo-card" onClick={() => { setEmail('am@telkom.co.id'); setPassword('telkom123') }}>
                <span className="login-demo-role am">Account Manager</span>
                <span className="login-demo-email">am@telkom.co.id</span>
              </div>
            </div>
          </div>

          <p className="login-footer-text">
            © 2025 PT Telkom Indonesia · Wilayah Sulbagsel
          </p>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          background: #f5f7fa;
        }

        /* LEFT */
        .login-left {
          width: 480px;
          flex-shrink: 0;
          background: linear-gradient(160deg, #0d1b2a 0%, #1a2744 60%, #0f3460 100%);
          padding: 48px 52px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        .login-left::before {
          content: '';
          position: absolute;
          top: -100px; right: -100px;
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%);
          border-radius: 50%;
        }
        .login-left::after {
          content: '';
          position: absolute;
          bottom: -80px; left: -80px;
          width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(228,0,0,0.12) 0%, transparent 70%);
          border-radius: 50%;
        }

        .login-brand { display: flex; align-items: center; gap: 16px; position: relative; z-index: 1; }
        .login-brand-name { color: white; font-size: 1.125rem; font-weight: 700; }
        .login-brand-sub  { color: rgba(255,255,255,0.5); font-size: 0.75rem; margin-top: 2px; }

        .login-hero { position: relative; z-index: 1; }
        .login-hero h2 {
          color: white; font-size: 2rem; font-weight: 800;
          line-height: 1.2; margin-bottom: 16px;
        }
        .login-hero p { color: rgba(255,255,255,0.6); font-size: 0.9rem; line-height: 1.7; }

        .login-stats { display: flex; align-items: center; gap: 24px; position: relative; z-index: 1; }
        .login-stat  { display: flex; flex-direction: column; gap: 4px; }
        .login-stat-value { color: white; font-size: 1.5rem; font-weight: 700; }
        .login-stat-label { color: rgba(255,255,255,0.5); font-size: 0.75rem; }
        .login-stat-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.15); }

        /* RIGHT */
        .login-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
        }
        .login-form-wrap {
          width: 100%;
          max-width: 420px;
        }
        .login-form-header { margin-bottom: 32px; }
        .login-form-header h2 { font-size: 1.75rem; font-weight: 700; color: #1a202c; }
        .login-form-header p  { color: #718096; font-size: 0.9rem; margin-top: 6px; }

        .login-form { display: flex; flex-direction: column; gap: 20px; }

        .form-icon-left {
          position: absolute; left: 12px; top: 50%;
          transform: translateY(-50%); color: #9ca3af;
          pointer-events: none;
        }

        .login-demo-accounts {
          margin-top: 28px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        .login-demo-title {
          font-size: 0.8rem; font-weight: 600;
          color: #6b7280; margin-bottom: 12px;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .login-demo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .login-demo-card {
          display: flex; flex-direction: column; gap: 4px;
          padding: 12px; border-radius: 8px;
          background: white; border: 1px solid #e2e8f0;
          cursor: pointer; transition: all 0.15s;
        }
        .login-demo-card:hover { border-color: #3b82f6; background: #eff6ff; }
        .login-demo-role { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .login-demo-role.admin { color: #dc2626; }
        .login-demo-role.am    { color: #2563eb; }
        .login-demo-email { font-size: 0.78rem; color: #374151; }

        .login-footer-text {
          text-align: center; margin-top: 24px;
          font-size: 0.75rem; color: #9ca3af;
        }

        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .login-left { display: none; }
        }
      `}</style>
    </div>
  )
}
