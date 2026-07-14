'use client'

import { useEffect, useRef } from 'react'
import { formatDateShort, STATUS_MAP } from '@/lib/utils/helpers'
import type { OrderStats, OrderPerMonth } from '@/types'

interface Props {
  stats:        OrderStats
  monthlyData:  OrderPerMonth[]
  recentOrders: any[]
}

export default function DashboardClient({ stats, monthlyData, recentOrders }: Props) {
  const barRef  = useRef<HTMLCanvasElement>(null)
  const pieRef  = useRef<HTMLCanvasElement>(null)
  const barChart = useRef<any>(null)
  const pieChart = useRef<any>(null)

  useEffect(() => {
    let Chart: any
    async function initCharts() {
      const mod = await import('chart.js/auto')
      Chart = mod.default

      // --- Bar Chart ---
      if (barRef.current) {
        if (barChart.current) barChart.current.destroy()
        const labels = monthlyData.map(d => {
          const [y, m] = d.bulan.split('-')
          return new Date(+y, +m - 1).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
        })
        barChart.current = new Chart(barRef.current, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              { label: 'Selesai', data: monthlyData.map(d => d.selesai), backgroundColor: '#22c55e', borderRadius: 6, stack: 'a' },
              { label: 'Proses',  data: monthlyData.map(d => d.proses),  backgroundColor: '#3b82f6', borderRadius: 6, stack: 'a' },
              { label: 'Pending', data: monthlyData.map(d => d.pending), backgroundColor: '#facc15', borderRadius: 6, stack: 'a' },
              { label: 'Gagal',   data: monthlyData.map(d => d.gagal),   backgroundColor: '#ef4444', borderRadius: 6, stack: 'a' },
            ],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16, font: { size: 12 } } }, tooltip: { mode: 'index' } },
            scales: {
              x: { stacked: true, grid: { display: false }, ticks: { font: { size: 11 } } },
              y: { stacked: true, beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { stepSize: 1, font: { size: 11 } } },
            },
          },
        })
      }

      // --- Donut Chart ---
      if (pieRef.current) {
        if (pieChart.current) pieChart.current.destroy()
        pieChart.current = new Chart(pieRef.current, {
          type: 'doughnut',
          data: {
            labels: ['Pending', 'Proses', 'Selesai', 'Gagal'],
            datasets: [{
              data: [stats.total_pending, stats.total_proses, stats.total_selesai, stats.total_gagal],
              backgroundColor: ['#facc15', '#3b82f6', '#22c55e', '#ef4444'],
              borderWidth: 0, hoverOffset: 8,
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            cutout: '72%',
            plugins: {
              legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16, font: { size: 12 } } },
            },
          },
        })
      }
    }
    initCharts()
    return () => {
      barChart.current?.destroy()
      pieChart.current?.destroy()
    }
  }, [stats, monthlyData])

  const statCards = [
    { label: 'Total Order',    value: stats.total_all,     icon: '📋', color: 'blue'   },
    { label: 'Order Pending',  value: stats.total_pending, icon: '⏳', color: 'yellow' },
    { label: 'Sedang Proses',  value: stats.total_proses,  icon: '🔧', color: 'blue'   },
    { label: 'Order Selesai',  value: stats.total_selesai, icon: '✅', color: 'green'  },
    { label: 'Order Gagal',    value: stats.total_gagal,   icon: '❌', color: 'red'    },
  ]

  const pctSelesai = stats.total_all > 0 ? Math.round((stats.total_selesai / stats.total_all) * 100) : 0

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Monitoring</h1>
          <p className="page-subtitle">Ringkasan kinerja pelayanan pelanggan enterprise – Wilayah Sulbagsel</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          {statCards.map(card => (
            <div key={card.label} className="stat-card">
              <div className={`stat-icon ${card.color}`}>{card.icon}</div>
              <div className="stat-info">
                <div className="stat-value">{card.value}</div>
                <div className="stat-label">{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          {/* Bar Chart */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div className="card-title" style={{ marginBottom: 2 }}>Tren Order per Bulan</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>12 bulan terakhir</div>
              </div>
            </div>
            <div style={{ height: 260 }}>
              <canvas ref={barRef}/>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-title">Distribusi Status</div>
            <div style={{ flex: 1, position: 'relative', minHeight: 200 }}>
              <canvas ref={pieRef}/>
              {/* Center label */}
              <div style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1a202c' }}>{pctSelesai}%</div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: 2 }}>Selesai</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 0' }}>
            <div className="card-title" style={{ marginBottom: 0 }}>Order Terbaru</div>
            <a href="/orders" style={{ fontSize: '0.8rem', color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>
              Lihat semua →
            </a>
          </div>
          <div style={{ marginTop: 16 }}>
            {recentOrders.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 24px' }}>
                <div className="empty-icon">📭</div>
                <div className="empty-title">Belum ada data order</div>
                <div className="empty-desc">Data order akan muncul setelah Supabase terhubung dan seed data dijalankan</div>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Kode Order</th>
                    <th>Pelanggan</th>
                    <th>Jenis Layanan</th>
                    <th>Tanggal Order</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => {
                    const s = STATUS_MAP[order.status]
                    const badgeClass = order.status === 'selesai' ? 'badge-green' : order.status === 'proses' ? 'badge-blue' : order.status === 'pending' ? 'badge-yellow' : 'badge-red'
                    return (
                      <tr key={order.id}>
                        <td><span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#374151' }}>{order.kode_order}</span></td>
                        <td style={{ fontWeight: 500 }}>{order.customers?.nama_perusahaan ?? '-'}</td>
                        <td style={{ color: '#6b7280' }}>{order.jenis_layanan}</td>
                        <td style={{ color: '#6b7280' }}>{formatDateShort(order.tgl_order)}</td>
                        <td><span className={`badge ${badgeClass}`}>{s?.label ?? order.status}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
