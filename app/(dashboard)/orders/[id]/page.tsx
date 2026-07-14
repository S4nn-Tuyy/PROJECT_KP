import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDateShort, formatDateTime, STATUS_MAP, TAHAP_MAP } from '@/lib/utils/helpers'
import DeleteOrderButton from './DeleteOrderButton'

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  const { data: order } = await supabase
    .from('orders')
    .select('*, customers(*), profiles(nama, role)')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!order) notFound()

  const { data: progressList } = await supabase
    .from('installation_progress')
    .select('*, profiles(nama)')
    .eq('order_id', id)
    .order('tgl_update', { ascending: true })

  const badgeMap: Record<string, string> = {
    pending: 'badge-yellow', proses: 'badge-blue', selesai: 'badge-green', gagal: 'badge-red'
  }

  const latestProgress = progressList?.at(-1)
  const progressPct = latestProgress?.persentase ?? 0

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/orders" className="btn btn-ghost btn-sm" style={{ padding: '6px 10px' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
          </Link>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.125rem' }}>Detail Order</h1>
            <p className="page-subtitle" style={{ fontFamily: 'monospace' }}>{order.kode_order}</p>
          </div>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href={`/orders/${id}/progress/new`} className="btn btn-success">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
              Update Progres
            </Link>
            <Link href={`/orders/${id}/edit`} className="btn btn-secondary">Edit Order</Link>
            <DeleteOrderButton orderId={Number(id)} kodeOrder={order.kode_order} />
          </div>
        )}
      </div>

      <div className="page-body" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>
        {/* Left: Info + Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Order Info */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <h2 className="card-title" style={{ marginBottom: 0 }}>Informasi Order</h2>
              <span className={`badge ${badgeMap[order.status] ?? 'badge-gray'}`} style={{ fontSize: '0.8rem' }}>
                {STATUS_MAP[order.status]?.label ?? order.status}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                ['Kode Order',       order.kode_order],
                ['Jenis Layanan',    order.jenis_layanan],
                ['Bandwidth',        order.bandwidth ?? '-'],
                ['Pelanggan',        order.customers?.nama_perusahaan ?? '-'],
                ['PIC Pelanggan',    order.customers?.pic_name ?? '-'],
                ['Phone',            order.customers?.phone ?? '-'],
                ['Account Manager',  order.profiles?.nama ?? '-'],
                ['Tgl Order',        formatDateShort(order.tgl_order)],
                ['Target Selesai',   formatDateShort(order.tgl_target_selesai)],
                ['Dibuat',           formatDateTime(order.created_at)],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: '0.9rem', color: '#1a202c', fontWeight: 500 }}>{value}</div>
                </div>
              ))}
              {order.catatan && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Catatan</div>
                  <div style={{ fontSize: '0.9rem', color: '#374151', background: '#f8fafc', padding: '10px 14px', borderRadius: 8, borderLeft: '3px solid #3b82f6' }}>{order.catatan}</div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar Summary */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="card-title" style={{ marginBottom: 0 }}>Progress Pemasangan</div>
              <span style={{ fontWeight: 700, color: '#3b82f6', fontSize: '1rem' }}>{progressPct}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPct}%` }}/>
            </div>
            {latestProgress && (
              <div style={{ marginTop: 12, fontSize: '0.8rem', color: '#6b7280' }}>
                Tahap terakhir: <strong style={{ color: '#1a202c' }}>{TAHAP_MAP[latestProgress.tahap]?.label}</strong> — {formatDateShort(latestProgress.tgl_update)}
              </div>
            )}
          </div>
        </div>

        {/* Right: Timeline */}
        <div className="card">
          <div className="card-title">Timeline Progres</div>
          {(!progressList || progressList.length === 0) ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <div className="empty-icon">🔍</div>
              <div className="empty-title">Belum ada progres</div>
              <div className="empty-desc">Tambahkan update progres pemasangan</div>
            </div>
          ) : (
            <ol className="timeline-list">
              {progressList.map((p: any) => {
                const tahap = TAHAP_MAP[p.tahap]
                const isDone = p.tahap === 'selesai'
                return (
                  <li key={p.id} className="timeline-item">
                    <div className={`timeline-dot ${isDone ? 'done' : 'active'}`}>{tahap?.icon}</div>
                    <div className="timeline-content">
                      <div className="timeline-title">{tahap?.label ?? p.tahap}</div>
                      <div className="timeline-meta">{formatDateShort(p.tgl_update)} · {p.persentase}% · {p.profiles?.nama ?? '-'}</div>
                      {p.catatan && <div className="timeline-note">{p.catatan}</div>}
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}
