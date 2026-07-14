import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDateTime } from '@/lib/utils/helpers'

export const metadata = { title: 'Audit Log' }

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ aksi?: string; page?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const params   = await searchParams
  const aksi     = params.aksi  ?? 'all'
  const page     = parseInt(params.page ?? '1')
  const pageSize = 15
  const offset   = (page - 1) * pageSize

  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (aksi !== 'all') query = query.eq('aksi', aksi)

  const { data: logs, count } = await query
  const totalPages = Math.ceil((count ?? 0) / pageSize)

  const aksiColor: Record<string, string> = {
    CREATE: '#16a34a', UPDATE: '#2563eb', DELETE: '#dc2626'
  }
  const aksiStyle = (a: string) => ({
    display: 'inline-block', padding: '2px 10px', borderRadius: 99,
    fontSize: '0.7rem', fontWeight: 700, color: 'white',
    background: aksiColor[a] ?? '#6b7280',
  })

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Log</h1>
          <p className="page-subtitle">Riwayat semua perubahan data sistem</p>
        </div>
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <form method="GET" style={{ display: 'flex', gap: 12 }}>
          <select name="aksi" defaultValue={aksi} className="form-input form-select" style={{ width: 160 }}>
            <option value="all">Semua Aksi</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>
          <button type="submit" className="btn btn-secondary">Filter</button>
        </form>

        <div className="table-wrapper">
          {(!logs || logs.length === 0) ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-title">Belum ada log</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>User</th>
                  <th>Aksi</th>
                  <th>Tabel</th>
                  <th>ID Target</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.8rem', color: '#6b7280', whiteSpace: 'nowrap' }}>{formatDateTime(log.created_at)}</td>
                    <td style={{ fontWeight: 500 }}>{log.user_nama}</td>
                    <td><span style={aksiStyle(log.aksi)}>{log.aksi}</span></td>
                    <td><code style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{log.tabel_target}</code></td>
                    <td style={{ fontSize: '0.8rem', color: '#6b7280' }}>#{log.id_target}</td>
                    <td>
                      {log.data_baru && (
                        <details style={{ fontSize: '0.75rem' }}>
                          <summary style={{ cursor: 'pointer', color: '#3b82f6' }}>Lihat data</summary>
                          <pre style={{ marginTop: 8, background: '#f8fafc', padding: 10, borderRadius: 6, overflow: 'auto', maxWidth: 300, maxHeight: 150, fontSize: '0.7rem' }}>
                            {JSON.stringify(log.data_baru, null, 2)}
                          </pre>
                        </details>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <a key={p} href={`/audit-log?page=${p}&aksi=${aksi}`}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500,
                  background: p === page ? '#2563eb' : 'white',
                  color: p === page ? 'white' : '#374151',
                  border: '1px solid', borderColor: p === page ? '#2563eb' : '#d1d5db',
                  textDecoration: 'none',
                }}>{p}</a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
