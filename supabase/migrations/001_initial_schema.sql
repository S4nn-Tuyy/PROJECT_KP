-- ============================================================
-- SISTEM MONITORING KINERJA PELAYANAN PELANGGAN ENTERPRISE
-- PT Telkom Indonesia – Wilayah Sulbagsel
-- Migration: 001_initial_schema.sql
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: profiles (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama       TEXT NOT NULL,
  username   TEXT UNIQUE NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('admin', 'account_manager')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: customers (data pelanggan enterprise)
-- ============================================================
CREATE TABLE public.customers (
  id              SERIAL PRIMARY KEY,
  nama_perusahaan TEXT NOT NULL,
  alamat          TEXT,
  pic_name        TEXT,
  phone           TEXT,
  email           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: orders (data order layanan)
-- ============================================================
CREATE TABLE public.orders (
  id                  SERIAL PRIMARY KEY,
  customer_id         INT REFERENCES public.customers(id) ON DELETE SET NULL,
  kode_order          TEXT UNIQUE NOT NULL,
  jenis_layanan       TEXT NOT NULL,
  bandwidth           TEXT,
  tgl_order           DATE NOT NULL,
  tgl_target_selesai  DATE,
  status              TEXT NOT NULL CHECK (status IN ('pending','proses','selesai','gagal')) DEFAULT 'pending',
  account_manager_id  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  catatan             TEXT,
  deleted_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: installation_progress (progres pemasangan per order)
-- ============================================================
CREATE TABLE public.installation_progress (
  id          SERIAL PRIMARY KEY,
  order_id    INT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  tgl_update  DATE NOT NULL,
  tahap       TEXT NOT NULL CHECK (tahap IN ('survey','instalasi_kabel','konfigurasi','testing','selesai')),
  persentase  SMALLINT NOT NULL CHECK (persentase BETWEEN 0 AND 100) DEFAULT 0,
  catatan     TEXT,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: audit_logs (riwayat perubahan data - immutable)
-- ============================================================
CREATE TABLE public.audit_logs (
  id           SERIAL PRIMARY KEY,
  user_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_nama    TEXT NOT NULL,
  aksi         TEXT NOT NULL CHECK (aksi IN ('CREATE','UPDATE','DELETE')),
  tabel_target TEXT NOT NULL,
  id_target    TEXT NOT NULL,
  data_lama    JSONB,
  data_baru    JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: import_history (riwayat import file CSV/Excel)
-- ============================================================
CREATE TABLE public.import_history (
  id            SERIAL PRIMARY KEY,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_nama     TEXT,
  filename      TEXT NOT NULL,
  total_rows    INT DEFAULT 0,
  success_rows  INT DEFAULT 0,
  failed_rows   INT DEFAULT 0,
  error_detail  JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES untuk performa query
-- ============================================================
CREATE INDEX idx_orders_status        ON public.orders(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_customer      ON public.orders(customer_id);
CREATE INDEX idx_orders_am            ON public.orders(account_manager_id);
CREATE INDEX idx_orders_tgl_order     ON public.orders(tgl_order);
CREATE INDEX idx_orders_deleted_at    ON public.orders(deleted_at);
CREATE INDEX idx_progress_order_id    ON public.installation_progress(order_id);
CREATE INDEX idx_audit_user_id        ON public.audit_logs(user_id);
CREATE INDEX idx_audit_created_at     ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_tabel          ON public.audit_logs(tabel_target);

-- ============================================================
-- TRIGGER: auto update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_progress_updated_at
  BEFORE UPDATE ON public.installation_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

-- customers: semua authenticated bisa lihat, hanya admin bisa CUD
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers_select"  ON public.customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "customers_insert"  ON public.customers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "customers_update"  ON public.customers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "customers_delete"  ON public.customers FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- orders: semua authenticated bisa lihat, hanya admin bisa CUD
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_select"  ON public.orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "orders_insert"  ON public.orders FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "orders_update"  ON public.orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "orders_delete"  ON public.orders FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- installation_progress: semua authenticated bisa lihat, hanya admin bisa CUD
ALTER TABLE public.installation_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progress_select"  ON public.installation_progress FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "progress_insert"  ON public.installation_progress FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "progress_update"  ON public.installation_progress FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "progress_delete"  ON public.installation_progress FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- audit_logs: hanya admin bisa lihat, INSERT hanya via service_role
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_select_admin"  ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- import_history: hanya admin bisa lihat & insert
ALTER TABLE public.import_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "import_select_admin"  ON public.import_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "import_insert_admin"  ON public.import_history FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- VIEWS untuk dashboard
-- ============================================================

-- View: ringkasan statistik order
CREATE OR REPLACE VIEW public.v_order_stats AS
SELECT
  COUNT(*) FILTER (WHERE deleted_at IS NULL)                         AS total_all,
  COUNT(*) FILTER (WHERE status = 'pending'  AND deleted_at IS NULL) AS total_pending,
  COUNT(*) FILTER (WHERE status = 'proses'   AND deleted_at IS NULL) AS total_proses,
  COUNT(*) FILTER (WHERE status = 'selesai'  AND deleted_at IS NULL) AS total_selesai,
  COUNT(*) FILTER (WHERE status = 'gagal'    AND deleted_at IS NULL) AS total_gagal,
  ROUND(AVG(
    CASE WHEN status = 'selesai' AND deleted_at IS NULL
    THEN (tgl_target_selesai - tgl_order) END
  ), 1) AS avg_durasi_hari
FROM public.orders;

-- View: order per bulan (untuk chart tren)
CREATE OR REPLACE VIEW public.v_orders_per_month AS
SELECT
  DATE_TRUNC('month', tgl_order) AS bulan,
  COUNT(*)                        AS total,
  COUNT(*) FILTER (WHERE status = 'selesai') AS selesai,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending,
  COUNT(*) FILTER (WHERE status = 'proses')  AS proses,
  COUNT(*) FILTER (WHERE status = 'gagal')   AS gagal
FROM public.orders
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('month', tgl_order)
ORDER BY bulan DESC;
