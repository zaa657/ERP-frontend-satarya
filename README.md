# Satarya ERP — Sistem Manajemen Operasional Terpadu

Aplikasi Enterprise Resource Planning (ERP) modern berbasis web untuk manajemen operasional kontraktor, logistik, proyek klien, kas keuangan, dan penggajian karyawan.

---

## 📁 Struktur Folder Proyek (IT Architecture)

Repositori ini menggunakan arsitektur standar **Laravel & Web Modern**, memisahkan secara tegas antara berkas publik web, logika aplikasi, template, dan konfigurasi:

```text
Project_admin/
├── app/                  # Logika backend PHP (Controllers, Models, Providers)
│   ├── Http/             # HTTP Controllers & Middleware
│   ├── Models/           # Model Eloquent (User, dll.)
│   └── Providers/        # Service Providers aplikasi
├── bootstrap/            # Berkas inisialisasi framework Laravel
│   ├── app.php           # Konfigurasi routing & middleware
│   └── cache/            # Cache internal framework
├── config/               # Seluruh konfigurasi aplikasi (app, database, auth, session, dll.)
├── database/             # Skema basis data, migration, factory, dan seeder
├── public/               # Web Server Document Root (Pusat seluruh asset publik)
│   ├── css/
│   │   └── erp.css       # Stylesheet utama aplikasi (design system, tema, layout)
│   ├── js/
│   │   └── erp.js        # Logika aplikasi frontend SPA (state, modul, kalkulasi)
│   ├── img/
│   │   └── logo.png      # Logo resmi perusahaan
│   ├── index.html        # Entry point static SPA (untuk preview statis/offline)
│   ├── index.php         # Entry point web server PHP / Laravel
│   ├── .htaccess         # Konfigurasi rewrite Apache
│   ├── favicon.ico       # Favicon tab browser
│   └── robots.txt        # Direktif crawler web
├── resources/            # Template view dan asset mentah
│   ├── views/
│   │   └── erp.blade.php # Template Blade utama yang merender shell aplikasi
│   ├── css/              # Source CSS pendukung
│   └── js/               # Source JS pendukung
├── routes/               # Definisi endpoint URL
│   ├── web.php           # Route web publik (merender tampilan ERP)
│   └── console.php       # Perintah konsol Artisan
├── storage/              # Berkas penyimpanan sementara, sesi, cache, dan log
├── tests/                # Otomatisasi pengujian fitur (Feature & Unit Tests)
│   ├── Feature/          # Test integritas halaman dan static assets
│   └── Unit/             # Test fungsi unit
├── artisan               # Command Line Interface (CLI) Laravel
├── composer.json         # Konfigurasi dependensi PHP & metadata proyek
├── index.html            # Redirection otomatis ke public/index.html
└── package.json          # Konfigurasi toolchain frontend
```

---

## 🚀 Cara Menjalankan Aplikasi

Aplikasi dapat dijalankan melalui **dua metode**:

### Metode 1: Menggunakan PHP / Laravel Server (Direkomendasikan)
1. Pastikan PHP (>= 8.2) dan Composer terpasang di komputer.
2. Jalankan server lokal:
   ```bash
   php artisan serve
   ```
3. Buka browser di alamat: `http://127.0.0.1:8000`

### Metode 2: Langsung via Browser / Static Server
1. Buka berkas [public/index.html](public/index.html) langsung di peramban (Google Chrome / Edge / Firefox) atau gunakan ekstensi Live Server.
2. Seluruh data transaksi tersimpan secara lokal dan interaktif.

---

## 🧪 Menjalankan Pengujian (Testing)

Untuk memastikan seluruh halaman, routing, dan asset statis berfungsi dengan baik:

```bash
php artisan test
```

---

## 🛠️ Modul Utama Satarya ERP

* **Dashboard & KPI**: Ringkasan performa omzet, kas aktif, dan status pekerjaan.
* **Proyek & Kanban**: Manajemen kontrak, pelacakan progres, dan arsip RAB PDF.
* **Keuangan & Invoice**: Buku kas harian, penagihan termin otomatis, dan Laba-Rugi (P&L).
* **SDM & Payroll**: Profil karyawan, absensi, kalkulasi otomatis kasbon & ganti rugi, serta cetak slip gaji.
* **Logistik & Perlengkapan**: Inventaris alat, mutasi stok material, dan pemeliharaan barang rusak.
* **Vendor & Mitra**: Direktori rekanan dengan nama narahubung (PIC) dan kontak cepat WhatsApp.
