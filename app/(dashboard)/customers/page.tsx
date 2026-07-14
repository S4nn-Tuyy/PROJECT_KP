import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDateShort } from '@/lib/utils/helpers'

export const metadata = { title: 'Data Pelanggan' }

export default async function CustomersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: customers } = await supabase
    .from('customers')
    .select('*, orders(id, status)')
    .order('nama_perusahaan')

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Data Pelanggan</h1>
          <p className="page-subtitle">Daftar pelanggan enterprise yang terdaftar</p>
        </div>
      </div>

      <div className="page-body">
        <div className="table-wrapper">
          {(!customers || customers.length === 0) ? (
            <div className="empty-state">
              <div className="empty-icon">🏢</div>
              <div className="empty-title">Belum ada data pelanggan</div>
              <div className="empty-desc">Data pelanggan akan muncul setelah seed data dijalankan</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Perusahaan</th>
                  <th>PIC</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Total Order</th>
                  <th>Aktif</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c: any) => {
                  const totalOrders  = c.orders?.length ?? 0
                  const activeOrders = c.orders?.filter((o: any) => o.status === 'proses').length ?? 0
                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1a202c' }}>{c.nama_perusahaan}</div>
                        {c.alamat && <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 2 }}>{c.alamat}</div>}
                      </td>
                      <td>{c.pic_name ?? '-'}</td>
                      <td style={{ fontSize: '0.8125rem', color: '#6b7280' }}>{c.phone ?? '-'}</td>
                      <td style={{ fontSize: '0.8125rem', color: '#6b7280' }}>{c.email ?? '-'}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#1a202c' }}>{totalOrders}</span>
                        <span style={{ color: '#6b7280', fontSize: '0.8rem' }}> order</span>
                      </td>
                      <td>
                        {activeOrders > 0
                          ? <span className="badge badge-blue">{activeOrders} proses</span>
                          : <span className="badge badge-gray">-</span>}
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
