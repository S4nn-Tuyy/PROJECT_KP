import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import ProgressForm from '@/components/progress/ProgressForm'

export const metadata = { title: 'Update Progres' }

export default async function NewProgressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect(`/orders/${id}`)

  const { data: order } = await supabase.from('orders').select('kode_order, jenis_layanan').eq('id', id).single()
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
            <h1 className="page-title">Update Progres Pemasangan</h1>
            <p className="page-subtitle">{order.kode_order} · {order.jenis_layanan}</p>
          </div>
        </div>
      </div>
      <div className="page-body" style={{ maxWidth: 600 }}>
        <ProgressForm
          orderId={Number(id)}
          currentUserId={user.id}
          currentUserNama={profile?.nama ?? 'Admin'}
        />
      </div>
    </div>
  )
}
