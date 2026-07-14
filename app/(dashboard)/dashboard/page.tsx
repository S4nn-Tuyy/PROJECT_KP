import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch stats
  const { data: orders } = await supabase
    .from('orders')
    .select('id, status, tgl_order, tgl_target_selesai, kode_order, jenis_layanan, customers(nama_perusahaan)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const allOrders   = orders ?? []
  const totalAll    = allOrders.length
  const totalPending = allOrders.filter(o => o.status === 'pending').length
  const totalProses  = allOrders.filter(o => o.status === 'proses').length
  const totalSelesai = allOrders.filter(o => o.status === 'selesai').length
  const totalGagal   = allOrders.filter(o => o.status === 'gagal').length

  // Orders per month (last 12 months)
  const monthlyMap: Record<string, { total: number; selesai: number; pending: number; proses: number; gagal: number }> = {}
  allOrders.forEach(o => {
    const m = o.tgl_order?.slice(0, 7) // YYYY-MM
    if (!m) return
    if (!monthlyMap[m]) monthlyMap[m] = { total: 0, selesai: 0, pending: 0, proses: 0, gagal: 0 }
    monthlyMap[m].total++
    monthlyMap[m][o.status as keyof typeof monthlyMap[string]]++
  })
  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([bulan, v]) => ({ bulan, ...v }))

  const recentOrders = allOrders.slice(0, 10)

  return (
    <DashboardClient
      stats={{ total_all: totalAll, total_pending: totalPending, total_proses: totalProses, total_selesai: totalSelesai, total_gagal: totalGagal, avg_durasi_hari: null }}
      monthlyData={monthlyData}
      recentOrders={recentOrders as any[]}
    />
  )
}
