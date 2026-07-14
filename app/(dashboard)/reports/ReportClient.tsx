'use client'

import { useRef, useEffect, useState } from 'react'
import { formatDateShort, STATUS_MAP } from '@/lib/utils/helpers'
import { useRouter } from 'next/navigation'

interface Props {
  orders:  any[]
  stats:   { total: number; selesai: number; proses: number; pending: number; gagal: number }
  filters: { startDate: string; endDate: string; status: string }
}

export default function ReportClient({ orders, stats, filters }: Props) {
  const router    = useRouter()
  const pieRef    = useRef<HTMLCanvasElement>(null)
  const pieChart  = useRef<any>(null)
  const [form, setForm] = useState(filters)

  useEffect(() => {
    async function initChart() {
      const { default: Chart } = await import('chart.js/auto')
      if (pieRef.current) {
        if (pieChart.current) pieChart.current.destroy()
        pieChart.current = new Chart(pieRef.current, {
          type: 'doughnut',
          data: {
            labels: ['Selesai', 'Proses', 'Pending', 'Gagal'],
            datasets: [{
              data: [stats.selesai, stats.proses, stats.pending, stats.gagal],
              backgroundColor: ['#22c55e', '#3b82f6', '#facc15', '#ef4444'],
              borderWidth: 0, hoverOffset: 6,
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false, cutout: '68%',
            plugins: { legend: { position: 'right', labels: { boxWidth: 12, padding: 14, font: { size: 12 } } } },
          },
        })
      }
    }
    initChart()
    return () => { pieChart.current?.destroy() }
  }, [stats])

  function handleFilter(e: React.FormEvent) {
    e.preventDefault()
    const p = new URLSearchParams()
    if (form.startDate) p.set('startDate', form.startDate)
    if (form.endDate)   p.set('endDate',   form.endDate)
    if (form.status !== 'all') p.set('status', form.status)
    router.push(`/reports?${p.toString()}`)
  }

  async function exportPDF() {
    const { default: jsPDF }    = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF()

    doc.setFontSize(16); doc.setFont('helvetica', 'bold')
    doc.text('PT Telkom Indonesia – Wilayah Sulbagsel', 14, 18)
    doc.setFontSize(12); doc.setFont('helvetica', 'normal')
    doc.text('Laporan Order Layanan Enterprise', 14, 26)
    doc.setFontSize(9); doc.setTextColor(120)
    doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}  |  Total: ${stats.total} order`, 14, 33)
    doc.setTextColor(0)

    autoTable(doc, {
      startY: 40,
      head: [['Kode Order', 'Pelanggan', 'Layanan', 'Tgl Order', 'Target', 'Status']],
      body: orders.map(o => [
        o.kode_order,
        o.customers?.nama_perusahaan ?? '-',
        o.jenis_layanan,
        formatDateShort(o.tgl_order),
        formatDateShort(o.tgl_target_selesai),
        STATUS_MAP[o.status]?.label ?? o.status,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    })
    doc.save(`laporan-telkom-${new Date().toISOString().slice(0,10)}.pdf`)
  }

  async function exportExcel() {
    const { utils, writeFile } = await import('xlsx')
    const ws = utils.json_to_sheet(orders.map(o => ({
      'Kode Order':    o.kode_order,
      'Pelanggan':     o.customers?.nama_perusahaan ?? '-',
      'Jenis Layanan': o.jenis_layanan,
      'Bandwidth':     o.bandwidth ?? '-',
      'Tgl Order':     formatDateShort(o.tgl_order),
      'Target Selesai':formatDateShort(o.tgl_target_selesai),
      'Status':        STATUS_MAP[o.status]?.label ?? o.status,
      'AM':            o.profiles?.nama ?? '-',
      'Catatan':       o.catatan ?? '',
    })))
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Order')
    writeFile(wb, `laporan-telkom-${new Date().toISOString().slice(0,10)}.xlsx`)
  }

  const badgeMap: Record<string, string> = { pending: 'badge-yellow', proses: 'badge-blue', selesai: 'badge-green', gagal: 'badge-red' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Filter */}
      <form onSubmit={handleFilter} className="card" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end', padding: '16px 20px' }}>
        <div className="form-group" style={{ minWidth: 160 }}>
          <label className="form-label">Dari Tanggal</label>
          <input type="date" className="form-input" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}/>
        </div>
        <div className="form-group" style={{ minWidth: 160 }}>
          <label className="form-label">Sampai Tanggal</label>
          <input type="date" className="form-input" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}/>
        </div>
        <div className="form-group" style={{ minWidth: 140 }}>
          <label className="form-label">Status</label>
          <select className="form-input form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
            <option value="all">Semua</option>
            <option value="pending">Pending</option>
            <option value="proses">Proses</option>
            <option value="selesai">Selesai</option>
            <option value="gagal">Gagal</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Terapkan Filter</button>
      </form>

      {/* Stats + Chart Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Summary Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Total Order',   value: stats.total,   color: '#2563eb' },
              { label: 'Selesai',       value: stats.selesai, color: '#16a34a' },
              { label: 'Pending',       value: stats.pending, color: '#ca8a04' },
              { label: 'Proses',        value: stats.proses,  color: '#3b82f6' },
              { label: 'Gagal',         value: stats.gagal,   color: '#dc2626' },
              { label: '% Selesai',     value: `${stats.total > 0 ? Math.round((stats.selesai/stats.total)*100) : 0}%`, color: '#7c3aed' },
            ].map(c => (
              <div key={c.label} className="card" style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: c.color }}>{c.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>{c.label}</div>
              </div>
            ))}
          </div>

          {/* Export Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={exportPDF} className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Export PDF
            </button>
            <button onClick={exportExcel} className="btn btn-success" style={{ flex: 1, justifyContent: 'center' }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Export Excel
            </button>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="card">
          <div className="card-title">Distribusi Status</div>
          <div style={{ height: 220 }}><canvas ref={pieRef}/></div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {orders.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📊</div><div className="empty-title">Tidak ada data</div></div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Kode Order</th><th>Pelanggan</th><th>Jenis Layanan</th>
                <th>Tgl Order</th><th>Target</th><th>Status</th><th>AM</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o: any) => (
                <tr key={o.id}>
                  <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#1e40af', fontWeight: 600 }}>{o.kode_order}</span></td>
                  <td style={{ fontWeight: 500 }}>{o.customers?.nama_perusahaan ?? '-'}</td>
                  <td>{o.jenis_layanan}</td>
                  <td style={{ color: '#6b7280', fontSize: '0.8125rem' }}>{formatDateShort(o.tgl_order)}</td>
                  <td style={{ color: '#6b7280', fontSize: '0.8125rem' }}>{formatDateShort(o.tgl_target_selesai)}</td>
                  <td><span className={`badge ${badgeMap[o.status] ?? 'badge-gray'}`}>{STATUS_MAP[o.status]?.label ?? o.status}</span></td>
                  <td style={{ color: '#6b7280', fontSize: '0.8125rem' }}>{o.profiles?.nama ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
