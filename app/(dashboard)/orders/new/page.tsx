import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import OrderForm from '@/components/orders/OrderForm'

export const metadata = { title: 'Tambah Order' }

export default async function NewOrderPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/orders')

  const [{ data: customers }, { data: managers }] = await Promise.all([
    supabase.from('customers').select('*').order('nama_perusahaan'),
    supabase.from('profiles').select('*').eq('role', 'account_manager').order('nama'),
  ])

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
            <h1 className="page-title">Tambah Order Baru</h1>
            <p className="page-subtitle">Isi form berikut untuk menambahkan order layanan baru</p>
          </div>
        </div>
      </div>
      <div className="page-body">
        <OrderForm
          mode="create"
          customers={customers ?? []}
          managers={managers ?? []}
          currentUserNama={profile?.nama ?? 'Admin'}
          currentUserId={user.id}
        />
      </div>
    </div>
  )
}
