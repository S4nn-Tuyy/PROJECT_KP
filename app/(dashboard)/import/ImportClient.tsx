'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Customer } from '@/types'
import { useRouter } from 'next/navigation'

interface Props {
  currentUserId:   string
  currentUserNama: string
  customers:       Customer[]
}

interface PreviewRow {
  row:    number
  data:   Record<string, string>
  error?: string
  valid:  boolean
}

const REQUIRED_COLS = ['kode_order', 'jenis_layanan', 'tgl_order', 'status']
const TEMPLATE_HEADERS = ['kode_order', 'nama_perusahaan', 'jenis_layanan', 'bandwidth', 'tgl_order', 'tgl_target_selesai', 'status', 'catatan']

export default function ImportClient({ currentUserId, currentUserNama, customers }: Props) {
  const router      = useRouter()
  const fileRef     = useRef<HTMLInputElement>(null)
  const [file, setFile]         = useState<File | null>(null)
  const [preview, setPreview]   = useState<PreviewRow[]>([])
  const [loading, setLoading]   = useState(false)
  const [result,  setResult]    = useState<{ success: number; failed: number } | null>(null)
  const [error,   setError]     = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f); setResult(null); setError('')

    const { read, utils } = await import('xlsx')
    const buffer = await f.arrayBuffer()
    const wb     = read(buffer)
    const ws     = wb.Sheets[wb.SheetNames[0]]
    const rows   = utils.sheet_to_json<Record<string, string>>(ws, { defval: '' })

    const previews: PreviewRow[] = rows.slice(0, 5).map((row, i) => {
      const missing = REQUIRED_COLS.filter(col => !row[col])
      return { row: i + 2, data: row, valid: missing.length === 0, error: missing.length ? `Kolom wajib kosong: ${missing.join(', ')}` : undefined }
    })
    setPreview(previews)
  }

  async function handleImport() {
    if (!file) return
    setLoading(true); setError('')

    const { read, utils } = await import('xlsx')
    const buffer = await file.arrayBuffer()
    const wb     = read(buffer)
    const ws     = wb.Sheets[wb.SheetNames[0]]
    const rows   = utils.sheet_to_json<Record<string, string>>(ws, { defval: '' })

    const supabase = createClient()
    let success = 0; let failed = 0
    const errors: any[] = []

    const customerMap = Object.fromEntries(customers.map(c => [c.nama_perusahaan.toLowerCase(), c.id]))

    for (const row of rows) {
      const missing = REQUIRED_COLS.filter(col => !row[col])
      if (missing.length > 0) { failed++; errors.push({ row: row.kode_order, error: `Missing: ${missing.join(', ')}` }); continue }

      const customerId = customerMap[row.nama_perusahaan?.toLowerCase()] ?? null

      const { error: err } = await supabase.from('orders').insert({
        kode_order:         row.kode_order,
        customer_id:        customerId,
        jenis_layanan:      row.jenis_layanan,
        bandwidth:          row.bandwidth || null,
        tgl_order:          row.tgl_order,
        tgl_target_selesai: row.tgl_target_selesai || null,
        status:             ['pending','proses','selesai','gagal'].includes(row.status) ? row.status : 'pending',
        catatan:            row.catatan || null,
      })

      if (err) { failed++; errors.push({ row: row.kode_order, error: err.message }) }
      else success++
    }

    // Save import history
    await supabase.from('import_history').insert({
      user_id:     currentUserId,
      user_nama:   currentUserNama,
      filename:    file.name,
      total_rows:  rows.length,
      success_rows: success,
      failed_rows:  failed,
      error_detail: errors.length > 0 ? errors : null,
    })

    setResult({ success, failed })
    setLoading(false)
    setFile(null); if (fileRef.current) fileRef.current.value = ''
    setPreview([])
    router.refresh()
  }

  function downloadTemplate() {
    import('xlsx').then(({ utils, writeFile }) => {
      const ws = utils.aoa_to_sheet([TEMPLATE_HEADERS, ['ORD-2025-XXX', 'PT Contoh', 'Astinet', '100 Mbps', '2025-07-01', '2025-08-01', 'pending', 'Catatan']])
      const wb = utils.book_new(); utils.book_append_sheet(wb, ws, 'Template')
      writeFile(wb, 'template-import-order.xlsx')
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Upload Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 className="card-title" style={{ marginBottom: 0 }}>Upload File</h3>
          <button onClick={downloadTemplate} className="btn btn-secondary btn-sm">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Download Template
          </button>
        </div>

        <div
          style={{
            border: '2px dashed #d1d5db', borderRadius: 12, padding: '40px 24px',
            textAlign: 'center', background: '#f8fafc', cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if(f) { const inp = fileRef.current; if(inp){ const dt = new DataTransfer(); dt.items.add(f); inp.files = dt.files; handleFile({ target: inp } as any) } } }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📂</div>
          <div style={{ fontWeight: 600, color: '#374151' }}>Klik atau drag & drop file di sini</div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 6 }}>CSV atau Excel (.xlsx) — maks 5MB</div>
          {file && <div style={{ marginTop: 12, fontSize: '0.875rem', color: '#2563eb', fontWeight: 500 }}>📄 {file.name}</div>}
        </div>
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={handleFile}/>

        <div className="alert alert-info" style={{ marginTop: 16 }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Kolom wajib: <strong>kode_order, jenis_layanan, tgl_order, status</strong>. Download template untuk format yang benar.</span>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={`alert ${result.failed === 0 ? 'alert-success' : 'alert-warning'}`}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Import selesai: <strong>{result.success} baris berhasil</strong>{result.failed > 0 ? `, ${result.failed} baris gagal` : ''}.</span>
        </div>
      )}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Preview */}
      {preview.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="card-title" style={{ marginBottom: 0 }}>Preview (5 baris pertama)</h3>
            <button onClick={handleImport} className="btn btn-primary" disabled={loading}>
              {loading ? 'Mengimport...' : `Import Semua Data`}
            </button>
          </div>
          <div className="table-wrapper" style={{ overflow: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Baris</th><th>Status</th>
                  {Object.keys(preview[0]?.data ?? {}).slice(0, 6).map(k => <th key={k}>{k}</th>)}
                </tr>
              </thead>
              <tbody>
                {preview.map(p => (
                  <tr key={p.row}>
                    <td>{p.row}</td>
                    <td>
                      {p.valid
                        ? <span className="badge badge-green">Valid</span>
                        : <span className="badge badge-red" title={p.error}>Error</span>}
                    </td>
                    {Object.values(p.data).slice(0, 6).map((v, i) => <td key={i} style={{ fontSize: '0.8rem' }}>{v || '-'}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
