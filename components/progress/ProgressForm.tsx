'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TAHAP_MAP } from '@/lib/utils/helpers'

interface Props {
  orderId:         number
  currentUserId:   string
  currentUserNama: string
}

export default function ProgressForm({ orderId, currentUserId, currentUserNama }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [form, setForm] = useState({
    tgl_update:  new Date().toISOString().slice(0, 10),
    tahap:       'survey',
    persentase:  20,
    catatan:     '',
  })

  const tahapOptions = [
    { value: 'survey',          label: '🔍 Survey Lokasi',    pct: 20 },
    { value: 'instalasi_kabel', label: '🔌 Instalasi Kabel',  pct: 50 },
    { value: 'konfigurasi',     label: '⚙️ Konfigurasi',      pct: 75 },
    { value: 'testing',         label: '🧪 Testing Koneksi',  pct: 90 },
    { value: 'selesai',         label: '✅ Selesai & Aktif',  pct: 100 },
  ]

  function handleTahapChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = tahapOptions.find(t => t.value === e.target.value)
    setForm(prev => ({ ...prev, tahap: e.target.value, persentase: selected?.pct ?? prev.persentase }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')

    const supabase = createClient()
    const { data, error: err } = await supabase.from('installation_progress').insert({
      order_id:   orderId,
      tgl_update: form.tgl_update,
      tahap:      form.tahap,
      persentase: form.persentase,
      catatan:    form.catatan || null,
      user_id:    currentUserId,
    }).select().single()

    if (err) { setError(err.message); setLoading(false); return }

    // Update status order jika selesai
    if (form.tahap === 'selesai') {
      await supabase.from('orders').update({ status: 'selesai' }).eq('id', orderId)
    } else if (form.tahap !== 'survey') {
      await supabase.from('orders').update({ status: 'proses' }).eq('id', orderId)
    }

    await supabase.from('audit_logs').insert({
      user_id: currentUserId, user_nama: currentUserNama,
      aksi: 'CREATE', tabel_target: 'installation_progress', id_target: String(data.id),
      data_lama: null, data_baru: form,
    })

    router.push(`/orders/${orderId}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="form-group">
        <label className="form-label">Tanggal Update <span className="required">*</span></label>
        <input type="date" className="form-input" value={form.tgl_update}
          onChange={e => setForm(p => ({ ...p, tgl_update: e.target.value }))} required/>
      </div>

      <div className="form-group">
        <label className="form-label">Tahap Pemasangan <span className="required">*</span></label>
        <select className="form-input form-select" value={form.tahap} onChange={handleTahapChange} required>
          {tahapOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Persentase Progress: <strong>{form.persentase}%</strong></label>
        <input type="range" min={0} max={100} step={5} value={form.persentase}
          onChange={e => setForm(p => ({ ...p, persentase: Number(e.target.value) }))}
          style={{ width: '100%', accentColor: '#3b82f6' }}/>
        <div className="progress-bar" style={{ marginTop: 8 }}>
          <div className="progress-fill" style={{ width: `${form.persentase}%` }}/>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Catatan Teknisi</label>
        <textarea className="form-input form-textarea" value={form.catatan}
          onChange={e => setForm(p => ({ ...p, catatan: e.target.value }))}
          rows={3} placeholder="Deskripsi pekerjaan yang dilakukan..."/>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-secondary" onClick={() => router.back()} disabled={loading}>Batal</button>
        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? 'Menyimpan...' : 'Simpan Progres'}
        </button>
      </div>
    </form>
  )
}
