import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import OrderForm from '@/components/orders/OrderForm'

export const metadata = { title: 'Edit Order' }

export default async function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/orders')

  const [{ data: order }, { data: customers }, { data: managers }] = await Promise.all([
    supabase.from('orders').select('*').eq('id', id).is('deleted_at', null).single(),
    supabase.from('customers').select('*').order('nama_perusahaan'),
    supabase.from('profiles').select('*').eq('role', 'account_manager').order('nama'),
  ])

  if (!order) notFound()

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href={`/orders/${id}`} className="btn btn-ghost btn-sm" style={{ padding: '6px 10px' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
          </Link>
          <div>
            <h1 className="page-title">Edit Order</h1>
            <p className="page-subtitle" style={{ fontFamily: 'monospace' }}>{order.kode_order}</p>
          </div>
        </div>
      </div>
      <div className="page-body">
        <OrderForm
          mode="edit"
          orderId={Number(id)}
          initial={order}
          customers={customers ?? []}
          managers={managers ?? []}
          currentUserNama={profile?.nama ?? 'Admin'}
          currentUserId={user.id}
        />
      </div>
    </div>
  )
}
