'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { Profile } from '@/types'

const navItems = [
  {
    section: 'Utama',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      )},
    ]
  },
  {
    section: 'Manajemen',
    items: [
      { href: '/orders', label: 'Order Layanan', icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      )},
      { href: '/progress', label: 'Progres Pemasangan', icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
      )},
      { href: '/customers', label: 'Data Pelanggan', icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>
      )},
    ]
  },
  {
    section: 'Data',
    items: [
      { href: '/import', label: 'Import Data', icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
        </svg>
      )},
      { href: '/reports', label: 'Laporan', icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
      )},
    ]
  },
]

const adminOnlyItems = ['/audit-log', '/import']

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isAdmin = profile?.role === 'admin'

  const auditItem = {
    href: '/audit-log', label: 'Audit Log', icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    )
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="10" fill="#e40000"/>
          <path d="M12 24C12 17.373 17.373 12 24 12C30.627 12 36 17.373 36 24C36 30.627 30.627 36 24 36" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="24" cy="24" r="4" fill="white"/>
          <path d="M24 16V12M24 36V32M32 24H36M12 24H16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <div>
          <div className="sidebar-logo-text">Telkom Indonesia</div>
          <div className="sidebar-logo-sub">Sulbagsel · Monitoring</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map(group => (
          <div key={group.section}>
            <div className="sidebar-section-label">{group.section}</div>
            {group.items.map(item => {
              if (!isAdmin && adminOnlyItems.includes(item.href)) return null
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link key={item.href} href={item.href} className={`sidebar-item ${active ? 'active' : ''}`}>
                  {item.icon}
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
        {isAdmin && (
          <div>
            <div className="sidebar-section-label">Sistem</div>
            <Link href={auditItem.href} className={`sidebar-item ${pathname === auditItem.href ? 'active' : ''}`}>
              {auditItem.icon}
              {auditItem.label}
            </Link>
          </div>
        )}
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {profile?.nama?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{profile?.nama ?? 'User'}</div>
            <div className="sidebar-user-role">
              {profile?.role === 'admin' ? '🔴 Admin' : '🔵 Account Manager'}
            </div>
          </div>
          <button className="sidebar-logout-btn" onClick={handleLogout} title="Logout" disabled={loggingOut}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        .sidebar-logo-sub { color: rgba(255,255,255,0.4); font-size: 0.7rem; }
        .sidebar-user {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          background: rgba(255,255,255,0.06);
        }
        .sidebar-avatar {
          width: 34px; height: 34px; border-radius: 8px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white; font-size: 0.875rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .sidebar-user-info { flex: 1; min-width: 0; }
        .sidebar-user-name { color: white; font-size: 0.8125rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sidebar-user-role { color: rgba(255,255,255,0.45); font-size: 0.7rem; margin-top: 1px; }
        .sidebar-logout-btn {
          background: transparent; border: none; cursor: pointer;
          color: rgba(255,255,255,0.4); padding: 4px;
          border-radius: 6px; transition: all 0.15s;
          display: flex; align-items: center;
        }
        .sidebar-logout-btn:hover { background: rgba(239,68,68,0.2); color: #f87171; }
      `}</style>
    </aside>
  )
}
