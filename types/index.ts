// ============================================================
// DATABASE TYPES
// PT Telkom Indonesia – Monitoring System
// ============================================================

export type UserRole = 'admin' | 'account_manager'

export type OrderStatus = 'pending' | 'proses' | 'selesai' | 'gagal'

export type TahapPemasangan =
  | 'survey'
  | 'instalasi_kabel'
  | 'konfigurasi'
  | 'testing'
  | 'selesai'

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE'

// ============================================================

export interface Profile {
  id:         string
  nama:       string
  username:   string
  role:       UserRole
  created_at: string
}

export interface Customer {
  id:              number
  nama_perusahaan: string
  alamat:          string | null
  pic_name:        string | null
  phone:           string | null
  email:           string | null
  created_at:      string
  updated_at:      string
}

export interface Order {
  id:                  number
  customer_id:         number | null
  kode_order:          string
  jenis_layanan:       string
  bandwidth:           string | null
  tgl_order:           string
  tgl_target_selesai:  string | null
  status:              OrderStatus
  account_manager_id:  string | null
  catatan:             string | null
  deleted_at:          string | null
  created_at:          string
  updated_at:          string
  // joined
  customers?:          Customer
  profiles?:           Profile
}

export interface InstallationProgress {
  id:         number
  order_id:   number
  tgl_update: string
  tahap:      TahapPemasangan
  persentase: number
  catatan:    string | null
  user_id:    string | null
  created_at: string
  updated_at: string
  // joined
  profiles?:  Profile
}

export interface AuditLog {
  id:           number
  user_id:      string | null
  user_nama:    string
  aksi:         AuditAction
  tabel_target: string
  id_target:    string
  data_lama:    Record<string, unknown> | null
  data_baru:    Record<string, unknown> | null
  created_at:   string
}

export interface ImportHistory {
  id:           number
  user_id:      string | null
  user_nama:    string | null
  filename:     string
  total_rows:   number
  success_rows: number
  failed_rows:  number
  error_detail: Record<string, unknown> | null
  created_at:   string
}

// ============================================================
// DASHBOARD TYPES
// ============================================================

export interface OrderStats {
  total_all:       number
  total_pending:   number
  total_proses:    number
  total_selesai:   number
  total_gagal:     number
  avg_durasi_hari: number | null
}

export interface OrderPerMonth {
  bulan:   string
  total:   number
  selesai: number
  pending: number
  proses:  number
  gagal:   number
}

// ============================================================
// FORM TYPES
// ============================================================

export interface OrderFormData {
  customer_id:        number
  kode_order:         string
  jenis_layanan:      string
  bandwidth:          string
  tgl_order:          string
  tgl_target_selesai: string
  status:             OrderStatus
  account_manager_id: string
  catatan:            string
}

export interface ProgressFormData {
  tgl_update:  string
  tahap:       TahapPemasangan
  persentase:  number
  catatan:     string
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T = unknown> {
  data:    T | null
  error:   string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data:       T[]
  total:      number
  page:       number
  pageSize:   number
  totalPages: number
}

// ============================================================
// FILTER TYPES
// ============================================================

export interface OrderFilter {
  status?:    OrderStatus | 'all'
  search?:    string
  startDate?: string
  endDate?:   string
  amId?:      string
  page?:      number
  pageSize?:  number
}

export interface ReportFilter {
  startDate?:   string
  endDate?:     string
  status?:      OrderStatus | 'all'
  amId?:        string
  jenisLayanan?: string
}
