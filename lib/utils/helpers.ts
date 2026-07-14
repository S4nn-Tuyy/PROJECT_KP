import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day:   '2-digit',
    month: 'long',
    year:  'numeric',
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending',  color: 'yellow' },
  proses:  { label: 'Proses',   color: 'blue'   },
  selesai: { label: 'Selesai',  color: 'green'  },
  gagal:   { label: 'Gagal',    color: 'red'    },
}

export const TAHAP_MAP: Record<string, { label: string; icon: string; step: number }> = {
  survey:          { label: 'Survey Lokasi',      icon: '🔍', step: 1 },
  instalasi_kabel: { label: 'Instalasi Kabel',    icon: '🔌', step: 2 },
  konfigurasi:     { label: 'Konfigurasi',        icon: '⚙️', step: 3 },
  testing:         { label: 'Testing Koneksi',    icon: '🧪', step: 4 },
  selesai:         { label: 'Selesai & Aktif',    icon: '✅', step: 5 },
}

export function getStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    pending: 'badge-yellow',
    proses:  'badge-blue',
    selesai: 'badge-green',
    gagal:   'badge-red',
  }
  return map[status] ?? 'badge-gray'
}
