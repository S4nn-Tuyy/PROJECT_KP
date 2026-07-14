-- ============================================================
-- SEED DATA
-- PT Telkom Indonesia – Monitoring System
-- Jalankan SETELAH migration 001 selesai
-- ============================================================

-- ============================================================
-- SEED: Users via Supabase Auth (gunakan Supabase Studio atau
--       script ini hanya untuk referensi — password di-hash
--       oleh Supabase Auth secara otomatis saat register)
-- CATATAN: Seed user dilakukan via API di /lib/supabase/seed.ts
-- ============================================================

-- ============================================================
-- SEED: Customers (data pelanggan enterprise sample)
-- ============================================================
INSERT INTO public.customers (nama_perusahaan, alamat, pic_name, phone, email) VALUES
  ('PT Bank Sulawesi Selatan',    'Jl. Ratulangi No. 16, Makassar',       'Budi Santoso',    '0411-123456', 'it@bank-sulsel.co.id'),
  ('PT Pelindo IV',               'Jl. Soekarno No. 1, Makassar',         'Andi Wijaya',     '0411-234567', 'it@pelindo4.co.id'),
  ('Pemerintah Kota Makassar',    'Jl. Ahmad Yani No. 2, Makassar',       'Hendra Kusuma',   '0411-345678', 'it@makassarkota.go.id'),
  ('PT Semen Tonasa',             'Jl. Jend. Sudirman, Pangkep',          'Rizky Pratama',   '0410-123456', 'it@sementonasa.co.id'),
  ('Universitas Hasanuddin',      'Jl. Perintis Kemerdekaan Km 10, Mksr', 'Prof. Syamsul',   '0411-456789', 'it@unhas.ac.id'),
  ('PT PLN (Persero) UIW Sulsel', 'Jl. Sultan Hasanuddin, Makassar',      'Dedi Firmansyah', '0411-567890', 'it@pln-sulsel.co.id'),
  ('RSUD Labuang Baji',           'Jl. Ratulangi No. 81, Makassar',       'dr. Aisyah',      '0411-678901', 'it@rsud-labaji.go.id'),
  ('PT Bosowa Corporation',       'Jl. Urip Sumoharjo, Makassar',         'Herman Lim',      '0411-789012', 'it@bosowa.co.id'),
  ('PT Angkasa Pura I',           'Bandara Sultan Hasanuddin, Mksr',      'Fajar Nugroho',   '0411-890123', 'it@angkasapura1.co.id'),
  ('Bank BPD Sulselbar',          'Jl. Dr. Sam Ratulangi, Makassar',      'Muh. Arif',       '0411-901234', 'it@bpdsulselbar.co.id');

-- ============================================================
-- SEED: Orders (30+ data order realistis)
-- ============================================================
-- Catatan: account_manager_id diisi NULL dulu, diupdate via script setelah user seeded
INSERT INTO public.orders (kode_order, customer_id, jenis_layanan, bandwidth, tgl_order, tgl_target_selesai, status, catatan) VALUES
  -- Orders Selesai
  ('ORD-2025-001', 1, 'Astinet',              '100 Mbps', '2025-01-10', '2025-01-25', 'selesai', 'Instalasi berjalan lancar'),
  ('ORD-2025-002', 2, 'Dedicated Internet',   '200 Mbps', '2025-01-15', '2025-02-01', 'selesai', 'Upgrade dari 100Mbps'),
  ('ORD-2025-003', 3, 'Astinet',              '50 Mbps',  '2025-02-01', '2025-02-15', 'selesai', NULL),
  ('ORD-2025-004', 4, 'Dedicated Internet',   '500 Mbps', '2025-02-10', '2025-03-01', 'selesai', 'Kontrak 2 tahun'),
  ('ORD-2025-005', 5, 'Astinet Lite',         '20 Mbps',  '2025-02-20', '2025-03-10', 'selesai', NULL),
  ('ORD-2025-006', 6, 'Dedicated Internet',   '1 Gbps',   '2025-03-01', '2025-03-20', 'selesai', 'Kapasitas penuh gedung utama'),
  ('ORD-2025-007', 7, 'Astinet',              '100 Mbps', '2025-03-15', '2025-04-01', 'selesai', NULL),
  ('ORD-2025-008', 8, 'Metro Ethernet',       '300 Mbps', '2025-04-01', '2025-04-20', 'selesai', 'Koneksi antar gedung'),
  ('ORD-2025-009', 9, 'Dedicated Internet',   '200 Mbps', '2025-04-10', '2025-05-01', 'selesai', NULL),
  ('ORD-2025-010', 10,'Astinet',              '50 Mbps',  '2025-04-20', '2025-05-10', 'selesai', NULL),
  ('ORD-2025-011', 1, 'Metro Ethernet',       '1 Gbps',   '2025-05-01', '2025-05-20', 'selesai', 'Upgrade koneksi cabang'),
  ('ORD-2025-012', 3, 'Dedicated Internet',   '200 Mbps', '2025-05-10', '2025-06-01', 'selesai', NULL),
  -- Orders Proses
  ('ORD-2025-013', 2, 'Astinet',              '500 Mbps', '2025-06-01', '2025-07-01', 'proses',  'Menunggu survey lapangan'),
  ('ORD-2025-014', 5, 'Dedicated Internet',   '100 Mbps', '2025-06-05', '2025-07-05', 'proses',  'Instalasi kabel sedang berjalan'),
  ('ORD-2025-015', 6, 'Astinet Lite',         '20 Mbps',  '2025-06-10', '2025-07-10', 'proses',  NULL),
  ('ORD-2025-016', 8, 'Metro Ethernet',       '500 Mbps', '2025-06-12', '2025-07-12', 'proses',  'Konfigurasi perangkat'),
  ('ORD-2025-017', 9, 'Dedicated Internet',   '1 Gbps',   '2025-06-15', '2025-07-15', 'proses',  'Testing koneksi'),
  ('ORD-2025-018', 4, 'Astinet',              '200 Mbps', '2025-06-20', '2025-07-20', 'proses',  NULL),
  -- Orders Pending
  ('ORD-2025-019', 7, 'Dedicated Internet',   '300 Mbps', '2025-07-01', '2025-08-01', 'pending', 'Menunggu persetujuan anggaran'),
  ('ORD-2025-020', 10,'Metro Ethernet',       '200 Mbps', '2025-07-02', '2025-08-02', 'pending', NULL),
  ('ORD-2025-021', 1, 'Astinet',              '100 Mbps', '2025-07-03', '2025-08-03', 'pending', 'Order baru masuk'),
  ('ORD-2025-022', 2, 'Dedicated Internet',   '500 Mbps', '2025-07-04', '2025-08-04', 'pending', NULL),
  ('ORD-2025-023', 3, 'Astinet Lite',         '50 Mbps',  '2025-07-05', '2025-08-05', 'pending', 'Menunggu survey'),
  ('ORD-2025-024', 5, 'Metro Ethernet',       '1 Gbps',   '2025-07-06', '2025-08-06', 'pending', NULL),
  -- Orders Gagal
  ('ORD-2025-025', 6, 'Dedicated Internet',   '200 Mbps', '2025-03-01', '2025-04-01', 'gagal',   'Lokasi tidak terjangkau infrastruktur'),
  ('ORD-2025-026', 7, 'Astinet',              '100 Mbps', '2025-04-01', '2025-05-01', 'gagal',   'Pelanggan membatalkan kontrak'),
  -- Orders bulan sebelumnya (untuk chart tren)
  ('ORD-2024-050', 8, 'Astinet',              '50 Mbps',  '2024-10-01', '2024-10-20', 'selesai', NULL),
  ('ORD-2024-051', 9, 'Dedicated Internet',   '100 Mbps', '2024-11-01', '2024-11-20', 'selesai', NULL),
  ('ORD-2024-052', 10,'Metro Ethernet',       '200 Mbps', '2024-11-15', '2024-12-01', 'selesai', NULL),
  ('ORD-2024-053', 1, 'Astinet Lite',         '20 Mbps',  '2024-12-01', '2024-12-20', 'selesai', NULL),
  ('ORD-2024-054', 2, 'Dedicated Internet',   '500 Mbps', '2024-12-10', '2025-01-10', 'selesai', NULL);

-- ============================================================
-- SEED: Installation Progress (untuk order yang sudah proses/selesai)
-- ============================================================
-- Order ORD-2025-001 (selesai)
INSERT INTO public.installation_progress (order_id, tgl_update, tahap, persentase, catatan) VALUES
  (1, '2025-01-10', 'survey',           20,  'Survey lokasi selesai, kondisi baik'),
  (1, '2025-01-15', 'instalasi_kabel',  50,  'Penarikan kabel ODP ke gedung selesai'),
  (1, '2025-01-20', 'konfigurasi',      75,  'Konfigurasi router dan switch selesai'),
  (1, '2025-01-23', 'testing',          90,  'Testing koneksi berhasil, kecepatan sesuai SLA'),
  (1, '2025-01-25', 'selesai',          100, 'Layanan aktif, pelanggan puas');

-- Order ORD-2025-002 (selesai)
INSERT INTO public.installation_progress (order_id, tgl_update, tahap, persentase, catatan) VALUES
  (2, '2025-01-15', 'survey',           20,  'Survey selesai'),
  (2, '2025-01-22', 'instalasi_kabel',  50,  'Kabel terpasang'),
  (2, '2025-01-28', 'konfigurasi',      75,  'Perangkat dikonfigurasi'),
  (2, '2025-01-31', 'testing',          90,  'Testing OK'),
  (2, '2025-02-01', 'selesai',          100, 'Aktif');

-- Order ORD-2025-013 (proses - sedang berjalan)
INSERT INTO public.installation_progress (order_id, tgl_update, tahap, persentase, catatan) VALUES
  (13, '2025-06-03', 'survey',          20,  'Survey dijadwalkan tanggal 5 Juni'),
  (13, '2025-06-07', 'instalasi_kabel', 45,  'Penarikan kabel ODP sedang berjalan');

-- Order ORD-2025-014 (proses)
INSERT INTO public.installation_progress (order_id, tgl_update, tahap, persentase, catatan) VALUES
  (14, '2025-06-06', 'survey',          20,  'Survey selesai'),
  (14, '2025-06-10', 'instalasi_kabel', 50,  'Kabel sedang dipasang'),
  (14, '2025-06-15', 'konfigurasi',     70,  'Konfigurasi awal selesai');

-- Order ORD-2025-017 (proses - hampir selesai)
INSERT INTO public.installation_progress (order_id, tgl_update, tahap, persentase, catatan) VALUES
  (17, '2025-06-16', 'survey',          20,  'Survey OK'),
  (17, '2025-06-20', 'instalasi_kabel', 50,  'Kabel terpasang'),
  (17, '2025-06-25', 'konfigurasi',     75,  'Konfigurasi selesai'),
  (17, '2025-06-28', 'testing',         90,  'Testing sedang berlangsung');
