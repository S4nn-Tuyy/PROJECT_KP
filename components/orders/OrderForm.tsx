'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Customer, Profile, OrderStatus } from '@/types'

interface Props {
  mode:       'create' | 'edit'
  orderId?:   number
  initial?:   Record<string, any>
  customers:  Customer[]
  managers:   Profile[]
  currentUserNama: string
  currentUserId:   string
}

const JENIS_LAYANAN = ['Astinet', 'Astinet Lite', 'Dedicated Internet', 'Metro Ethernet', 'IP Transit', 'MPLS']

export default function OrderForm({ mode, orderId, initial, customers, managers, currentUserNama, currentUserId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [form, setForm] = useState({
    customer_id:        initial?.customer_id        ?? '',
    kode_order:         initial?.kode_order         ?? '',
    jenis_layanan:      initial?.jenis_layanan      ?? '',
    bandwidth:          initial?.bandwidth           ?? '',
    tgl_order:          initial?.tgl_order          ?? '',
    tgl_target_selesai: initial?.tgl_target_selesai ?? '',
    status:             initial?.status             ?? 'pending',
    account_manager_id: initial?.account_manager_id ?? '',
    catatan:            initial?.catatan            ?? '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const payload = {
      ...form,
      customer_id:        Number(form.customer_id),
      account_manager_id: form.account_manager_id || null,
    }

    if (mode === 'create') {
      const { data, error: err } = await supabase.from('orders').insert(payload).select().single()
      if (err) { setError(err.message); setLoading(false); return }

      await supabase.from('audit_logs').insert({
        user_id: currentUserId, user_nama: currentUserNama,
        aksi: 'CREATE', tabel_target: 'orders', id_target: String(data.id),
        data_lama: null, data_baru: payload,
      })
      router.push(`/orders/${data.id}`)
    } else {
      const { error: err } = await supabase.from('orders').update(payload).eq('id', orderId!)
      if (err) { setError(err.message); setLoading(false); return }

      await supabase.from('audit_logs').insert({
        user_id: currentUserId, user_nama: currentUserNama,
        aksi: 'UPDATE', tabel_target: 'orders', id_target: String(orderId),
        data_lama: initial, data_baru: payload,
      })
      router.push(`/orders/${orderId}`)
    }
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <h3 className="card-title">Informasi Pelanggan</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Pelanggan <span className="required">*</span></label>
            <select name="customer_id" className="form-input form-select" value={form.customer_id} onChange={handleChange} required>
              <option value="">Pilih Pelanggan</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.nama_perusahaan}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Kode Order <span className="required">*</span></label>
            <input name="kode_order" className="form-input" value={form.kode_order} onChange={handleChange} placeholder="ORD-2025-001" required/>
          </div>
          <div className="form-group">
            <label className="form-label">Account Manager</label>
            <select name="account_manager_id" className="form-input form-select" value={form.account_manager_id} onChange={handleChange}>
              <option value="">Pilih AM</option>
              {managers.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Detail Layanan</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Jenis Layanan <span className="required">*</span></label>
            <select name="jenis_layanan" className="form-input form-select" value={form.jenis_layanan} onChange={handleChange} required>
              <option value="">Pilih Layanan</option>
              {JENIS_LAYANAN.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Bandwidth</label>
            <input name="bandwidth" className="form-input" value={form.bandwidth} onChange={handleChange} placeholder="100 Mbps"/>
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal Order <span className="required">*</span></label>
            <input name="tgl_order" type="date" className="form-input" value={form.tgl_order} onChange={handleChange} required/>
          </div>
          <div className="form-group">
            <label className="form-label">Target Selesai</label>
            <input name="tgl_target_selesai" type="date" className="form-input" value={form.tgl_target_selesai} onChange={handleChange}/>
          </div>
          <div className="form-group">
            <label className="form-label">Status <span className="required">*</span></label>
            <select name="status" className="form-input form-select" value={form.status} onChange={handleChange} required>
              <option value="pending">Pending</option>
              <option value="proses">Proses</option>
              <option value="selesai">Selesai</option>
              <option value="gagal">Gagal</option>
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Catatan</label>
            <textarea name="catatan" className="form-input form-textarea" value={form.catatan} onChange={handleChange} rows={3} placeholder="Catatan tambahan..."/>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-secondary" onClick={() => router.back()} disabled={loading}>Batal</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Menyimpan...' : mode === 'create' ? 'Tambah Order' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  )
}
