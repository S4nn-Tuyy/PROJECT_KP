import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDateShort, TAHAP_MAP } from '@/lib/utils/helpers'

export const metadata = { title: 'Progres Pemasangan' }

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  // Ambil semua order beserta progres pemasangan terakhirnya
  const { data: orders } = await supabase
    .from('orders')
    .select('*, customers(nama_perusahaan), installation_progress(*, profiles(nama))')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const activeOrders = orders ?? []

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Progres Pemasangan</h1>
          <p className="page-subtitle">Status tahapan instalasi layanan pelanggan enterprise secara real-time</p>
        </div>
      </div>

      <div className="page-body">
        <div className="table-wrapper">
          {activeOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔌</div>
              <div className="empty-title">Belum ada progres pemasangan</div>
              <div className="empty-desc">Data progres akan muncul jika ada order terdaftar</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Kode Order</th>
                  <th>Pelanggan</th>
                  <th>Layanan</th>
                  <th>Tahap Pemasangan</th>
                  <th style={{ width: 220 }}>Persentase</th>
                  <th>Update Terakhir</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {activeOrders.map((order: any) => {
                  // Dapatkan update progress terakhir
                  const sortedProgress = [...(order.installation_progress ?? [])].sort(
                    (a, b) => new Date(b.tgl_update).getTime() - new Date(a.tgl_update).getTime()
                  )
                  const latest = sortedProgress[0]
                  const pct = latest?.persentase ?? 0
                  const tahap = TAHAP_MAP[latest?.tahap ?? 'survey']

                  return (
                    <tr key={order.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 600, color: '#1e40af' }}>
                          {order.kode_order}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{order.customers?.nama_perusahaan ?? '-'}</td>
                      <td>{order.jenis_layanan}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span>{tahap?.icon ?? '🔍'}</span>
                          <span style={{ fontWeight: 500 }}>{tahap?.label ?? 'Survey Lokasi'}</span>
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="progress-bar" style={{ flex: 1, margin: 0, height: 8 }}>
                            <div className="progress-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4b5563', minWidth: 32, textAlign: 'right' }}>
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td style={{ color: '#6b7280', fontSize: '0.8125rem' }}>
                        {latest ? formatDateShort(latest.tgl_update) : '-'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Link href={`/orders/${order.id}`} className="btn btn-ghost btn-sm">
                            Detail
                          </Link>
                          {isAdmin && (
                            <Link href={`/orders/${order.id}/progress/new`} className="btn btn-secondary btn-sm">
                              Update
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
