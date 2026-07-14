import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils/helpers'
import ImportClient from './ImportClient'

export const metadata = { title: 'Import Data' }

export default async function ImportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: history } = await supabase
    .from('import_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: customers } = await supabase.from('customers').select('*').order('nama_perusahaan')

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Import Data</h1>
          <p className="page-subtitle">Upload file CSV atau Excel untuk memasukkan data order secara massal</p>
        </div>
      </div>

      <div className="page-body" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
        <ImportClient
          currentUserId={user.id}
          currentUserNama={profile?.nama ?? 'Admin'}
          customers={customers ?? []}
        />

        {/* History */}
        <div className="card">
          <div className="card-title">Riwayat Import</div>
          {(!history || history.length === 0) ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="empty-icon">📂</div>
              <div className="empty-title">Belum ada riwayat</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {history.map((h: any) => (
                <div key={h.id} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1a202c' }}>{h.filename}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>
                    {formatDateTime(h.created_at)} · {h.user_nama}
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: '0.75rem' }}>
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ {h.success_rows} berhasil</span>
                    {h.failed_rows > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}>✗ {h.failed_rows} gagal</span>}
                    <span style={{ color: '#6b7280' }}>Total: {h.total_rows}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
