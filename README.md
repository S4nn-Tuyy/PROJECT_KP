# Sistem Informasi Monitoring Kinerja Pelayanan Pelanggan Enterprise (Telkom Monitoring)

Sistem Informasi Monitoring Kinerja Pelayanan Pelanggan Enterprise berbasis Web pada PT Telkom Indonesia (Sulbagsel). Dibangun menggunakan Next.js 16 (App Router), TypeScript, Tailwind CSS v4, dan Supabase sebagai database.

## Fitur Utama

- **Dashboard Real-Time**: Visualisasi data order, tren bulanan menggunakan Chart.js, serta distribusi status proyek.
- **Manajemen Order (CRUD)**: Pengelolaan penuh data order layanan (tambah, edit, detail, hapus) untuk Administrator.
- **Timeline Progres Pemasangan**: Pemantauan tahapan instalasi dari survey, penarikan kabel, konfigurasi, testing, hingga aktif (selesai).
- **Import Data Excel/CSV**: Fasilitas unggah data massal dengan fitur preview & validasi instan sebelum disimpan ke database.
- **Ekspor Laporan**: Unduh rekapitulasi data dengan filter fleksibel ke format PDF (dilengkapi tabel terformat) dan Excel (.xlsx).
- **Audit Log Keamanan**: Pencatatan aktivitas CUD (Create, Update, Delete) secara otomatis dan aman untuk pelacakan performa staf dan integritas data.

## Tech Stack

- **Framework**: Next.js 16.2.10 (Turbopack enabled)
- **Database / Auth / Backend**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS (v4) & Custom Premium CSS
- **Visualisasi**: Chart.js
- **Ekspor Dokumen**: jsPDF, jsPDF-AutoTable, SheetJS (xlsx)

---

## Panduan Instalasi & Pengaturan

### 1. Kloning Repositori
```bash
git clone https://github.com/S4nn-Tuyy/PROJECT_KP.git
cd PROJECT_KP
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Pengaturan Database Supabase (Cloud)
Karena docker desktop opsional, sistem ini dikonfigurasi menggunakan Supabase Cloud.
1. Buat project baru di [Supabase Console](https://supabase.com).
2. Buka **SQL Editor** pada Dashboard Supabase Anda.
3. Jalankan kode skema dari file `supabase/migrations/001_initial_schema.sql` untuk membuat tabel, relasi, RLS, dan triggers.
4. Jalankan kode benih dari file `supabase/seed.sql` untuk mengisi data awal pelanggan dan pesanan.
5. Buatlah user auth di menu **Authentication > Users** dengan detail kredensial berikut:
   - `admin@telkom.co.id` (Password: `admin123`)
   - `am@telkom.co.id` (Password: `telkom123`)
6. Jalankan kueri SQL berikut untuk mendaftarkan user auth tadi ke profil role:
   ```sql
   INSERT INTO public.profiles (id, nama, username, role)
   SELECT 
     id,
     CASE 
       WHEN email = 'admin@telkom.co.id' THEN 'Administrator'
       WHEN email = 'am@telkom.co.id'    THEN 'AM Sulbagsel'
     END as nama,
     CASE 
       WHEN email = 'admin@telkom.co.id' THEN 'admin'
       WHEN email = 'am@telkom.co.id'    THEN 'am_sulbagsel'
     END as username,
     CASE 
       WHEN email = 'admin@telkom.co.id' THEN 'admin'
       WHEN email = 'am@telkom.co.id'    THEN 'account_manager'
     END as role
   FROM auth.users
   WHERE email IN ('admin@telkom.co.id', 'am@telkom.co.id');
   ```

### 4. Konfigurasi Environment Variables
Buat file bernama `.env.local` pada folder root proyek dan lengkapi nilainya:
```env
NEXT_PUBLIC_SUPABASE_URL=https://yntfapqohipplikonwoj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 5. Jalankan Aplikasi Secara Lokal
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di peramban Anda.
