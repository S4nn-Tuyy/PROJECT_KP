import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDateShort, STATUS_MAP } from '@/lib/utils/helpers'
import ReportClient from './ReportClient'

export const metadata = { title: 'Laporan' }

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string; status?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params    = await searchParams
  const startDate = params.startDate ?? ''
  const endDate   = params.endDate   ?? ''
  const status    = params.status    ?? 'all'

  let query = supabase
    .from('orders')
    .select('*, customers(nama_perusahaan, pic_name), profiles(nama)')
    .is('deleted_at', null)
    .order('tgl_order', { ascending: false })

  if (status !== 'all') query = query.eq('status', status)
  if (startDate) query = query.gte('tgl_order', startDate)
  if (endDate)   query = query.lte('tgl_order', endDate)

  const { data: orders } = await query

  const allOrders = orders ?? []
  const stats = {
    total:   allOrders.length,
    selesai: allOrders.filter(o => o.status === 'selesai').length,
    proses:  allOrders.filter(o => o.status === 'proses').length,
    pending: allOrders.filter(o => o.status === 'pending').length,
    gagal:   allOrders.filter(o => o.status === 'gagal').length,
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Laporan</h1>
          <p className="page-subtitle">Rekap dan visualisasi data order layanan</p>
        </div>
      </div>
      <div className="page-body">
        <ReportClient
          orders={allOrders as any[]}
          stats={stats}
          filters={{ startDate, endDate, status }}
        />
      </div>
    </div>
  )
}
