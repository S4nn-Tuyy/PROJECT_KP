'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DeleteOrderButton({ orderId, kodeOrder }: { orderId: number; kodeOrder: string }) {
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('orders').update({ deleted_at: new Date().toISOString() }).eq('id', orderId)
    await supabase.from('audit_logs').insert({
      user_id: user?.id, user_nama: 'Admin',
      aksi: 'DELETE', tabel_target: 'orders', id_target: String(orderId),
      data_lama: { kode_order: kodeOrder }, data_baru: null,
    })
    setOpen(false)
    router.push('/orders')
    router.refresh()
  }

  return (
    <>
      <button className="btn btn-danger" onClick={() => setOpen(true)}>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
        Hapus
      </button>
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Hapus Order</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-danger">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <span>Order <strong>{kodeOrder}</strong> akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setOpen(false)} disabled={loading}>Batal</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                {loading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
