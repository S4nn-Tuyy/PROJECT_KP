import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDateShort, STATUS_MAP } from '@/lib/utils/helpers'

export const metadata = { title: 'Order Layanan' }

const PAGE_SIZE = 10

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  const params  = await searchParams
  const status  = params.status  ?? 'all'
  const search  = params.search  ?? ''
  const page    = parseInt(params.page ?? '1')
  const offset  = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('orders')
    .select('*, customers(nama_perusahaan), profiles(nama)', { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (status !== 'all') query = query.eq('status', status)
  if (search) query = query.or(`kode_order.ilike.%${search}%,jenis_layanan.ilike.%${search}%`)

  const { data: orders, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  const badgeMap: Record<string, string> = {
    pending: 'badge-yellow', proses: 'badge-blue', selesai: 'badge-green', gagal: 'badge-red'
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Order Layanan</h1>
          <p className="page-subtitle">Kelola data order layanan pelanggan enterprise</p>
        </div>
        {isAdmin && (
          <Link href="/orders/new" className="btn btn-primary">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Tambah Order
          </Link>
        )}
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Filters */}
        <form method="GET" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="search-box" style={{ flex: 1, minWidth: 220 }}>
            <svg className="search-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input name="search" defaultValue={search} className="form-input" style={{ paddingLeft: 36 }} placeholder="Cari kode order atau jenis layanan..."/>
          </div>
          <select name="status" defaultValue={status} className="form-input form-select" style={{ width: 160 }}>
            <option value="all">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="proses">Proses</option>
            <option value="selesai">Selesai</option>
            <option value="gagal">Gagal</option>
          </select>
          <button type="submit" className="btn btn-secondary">Filter</button>
          <Link href="/orders" className="btn btn-ghost">Reset</Link>
        </form>

        {/* Table */}
        <div className="table-wrapper">
          {(!orders || orders.length === 0) ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-title">Tidak ada order ditemukan</div>
              <div className="empty-desc">Coba ubah filter atau tambah order baru</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Kode Order</th>
                  <th>Pelanggan</th>
                  <th>Jenis Layanan</th>
                  <th>Bandwidth</th>
                  <th>Tgl Order</th>
                  <th>Target Selesai</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 600, color: '#1e40af' }}>
                        {order.kode_order}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{order.customers?.nama_perusahaan ?? '-'}</td>
                    <td>{order.jenis_layanan}</td>
                    <td>{order.bandwidth ?? '-'}</td>
                    <td style={{ color: '#6b7280', fontSize: '0.8125rem' }}>{formatDateShort(order.tgl_order)}</td>
                    <td style={{ color: '#6b7280', fontSize: '0.8125rem' }}>{formatDateShort(order.tgl_target_selesai)}</td>
                    <td><span className={`badge ${badgeMap[order.status] ?? 'badge-gray'}`}>{STATUS_MAP[order.status]?.label ?? order.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link href={`/orders/${order.id}`} className="btn btn-ghost btn-sm">Detail</Link>
                        {isAdmin && <Link href={`/orders/${order.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <Link
                key={p}
                href={`/orders?page=${p}&status=${status}&search=${search}`}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500,
                  background: p === page ? '#2563eb' : 'white',
                  color: p === page ? 'white' : '#374151',
                  border: '1px solid',
                  borderColor: p === page ? '#2563eb' : '#d1d5db',
                  textDecoration: 'none',
                }}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
