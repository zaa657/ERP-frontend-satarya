/* =====================================================================
   SATARYA ERP — OCEAN WORKSPACE
   Aplikasi frontend murni (data tersimpan di localStorage browser).
   Kunci penyimpanan sama dengan versi sebelumnya sehingga data lama
   tetap terbaca.
   ===================================================================== */
"use strict";

/* ---------------------------------------------------------------------
   1. SKEMA ENTITAS
   f: [kunci, label, tipe]
   tipe: "n" nominal Rp, "q" jumlah, "d" tanggal, "m" bulan,
         "ref:x" relasi wajib, "ref:x?" relasi opsional,
         "pdf"/"pdf?" unggah PDF, "txt" teks panjang, array = pilihan
   --------------------------------------------------------------------- */
const E = {
    alat: {
        t: "Inventaris Peralatan",
        s: "Peralatan",
        d: "Aset tools & mesin beserta kondisi, jumlah unit, dan nilai perolehan.",
        f: [
            ["nama", "Nama peralatan / mesin"],
            ["kode", "Kode / Merk / Tipe"],
            ["kondisi", "Kondisi", ["Baik", "Rusak Ringan", "Rusak Berat"]],
            ["jumlah", "Jumlah unit", "q"],
            ["harga", "Harga perolehan / unit", "n"],
            ["ket", "Lokasi penyimpanan / Keterangan"],
        ],
    },
    rusak: {
        t: "Laporan Kerusakan",
        s: "Laporan Kerusakan",
        d: "Tiket kerusakan peralatan dari lapangan hingga selesai diperbaiki.",
        f: [
            ["tgl", "Tanggal laporan", "d"],
            ["alat", "Peralatan", "ref:alat"],
            ["jumlah", "Jumlah rusak", "q"],
            [
                "kondisi",
                "Tingkat kerusakan",
                ["Rusak Ringan", "Rusak Berat", "Rusak Total"],
            ],
            ["proj", "Lokasi proyek (opsional)", "ref:proj?"],
            ["pelapor", "Nama pelapor / Mandor"],
            [
                "status",
                "Status perbaikan",
                [
                    "Dilaporkan",
                    "Sedang Diperbaiki",
                    "Selesai",
                    "Afkir/Rusak Total",
                ],
            ],
            ["ket", "Keterangan kerusakan / Tindak lanjut", "txt"],
        ],
    },
    supply: {
        t: "Stok Perlengkapan",
        s: "Perlengkapan",
        d: "Bahan habis pakai dengan stok berjalan dan batas minimum otomatis.",
        f: [
            ["nama", "Nama perlengkapan / bahan"],
            ["kategori", "Kategori"],
            ["satuan", "Satuan"],
            ["stok", "Stok awal", "q"],
            ["minStok", "Stok minimum", "q"],
            ["harga", "Harga satuan", "n"],
        ],
    },
    inv: {
        t: "Semua Inventaris",
        s: "Barang",
        d: "Data inventaris lama (kompatibilitas).",
        f: [
            ["nama", "Nama barang"],
            ["kategori", "Kategori"],
            ["satuan", "Satuan"],
            ["stok", "Stok awal", "q"],
            ["minStok", "Stok minimum", "q"],
            ["harga", "Harga satuan", "n"],
        ],
    },
    mov: {
        t: "Mutasi Stok",
        s: "Mutasi Perlengkapan",
        d: "Catatan stok masuk dari supplier dan pemakaian ke proyek.",
        f: [
            ["tgl", "Tanggal", "d"],
            ["supply", "Perlengkapan / Bahan", "ref:supply"],
            ["tipe", "Jenis mutasi", ["masuk", "keluar"]],
            ["qty", "Jumlah", "q"],
            ["proj", "Untuk proyek (opsional)", "ref:proj?"],
            ["ket", "Keterangan / Supplier / Bagian"],
        ],
    },
    vendor: {
        t: "Vendor & Supplier",
        s: "Vendor",
        d: "Direktori pemasok material, penyewaan alat, subkon, dan jasa.",
        f: [
            ["nama", "Nama vendor / toko"],
            [
                "kategori",
                "Kategori",
                [
                    "Material",
                    "Alat & Sewa",
                    "Jasa / Subkon",
                    "Transportasi",
                    "Lainnya",
                ],
            ],
            ["pic", "Nama Kontak / Penanggung Jawab (PIC)"],
            ["kontak", "Telepon / WhatsApp"],
            ["alamat", "Alamat"],
            ["rating", "Penilaian", ["5", "4", "3", "2", "1"]],
            ["ket", "Catatan (termin bayar, rekening, dll.)", "txt"],
        ],
    },
    sales: {
        t: "Kinerja Sales & Tim",
        s: "Anggota Tim",
        d: "Anggota tim per divisi dan capaian omzet terhadap target sales.",
        f: [
            ["nama", "Nama"],
            [
                "divisi",
                "Divisi / Peran",
                [
                    "Sales",
                    "Admin",
                    "Mandor",
                    "HRD",
                    "Finance",
                    "Finansial Audit",
                    "Logistic",
                ],
            ],
            ["kontak", "Kontak"],
            ["target", "Target omzet (khusus Sales)", "n"],
        ],
    },
    proj: {
        t: "Proyek Klien",
        s: "Proyek",
        d: "Seluruh proyek beserta nilai kontrak, biaya terpakai, dan sisa nilai.",
        f: [
            ["nama", "Nama proyek"],
            ["klien", "Nama klien"],
            ["alamat", "Alamat proyek"],
            ["kontak", "Kontak klien"],
            ["sales", "Sales (Opsional)", "ref:sales?"],
            ["nilai", "Nilai kontrak (Rp)", "n"],
            ["mulai", "Tanggal mulai", "d"],
            [
                "status",
                "Status",
                ["Prospek", "Berjalan", "Tertunda", "Selesai"],
            ],
        ],
    },
    rab: {
        t: "RAB (Rencana Anggaran Biaya)",
        s: "Dokumen RAB",
        d: "Arsip dokumen RAB dalam format PDF yang terikat ke proyek.",
        f: [
            ["proj", "Proyek", "ref:proj"],
            ["nama", "Keterangan / Judul RAB"],
            ["pdf", "File PDF RAB", "pdf"],
        ],
    },
    budget: {
        t: "Budgeting Proyek",
        s: "Item Budgeting",
        d: "Alokasi anggaran per item pekerjaan dibanding realisasinya.",
        f: [
            ["proj", "Proyek", "ref:proj"],
            ["item", "Item pekerjaan / Uraian"],
            ["rencana", "Alokasi anggaran", "n"],
            ["pdf", "File PDF Lampiran (opsional)", "pdf?"],
        ],
    },
    biaya: {
        t: "Penggunaan Anggaran",
        s: "Pengeluaran",
        d: "Realisasi pengeluaran proyek — gabungan input langsung & Kas Harian.",
        f: [
            ["tgl", "Tanggal", "d"],
            ["proj", "Proyek", "ref:proj"],
            ["kategori", "Kategori"],
            ["nominal", "Nominal", "n"],
            ["ket", "Keterangan"],
        ],
    },
    dok: {
        t: "Dokumentasi Proyek",
        s: "Dokumen",
        d: "Katalog tautan kontrak, gambar desain, foto progres, dan laporan.",
        f: [
            ["proj", "Proyek", "ref:proj"],
            [
                "katalog",
                "Katalog",
                [
                    "Kontrak",
                    "Gambar dan desain",
                    "Foto progres",
                    "Laporan",
                    "Lainnya",
                ],
            ],
            ["nama", "Nama dokumen"],
            ["link", "Link (Drive atau URL)"],
        ],
    },
    karyawan: {
        t: "Data Karyawan",
        s: "Karyawan",
        d: "Profil karyawan, gaji pokok, kehadiran, kasbon, dan ganti rugi aktif.",
        f: [
            ["nama", "Nama"],
            ["posisi", "Posisi"],
            ["kontak", "Kontak"],
            ["gaji", "Gaji pokok", "n"],
        ],
    },
    absen: {
        t: "Absensi Kehadiran",
        s: "Absensi",
        d: "Rekap kehadiran harian karyawan.",
        f: [
            ["tgl", "Tanggal", "d"],
            ["kar", "Karyawan", "ref:karyawan"],
            ["status", "Status", ["hadir", "izin", "sakit", "alpha"]],
            ["ket", "Keterangan"],
        ],
    },
    kasbon: {
        t: "Kasbon Karyawan",
        s: "Kasbon",
        d: "Pinjaman karyawan beserta status pelunasannya.",
        f: [
            ["tgl", "Tanggal", "d"],
            ["kar", "Karyawan", "ref:karyawan"],
            ["nominal", "Nominal kasbon", "n"],
            ["status", "Status", ["Belum Lunas", "Lunas"]],
            ["ket", "Keperluan / Keterangan"],
        ],
    },
    gantirugi: {
        t: "Ganti Rugi Karyawan",
        s: "Ganti Rugi",
        d: "Kewajiban ganti rugi karyawan atas kerusakan/kehilangan barang.",
        f: [
            ["tgl", "Tanggal", "d"],
            ["kar", "Karyawan", "ref:karyawan"],
            ["nominal", "Nominal ganti rugi", "n"],
            ["status", "Status", ["Belum Dibayar", "Lunas"]],
            ["ket", "Alasan / Kerusakan / Barang"],
        ],
    },
    gaji: {
        t: "Pembayaran Gaji",
        s: "Pembayaran Gaji",
        d: "Slip pembayaran gaji bulanan dengan potongan kasbon & ganti rugi.",
        f: [
            ["bulan", "Bulan", "m"],
            ["kar", "Karyawan", "ref:karyawan"],
            ["nominal", "Gaji Pokok", "n"],
            ["pot_kasbon", "Potongan Kasbon", "n"],
            ["pot_rugi", "Potongan Ganti Rugi", "n"],
            ["status", "Status", ["Lunas", "Belum"]],
            ["ket", "Keterangan"],
        ],
    },
    form: {
        t: "Formulir Permintaan",
        s: "Formulir",
        d: "Pengajuan pengadaan / penggunaan barang dengan alur persetujuan.",
        f: [
            ["tgl", "Tanggal", "d"],
            ["jenis", "Jenis", ["Pengadaan", "Penggunaan"]],
            ["pemohon", "Pemohon"],
            ["proj", "Proyek (opsional)", "ref:proj?"],
            ["barang", "Barang atau keperluan"],
            ["qty", "Jumlah", "q"],
            ["status", "Status", ["Diajukan", "Disetujui", "Ditolak"]],
        ],
    },
    keu: {
        t: "Kas Harian",
        s: "Transaksi",
        d: "Buku kas masuk & keluar harian — sumber utama laporan keuangan.",
        f: [
            ["tgl", "Tanggal", "d"],
            ["tipe", "Jenis", ["masuk", "keluar"]],
            ["proj", "Proyek (opsional)", "ref:proj?"],
            [
                "kategori",
                "Kategori Transaksi",
                [
                    "Borongan Tukang",
                    "Pembayaran Termin Proyek",
                    "Pembelian Material",
                    "Pembelian / Sewa Alat",
                    "Gaji & Upah",
                    "Kasbon Karyawan",
                    "Operasional Kantor",
                    "Lain-lain",
                ],
            ],
            ["nominal", "Nominal", "n"],
            ["ket", "Keterangan / Nama Tukang / Rincian"],
        ],
    },
    invoice: {
        t: "Invoice & Tagihan",
        s: "Invoice",
        d: "Penagihan termin ke klien, jatuh tempo, dan pelunasan otomatis ke kas.",
        f: [
            ["no", "Nomor invoice"],
            ["tgl", "Tanggal terbit", "d"],
            ["jatuh", "Jatuh tempo", "d"],
            ["proj", "Proyek", "ref:proj"],
            ["uraian", "Uraian tagihan (mis. Termin 2 — 40%)"],
            ["nominal", "Nominal tagihan", "n"],
            ["status", "Status", ["Draft", "Terkirim", "Lunas"]],
        ],
    },
};

/* ---------------------------------------------------------------------
   2. IKON (SVG garis)
   --------------------------------------------------------------------- */
const ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    dash: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    proj: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3"/>',
    kanban: '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="10" rx="1.5"/><rect x="17" y="4" width="4" height="13" rx="1.5"/>',
    rab: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/>',
    budget: '<path d="M21 12A9 9 0 1 1 12 3v9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
    biaya: '<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    dok: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
    keu: '<path d="M20 7H5a2 2 0 0 1 0-4h13v4"/><path d="M3 5v14a2 2 0 0 0 2 2h15V7"/><circle cx="16" cy="14" r="1.4"/>',
    invoice: '<path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5M9 12h6M9 16h4"/>',
    lap: '<path d="M3 3v18h18"/><path d="M7 15v3M12 10v8M17 6v12"/>',
    pl: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    alat: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/>',
    rusak: '<path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86z"/><path d="M12 8v4M12 16h.01"/>',
    supply: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/>',
    inv: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>',
    mov: '<path d="m17 1 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    form: '<rect x="6" y="4" width="12" height="18" rx="2"/><path d="M9 2h6v4H9zM9 12h6M9 16h4"/>',
    vendor: '<path d="M1 4h13v12H1z"/><path d="M14 9h4l4 4v3h-8"/><circle cx="5.5" cy="18.5" r="2"/><circle cx="17.5" cy="18.5" r="2"/>',
    karyawan:
        '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    gaji: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
    kasbon: '<circle cx="12" cy="12" r="9"/><path d="M12 6.5v11M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5"/>',
    gantirugi:
        '<path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/>',
    absen: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4"/>',
    sales: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    alert: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    set: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    log: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/>',
    download:
        '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    print: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    chevR: '<path d="m9 18 6-6-6-6"/>',
    chevL: '<path d="m15 18-6-6 6-6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    warn: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    arrowR: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    up: '<path d="m18 15-6-6-6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    inflow: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    outflow: '<path d="M12 5v14M19 12l-7 7-7-7"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
};
const I = (k, cls) =>
    `<svg class="ico${cls ? " " + cls : ""}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[k] || ICONS.grid}</svg>`;
const WAVES = `<svg class="waves" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true">
  <path fill="rgba(255,255,255,.10)" d="M0 120 C 240 60 480 180 720 130 S 1200 60 1440 110 V220 H0Z"/>
  <path fill="rgba(255,255,255,.12)" d="M0 160 C 300 110 520 210 820 165 S 1240 120 1440 150 V220 H0Z"/>
  <path fill="rgba(94,234,212,.16)" d="M0 190 C 260 160 600 230 900 195 S 1300 170 1440 185 V220 H0Z"/>
</svg>`;

/* ---------------------------------------------------------------------
   3. NAVIGASI, HALAMAN & ROLE
   --------------------------------------------------------------------- */
const NAV = [
    { id: "home", label: "Beranda", ico: "home", page: "dash" },
    {
        id: "proyek",
        label: "Proyek",
        ico: "proj",
        wide: true,
        items: [
            ["proj", "Proyek Klien", "Daftar, nilai kontrak & profitabilitas"],
            ["kanban", "Papan Kanban", "Seret proyek antar tahap status", 1],
            ["rab", "RAB (PDF)", "Arsip dokumen rencana anggaran"],
            ["budget", "Budgeting", "Alokasi anggaran per item pekerjaan"],
            ["biaya", "Penggunaan Anggaran", "Realisasi pengeluaran proyek"],
            ["dok", "Dokumentasi", "Kontrak, desain & foto progres"],
        ],
    },
    {
        id: "keuangan",
        label: "Keuangan",
        ico: "keu",
        items: [
            ["keu", "Kas Harian", "Buku kas masuk & keluar"],
            [
                "invoice",
                "Invoice & Tagihan",
                "Penagihan termin & piutang klien",
                1,
            ],
            ["lap", "Laporan Arus Kas", "Rekap harian, mingguan, bulanan"],
            ["pl", "Laba-Rugi", "Pendapatan, beban & margin proyek", 1],
        ],
    },
    {
        id: "inventaris",
        label: "Inventaris",
        ico: "supply",
        wide: true,
        items: [
            ["alat", "Peralatan", "Tools, mesin & nilai aset"],
            ["rusak", "Laporan Kerusakan", "Tiket perbaikan peralatan"],
            ["supply", "Stok Perlengkapan", "Bahan habis pakai & stok minimum"],
            ["mov", "Mutasi Stok", "Stok masuk & pemakaian proyek"],
            ["form", "Formulir Permintaan", "Pengajuan & persetujuan barang"],
            ["vendor", "Vendor & Supplier", "Direktori pemasok & penilaian", 1],
        ],
    },
    {
        id: "sdm",
        label: "SDM",
        ico: "karyawan",
        items: [
            ["karyawan", "Karyawan", "Profil & ringkasan kewajiban"],
            ["absen", "Absensi", "Kehadiran harian"],
            ["gaji", "Penggajian", "Slip gaji & potongan"],
            ["kasbon", "Kasbon", "Pinjaman karyawan"],
            ["gantirugi", "Ganti Rugi", "Kewajiban atas kerusakan"],
        ],
    },
    { id: "salesnav", label: "Sales", ico: "sales", page: "sales" },
];
const EXTRA_PAGES = {
    dash: ["Beranda", "Ringkasan operasional perusahaan hari ini."],
    alert: [
        "Pusat Peringatan",
        "Semua isu yang perlu ditindaklanjuti, diurutkan dari yang paling kritis.",
    ],
    kanban: [
        "Papan Kanban Proyek",
        "Seret kartu proyek untuk memindahkan tahap. Di ponsel, gunakan tombol panah pada kartu.",
    ],
    lap: [
        "Laporan Arus Kas",
        "Rekap pemasukan dan pengeluaran dari Kas Harian per periode.",
    ],
    pl: [
        "Laporan Laba-Rugi",
        "Pendapatan, beban per kategori, dan profitabilitas tiap proyek.",
    ],
    log: [
        "Log Aktivitas",
        "Jejak audit seluruh perubahan data oleh setiap pengguna.",
    ],
    pd: ["Detail Proyek", ""],
    kd: ["Profil Karyawan", ""],
};
const pageTitle = (k) =>
    EXTRA_PAGES[k] ? EXTRA_PAGES[k][0] : E[k] ? E[k].t : k;
const pageDesc = (k) =>
    EXTRA_PAGES[k] ? EXTRA_PAGES[k][1] : E[k] ? E[k].d : "";
const pageGroup = (k) => {
    if (k === "pd" || k === "kanban") return NAV[1];
    if (k === "kd") return NAV[4];
    return NAV.find(
        (g) => g.page === k || (g.items || []).some((i) => i[0] === k),
    );
};

const ROLES = {};
/* ---------------------------------------------------------------------
   4. DATA & STATE
   --------------------------------------------------------------------- */
const KEY = "mgmt_internal_v2"; // sama dengan versi lama → data lama tetap terbaca
const THEME_KEY = "satarya_theme";
let D;
try {
    D = JSON.parse(localStorage.getItem(KEY)) || {};
} catch (e) {
    D = {};
}
const normalize = () => {
    Object.keys(E).forEach((k) => (D[k] = Array.isArray(D[k]) ? D[k] : []));
    // Aktivitas Terbaru hanya di memori sementara (tidak disimpan di localhost/localStorage & otomatis terhapus saat refresh)
    D.log = [];
    try {
        localStorage.removeItem("satarya_session");
        const raw = localStorage.getItem(KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && (parsed.log || parsed.act)) {
                delete parsed.log;
                delete parsed.act;
                localStorage.setItem(KEY, JSON.stringify(parsed));
            }
        }
    } catch (e) {}
};
normalize();

const ME = { u: "admin", n: "Satarya ERP", r: "owner" };

function today() {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 6e4)
        .toISOString()
        .slice(0, 10);
}

const S = {
    page: "dash",
    id: null,
    activeDate: today(),
    calViewYear: new Date().getFullYear(),
    calViewMonth: new Date().getMonth(),
    tab: {},
    q: {},
    sort: {},
    filter: {},
    limit: {},
    per: "bulan",
    plPer: "bulan",
    plMonth: new Date().toISOString().slice(0, 7),
    alertF: "all",
};
let charts = [];
const PAGE_SIZE = 25;

const save = () => {
    try {
        const toSave = { ...D };
        delete toSave.log; // Jangan simpan log aktivitas ke localStorage agar otomatis bersih saat refresh
        localStorage.setItem(KEY, JSON.stringify(toSave));
    } catch (e) {
        toast("Gagal menyimpan: " + e.message, "bad");
    }
};

/* ---------------------------------------------------------------------
   5. HELPER
   --------------------------------------------------------------------- */
const $ = (s, r) => (r || document).querySelector(s);
const rp = (n) => "Rp " + Math.round(+n || 0).toLocaleString("id-ID");
const rpS = (n) => {
    const v = +n || 0,
        a = Math.abs(v),
        s = v < 0 ? "-" : "";
    if (a >= 1e9)
        return s + "Rp " + (a / 1e9).toFixed(2).replace(/\.?0+$/, "") + " M";
    if (a >= 1e6)
        return s + "Rp " + (a / 1e6).toFixed(1).replace(/\.0$/, "") + " jt";
    if (a >= 1e3) return s + "Rp " + Math.round(a / 1e3) + " rb";
    return s + "Rp " + Math.round(a);
};
const esc = (s) =>
    String(s ?? "").replace(
        /[&<>"']/g,
        (c) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
            })[c],
    );
const sum = (a, f) => (a || []).reduce((s, x) => s + (+f(x) || 0), 0);
const nm = (e, id) => ((D[e] || []).find((x) => x.id == id) || {}).nama || "-";
const initials = (s) =>
    String(s || "?")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase() || "?";
const fmtD = (s) => {
    if (!s) return "-";
    const d = new Date(s);
    return isNaN(d)
        ? esc(s)
        : d.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
          });
};
const fmtM = (s) => {
    if (!s) return "-";
    const d = new Date(s + "-01");
    return isNaN(d)
        ? esc(s)
        : d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
};
const relT = (iso) => {
    const s = (Date.now() - new Date(iso)) / 1000;
    if (s < 60) return "baru saja";
    if (s < 3600) return Math.floor(s / 60) + " menit lalu";
    if (s < 86400) return Math.floor(s / 3600) + " jam lalu";
    if (s < 604800) return Math.floor(s / 86400) + " hari lalu";
    return fmtD(iso);
};
const greet = () => {
    const h = new Date().getHours();
    return h < 11
        ? "Selamat pagi"
        : h < 15
          ? "Selamat siang"
          : h < 18
            ? "Selamat sore"
            : "Selamat malam";
};

const can = (k) => true; // RBAC dinonaktifkan: semua modul dapat diakses penuh

/* Perhitungan bisnis (sama dengan versi sebelumnya) */
const spent = (p) =>
    sum(
        D.biaya.filter((b) => b.proj == p.id),
        (b) => b.nominal,
    ) +
    sum(
        D.keu.filter((k) => k.proj == p.id && k.tipe == "keluar"),
        (k) => k.nominal,
    );
const received = (p) =>
    sum(
        D.keu.filter((k) => k.proj == p.id && k.tipe == "masuk"),
        (k) => k.nominal,
    );
const rabOf = (p) =>
    sum(
        D.budget.filter((r) => r.proj == p.id),
        (r) => r.rencana,
    );
const stok = (i) =>
    (+i.stok || 0) +
    sum(
        D.mov.filter(
            (m) => (m.supply == i.id || m.inv == i.id) && m.tipe == "masuk",
        ),
        (m) => m.qty,
    ) -
    sum(
        D.mov.filter(
            (m) => (m.supply == i.id || m.inv == i.id) && m.tipe == "keluar",
        ),
        (m) => m.qty,
    );
const kasIn = () =>
    sum(
        D.keu.filter((k) => k.tipe == "masuk"),
        (k) => k.nominal,
    );
const kasOut = () =>
    sum(
        D.keu.filter((k) => k.tipe == "keluar"),
        (k) => k.nominal,
    );
const kas = () => kasIn() - kasOut();
const mSum = (m, t) =>
    sum(
        D.keu.filter((k) => (k.tgl || "").startsWith(m) && k.tipe == t),
        (k) => k.nominal,
    );
const hadirPct = (k) => {
    const a = D.absen.filter((x) => x.kar == k.id);
    return a.length
        ? Math.round(
              (a.filter((x) => x.status == "hadir").length / a.length) * 100,
          ) + "%"
        : "-";
};
const invStatus = (r) =>
    r.status !== "Lunas" && r.jatuh && r.jatuh < today()
        ? "Jatuh Tempo"
        : r.status || "Draft";
const piutang = () =>
    sum(
        D.invoice.filter((r) => r.status !== "Lunas"),
        (r) => r.nominal,
    );
const nextInvNo = () => {
    const ym = today().slice(0, 7).replace("-", "");
    const n =
        D.invoice.filter((r) => String(r.no || "").startsWith("INV-" + ym))
            .length + 1;
    return `INV-${ym}-${String(n).padStart(3, "0")}`;
};

const BADGE = {
    Prospek: "info",
    Berjalan: "teal",
    Selesai: "ok",
    Tertunda: "warn",
    Lunas: "ok",
    Belum: "warn",
    "Belum Lunas": "warn",
    "Belum Dibayar": "bad",
    Disetujui: "ok",
    Ditolak: "bad",
    Diajukan: "warn",
    hadir: "ok",
    izin: "info",
    sakit: "warn",
    alpha: "bad",
    masuk: "ok",
    keluar: "bad",
    Baik: "ok",
    "Rusak Ringan": "warn",
    "Rusak Berat": "bad",
    "Rusak Total": "bad",
    Dilaporkan: "warn",
    "Sedang Diperbaiki": "info",
    "Afkir/Rusak Total": "bad",
    Draft: "",
    Terkirim: "info",
    "Jatuh Tempo": "bad",
    Pengadaan: "info",
    Penggunaan: "teal",
};
const badge = (s) => {
    if (s == null || s === "") return '<span class="muted">-</span>';
    const c = BADGE[s];
    return c === undefined
        ? esc(s)
        : `<span class="badge ${c}">${esc(s)}</span>`;
};
const stars = (n) => {
    const v = Math.max(0, Math.min(5, +n || 0));
    return `<span class="stars" title="${v} dari 5">${"★".repeat(v)}<i>${"★".repeat(5 - v)}</i></span>`;
};

const recLabel = (k, r) => {
    if (!r) return "";
    if (r.nama) return r.nama;
    if (r.no) return r.no;
    if (r.item) return r.item;
    if (r.barang) return r.barang;
    if (r.kar)
        return (
            nm("karyawan", r.kar) +
            (r.tgl ? " · " + r.tgl : r.bulan ? " · " + r.bulan : "")
        );
    if (r.supply)
        return (
            nm("supply", r.supply) +
            " · " +
            (r.tipe || "") +
            " " +
            (r.qty || "")
        );
    if (r.alat) return nm("alat", r.alat);
    if (r.kategori)
        return r.kategori + (r.nominal ? " · " + rp(r.nominal) : "");
    return E[k] ? E[k].s : k;
};
const logAct = (a, k, label) => {
    if (!Array.isArray(D.log)) D.log = [];
    D.log.unshift({
        t: new Date().toISOString(),
        u: ME ? ME.n : "Sistem",
        r: ME ? ME.r : "",
        a,
        k,
        l: String(label || "").slice(0, 140),
    });
    if (D.log.length > 400) D.log.length = 400;
};

window.clearActLog = () => {
    D.log = [];
    render(true);
    toast("Aktivitas terbaru dibersihkan");
};

function toast(m, type) {
    const box = $("#toasts");
    const t = document.createElement("div");
    t.className = "toast " + (type || "");
    t.innerHTML =
        I(type === "bad" ? "warn" : "check") + `<span>${esc(m)}</span>`;
    box.appendChild(t);
    setTimeout(() => {
        t.classList.add("out");
        setTimeout(() => t.remove(), 300);
    }, 2600);
}
window.toast = toast;

/* Konfirmasi kustom (Promise) */
function ask(title, msg, okLabel) {
    return new Promise((res) => {
        const d = $("#cfm");
        d.innerHTML = `<div class="ring-ico">${I("trash")}</div><h3>${esc(title)}</h3><p>${esc(msg)}</p>
      <div class="btns"><button class="btn" data-v="0">Batal</button><button class="btn btn-danger" data-v="1" style="background:var(--bad);color:#fff;border-color:var(--bad)">${esc(okLabel || "Ya, hapus")}</button></div>`;
        d.querySelectorAll("button").forEach((b) =>
            b.addEventListener("click", () => {
                d.close();
                res(b.dataset.v === "1");
            }),
        );
        d.onclose = () => res(false);
        d.showModal();
    });
}

/* ---------------------------------------------------------------------
   6. PERINGATAN (disaring sesuai hak akses role)
   --------------------------------------------------------------------- */
function alerts() {
    const a = [];
    D.supply.forEach((i) => {
        const s = stok(i);
        if (s <= (+i.minStok || 0))
            a.push({
                lv: "w",
                txt: `Stok <b>${esc(i.nama)}</b> tinggal ${s} ${esc(i.satuan || "")} (minimum ${i.minStok || 0}).`,
                go: ["supply"],
            });
    });
    D.rusak
        .filter(
            (r) =>
                r.status === "Dilaporkan" || r.status === "Sedang Diperbaiki",
        )
        .forEach((r) =>
            a.push({
                lv: "b",
                txt: `Peralatan <b>${esc(nm("alat", r.alat))}</b> rusak (${esc(r.kondisi)}) — ${esc(r.ket || "-")} · ${esc(r.status)}`,
                go: ["rusak"],
            }),
        );
    D.proj.forEach((p) => {
        const sp = spent(p),
            rb = rabOf(p);
        if (p.nilai && sp > +p.nilai)
            a.push({
                lv: "b",
                txt: `Proyek <b>${esc(p.nama)}</b> merugi: biaya ${rp(sp)} melebihi nilai proyek ${rp(p.nilai)}.`,
                go: ["pd", p.id],
            });
        else if (rb && sp > rb)
            a.push({
                lv: "w",
                txt: `Anggaran <b>${esc(p.nama)}</b> melebihi RAB: terpakai ${rp(sp)} dari ${rp(rb)}.`,
                go: ["pd", p.id],
            });
        if (p.status == "Berjalan" && !D.dok.some((d) => d.proj == p.id))
            a.push({
                lv: "i",
                txt: `<b>${esc(p.nama)}</b> belum memiliki dokumentasi.`,
                go: ["pd", p.id],
            });
    });
    D.invoice.forEach((r) => {
        if (invStatus(r) === "Jatuh Tempo")
            a.push({
                lv: "b",
                txt: `Invoice <b>${esc(r.no)}</b> (${esc(nm("proj", r.proj))}) jatuh tempo ${fmtD(r.jatuh)} — ${rp(r.nominal)}.`,
                go: ["invoice"],
            });
    });
    D.sales
        .filter((s) => !s.divisi || s.divisi === "Sales")
        .forEach((s) => {
            const last = D.proj
                .filter((p) => p.sales == s.id)
                .map((p) => p.mulai || "")
                .sort()
                .pop();
            const d = last
                ? Math.floor((Date.now() - new Date(last)) / 864e5)
                : null;
            if (d === null || d > 30)
                a.push({
                    lv: "w",
                    txt: `<b>${esc(s.nama)}</b> ${d === null ? "belum pernah membawa proyek" : "belum membawa proyek baru selama " + d + " hari"}.`,
                    go: ["sales"],
                });
        });
    if (kas() < 0)
        a.push({
            lv: "b",
            txt: `Saldo kas negatif: <b>${rp(kas())}</b>.`,
            go: ["keu"],
        });
    const order = { b: 0, w: 1, i: 2 };
    return a
        .filter((x) => can(x.go[0]))
        .sort((x, y) => order[x.lv] - order[y.lv]);
}
const alertRow = (x) =>
    `<div class="alert-item ${x.lv}"><span class="alert-ico">${I(x.lv === "i" ? "info" : "warn")}</span>
   <div class="alert-txt">${x.txt} <button class="link" onclick="go('${x.go[0]}',${x.go[1] || "null"})">Tindak lanjut →</button></div></div>`;
const alertList = (max) => {
    const a = alerts().slice(0, max || 999);
    return a.length
        ? a.map(alertRow).join("")
        : `<div class="empty-ill"><div class="ring-ico">${I("check")}</div><b>Semua aman</b><p>Tidak ada peringatan. Semua indikator dalam batas normal.</p></div>`;
};

/* ---------------------------------------------------------------------
   7. SHELL: TOP NAV, DRAWER, TAB BAR
   --------------------------------------------------------------------- */
const isOn = (k) =>
    S.page === k ||
    (S.page === "pd" && k === "proj") ||
    (S.page === "kd" && k === "karyawan");
const groupItems = (g) => (g.items || []).filter((i) => can(i[0]));

function renderCalWidget() {
    const activeDate = S.activeDate || today();
    const dObj = new Date(activeDate);
    const activeDateLabel = isNaN(dObj)
        ? activeDate
        : dObj.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
          });

    const viewYear = S.calViewYear;
    const viewMonth = S.calViewMonth;
    const monthName = new Date(viewYear, viewMonth, 1).toLocaleDateString(
        "id-ID",
        { month: "long", year: "numeric" },
    );

    const firstDay = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // 0=Mon, 6=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const dayHeaders = ["Sn", "Sl", "Rb", "Km", "Jm", "Sb", "Mn"]
        .map((h) => `<div class="cal-day-h">${h}</div>`)
        .join("");

    let cells = "";
    // Hari bulan sebelumnya
    for (let i = firstDay - 1; i >= 0; i--) {
        const dNum = daysInPrevMonth - i;
        cells += `<div class="cal-cell-btn other-m">${dNum}</div>`;
    }

    const todayStr = today();
    for (let d = 1; d <= daysInMonth; d++) {
        const mm = String(viewMonth + 1).padStart(2, "0");
        const dd = String(d).padStart(2, "0");
        const cellDateStr = `${viewYear}-${mm}-${dd}`;
        const isToday = cellDateStr === todayStr;
        const isSelected = cellDateStr === activeDate;

        cells += `<button type="button" class="cal-cell-btn ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}" onclick="pickNavDate('${cellDateStr}',event)">${d}</button>`;
    }

    return `
    <div class="cal-nav" data-dd id="top_cal_nav">
      <button class="icon-btn top-cal-icon-btn" onclick="toggleDD(this.parentNode,event)" title="Kalender Operasional (${activeDateLabel})" aria-label="Kalender" aria-haspopup="true">
        ${I("cal")}
        <span class="cal-badge-dot"></span>
      </button>
      <div class="cal-pop">
        <div class="cal-pop-title">
          <div>
            <b>Kalender Operasional</b>
            <small class="muted" style="display:block;margin-top:2px;font-weight:600">${activeDateLabel}</small>
          </div>
          <button type="button" class="icon-btn" onclick="toggleDD(this.closest('[data-dd]'),event)" aria-label="Tutup" style="margin-left:auto;width:28px;height:28px">${I("x")}</button>
        </div>
        <div class="cal-pop-head">
          <span class="cal-pop-title">📅 ${monthName}</span>
          <div class="cal-nav-btns">
            <button type="button" class="cal-arrow-btn" onclick="navCalMonth(-1,event)" title="Bulan Sebelumnya">${I("chevL")}</button>
            <button type="button" class="cal-arrow-btn" onclick="navCalMonth(1,event)" title="Bulan Berikutnya">${I("chevR")}</button>
          </div>
        </div>

        <div class="cal-direct-input">
          <label>Pilih Bebas:</label>
          <input type="date" value="${activeDate}" onchange="pickNavDate(this.value,event)">
        </div>

        <div class="cal-presets">
          <button type="button" class="cal-preset-btn ${activeDate === todayStr ? "active" : ""}" onclick="quickCalPreset('today',event)">Hari Ini</button>
          <button type="button" class="cal-preset-btn" onclick="quickCalPreset('yesterday',event)">Kemarin</button>
          <button type="button" class="cal-preset-btn" onclick="quickCalPreset('monthStart',event)">Awal Bulan</button>
        </div>

        <div class="cal-grid-d">
          ${dayHeaders}
          ${cells}
        </div>

        <div class="cal-pop-foot">
          <span>Aktif: <b>${activeDateLabel}</b></span>
          <button type="button" class="link" onclick="quickCalPreset('today',event)">Ke Hari Ini</button>
        </div>
      </div>
    </div>`;
}

window.pickNavDate = (dateStr, ev) => {
    if (ev) ev.stopPropagation();
    if (!dateStr) return;
    S.activeDate = dateStr;
    const d = new Date(dateStr);
    if (!isNaN(d)) {
        S.calViewYear = d.getFullYear();
        S.calViewMonth = d.getMonth();
    }
    const formatted = fmtD(dateStr);
    toast(`Tanggal operasional aktif: ${formatted}`);
    renderTop();
};

window.navCalMonth = (delta, ev) => {
    if (ev) ev.stopPropagation();
    let m = S.calViewMonth + delta;
    let y = S.calViewYear;
    if (m < 0) {
        m = 11;
        y--;
    } else if (m > 11) {
        m = 0;
        y++;
    }
    S.calViewMonth = m;
    S.calViewYear = y;
    const navEl = document.getElementById("top_cal_nav");
    const wasOpen = navEl && navEl.classList.contains("open");
    renderTop();
    if (wasOpen) {
        const newNav = document.getElementById("top_cal_nav");
        if (newNav) newNav.classList.add("open");
    }
};

window.quickCalPreset = (preset, ev) => {
    if (ev) ev.stopPropagation();
    const now = new Date();
    let target = today();
    if (preset === "yesterday") {
        now.setDate(now.getDate() - 1);
        target = now.toISOString().slice(0, 10);
    } else if (preset === "monthStart") {
        const ym = S.activeDate
            ? S.activeDate.slice(0, 7)
            : today().slice(0, 7);
        target = ym + "-01";
    }
    pickNavDate(target, ev);
};

function renderTop() {
    const n = alerts().length;
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    const navHtml = NAV.map((g) => {
        if (g.page) {
            if (!can(g.page)) return "";
            return `<div class="nav-item"><button class="nav-btn ${isOn(g.page) ? "on" : ""}" onclick="go('${g.page}')">${I(g.ico)}${g.label}</button></div>`;
        }
        const items = groupItems(g);
        if (!items.length) return "";
        const active = items.some((i) => isOn(i[0]));
        return `<div class="nav-item" data-dd>
      <button class="nav-btn ${active ? "on" : ""}" onclick="toggleDD(this.parentNode,event)" aria-haspopup="true">${I(g.ico)}${g.label}${I("chev", "caret")}</button>
      <div class="mega ${g.wide && items.length > 3 ? "wide" : ""}">${items
          .map(
              ([k, l, d, isNew]) =>
                  `<button class="mega-item ${isOn(k) ? "on" : ""}" onclick="go('${k}')"><span class="mega-ico">${I(k)}</span><span><span class="mega-t">${l}${isNew ? '<span class="mega-new">BARU</span>' : ""}</span><span class="mega-d">${d}</span></span></button>`,
          )
          .join("")}</div></div>`;
    }).join("");

    $("#top").innerHTML = `<div class="top-in">
    <button class="icon-btn burger" onclick="openDrawer()" aria-label="Buka menu">${I("menu")}</button>
    <button class="brand" onclick="go('dash')" aria-label="Beranda">
      <span class="brand-logo"><img src="img/logo.png" alt="Satarya"></span>
      <span><span class="brand-name">SATARYA</span><span class="brand-sub">Sistem Operasional</span></span>
    </button>
    <nav class="nav" aria-label="Navigasi utama">${navHtml}</nav>
    <div class="top-actions">
      <button class="search-trigger" onclick="openCmdk()">${I("search")}<span>Cari apa saja…</span><kbd>Ctrl K</kbd></button>
      ${renderCalWidget()}
      <button class="icon-btn" onclick="toggleTheme()" title="${dark ? "Mode terang" : "Mode gelap"}" aria-label="Ganti tema">${I(dark ? "sun" : "moon")}</button>
      <button class="icon-btn" onclick="go('alert')" title="${n} peringatan" aria-label="${n} peringatan">${I("alert")}${n ? `<span class="cnt">${n > 99 ? "99+" : n}</span>` : ""}</button>
      <button class="btn btn-sm btn-lemon" onclick="showLogin()" title="Pratinjau Tampilan Halaman Login" style="font-size:12px;padding:0 12px;gap:6px">${I("lock")} Halaman Login</button>
    </div>
  </div>`;
}

window.toggleDD = (el, ev) => {
    ev.stopPropagation();
    const was = el.classList.contains("open");
    document
        .querySelectorAll("[data-dd].open")
        .forEach((x) => x.classList.remove("open"));
    if (!was) el.classList.add("open");
};
document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-dd]"))
        document
            .querySelectorAll("[data-dd].open")
            .forEach((x) => x.classList.remove("open"));
});

function tabPages() {
    const pool = [
        "proj",
        "keu",
        "alat",
        "karyawan",
        "invoice",
        "sales",
        "supply",
        "absen",
        "kanban",
    ];
    return pool.filter(can).slice(0, 2);
}
function renderTabbar() {
    const [a, b] = tabPages();
    const btn = (k, label, ico) =>
        k
            ? `<button class="${isOn(k) ? "on" : ""}" onclick="go('${k}')">${I(ico || k)}<span>${label}</span></button>`
            : "<span></span>";
    const short = {
        proj: "Proyek",
        keu: "Kas",
        alat: "Alat",
        karyawan: "Tim",
        invoice: "Invoice",
        sales: "Sales",
        supply: "Stok",
        absen: "Absen",
        kanban: "Kanban",
    };
    $("#tabbar").innerHTML =
        btn("dash", "Beranda", "home") +
        btn(a, short[a]) +
        `<button class="fab" onclick="openCmdk('create')" aria-label="Tambah data"><span class="fab-c">${I("plus")}</span></button>` +
        btn(b, short[b]) +
        `<button onclick="openDrawer()">${I("grid")}<span>Menu</span></button>`;
}

window.openDrawer = () => {
    const dr = $("#drawer");
    const groups = NAV.map((g) => {
        if (g.page) {
            if (!can(g.page)) return "";
            return `<button class="drawer-link ${isOn(g.page) ? "on" : ""}" style="padding-left:12px;font-weight:800" onclick="go('${g.page}')">${I(g.ico)}${g.label}</button>`;
        }
        const items = groupItems(g);
        if (!items.length) return "";
        const open = items.some((i) => isOn(i[0]));
        return `<details ${open ? "open" : ""}><summary>${I(g.ico)}${g.label}${I("chev", "caret")}</summary>${items
            .map(
                ([k, l, , isNew]) =>
                    `<button class="drawer-link ${isOn(k) ? "on" : ""}" onclick="go('${k}')">${I(k)}${l}${isNew ? '<span class="mega-new">BARU</span>' : ""}</button>`,
            )
            .join("")}</details>`;
    }).join("");
    dr.innerHTML = `<div class="drawer-panel" onclick="event.stopPropagation()">
    <div class="drawer-h">
      <span class="brand-logo" style="width:34px;height:34px"><img src="img/logo.png" alt="Satarya"></span>
      <div><b>SATARYA ERP</b><small style="color:var(--lemon-400);font-weight:700">Sistem Operasional</small></div>
      <button class="icon-btn" onclick="closeDrawer()" aria-label="Tutup">${I("x")}</button>
    </div>
    <div class="drawer-b">
      <button class="drawer-link" style="padding-left:12px;margin-bottom:6px;border:1px solid var(--line)" onclick="closeDrawer();openCmdk()">${I("search")}Cari apa saja…</button>
      ${groups}
      <button class="drawer-link ${isOn("alert") ? "on" : ""}" style="padding-left:12px;font-weight:800" onclick="go('alert')">${I("alert")}Peringatan <span class="badge bad plain" style="margin-left:auto">${alerts().length}</span></button>
    </div>
    <div class="drawer-f">
      <button class="drawer-link" style="padding-left:12px" onclick="closeDrawer();showLogin()">${I("lock")}Halaman Login (Tampilan)</button>
      <button class="drawer-link" style="padding-left:12px" onclick="toggleTheme()">${I("moon")}Ganti tema</button>
    </div></div>`;
    dr.onclick = closeDrawer;
    dr.classList.add("open");
    dr.setAttribute("aria-hidden", "false");
};
window.closeDrawer = () => {
    const dr = $("#drawer");
    dr.classList.remove("open");
    dr.setAttribute("aria-hidden", "true");
};

window.toggleTheme = () => {
    const cur =
        document.documentElement.getAttribute("data-theme") === "dark"
            ? "light"
            : "dark";
    document.documentElement.setAttribute("data-theme", cur);
    try {
        localStorage.setItem(THEME_KEY, cur);
    } catch (e) {}
    if ($("#drawer").classList.contains("open")) closeDrawer();
    render(true);
};

/* ---------------------------------------------------------------------
   8. HALAMAN LOGIN (TAMPILAN SAJA / PREVIEW UI)
   --------------------------------------------------------------------- */
window.showLogin = () => {
    sessionStorage.removeItem("satarya_view_app");
    const appEl = $("#app");
    if (appEl) appEl.hidden = true;
    const loginEl = $("#login");
    if (!loginEl) return;
    loginEl.hidden = false;
    window.scrollTo(0, 0);

    loginEl.innerHTML = `
      <div class="login-art">
        <div class="login-brand">
          <span class="brand-logo"><img src="img/logo.png" alt="Satarya"></span>
          <div><b>SATARYA</b><span>Sistem Operasional ERP</span></div>
        </div>
        <div class="login-copy">
          <h2>Kelola proyek, kas, stok & tim <em>dalam satu alur terpadu.</em></h2>
          <p>Workspace operasional kontraktor modern: kontrol anggaran proyek, penagihan invoice termin, mutasi kas harian, hingga logistik peralatan dan absensi tim lapangan.</p>
          <div class="login-feats">
            <span>Papan Kanban</span>
            <span>Invoice Termin</span>
            <span>Laba-Rugi</span>
            <span>Stok Material</span>
            <span>Kas Harian</span>
            <span>Mode Gelap</span>
          </div>
        </div>
        <div class="login-foot">© ${new Date().getFullYear()} Satarya ERP · Solusi Manajemen Operasional Terpadu</div>
        ${WAVES}
      </div>
      <div class="login-panel">
        <form class="login-card" id="loginForm" onsubmit="event.preventDefault(); enterApp();">
          <div class="brand-logo" style="width:52px;height:52px;margin-bottom:18px"><img src="img/logo.png" alt="Satarya"></div>
          <h1>Masuk ke Akun</h1>
          <p>Silakan isi formulir di bawah ini untuk mengakses dashboard ERP.</p>
          
          <label class="field">
            <span>Nama Pengguna atau Email</span>
            <input type="text" name="u" placeholder="mis. admin@satarya.id / Nama Pengguna" value="admin" autocomplete="username">
          </label>
          
          <label class="field">
            <span>Kata Sandi</span>
            <div class="pw-wrap">
              <input type="password" name="p" placeholder="••••••••" value="••••••••" autocomplete="current-password">
              <button type="button" class="icon-btn" onclick="const i=this.previousElementSibling;i.type=i.type==='password'?'text':'password'" aria-label="Tampilkan sandi">${I("eye")}</button>
            </div>
          </label>

          <div style="display:flex;align-items:center;justify-content:space-between;margin:10px 0 22px;font-size:13px;">
            <label style="display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-weight:600;color:var(--text-2);">
              <input type="checkbox" checked style="width:16px;height:16px;accent-color:var(--primary);cursor:pointer"> Ingat Saya
            </label>
            <a href="javascript:void(0)" onclick="toast('Fitur pemulihan kata sandi belum diaktifkan (hanya tampilan)')" style="color:var(--primary);font-weight:700;text-decoration:none;">Lupa Kata Sandi?</a>
          </div>

          <button class="btn btn-primary" type="submit" style="width:100%;height:46px;font-size:14.5px;font-weight:800;">
            ${I("lock")} Masuk ke Workspace
          </button>
          
          <button type="button" class="btn btn-soft" onclick="enterApp()" style="width:100%;height:40px;margin-top:10px;font-weight:700;">
            ${I("arrowR")} Buka Dashboard Langsung
          </button>

          <div style="margin-top:22px;padding:12px 14px;border-radius:12px;background:var(--lemon-100);border:1px solid var(--lemon-300);color:#3d3300;font-size:12.5px;display:flex;align-items:flex-start;gap:10px;line-height:1.45;">
            <span style="color:#735a00;flex-shrink:0;margin-top:1px">${I("info")}</span>
            <div>
              <b>Mode Pratinjau Tampilan (Belum Difungsikan)</b>
              <div style="margin-top:2px;opacity:0.9">Halaman login ini dibuat khusus untuk meninjau desain antarmuka. Belum terhubung ke autentikasi database, sehingga Anda dapat langsung menekan tombol <b>Masuk</b> untuk membuka dashboard.</div>
            </div>
          </div>
        </form>
      </div>`;
};

window.enterApp = () => {
    sessionStorage.setItem("satarya_view_app", "1");
    const loginEl = $("#login");
    if (loginEl) loginEl.hidden = true;
    const appEl = $("#app");
    if (appEl) appEl.hidden = false;
    render();
    toast("Membuka Dashboard ERP (Mode Pratinjau)");
};

/* Header halaman */
function head(title, desc, actions, crumbs) {
    const g = pageGroup(S.page);
    const trail = [`<button onclick="go('dash')">Beranda</button>`];
    if (g && g.id !== "home") trail.push(`<span>${g.label}</span>`);
    (crumbs || []).forEach((c) => trail.push(c));
    return `<div class="page-head"><div>
      <div class="crumbs">${trail.join(I("chevR"))}${I("chevR")}<span class="cur">${esc(title)}</span></div>
      <h1>${esc(title)}</h1>${desc ? `<p>${desc}</p>` : ""}
    </div>${actions ? `<div class="page-actions">${actions}</div>` : ""}</div>`;
}

/* ---------------------------------------------------------------------
   9. DASHBOARD
   --------------------------------------------------------------------- */
function dash() {
    const run = D.proj.filter((p) => p.status === "Berjalan");
    const lowSupply = D.supply.filter(
        (i) => stok(i) <= (+i.minStok || 0),
    ).length;
    const rusakPending = D.rusak.filter(
        (r) => r.status === "Dilaporkan" || r.status === "Sedang Diperbaiki",
    ).length;
    const piutangVal = piutang();
    const alertCount = alerts().length;

    const tglStr = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return `<div class="hero">
      <div>
        <span class="hero-date">${I("cal")}${tglStr}</span>
        <h2>${greet()}! Selamat Datang di Satarya ERP</h2>
        <p>Sistem operasional aktif. Pantau perputaran kas, proyek lapangan, dan inventaris secara terpadu.</p>
        <div class="hero-actions">
          <button class="btn btn-lemon" onclick="openForm('proj')">${I("plus")}Proyek Baru</button>
          <button class="btn btn-glass" onclick="openForm('keu',null,{tipe:'keluar'})">${I("outflow")}Catat Pengeluaran</button>
          <button class="btn btn-glass" onclick="openForm('invoice')">${I("invoice")}Buat Invoice</button>
        </div>
      </div>
      <div class="hero-balance">
        <span>Saldo Kas Operasional</span>
        <b class="${kas() < 0 ? "neg" : ""}">${rp(kas())}</b>
        <div class="hero-flow">
          <div><small>Pemasukan Kas</small><strong class="pos">${rpS(kasIn())}</strong></div>
          <div><small>Pengeluaran Kas</small><strong class="neg">${rpS(kasOut())}</strong></div>
        </div>
      </div>
      ${WAVES}
    </div>

    <div class="kpis">
      <button class="kpi" onclick="go('keu')">
        <div class="kpi-top"><span class="kpi-ico">${I("keu")}</span><span class="kpi-tag">Buku Kas</span></div>
        <span class="kpi-label">Kas Operasional</span>
        <b class="kpi-val ${kas() < 0 ? "neg" : "pos"}">${rp(kas())}</b>
        <span class="kpi-foot">Selisih arus kas berjalan</span>
      </button>

      <button class="kpi teal" onclick="go('proj')">
        <div class="kpi-top"><span class="kpi-ico">${I("proj")}</span><span class="kpi-tag">${run.length} Aktif</span></div>
        <span class="kpi-label">Nilai Kontrak Berjalan</span>
        <b class="kpi-val">${rp(sum(run, (p) => p.nilai))}</b>
        <span class="kpi-foot">Total ${D.proj.length} proyek terdaftar</span>
      </button>

      <button class="kpi ${piutangVal > 0 ? "warn" : ""}" onclick="go('invoice')">
        <div class="kpi-top"><span class="kpi-ico">${I("invoice")}</span><span class="kpi-tag">Piutang</span></div>
        <span class="kpi-label">Tagihan Belum Lunas</span>
        <b class="kpi-val">${rp(piutangVal)}</b>
        <span class="kpi-foot">${D.invoice.filter((r) => r.status !== "Lunas").length} invoice menanti pembayaran</span>
      </button>

      <button class="kpi ${alertCount ? "bad" : ""}" onclick="go('alert')">
        <div class="kpi-top"><span class="kpi-ico">${I("alert")}</span><span class="kpi-tag">Peringatan</span></div>
        <span class="kpi-label">Isu Perlu Tindakan</span>
        <b class="kpi-val ${alertCount ? "neg" : ""}">${alertCount}</b>
        <span class="kpi-foot">${lowSupply} stok tipis · ${rusakPending} alat rusak</span>
      </button>
    </div>

    <div class="mini-stats">
      <button type="button" onclick="go('kanban')">
        ${I("kanban")}
        <div><small>Papan Proyek</small><b>${D.proj.filter((p) => p.status === "Prospek").length} prospek · ${run.length} jalan</b></div>
      </button>
      <button type="button" onclick="go('supply')">
        ${I("supply")}
        <div><small>Perlengkapan</small><b>${D.supply.length} item · ${lowSupply} tipis</b></div>
      </button>
      <button type="button" onclick="go('alat')">
        ${I("alat")}
        <div><small>Aset Peralatan</small><b>${sum(D.alat, (x) => x.jumlah)} unit mesin/tools</b></div>
      </button>
      <button type="button" onclick="go('karyawan')">
        ${I("karyawan")}
        <div><small>SDM & Karyawan</small><b>${D.karyawan.length} personil aktif</b></div>
      </button>
    </div>

    <div class="grid-3">
      <div class="card">
        <div class="card-h">
          <div>
            <h3>Arus Kas 6 Bulan Terakhir</h3>
            <p>Perbandingan pemasukan termin dan pengeluaran kas operasional.</p>
          </div>
          ${can("keu") ? `<button class="btn btn-sm btn-ghost" onclick="go('keu')">Buka Kas →</button>` : ""}
        </div>
        <div class="card-b">
          <div class="chart-box"><canvas id="c1"></canvas></div>
        </div>
      </div>

      <div class="card">
        <div class="card-h">
          <div>
            <h3>Status Proyek</h3>
            <p>Komposisi tahap pekerjaan saat ini.</p>
          </div>
          ${can("kanban") ? `<button class="btn btn-sm btn-ghost" onclick="go('kanban')">Papan Kanban →</button>` : ""}
        </div>
        <div class="card-b">
          <div class="chart-box"><canvas id="c2"></canvas></div>
        </div>
      </div>
    </div>

    <div class="grid-2" style="margin-top:20px">
      <div class="card">
        <div class="card-h">
          <div>
            <h3>Kesehatan Anggaran Proyek</h3>
            <p>Realisasi biaya lapangan terhadap nilai RAB.</p>
          </div>
          ${can("proj") ? `<button class="btn btn-sm btn-ghost" onclick="go('proj')">Semua Proyek →</button>` : ""}
        </div>
        <div class="card-b">
          ${
              D.proj.length
                  ? D.proj.slice(-5).reverse().map(budgetBar).join("")
                  : '<div class="empty">Belum ada proyek aktif.</div>'
          }
        </div>
      </div>

      <div class="card">
        <div class="card-h">
          <div>
            <h3>Peringatan & Isu Lapangan</h3>
            <p>Hal mendesak yang memerlukan penanganan.</p>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="go('alert')">Semua Isu (${alertCount}) →</button>
        </div>
        <div class="card-b">
          ${alertList(4)}
        </div>
      </div>
    </div>

    ${
        D.log && D.log.length
            ? `<div class="card" style="margin-top:20px">
            <div class="card-h">
              <div>
                <h3>Aktivitas Terbaru</h3>
                <p>Jejak perubahan data sistem (sementara &bull; otomatis terhapus saat refresh browser).</p>
              </div>
              <button type="button" class="btn btn-sm btn-ghost" onclick="clearActLog()" title="Bersihkan riwayat aktivitas">${I("trash")} Bersihkan</button>
            </div>
            <div class="card-b">
              <div class="tl">
                ${D.log
                    .slice(0, 5)
                    .map(
                        (l) =>
                            `<div class="tl-item ${l.a === "Hapus" ? "del" : l.a === "Tambah" ? "add" : ""}">
                        <b>${esc(l.u)}</b> <span class="badge plain">${esc(l.a)}</span>
                        <p>${esc(l.l)}</p>
                        <small>${relT(l.t)}</small>
                      </div>`,
                    )
                    .join("")}
              </div>
            </div>
          </div>`
            : ""
    }`;
}

function budgetBar(p) {
    const rb = rabOf(p),
        sp = spent(p),
        base = rb || +p.nilai || 0,
        pc = base ? Math.min(100, (sp / base) * 100) : 0,
        over = base && sp > base;
    return `
    <div class="bud">
      <div class="bud-top">
        <div>
          <button class="link" onclick="go('pd',${p.id})">${esc(p.nama)}</button>
          <span style="font-size:12px;color:var(--muted);margin-left:6px">${esc(p.klien || "")}</span>
        </div>
        <b class="${over ? "neg" : ""}">${base ? Math.round((sp / base) * 100) : 0}%</b>
      </div>
      <div class="meter ${over ? "over" : ""}"><i style="width:${pc}%"></i></div>
      <small>Terpakai <b>${rp(sp)}</b> dari ${rb ? "RAB" : "nilai"} <b>${rp(base)}</b></small>
    </div>`;
}

/* ---------------------------------------------------------------------
   10. KANBAN PROYEK
   --------------------------------------------------------------------- */
const KANBAN_STAGES = ["Prospek", "Berjalan", "Tertunda", "Selesai"];

function kanban() {
    const filterSales = S.filter.kanbanSales || "";
    let list = D.proj.slice();
    if (filterSales) list = list.filter((p) => p.sales == filterSales);

    const cols = KANBAN_STAGES.map((st) => {
        const items = list.filter((p) => (p.status || "Berjalan") === st);
        const totalVal = sum(items, (p) => p.nilai);

        const cards = items
            .map((p) => {
                const sp = spent(p);
                const rb = rabOf(p);
                const base = rb || +p.nilai || 0;
                const pc = base
                    ? Math.min(100, Math.round((sp / base) * 100))
                    : 0;
                const salesName = nm("sales", p.sales);

                // Tombol perpindahan tahap di mobile
                const stIdx = KANBAN_STAGES.indexOf(st);
                const prevSt = stIdx > 0 ? KANBAN_STAGES[stIdx - 1] : null;
                const nextSt =
                    stIdx < KANBAN_STAGES.length - 1
                        ? KANBAN_STAGES[stIdx + 1]
                        : null;

                return `
          <div class="kcard" draggable="true" ondragstart="kDragStart(event, ${p.id})" ondragend="kDragEnd(event)" id="kc_${p.id}">
            <h4><a class="link" onclick="go('pd',${p.id})">${esc(p.nama)}</a></h4>
            <div class="muted">${esc(p.klien || "-")} · Mulai ${fmtD(p.mulai)}</div>
            <div class="kcard-val">${rp(p.nilai)}</div>
            <div class="meter ${base && sp > base ? "over" : ""}" style="height:6px"><i style="width:${pc}%"></i></div>
            <div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--muted);margin-top:4px">
              <span>Biaya: ${rpS(sp)}</span>
              <span>${pc}%</span>
            </div>
            <div class="kcard-foot">
              <span class="avatar" title="Sales: ${esc(salesName)}">${initials(salesName)}</span>
              <div class="kmove">
                ${prevSt ? `<button class="icon-btn row-act" onclick="moveProj(${p.id},'${prevSt}')" title="Geser ke ${prevSt}">${I("chevL")}</button>` : ""}
                ${nextSt ? `<button class="icon-btn row-act" onclick="moveProj(${p.id},'${nextSt}')" title="Geser ke ${nextSt}">${I("chevR")}</button>` : ""}
                <button class="icon-btn row-act" onclick="openForm('proj',${p.id})" title="Ubah">${I("edit")}</button>
              </div>
            </div>
          </div>`;
            })
            .join("");

        return `
      <div class="kcol" ondragover="kDragOver(event)" ondragleave="kDragLeave(event)" ondrop="kDrop(event, '${st}')">
        <div class="kcol-h">
          <span class="dot" style="background:${st === "Berjalan" ? "var(--primary)" : st === "Selesai" ? "var(--ok)" : st === "Tertunda" ? "var(--warn)" : "var(--lemon-600)"}"></span>
          <b>${st}</b>
          <span class="badge plain">${items.length}</span>
        </div>
        <div class="kcol-sum">${rp(totalVal)}</div>
        <div class="kcards">${cards || '<div class="empty" style="padding:14px;background:var(--surface);border-radius:10px">Kosong</div>'}</div>
        <button type="button" class="kcol-add-btn" onclick="openForm('proj', null, { status: '${st}' })">${I("plus")}Tambah Proyek (${st})</button>
      </div>`;
    }).join("");

    const salesOpts = D.sales
        .map(
            (s) =>
                `<option value="${s.id}" ${filterSales == s.id ? "selected" : ""}>${esc(s.nama)}</option>`,
        )
        .join("");

    const actions = `
    <div style="display:inline-flex;gap:8px;align-items:center">
      <select onchange="S.filter.kanbanSales=this.value;render()" style="height:40px;padding:0 12px;border-radius:var(--r-sm);border:1.5px solid var(--line-2);background:var(--surface)">
        <option value="">Semua Sales</option>
        ${salesOpts}
      </select>
      <button class="btn" onclick="go('proj')">${I("grid")}Tampilan Tabel</button>
      <button class="btn btn-primary" onclick="openForm('proj')">${I("plus")}Tambah Proyek</button>
    </div>`;

    return (
        head("Papan Kanban Proyek", pageDesc("kanban"), actions) +
        `<div class="kanban">${cols}</div>`
    );
}

let draggedProjId = null;
window.kDragStart = (ev, id) => {
    draggedProjId = id;
    ev.dataTransfer.setData("text/plain", id);
    setTimeout(() => {
        const el = document.getElementById("kc_" + id);
        if (el) el.classList.add("dragging");
    }, 0);
};
window.kDragEnd = (ev) => {
    const el = document.querySelector(".kcard.dragging");
    if (el) el.classList.remove("dragging");
    document
        .querySelectorAll(".kcol.over")
        .forEach((c) => c.classList.remove("over"));
};
window.kDragOver = (ev) => {
    ev.preventDefault();
    ev.currentTarget.classList.add("over");
};
window.kDragLeave = (ev) => {
    ev.currentTarget.classList.remove("over");
};
window.kDrop = (ev, newStatus) => {
    ev.preventDefault();
    ev.currentTarget.classList.remove("over");
    const id = +ev.dataTransfer.getData("text/plain") || draggedProjId;
    if (!id) return;
    moveProj(id, newStatus);
};
window.moveProj = (id, newStatus) => {
    const p = D.proj.find((x) => x.id == id);
    if (!p || p.status === newStatus) return;
    const old = p.status;
    p.status = newStatus;
    logAct("Ubah Status", "proj", `Status ${p.nama}: ${old} → ${newStatus}`);
    save();
    render(true);
    toast(`Status proyek "${p.nama}" diubah ke ${newStatus}`);
};

/* ---------------------------------------------------------------------
   11. DATA TABLE & LIST PAGES
   --------------------------------------------------------------------- */
function topStats(k) {
    if (k === "alat")
        return [
            ["Total Jenis Alat", D.alat.length],
            ["Total Unit Aset", sum(D.alat, (x) => x.jumlah)],
            [
                "Nilai Aset Peralatan",
                rp(sum(D.alat, (x) => (+x.jumlah || 0) * (+x.harga || 0))),
            ],
            [
                "Sedang Diperbaiki",
                D.rusak.filter(
                    (x) =>
                        x.status === "Dilaporkan" ||
                        x.status === "Sedang Diperbaiki",
                ).length,
            ],
        ];
    if (k === "rusak")
        return [
            ["Total Laporan", D.rusak.length],
            [
                "Tiket Baru",
                D.rusak.filter((x) => x.status === "Dilaporkan").length,
            ],
            [
                "Sedang Dikerjakan",
                D.rusak.filter((x) => x.status === "Sedang Diperbaiki").length,
            ],
            [
                "Selesai Diperbaiki",
                D.rusak.filter((x) => x.status === "Selesai").length,
            ],
        ];
    if (k === "supply" || k === "inv")
        return [
            ["Item Terdaftar", D[k].length],
            [
                "Nilai Persediaan",
                rp(sum(D[k], (i) => stok(i) * (+i.harga || 0))),
            ],
            [
                "Stok Menipis",
                D[k].filter((i) => stok(i) <= (+i.minStok || 0)).length,
            ],
        ];
    if (k === "mov")
        return [
            ["Total Transaksi Mutasi", D.mov.length],
            ["Mutasi Masuk", D.mov.filter((m) => m.tipe === "masuk").length],
            [
                "Mutasi Pemakaian",
                D.mov.filter((m) => m.tipe === "keluar").length,
            ],
        ];
    if (k === "vendor")
        return [
            ["Total Vendor", D.vendor.length],
            [
                "Vendor Material",
                D.vendor.filter((v) => v.kategori === "Material").length,
            ],
            [
                "Alat & Sewa",
                D.vendor.filter((v) => v.kategori === "Alat & Sewa").length,
            ],
            [
                "Jasa / Subkon",
                D.vendor.filter((v) => v.kategori === "Jasa / Subkon").length,
            ],
        ];
    if (k === "proj")
        return [
            ["Total Proyek", D.proj.length],
            ["Total Nilai Kontrak", rp(sum(D.proj, (p) => p.nilai))],
            ["Realisasi Biaya", rp(sum(D.proj, spent))],
            ["Penerimaan Termin", rp(sum(D.proj, received))],
        ];
    if (k === "rab")
        return [
            ["Dokumen Terunggah", D.rab.length],
            [
                "Proyek Terhubung",
                new Set(D.rab.map((x) => x.proj).filter(Boolean)).size,
            ],
        ];
    if (k === "budget")
        return [
            ["Item Anggaran", D.budget.length],
            ["Alokasi Total RAB", rp(sum(D.budget, (x) => x.rencana))],
            ["Realisasi Lapangan", rp(sum(D.proj, spent))],
        ];
    if (k === "biaya") {
        const keuExp = D.keu.filter((x) => x.tipe === "keluar" && x.proj);
        const totKeu = sum(keuExp, (x) => x.nominal);
        const totDir = sum(D.biaya, (x) => x.nominal);
        return [
            ["Total Pengeluaran Proyek", rp(totKeu + totDir)],
            ["Dari Kas Harian", rp(totKeu)],
            ["Input Anggaran", rp(totDir)],
        ];
    }
    if (k === "keu")
        return [
            ["Saldo Kas", rp(kas())],
            ["Total Pemasukan", rp(kasIn())],
            ["Total Pengeluaran", rp(kasOut())],
            [
                "Borongan Tukang",
                rp(
                    sum(
                        D.keu.filter((x) => x.kategori === "Borongan Tukang"),
                        (x) => x.nominal,
                    ),
                ),
            ],
        ];
    if (k === "invoice")
        return [
            ["Total Invoice", D.invoice.length],
            ["Total Nilai Tagihan", rp(sum(D.invoice, (x) => x.nominal))],
            ["Sisa Piutang", rp(piutang())],
            [
                "Sudah Lunas",
                rp(
                    sum(
                        D.invoice.filter((x) => x.status === "Lunas"),
                        (x) => x.nominal,
                    ),
                ),
            ],
        ];
    if (k === "karyawan")
        return [
            ["Total Karyawan", D.karyawan.length],
            ["Beban Gaji Pokok", rp(sum(D.karyawan, (x) => x.gaji))],
            [
                "Kasbon Aktif",
                rp(
                    sum(
                        D.kasbon.filter((x) => x.status === "Belum Lunas"),
                        (x) => x.nominal,
                    ),
                ),
            ],
            [
                "Ganti Rugi Aktif",
                rp(
                    sum(
                        D.gantirugi.filter((x) => x.status === "Belum Dibayar"),
                        (x) => x.nominal,
                    ),
                ),
            ],
        ];
    if (k === "kasbon")
        return [
            ["Total Pinjaman", D.kasbon.length],
            [
                "Belum Lunas",
                rp(
                    sum(
                        D.kasbon.filter((x) => x.status === "Belum Lunas"),
                        (x) => x.nominal,
                    ),
                ),
            ],
            [
                "Sudah Lunas",
                rp(
                    sum(
                        D.kasbon.filter((x) => x.status === "Lunas"),
                        (x) => x.nominal,
                    ),
                ),
            ],
        ];
    if (k === "gantirugi")
        return [
            ["Total Catatan", D.gantirugi.length],
            [
                "Belum Dibayar",
                rp(
                    sum(
                        D.gantirugi.filter((x) => x.status === "Belum Dibayar"),
                        (x) => x.nominal,
                    ),
                ),
            ],
            [
                "Lunas",
                rp(
                    sum(
                        D.gantirugi.filter((x) => x.status === "Lunas"),
                        (x) => x.nominal,
                    ),
                ),
            ],
        ];
    if (k === "gaji")
        return [
            ["Slip Pembayaran", D.gaji.length],
            [
                "Total Dibayarkan",
                rp(
                    sum(
                        D.gaji,
                        (x) =>
                            (+x.nominal || 0) -
                            (+x.pot_kasbon || 0) -
                            (+x.pot_rugi || 0),
                    ),
                ),
            ],
        ];
    if (k === "form")
        return [
            [
                "Pengajuan Baru",
                D.form.filter((x) => x.status === "Diajukan").length,
            ],
            [
                "Disetujui",
                D.form.filter((x) => x.status === "Disetujui").length,
            ],
            ["Ditolak", D.form.filter((x) => x.status === "Ditolak").length],
        ];
    if (k === "sales") {
        const sOnly = D.sales.filter((s) => !s.divisi || s.divisi === "Sales");
        return [
            ["Total Anggota Tim", D.sales.length],
            ["Personil Sales", sOnly.length],
            ["Total Target Sales", rp(sum(sOnly, (x) => x.target))],
            ["Omzet Tercapai", rp(sum(D.proj, (p) => p.nilai))],
        ];
    }
    return [["Total Baris", (D[k] || []).length]];
}

function extra(k) {
    if (k === "alat")
        return [
            [
                "Status Rusak",
                (r) => {
                    const lapor = D.rusak.filter(
                        (x) =>
                            x.alat == r.id &&
                            (x.status === "Dilaporkan" ||
                                x.status === "Sedang Diperbaiki"),
                    );
                    return lapor.length
                        ? `<span class="badge bad">${lapor.length} perbaikan</span>`
                        : '<span class="badge ok">Baik</span>';
                },
            ],
            ["Nilai Aset", (r) => rp((+r.jumlah || 0) * (+r.harga || 0))],
            [
                "Aksi Cepat",
                (r) =>
                    `<button class="btn btn-sm" onclick="openForm('rusak',null,{alat:${r.id}})">+ Laporkan Rusak</button>`,
            ],
        ];
    if (k === "supply" || k === "inv")
        return [
            ["Stok Kini", (r) => `<b>${stok(r)}</b> ${esc(r.satuan || "")}`],
            [
                "Kondisi",
                (r) =>
                    stok(r) <= (+r.minStok || 0)
                        ? '<span class="badge bad">Menipis</span>'
                        : '<span class="badge ok">Aman</span>',
            ],
            [
                "Aksi Cepat",
                (r) =>
                    `<div class="quick">
            <button class="btn btn-sm btn-soft" onclick="openForm('mov',null,{supply:${r.id},tipe:'masuk'})">+ Masuk</button>
            <button class="btn btn-sm" onclick="openForm('mov',null,{supply:${r.id},tipe:'keluar'})">- Pakai</button>
          </div>`,
            ],
        ];
    if (k === "proj")
        return [
            ["Biaya Terpakai", (r) => rp(spent(r))],
            [
                "Sisa Kontrak",
                (r) => {
                    const s = (+r.nilai || 0) - spent(r);
                    return `<span class="${s < 0 ? "neg" : "pos"}">${rp(s)}</span>`;
                },
            ],
            [
                "Aksi Cepat",
                (r) =>
                    `<button class="btn btn-sm btn-soft" onclick="go('pd',${r.id})">Lihat Detail →</button>`,
            ],
        ];
    if (k === "karyawan")
        return [
            ["Kehadiran", (r) => hadirPct(r)],
            [
                "Kasbon Aktif",
                (r) => {
                    const unp = sum(
                        D.kasbon.filter(
                            (x) => x.kar == r.id && x.status === "Belum Lunas",
                        ),
                        (x) => x.nominal,
                    );
                    return unp
                        ? `<span class="neg">${rp(unp)}</span>`
                        : '<span class="muted">Rp 0</span>';
                },
            ],
            [
                "Aksi Cepat",
                (r) =>
                    `<button class="btn btn-sm btn-soft" onclick="go('kd',${r.id})">Profil Karyawan →</button>`,
            ],
        ];
    if (k === "gaji")
        return [
            [
                "Gaji Bersih (THP)",
                (r) => {
                    const bersih = Math.max(
                        0,
                        (+r.nominal || 0) - (+r.pot_kasbon || 0) - (+r.pot_rugi || 0),
                    );
                    return `<b class="pos">${rp(bersih)}</b>`;
                },
            ],
        ];
    if (k === "vendor")
        return [
            ["Penilaian", (r) => stars(r.rating)],
            [
                "Kontak Cepat",
                (r) => {
                    const num = String(r.kontak || "").replace(/[^0-9]/g, "");
                    return num
                        ? `<a class="btn btn-sm btn-soft" href="https://wa.me/${num.startsWith("0") ? "62" + num.slice(1) : num}" target="_blank" rel="noopener">${I("phone")} WhatsApp</a>`
                        : "-";
                },
            ],
        ];
    if (k === "invoice")
        return [
            ["Status Tagihan", (r) => badge(invStatus(r))],
            [
                "Cetak",
                (r) =>
                    `<div class="quick">
            <button class="btn btn-sm btn-soft" onclick="printInvoice(${r.id})">${I("print")} Cetak</button>
            ${
                r.status !== "Lunas"
                    ? `<button class="btn btn-sm btn-accent" onclick="payInvoice(${r.id})" title="Catat Pelunasan ke Kas">+ Lunas</button>`
                    : ""
            }
          </div>`,
            ],
        ];
    if (k === "biaya")
        return [
            [
                "Sumber",
                (r) =>
                    r._src === "keu"
                        ? '<span class="badge ok plain">Kas Harian</span>'
                        : '<span class="badge warn plain">Input Langsung</span>',
            ],
        ];
    return [];
}

function disp(f, v, plain, k, r) {
    const t = f[2];
    if (typeof t === "string" && t.startsWith("ref:")) {
        const targetEntity = t.slice(4).replace("?", "");
        return esc(v ? nm(targetEntity, v) : "-");
    }
    if (plain) return String(v ?? "");
    if (k === "proj" && f[0] === "nama")
        return `<button class="link" onclick="go('pd',${r.id})">${esc(v)}</button>`;
    if (k === "karyawan" && f[0] === "nama")
        return `<button class="link" onclick="go('kd',${r.id})">${esc(v)}</button>`;
    if (f[0] === "link")
        return v
            ? `<a class="file-pill" href="${esc(v)}" target="_blank" rel="noopener">${I("link")} Buka Tautan</a>`
            : "-";
    if (t === "pdf" || t === "pdf?" || f[0] === "pdf") {
        if (!v) return '<span class="muted">-</span>';
        const name = r.pdf_name || "Dokumen.pdf";
        return `<a class="file-pill" href="${esc(v)}" download="${esc(name)}" target="_blank" rel="noopener">${I("file")} ${esc(name)}</a>`;
    }
    if (f[0] === "status" || f[0] === "tipe" || f[0] === "kondisi")
        return badge(v);
    if (t === "n") return rp(v);
    if (t === "d") return fmtD(v);
    if (t === "m") return fmtM(v);
    if (f[0] === "rating") return stars(v);
    return esc(v);
}

function listPage(k) {
    const e = E[k];
    if (!e) return '<div class="empty">Halaman tidak ditemukan.</div>';

    const q = (S.q[k] || "").toLowerCase().trim();
    const sortCfg = S.sort[k] || { col: null, desc: false };
    const filterVal = S.filter[k] || "";

    // Data sumber gabungan untuk Penggunaan Anggaran (biaya)
    let sourceData = D[k] || [];
    if (k === "biaya") {
        const keuExpenses = (D.keu || [])
            .filter((x) => x.tipe === "keluar" && x.proj)
            .map((x) => ({
                id: x.id,
                tgl: x.tgl,
                proj: x.proj,
                kategori: x.kategori || "Kas Harian",
                nominal: x.nominal,
                ket: x.ket || "Dari Kas Harian",
                _src: "keu",
            }));
        const directBiaya = (D.biaya || []).map((x) => ({
            ...x,
            _src: "biaya",
        }));
        const seen = new Set();
        sourceData = [...directBiaya, ...keuExpenses].filter((item) => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
        });
    }

    // Filter chips (berdasarkan status atau kategori umum)
    const statusField = e.f.find(
        (f) =>
            f[0] === "status" ||
            f[0] === "tipe" ||
            f[0] === "kondisi" ||
            f[0] === "kategori",
    );
    let chipsHtml = "";
    if (statusField && Array.isArray(statusField[2])) {
        const opts = statusField[2];
        chipsHtml = `<div class="chips">
      <button class="chip ${!filterVal ? "on" : ""}" onclick="setTableFilter('${k}','')">Semua <small>${sourceData.length}</small></button>
      ${opts
          .map((opt) => {
              const count = sourceData.filter(
                  (r) => r[statusField[0]] === opt,
              ).length;
              return `<button class="chip ${filterVal === opt ? "on" : ""}" onclick="setTableFilter('${k}','${opt}')">${opt} <small>${count}</small></button>`;
          })
          .join("")}
    </div>`;
    }

    // Saring data
    let filtered = sourceData.filter((r) => {
        if (filterVal && statusField && r[statusField[0]] !== filterVal)
            return false;
        if (!q) return true;
        const flat = e.f
            .map((f) => disp(f, r[f[0]], true, k, r))
            .join(" ")
            .toLowerCase();
        return flat.includes(q);
    });

    // Urutkan data
    if (sortCfg.col) {
        const colIdx = sortCfg.col;
        filtered.sort((a, b) => {
            let va = a[colIdx],
                vb = b[colIdx];
            if (va == null) va = "";
            if (vb == null) vb = "";
            if (typeof va === "number" && typeof vb === "number")
                return sortCfg.desc ? vb - va : va - vb;
            return sortCfg.desc
                ? String(vb).localeCompare(String(va))
                : String(va).localeCompare(String(vb));
        });
    } else {
        // Default terbaru di atas
        filtered.reverse();
    }

    // Batas pagination
    const limit = S.limit[k] || PAGE_SIZE;
    const pagedRows = filtered.slice(0, limit);
    const ex = extra(k);

    const statsCards = topStats(k)
        .map(
            ([l, v]) => `
      <div class="metric">
        <span>${l}</span>
        <b>${v}</b>
      </div>`,
        )
        .join("");

    const actions = `
    <button class="btn" onclick="csv('${k}')">${I("download")}Export CSV</button>
    ${k === "proj" ? `<button class="btn" onclick="go('kanban')">${I("kanban")}Papan Kanban</button>` : ""}
    <button class="btn btn-primary" onclick="openForm('${k}')">${I("plus")}Tambah ${e.s}</button>`;

    return (
        head(e.t, e.d, actions) +
        `<div class="metrics">${statsCards}</div>
    <div class="card">
      <div class="toolbar">
        <div class="search">
          ${I("search")}
          <input type="search" placeholder="Cari di ${e.t.toLowerCase()}..." value="${esc(S.q[k] || "")}" oninput="S.q['${k}']=this.value;render(true)" id="srch">
        </div>
        ${chipsHtml}
        <span class="count">${filtered.length} catatan</span>
      </div>

      <div class="tbl-wrap">
        <table class="tbl cards">
          <thead>
            <tr>
              ${e.f
                  .map((f) => {
                      const isSort = sortCfg.col === f[0];
                      const cls =
                          (f[2] === "n" || f[2] === "q" ? "n " : "") +
                          "sort" +
                          (isSort ? (sortCfg.desc ? " desc" : " asc") : "");
                      return `<th class="${cls}" onclick="sortCol('${k}','${f[0]}')">${f[1]}<span class="arr">${isSort ? (sortCfg.desc ? "▼" : "▲") : "↕"}</span></th>`;
                  })
                  .join("")}
              ${ex.map((x) => `<th>${x[0]}</th>`).join("")}
              <th class="act">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${
                pagedRows
                    .map(
                        (r) => `
                <tr>
                  ${e.f
                      .map(
                          (f) =>
                              `<td data-label="${esc(f[1])}" class="${f[2] === "n" || f[2] === "q" ? "n" : ""}">${disp(f, r[f[0]], false, k, r)}</td>`,
                      )
                      .join("")}
                  ${ex.map((x) => `<td data-label="${esc(x[0])}">${x[1](r)}</td>`).join("")}
                  <td class="act">
                    <div class="row-actions">
                      <button class="icon-btn row-act" onclick="openForm('${r._src || k}',${r.id})" title="Ubah data">${I("edit")}</button>
                      <button class="icon-btn row-act del" onclick="del('${r._src || k}',${r.id})" title="Hapus data">${I("trash")}</button>
                    </div>
                  </td>
                </tr>`,
                    )
                    .join("") ||
                `<tr>
                <td colspan="99" class="empty-td">
                  <div class="empty-ill">
                    <div class="ring-ico">${I("search")}</div>
                    <b>${q ? "Tidak ada hasil pencarian" : "Belum ada catatan " + e.s.toLowerCase()}</b>
                    <p>${q ? "Coba gunakan kata kunci lain atau bersihkan filter." : 'Mulai pencatatan dengan menekan tombol "Tambah ' + e.s + '".'}</p>
                  </div>
                </td>
              </tr>`
            }
          </tbody>
        </table>
      </div>

      ${
          filtered.length > limit
              ? `<div class="more">
              <button class="btn btn-ghost" onclick="S.limit['${k}']=(S.limit['${k}']||${PAGE_SIZE})+${PAGE_SIZE};render(true)">
                Tampilkan lebih banyak (${filtered.length - limit} tersisa)
              </button>
            </div>`
              : ""
      }
    </div>

    ${
        k === "supply" || k === "inv"
            ? `<div class="card" style="margin-top:20px">
            <div class="card-h">
              <div><h3>Stok Dibanding Batas Minimum</h3><p>Perbandingan stok real time dengan batas peringatan.</p></div>
            </div>
            <div class="card-b"><div class="chart-box"><canvas id="c3"></canvas></div></div>
          </div>`
            : ""
    }

    ${
        k === "alat"
            ? `<div class="card" style="margin-top:20px">
            <div class="card-h">
              <div><h3>Kondisi Fisik Peralatan</h3><p>Proporsi aset yang baik vs membutuhkan servis.</p></div>
            </div>
            <div class="card-b"><div class="chart-box sm"><canvas id="c_alat"></canvas></div></div>
          </div>`
            : ""
    }

    ${k === "sales" ? salesKpi() : ""}`
    );
}

window.sortCol = (k, col) => {
    const cur = S.sort[k] || {};
    if (cur.col === col) {
        if (cur.desc) S.sort[k] = { col: null, desc: false };
        else S.sort[k] = { col, desc: true };
    } else {
        S.sort[k] = { col, desc: false };
    }
    render(true);
};
window.setTableFilter = (k, v) => {
    S.filter[k] = v;
    render(true);
};

/* ---------------------------------------------------------------------
   12. KPI SALES & TIM
   --------------------------------------------------------------------- */
function salesKpi() {
    const sList = D.sales.filter((s) => !s.divisi || s.divisi === "Sales");
    return `
    <div class="card" style="margin-top:20px">
      <div class="card-h">
        <div><h3>Capaian Target Tim Sales</h3><p>Realisasi omzet proyek terhadap target masing-masing personil.</p></div>
      </div>
      <div class="card-b">
        <div class="tbl-wrap">
          <table class="tbl">
            <thead>
              <tr>
                <th>Nama Sales</th>
                <th>Kontak</th>
                <th class="n">Jumlah Proyek</th>
                <th class="n">Omzet Masuk</th>
                <th class="n">Target Omzet</th>
                <th style="min-width:200px">Persentase Capaian</th>
              </tr>
            </thead>
            <tbody>
              ${
                  sList
                      .map((s) => {
                          const ps = D.proj.filter((p) => p.sales == s.id);
                          const o = sum(ps, (p) => p.nilai);
                          const pc = s.target ? (o / s.target) * 100 : 0;
                          return `
                    <tr>
                      <td><b>${esc(s.nama)}</b></td>
                      <td>${esc(s.kontak || "-")}</td>
                      <td class="n">${ps.length} proyek</td>
                      <td class="n pos">${rp(o)}</td>
                      <td class="n">${rp(s.target)}</td>
                      <td>
                        <div class="bud-top" style="margin-bottom:4px">
                          <span style="font-size:12px;color:var(--muted)">Target: ${rpS(s.target)}</span>
                          <b>${pc.toFixed(0)}%</b>
                        </div>
                        <div class="meter"><i style="width:${Math.min(100, pc)}%"></i></div>
                      </td>
                    </tr>`;
                      })
                      .join("") ||
                  '<tr><td colspan="6" class="empty">Belum ada staf di divisi Sales.</td></tr>'
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:20px">
      <div class="card-h">
        <div><h3>Grafik Omzet Dibanding Target</h3><p>Visualisasi performa per staf sales.</p></div>
      </div>
      <div class="card-b"><div class="chart-box"><canvas id="c5"></canvas></div></div>
    </div>`;
}

/* ---------------------------------------------------------------------
   13. DETAIL PROYEK
   --------------------------------------------------------------------- */
function projDetail() {
    const p = D.proj.find((x) => x.id == S.id);
    if (!p)
        return (
            head(
                "Proyek Tidak Ditemukan",
                "",
                `<button class="btn" onclick="go('proj')">Kembali</button>`,
            ) +
            '<div class="empty">Proyek tidak ditemukan atau telah dihapus.</div>'
        );

    const rb = rabOf(p);
    const sp = spent(p);
    const rec = received(p);
    const sisa = (+p.nilai || 0) - sp;
    const base = rb || +p.nilai || 0;
    const pc = base ? Math.min(100, Math.round((sp / base) * 100)) : 0;
    const activeTab = S.tab.pd || "ringkasan";

    const miniTable = (title, entityKey, addFilter, headers, rowsHtml) => `
    <div class="card">
      <div class="card-h">
        <div><h3>${title}</h3></div>
        ${can(entityKey) ? `<button class="btn btn-sm btn-primary" onclick="openForm('${entityKey}',null,${JSON.stringify(addFilter)})">${I("plus")}Tambah</button>` : ""}
      </div>
      <div class="card-b">
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}<th class="act">Aksi</th></tr></thead>
            <tbody>${rowsHtml || '<tr><td colspan="99" class="empty">Belum ada data pada bagian ini.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>`;

    // Sub data
    const rabs = D.rab.filter((r) => r.proj == p.id);
    const budgets = D.budget.filter((r) => r.proj == p.id);
    const biayas = D.biaya.filter((r) => r.proj == p.id);
    const keus = D.keu.filter((r) => r.proj == p.id);
    const docs = D.dok.filter((d) => d.proj == p.id);
    const invs = D.invoice.filter((i) => i.proj == p.id);

    const rabRows = rabs
        .map(
            (r) => `
      <tr>
        <td><b>${esc(r.nama)}</b></td>
        <td>${disp(["pdf", "File PDF", "pdf"], r.pdf, false, "rab", r)}</td>
        <td class="act">
          <button class="icon-btn row-act" onclick="openForm('rab',${r.id})">${I("edit")}</button>
          <button class="icon-btn row-act del" onclick="del('rab',${r.id})">${I("trash")}</button>
        </td>
      </tr>`,
        )
        .join("");

    const budgetRows = budgets
        .map(
            (b) => `
      <tr>
        <td><b>${esc(b.item)}</b></td>
        <td class="n">${rp(b.rencana)}</td>
        <td>${disp(["pdf", "Lampiran", "pdf?"], b.pdf, false, "budget", b)}</td>
        <td class="act">
          <button class="icon-btn row-act" onclick="openForm('budget',${b.id})">${I("edit")}</button>
          <button class="icon-btn row-act del" onclick="del('budget',${b.id})">${I("trash")}</button>
        </td>
      </tr>`,
        )
        .join("");

    const pengeluaranRows = [
        ...biayas.map((x) => ({ ...x, _src: "biaya" })),
        ...keus
            .filter((x) => x.tipe === "keluar")
            .map((x) => ({ ...x, _src: "keu" })),
    ]
        .sort((a, b) => String(b.tgl).localeCompare(String(a.tgl)))
        .map(
            (b) => `
      <tr>
        <td>${fmtD(b.tgl)}</td>
        <td><span class="badge ${b._src === "keu" ? "ok" : "warn"} plain">${b._src === "keu" ? "Kas Harian" : "Input Langsung"}</span></td>
        <td>${esc(b.kategori || "-")}</td>
        <td class="n neg">-${rp(b.nominal)}</td>
        <td>${esc(b.ket || "-")}</td>
        <td class="act">
          <button class="icon-btn row-act" onclick="openForm('${b._src}',${b.id})">${I("edit")}</button>
          <button class="icon-btn row-act del" onclick="del('${b._src}',${b.id})">${I("trash")}</button>
        </td>
      </tr>`,
        )
        .join("");

    const invRows = invs
        .map(
            (i) => `
      <tr>
        <td><b>${esc(i.no)}</b></td>
        <td>${fmtD(i.tgl)}</td>
        <td>${fmtD(i.jatuh)}</td>
        <td>${esc(i.uraian || "-")}</td>
        <td class="n">${rp(i.nominal)}</td>
        <td>${badge(invStatus(i))}</td>
        <td class="act">
          <button class="btn btn-sm btn-soft" onclick="printInvoice(${i.id})">${I("print")} Cetak</button>
          <button class="icon-btn row-act" onclick="openForm('invoice',${i.id})">${I("edit")}</button>
          <button class="icon-btn row-act del" onclick="del('invoice',${i.id})">${I("trash")}</button>
        </td>
      </tr>`,
        )
        .join("");

    const docCats = [
        "Kontrak",
        "Gambar dan desain",
        "Foto progres",
        "Laporan",
        "Lainnya",
    ];
    const docGridHtml = `
    <div class="card">
      <div class="card-h">
        <div><h3>Katalog Dokumentasi Proyek</h3><p>Arsip digital kontrak kerja, foto lapangan, dan laporan.</p></div>
        ${can("dok") ? `<button class="btn btn-sm btn-primary" onclick="openForm('dok',null,{proj:${p.id}})">${I("plus")}Unggah Tautan</button>` : ""}
      </div>
      <div class="card-b">
        <div class="doc-grid">
          ${docCats
              .map((cat) => {
                  const dList = docs.filter((d) => d.katalog === cat);
                  return `
              <div class="doc-col">
                <h4><span>${cat}</span><span class="badge plain">${dList.length}</span></h4>
                ${
                    dList
                        .map(
                            (d) => `
                    <div class="doc-row">
                      <a class="link" href="${esc(d.link)}" target="_blank" rel="noopener">${I("link")} ${esc(d.nama)}</a>
                      <button class="icon-btn row-act del" onclick="del('dok',${d.id})" title="Hapus">${I("trash")}</button>
                    </div>`,
                        )
                        .join("") ||
                    '<div class="muted" style="padding:6px 0;font-size:12px">Belum ada file.</div>'
                }
              </div>`;
              })
              .join("")}
        </div>
      </div>
    </div>`;

    const actions = `
    <button class="btn" onclick="go('proj')">${I("chevL")}Daftar Proyek</button>
    <button class="btn" onclick="window.print()">${I("print")}Cetak Lembar Proyek</button>
    <button class="btn btn-primary" onclick="openForm('proj',${p.id})">${I("edit")}Ubah Proyek</button>`;

    return (
        head(p.nama, `Klien: ${p.klien} · Status: ${p.status}`, actions, [
            `<button onclick="go('proj')">Proyek</button>`,
        ]) +
        `<div class="profile">
      <div class="profile-cover">${WAVES}</div>
      <div class="profile-body">
        <div class="avatar lg">${initials(p.nama)}</div>
        <div class="profile-info">
          <h2>${esc(p.nama)} ${badge(p.status)}</h2>
          <div class="profile-meta">
            <span>${I("user")} Klien: <b>${esc(p.klien)}</b></span>
            <span>${I("pin")} ${esc(p.alamat || "-")}</span>
            <span>${I("phone")} ${esc(p.kontak || "-")}</span>
            <span>${I("sales")} Sales: <b>${esc(nm("sales", p.sales))}</b></span>
            <span>${I("cal")} Mulai: <b>${fmtD(p.mulai)}</b></span>
          </div>
        </div>
        <div class="ring" style="--p:${pc};--ring-c:${pc > 100 ? "var(--bad)" : "var(--primary)"}">
          <div><b>${pc}%</b><small>Anggaran</small></div>
        </div>
      </div>
    </div>

    <div class="metrics">
      <div class="metric"><span>Nilai Kontrak</span><b>${rp(p.nilai)}</b></div>
      <div class="metric"><span>Total Alokasi RAB</span><b>${rp(rb)}</b></div>
      <div class="metric"><span>Biaya Lapangan Terpakai</span><b class="neg">${rp(sp)}</b></div>
      <div class="metric"><span>${sisa < 0 ? "Kerugian Sementara" : "Sisa Margin Kontrak"}</span><b class="${sisa < 0 ? "neg" : "pos"}">${rp(Math.abs(sisa))}</b></div>
      <div class="metric"><span>Termin Diterima di Kas</span><b class="pos">${rp(rec)}</b></div>
    </div>

    <div class="tabs">
      <button class="tab ${activeTab === "ringkasan" ? "on" : ""}" onclick="S.tab.pd='ringkasan';render()">Ringkasan Biaya</button>
      <button class="tab ${activeTab === "rab" ? "on" : ""}" onclick="S.tab.pd='rab';render()">RAB PDF <small>${rabs.length}</small></button>
      <button class="tab ${activeTab === "budget" ? "on" : ""}" onclick="S.tab.pd='budget';render()">Item Budgeting <small>${budgets.length}</small></button>
      <button class="tab ${activeTab === "pengeluaran" ? "on" : ""}" onclick="S.tab.pd='pengeluaran';render()">Pengeluaran Lapangan <small>${biayas.length + keus.filter((x) => x.tipe === "keluar").length}</small></button>
      <button class="tab ${activeTab === "invoice" ? "on" : ""}" onclick="S.tab.pd='invoice';render()">Invoice Klien <small>${invs.length}</small></button>
      <button class="tab ${activeTab === "dok" ? "on" : ""}" onclick="S.tab.pd='dok';render()">Dokumentasi <small>${docs.length}</small></button>
    </div>

    <div class="stack">
      ${
          activeTab === "ringkasan"
              ? `<div class="card">
              <div class="card-h"><div><h3>Kondisi Realisasi Anggaran</h3><p>Monitoring anggaran terpakai dibanding plafon RAB.</p></div></div>
              <div class="card-b">${budgetBar(p)}</div>
            </div>`
              : ""
      }
      ${activeTab === "rab" ? miniTable("Dokumen RAB (PDF)", "rab", { proj: p.id }, ["Judul RAB", "File PDF"], rabRows) : ""}
      ${activeTab === "budget" ? miniTable("Alokasi Anggaran (Itemized Budgeting)", "budget", { proj: p.id }, ["Item Pekerjaan", "Alokasi Rencana", "Lampiran"], budgetRows) : ""}
      ${activeTab === "pengeluaran" ? miniTable("Pengeluaran Terkait Proyek", "biaya", { proj: p.id }, ["Tanggal", "Sumber", "Kategori", "Nominal", "Keterangan"], pengeluaranRows) : ""}
      ${activeTab === "invoice" ? miniTable("Invoice & Tagihan Termin", "invoice", { proj: p.id }, ["No. Invoice", "Terbit", "Jatuh Tempo", "Uraian", "Nominal", "Status"], invRows) : ""}
      ${activeTab === "dok" ? docGridHtml : ""}
    </div>`
    );
}

/* ---------------------------------------------------------------------
   14. DETAIL KARYAWAN
   --------------------------------------------------------------------- */
function karyDetail() {
    const k = D.karyawan.find((x) => x.id == S.id);
    if (!k)
        return (
            head(
                "Karyawan Tidak Ditemukan",
                "",
                `<button class="btn" onclick="go('karyawan')">Kembali</button>`,
            ) +
            '<div class="empty">Karyawan tidak ditemukan atau telah dihapus.</div>'
        );

    const gajis = D.gaji.filter((g) => g.kar == k.id);
    const kasbons = D.kasbon.filter((b) => b.kar == k.id);
    const rugis = D.gantirugi.filter((r) => r.kar == k.id);
    const absens = D.absen.filter((a) => a.kar == k.id);

    const sisaKasbon = sum(
        kasbons.filter((x) => x.status === "Belum Lunas"),
        (x) => x.nominal,
    );
    const sisaRugi = sum(
        rugis.filter((x) => x.status === "Belum Dibayar"),
        (x) => x.nominal,
    );
    const totalGajiDibayar = sum(
        gajis,
        (x) => (+x.nominal || 0) - (+x.pot_kasbon || 0) - (+x.pot_rugi || 0),
    );
    const activeTab = S.tab.kd || "gaji";

    const gajiRows = gajis
        .slice()
        .reverse()
        .map((g) => {
            const bersih =
                (+g.nominal || 0) - (+g.pot_kasbon || 0) - (+g.pot_rugi || 0);
            return `
        <tr>
          <td><b>${fmtM(g.bulan)}</b></td>
          <td class="n">${rp(g.nominal)}</td>
          <td class="n neg">-${rp(g.pot_kasbon)}</td>
          <td class="n neg">-${rp(g.pot_rugi)}</td>
          <td class="n pos"><b>${rp(bersih)}</b></td>
          <td>${badge(g.status)}</td>
          <td>${esc(g.ket || "-")}</td>
          <td class="act">
            <button class="icon-btn row-act" onclick="openForm('gaji',${g.id})">${I("edit")}</button>
            <button class="icon-btn row-act del" onclick="del('gaji',${g.id})">${I("trash")}</button>
          </td>
        </tr>`;
        })
        .join("");

    const kasbonRows = kasbons
        .slice()
        .reverse()
        .map(
            (b) => `
      <tr>
        <td>${fmtD(b.tgl)}</td>
        <td class="n">${rp(b.nominal)}</td>
        <td>${badge(b.status)}</td>
        <td>${esc(b.ket || "-")}</td>
        <td class="act">
          <button class="icon-btn row-act" onclick="openForm('kasbon',${b.id})">${I("edit")}</button>
          <button class="icon-btn row-act del" onclick="del('kasbon',${b.id})">${I("trash")}</button>
        </td>
      </tr>`,
        )
        .join("");

    const rugiRows = rugis
        .slice()
        .reverse()
        .map(
            (r) => `
      <tr>
        <td>${fmtD(r.tgl)}</td>
        <td class="n">${rp(r.nominal)}</td>
        <td>${badge(r.status)}</td>
        <td>${esc(r.ket || "-")}</td>
        <td class="act">
          <button class="icon-btn row-act" onclick="openForm('gantirugi',${r.id})">${I("edit")}</button>
          <button class="icon-btn row-act del" onclick="del('gantirugi',${r.id})">${I("trash")}</button>
        </td>
      </tr>`,
        )
        .join("");

    const absenRows = absens
        .slice()
        .reverse()
        .map(
            (a) => `
      <tr>
        <td>${fmtD(a.tgl)}</td>
        <td>${badge(a.status)}</td>
        <td>${esc(a.ket || "-")}</td>
        <td class="act">
          <button class="icon-btn row-act" onclick="openForm('absen',${a.id})">${I("edit")}</button>
          <button class="icon-btn row-act del" onclick="del('absen',${a.id})">${I("trash")}</button>
        </td>
      </tr>`,
        )
        .join("");

    const actions = `
    <button class="btn" onclick="go('karyawan')">${I("chevL")}Daftar Karyawan</button>
    <button class="btn" onclick="window.print()">${I("print")}Cetak Profil</button>
    <button class="btn btn-primary" onclick="openForm('karyawan',${k.id})">${I("edit")}Ubah Data</button>`;

    return (
        head(
            k.nama,
            `Posisi: ${k.posisi || "Staff"} · Kontak: ${k.kontak || "-"}`,
            actions,
            [`<button onclick="go('karyawan')">Karyawan</button>`],
        ) +
        `<div class="profile">
      <div class="profile-cover">${WAVES}</div>
      <div class="profile-body">
        <div class="avatar lg">${initials(k.nama)}</div>
        <div class="profile-info">
          <h2>${esc(k.nama)}</h2>
          <div class="profile-meta">
            <span>${I("user")} Jabatan: <b>${esc(k.posisi || "Staff")}</b></span>
            <span>${I("phone")} ${esc(k.kontak || "-")}</span>
            <span>${I("keu")} Gaji Pokok Terdaftar: <b>${rp(k.gaji)}</b></span>
          </div>
        </div>
      </div>
    </div>

    <div class="metrics">
      <div class="metric"><span>Gaji Pokok Terdaftar</span><b>${rp(k.gaji)}</b></div>
      <div class="metric"><span>Sisa Kasbon Aktif</span><b class="${sisaKasbon ? "neg" : ""}">${rp(sisaKasbon)}</b></div>
      <div class="metric"><span>Sisa Ganti Rugi</span><b class="${sisaRugi ? "neg" : ""}">${rp(sisaRugi)}</b></div>
      <div class="metric"><span>Tingkat Kehadiran</span><b>${hadirPct(k)}</b></div>
      <div class="metric"><span>Total Pembayaran Gaji</span><b>${rp(totalGajiDibayar)}</b></div>
    </div>

    <div class="tabs">
      <button class="tab ${activeTab === "gaji" ? "on" : ""}" onclick="S.tab.kd='gaji';render()">Riwayat Gaji <small>${gajis.length}</small></button>
      <button class="tab ${activeTab === "kasbon" ? "on" : ""}" onclick="S.tab.kd='kasbon';render()">Kasbon <small>${kasbons.length}</small></button>
      <button class="tab ${activeTab === "gantirugi" ? "on" : ""}" onclick="S.tab.kd='gantirugi';render()">Ganti Rugi <small>${rugis.length}</small></button>
      <button class="tab ${activeTab === "absen" ? "on" : ""}" onclick="S.tab.kd='absen';render()">Kehadiran <small>${absens.length}</small></button>
    </div>

    <div class="stack">
      ${
          activeTab === "gaji"
              ? `<div class="card">
              <div class="card-h">
                <div><h3>Slip & Riwayat Pembayaran Gaji</h3></div>
                ${can("gaji") ? `<button class="btn btn-sm btn-primary" onclick="openForm('gaji',null,{kar:${k.id},nominal:${k.gaji}})">${I("plus")}Buat Slip Gaji</button>` : ""}
              </div>
              <div class="card-b">
                <div class="tbl-wrap">
                  <table class="tbl">
                    <thead><tr><th>Bulan</th><th class="n">Gaji Pokok</th><th class="n">Pot. Kasbon</th><th class="n">Pot. Rugi</th><th class="n">Gaji Bersih</th><th>Status</th><th>Keterangan</th><th class="act">Aksi</th></tr></thead>
                    <tbody>${gajiRows || '<tr><td colspan="8" class="empty">Belum ada slip gaji.</td></tr>'}</tbody>
                  </table>
                </div>
              </div>
            </div>`
              : ""
      }

      ${
          activeTab === "kasbon"
              ? `<div class="card">
              <div class="card-h">
                <div><h3>Catatan Kasbon Pinjaman</h3></div>
                ${can("kasbon") ? `<button class="btn btn-sm btn-primary" onclick="openForm('kasbon',null,{kar:${k.id}})">${I("plus")}Catat Kasbon</button>` : ""}
              </div>
              <div class="card-b">
                <div class="tbl-wrap">
                  <table class="tbl">
                    <thead><tr><th>Tanggal</th><th class="n">Nominal</th><th>Status</th><th>Keperluan</th><th class="act">Aksi</th></tr></thead>
                    <tbody>${kasbonRows || '<tr><td colspan="5" class="empty">Belum ada catatan kasbon.</td></tr>'}</tbody>
                  </table>
                </div>
              </div>
            </div>`
              : ""
      }

      ${
          activeTab === "gantirugi"
              ? `<div class="card">
              <div class="card-h">
                <div><h3>Kewajiban Ganti Rugi Kerusakan</h3></div>
                ${can("gantirugi") ? `<button class="btn btn-sm btn-primary" onclick="openForm('gantirugi',null,{kar:${k.id}})">${I("plus")}Catat Ganti Rugi</button>` : ""}
              </div>
              <div class="card-b">
                <div class="tbl-wrap">
                  <table class="tbl">
                    <thead><tr><th>Tanggal</th><th class="n">Nominal</th><th>Status</th><th>Alasan Kerusakan</th><th class="act">Aksi</th></tr></thead>
                    <tbody>${rugiRows || '<tr><td colspan="5" class="empty">Belum ada catatan ganti rugi.</td></tr>'}</tbody>
                  </table>
                </div>
              </div>
            </div>`
              : ""
      }

      ${
          activeTab === "absen"
              ? `<div class="card">
              <div class="card-h">
                <div><h3>Rekap Absensi Harian</h3></div>
                ${can("absen") ? `<button class="btn btn-sm btn-primary" onclick="openForm('absen',null,{kar:${k.id}})">${I("plus")}Catat Hadir</button>` : ""}
              </div>
              <div class="card-b">
                <div class="tbl-wrap">
                  <table class="tbl">
                    <thead><tr><th>Tanggal</th><th>Status Kehadiran</th><th>Keterangan</th><th class="act">Aksi</th></tr></thead>
                    <tbody>${absenRows || '<tr><td colspan="4" class="empty">Belum ada absensi.</td></tr>'}</tbody>
                  </table>
                </div>
              </div>
            </div>`
              : ""
      }
    </div>`
    );
}

/* ---------------------------------------------------------------------
   15. CETAK INVOICE & PELUNASAN KE KAS
   --------------------------------------------------------------------- */
window.printInvoice = (id) => {
    const inv = D.invoice.find((x) => x.id == id);
    if (!inv) return;
    const p = D.proj.find((x) => x.id == inv.proj) || {};
    const area = $("#print");
    area.innerHTML = `
    <div class="inv-doc">
      <div class="inv-top">
        <div class="inv-brand">
          <img src="img/logo.png" alt="Logo Satarya">
          <div>
            <b>SATARYA</b>
            <div style="font-size:12px;color:#6a7c90">General Contractor & Operational Services</div>
          </div>
        </div>
        <div class="inv-title">
          <h1>INVOICE</h1>
          <div style="font-size:13px;font-weight:700">No. ${esc(inv.no)}</div>
        </div>
      </div>

      <div class="inv-meta">
        <div>
          <small>Ditujukan Kepada</small>
          <div style="font-size:15px;font-weight:800;color:#0a2540">${esc(p.klien || "Klien")}</div>
          <div>Proyek: <b>${esc(p.nama || "-")}</b></div>
          <div style="color:#6a7c90;font-size:13px">${esc(p.alamat || "-")}</div>
          <div style="color:#6a7c90;font-size:13px">${esc(p.kontak || "-")}</div>
        </div>
        <div style="text-align:right">
          <small>Informasi Tagihan</small>
          <div>Tanggal Terbit: <b>${fmtD(inv.tgl)}</b></div>
          <div>Jatuh Tempo: <b style="color:#d64545">${fmtD(inv.jatuh)}</b></div>
          <div>Status: <b>${esc(inv.status || "Draft")}</b></div>
        </div>
      </div>

      <table class="inv-table">
        <thead>
          <tr>
            <th style="width:40px">No</th>
            <th>Uraian Tagihan Pekerjaan</th>
            <th style="text-align:right;width:180px">Nominal</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>
              <b>${esc(inv.uraian || "Pembayaran Termin Proyek")}</b>
              <div style="font-size:12px;color:#6a7c90">Proyek: ${esc(p.nama || "-")}</div>
            </td>
            <td style="text-align:right;font-size:15px;font-weight:700">${rp(inv.nominal)}</td>
          </tr>
        </tbody>
      </table>

      <div class="inv-total">
        <div>
          <span>Total Tagihan</span>
          <span>${rp(inv.nominal)}</span>
        </div>
      </div>

      <div class="inv-note">
        <div>
          <b>Instruksi Pembayaran:</b>
          <div>Harap transfer ke rekening resmi Satarya:</div>
          <div><b>Bank Mandiri: 123-00-9876543-1</b> a/n PT Satarya Operasional</div>
          <div>Konfirmasi pembayaran dapat dikirimkan melalui WhatsApp keuangan.</div>
        </div>
        <div class="inv-sign">
          <div>Hormat kami,</div>
          <div style="height:50px"></div>
          <b>( Bagian Keuangan )</b>
        </div>
      </div>
    </div>`;

    document.body.classList.add("printing-inv");
    window.print();
    setTimeout(() => document.body.classList.remove("printing-inv"), 1000);
};

window.payInvoice = async (id) => {
    const inv = D.invoice.find((x) => x.id == id);
    if (!inv) return;
    if (
        !(await ask(
            "Pelunasan Invoice",
            `Tandai invoice ${inv.no} (${rp(inv.nominal)}) sebagai lunas dan masukkan ke Kas Harian?`,
            "Ya, Catat Lunas",
        ))
    )
        return;

    inv.status = "Lunas";
    // Masukkan otomatis ke Kas Harian Masuk
    D.keu.push({
        id: Date.now(),
        tgl: today(),
        tipe: "masuk",
        proj: inv.proj,
        kategori: "Pembayaran Termin Proyek",
        nominal: +inv.nominal || 0,
        ket: `Pelunasan ${inv.no}: ${inv.uraian || "Termin"}`,
    });

    logAct(
        "Pelunasan Invoice",
        "invoice",
        `Pelunasan ${inv.no} ${rp(inv.nominal)} dicatat ke Kas`,
    );
    save();
    render(true);
    toast(
        `Invoice ${inv.no} lunas dan saldo kas bertambah ${rp(inv.nominal)}!`,
    );
};

/* ---------------------------------------------------------------------
   16. LAPORAN ARUS KAS & LABA-RUGI (P&L)
   --------------------------------------------------------------------- */
function lap() {
    const keyFn = {
        hari: (t) => t,
        minggu: (t) => {
            const d = new Date(t);
            d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
            return d.toISOString().slice(0, 10);
        },
        bulan: (t) => (t || "").slice(0, 7),
    }[S.per || "bulan"];

    const g = {};
    D.keu.forEach((k) => {
        if (!k.tgl) return;
        const p = keyFn(k.tgl);
        g[p] = g[p] || { m: 0, k: 0 };
        g[p][k.tipe === "masuk" ? "m" : "k"] += +k.nominal || 0;
    });

    const ks = Object.keys(g)
        .sort()
        .reverse()
        .slice(0, S.per === "hari" ? 31 : S.per === "minggu" ? 12 : 12);

    const lab = { hari: "Tanggal", minggu: "Minggu Mulai", bulan: "Bulan" }[
        S.per || "bulan"
    ];
    const tm = sum(ks, (p) => g[p].m);
    const tk = sum(ks, (p) => g[p].k);
    const selisih = tm - tk;

    const actions = `
    <div class="seg">
      ${[
          ["hari", "Harian"],
          ["minggu", "Mingguan"],
          ["bulan", "Bulanan"],
      ]
          .map(
              ([v, l]) =>
                  `<button class="${(S.per || "bulan") === v ? "on" : ""}" onclick="S.per='${v}';render()">${l}</button>`,
          )
          .join("")}
    </div>
    <button class="btn" onclick="csv('keu')">${I("download")}Export CSV</button>
    <button class="btn btn-primary" onclick="window.print()">${I("print")}Cetak Laporan</button>`;

    return (
        head("Laporan Arus Kas", pageDesc("lap"), actions) +
        `<div class="metrics">
      <div class="metric"><span>Pemasukan Periode Ini</span><b class="pos">${rp(tm)}</b></div>
      <div class="metric"><span>Pengeluaran Periode Ini</span><b class="neg">${rp(tk)}</b></div>
      <div class="metric"><span>Surplus / Defisit</span><b class="${selisih < 0 ? "neg" : "pos"}">${rp(selisih)}</b></div>
      <div class="metric"><span>Saldo Kas Kumulatif</span><b class="${kas() < 0 ? "neg" : "pos"}">${rp(kas())}</b></div>
    </div>

    <div class="card">
      <div class="card-h">
        <div><h3>Grafik Arus Kas (${lab})</h3><p>Perbandingan volume uang masuk dan uang keluar.</p></div>
      </div>
      <div class="card-b"><div class="chart-box"><canvas id="c4"></canvas></div></div>
    </div>

    <div class="card" style="margin-top:20px">
      <div class="card-h"><div><h3>Rincian Angka per ${lab}</h3></div></div>
      <div class="card-b">
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr><th>${lab}</th><th class="n">Uang Masuk</th><th class="n">Uang Keluar</th><th class="n">Selisih</th></tr></thead>
            <tbody>
              ${
                  ks
                      .map((p) => {
                          const s = g[p].m - g[p].k;
                          return `
                    <tr>
                      <td><b>${p}</b></td>
                      <td class="n pos">+${rp(g[p].m)}</td>
                      <td class="n neg">-${rp(g[p].k)}</td>
                      <td class="n ${s < 0 ? "neg" : "pos"}"><b>${rp(s)}</b></td>
                    </tr>`;
                      })
                      .join("") ||
                  '<tr><td colspan="4" class="empty">Belum ada transaksi di Kas Harian.</td></tr>'
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>`
    );
}

function plPage() {
    const curMonth = S.plMonth || today().slice(0, 7);
    const isMonth = S.plPer !== "all";

    const filterFn = (x) =>
        isMonth ? String(x.tgl || "").startsWith(curMonth) : true;

    const keuFiltered = D.keu.filter(filterFn);

    // Pendapatan
    const revTermin = sum(
        keuFiltered.filter(
            (k) =>
                k.tipe === "masuk" && k.kategori === "Pembayaran Termin Proyek",
        ),
        (k) => k.nominal,
    );
    const revOther = sum(
        keuFiltered.filter(
            (k) =>
                k.tipe === "masuk" && k.kategori !== "Pembayaran Termin Proyek",
        ),
        (k) => k.nominal,
    );
    const totalRev = revTermin + revOther;

    // Beban Pokok & Operasional
    const expCategories = [
        "Borongan Tukang",
        "Pembelian Material",
        "Pembelian / Sewa Alat",
        "Gaji & Upah",
        "Kasbon Karyawan",
        "Operasional Kantor",
        "Lain-lain",
    ];
    const catSums = {};
    expCategories.forEach((cat) => {
        catSums[cat] = sum(
            keuFiltered.filter(
                (k) => k.tipe === "keluar" && k.kategori === cat,
            ),
            (k) => k.nominal,
        );
    });
    const totalExp = sum(Object.values(catSums), (v) => v);
    const netIncome = totalRev - totalExp;
    const netMargin = totalRev
        ? ((netIncome / totalRev) * 100).toFixed(1)
        : "0";

    // Performa per proyek
    const projPl = D.proj
        .map((p) => {
            const pIn = sum(
                D.keu.filter((k) => k.proj == p.id && k.tipe === "masuk"),
                (k) => k.nominal,
            );
            const pOut = spent(p);
            const pNet = pIn - pOut;
            return { p, in: pIn, out: pOut, net: pNet };
        })
        .filter((x) => x.in > 0 || x.out > 0);

    const actions = `
    <div class="seg">
      <button class="${isMonth ? "on" : ""}" onclick="S.plPer='month';render()">Bulanan</button>
      <button class="${!isMonth ? "on" : ""}" onclick="S.plPer='all';render()">Semua Waktu</button>
    </div>
    ${
        isMonth
            ? `<input type="month" value="${curMonth}" onchange="S.plMonth=this.value;render()" style="height:40px;padding:0 12px;border-radius:var(--r-sm);border:1.5px solid var(--line-2);background:var(--surface)">`
            : ""
    }
    <button class="btn btn-primary" onclick="window.print()">${I("print")}Cetak Laba-Rugi</button>`;

    return (
        head("Laporan Laba-Rugi (P&L)", pageDesc("pl"), actions) +
        `<div class="metrics">
      <div class="metric"><span>Total Pendapatan</span><b class="pos">${rp(totalRev)}</b></div>
      <div class="metric"><span>Total Beban Operasional</span><b class="neg">${rp(totalExp)}</b></div>
      <div class="metric"><span>Laba Bersih Operasional</span><b class="${netIncome < 0 ? "neg" : "pos"}">${rp(netIncome)}</b></div>
      <div class="metric"><span>Margin Bersih</span><b class="${netIncome < 0 ? "neg" : "pos"}">${netMargin}%</b></div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-h"><div><h3>Laporan Laba-Rugi ${isMonth ? "— " + fmtM(curMonth) : "(Akumulatif)"}</h3></div></div>
        <div class="card-b">
          <table class="pl">
            <tbody>
              <tr class="sec"><td colspan="2">1. Pendapatan Operasional</td></tr>
              <tr class="ind"><td>Pembayaran Termin Proyek</td><td class="pos">${rp(revTermin)}</td></tr>
              <tr class="ind"><td>Pemasukan Operasional Lainnya</td><td class="pos">${rp(revOther)}</td></tr>
              <tr class="tot"><td>Total Pendapatan</td><td class="pos"><b>${rp(totalRev)}</b></td></tr>

              <tr class="sec"><td colspan="2">2. Beban Pokok & Operasional</td></tr>
              ${expCategories.map((cat) => `<tr class="ind"><td>${cat}</td><td class="neg">(${rp(catSums[cat])})</td></tr>`).join("")}
              <tr class="tot"><td>Total Beban Pengeluaran</td><td class="neg"><b>(${rp(totalExp)})</b></td></tr>

              <tr class="grand">
                <td>Laba Bersih Operasional</td>
                <td class="${netIncome < 0 ? "neg" : "pos"}">${rp(netIncome)} (${netMargin}%)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-h">
          <div><h3>Profitabilitas per Proyek</h3><p>Arus kas masuk vs total biaya dikeluarkan tiap proyek.</p></div>
        </div>
        <div class="card-b">
          <div class="tbl-wrap">
            <table class="tbl">
              <thead><tr><th>Proyek</th><th class="n">Termin Masuk</th><th class="n">Biaya Keluar</th><th class="n">Laba Bersih</th></tr></thead>
              <tbody>
                ${
                    projPl
                        .map(
                            (row) => `
                    <tr>
                      <td><button class="link" onclick="go('pd',${row.p.id})">${esc(row.p.nama)}</button></td>
                      <td class="n pos">${rp(row.in)}</td>
                      <td class="n neg">${rp(row.out)}</td>
                      <td class="n ${row.net < 0 ? "neg" : "pos"}"><b>${rp(row.net)}</b></td>
                    </tr>`,
                        )
                        .join("") ||
                    '<tr><td colspan="4" class="empty">Belum ada transaksi proyek.</td></tr>'
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`
    );
}

/* ---------------------------------------------------------------------
   17. PENGATURAN, CADANGAN & AUDIT LOG
   --------------------------------------------------------------------- */
function settings() {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";

    return (
        head("Pengaturan & Data", pageDesc("set")) +
        `<div class="card">
      <div class="card-h"><div><h3>Tampilan & Antarmuka</h3><p>Sesuaikan kenyamanan visual sesuai kondisi pencahayaan Anda.</p></div></div>
      <div class="card-b">
        <div class="set-row">
          <div><b>Mode Gelap (Dark Mode)</b><p>Gunakan tema gelap kontras tinggi untuk kenyamanan mata di malam hari.</p></div>
          <button class="btn" onclick="toggleTheme()">${I(dark ? "sun" : "moon")}${dark ? "Ubah ke Terang" : "Ubah ke Gelap"}</button>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:20px">
      <div class="card-h"><div><h3>Cadangan Data (Backup & Restore)</h3><p>Data tersimpan di penyimpanan lokal browser pada perangkat ini. Lakukan ekspor JSON secara rutin.</p></div></div>
      <div class="card-b">
        <div class="set-row">
          <div><b>Ekspor Cadangan Lengkap</b><p>Unduh seluruh data proyek, keuangan, inventaris, dan karyawan dalam format JSON terenkripsi bersih.</p></div>
          <button class="btn btn-primary" onclick="exp()">${I("download")}Unduh Backup (JSON)</button>
        </div>
        <div class="set-row">
          <div><b>Pulihkan Data (Restore)</b><p>Unggah berkas backup JSON yang pernah diekspor sebelumnya untuk mengembalikan catatan.</p></div>
          <label class="btn file-btn">
            ${I("upload")}Pilih File Backup
            <input type="file" accept=".json" onchange="imp(this.files[0])">
          </label>
        </div>
        <div class="set-row">
          <div><b style="color:var(--bad)">Reset & Kosongkan Data</b><p>Hapus seluruh basis data lokal. Tindakan ini tidak dapat dibatalkan.</p></div>
          <button class="btn btn-danger" onclick="resetAll()">${I("trash")}Hapus Semua Data</button>
        </div>
      </div>
    </div>`
    );
}

function logPage() {
    const logs = (D.log || []).filter(
        (l) => l.k !== "auth" && l.a !== "Masuk" && l.a !== "Keluar",
    );

    return (
        head(
            "Log Aktivitas & Jejak Audit",
            pageDesc("log"),
            `<button class="btn" onclick="D.log=[];save();render()">${I("trash")}Bersihkan Log</button>`,
        ) +
        `<div class="card">
      <div class="card-h"><div><h3>Catatan Perubahan Data (${logs.length} entri)</h3><p>Setiap penambahan, pengubahan, dan penghapusan data otomatis tercatat di sini.</p></div></div>
      <div class="card-b">
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr><th>Waktu</th><th>Pelaksana</th><th>Tindakan</th><th>Modul</th><th>Keterangan</th></tr></thead>
            <tbody>
              ${
                  logs
                      .map(
                          (l) => `
                  <tr>
                    <td>${fmtD(l.t)} <small class="muted">${new Date(l.t).toLocaleTimeString("id-ID")}</small></td>
                    <td><b>${esc(l.u || "Administrator")}</b></td>
                    <td><span class="badge ${l.a === "Hapus" ? "bad" : l.a === "Tambah" ? "ok" : "info"} plain">${esc(l.a)}</span></td>
                    <td>${esc(E[l.k]?.s || l.k)}</td>
                    <td>${esc(l.l)}</td>
                  </tr>`,
                      )
                      .join("") ||
                  '<tr><td colspan="5" class="empty">Belum ada riwayat aktivitas.</td></tr>'
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>`
    );
}

/* ---------------------------------------------------------------------
   18. DIALOG FORM (SHEET) & ACTIONS
   --------------------------------------------------------------------- */
function fld(f, v, pre) {
    const [k, l, t] = f;
    const val = v != null ? v : pre && pre[k] != null ? pre[k] : "";
    let i;
    const isFull =
        k === "ket" ||
        k === "alamat" ||
        k === "link" ||
        k === "item" ||
        k === "uraian" ||
        t === "txt";

    if (Array.isArray(t)) {
        i = `<select name="${k}">${t.map((o) => `<option ${o == val ? "selected" : ""}>${o}</option>`).join("")}</select>`;
    } else if (typeof t === "string" && t.startsWith("ref:")) {
        const opt = t.endsWith("?");
        const r = t.slice(4).replace("?", "");
        const emptyMsg = `Belum ada ${E[r].s.toLowerCase()}`;
        i = `
      <div class="ref">
        <select name="${k}" id="sel_${k}" ${opt ? "" : "required"}>
          ${opt ? '<option value="">-- Tidak ada (Opsional) --</option>' : D[r].length ? `<option value="">-- Pilih ${E[r].s} --</option>` : `<option value="">${emptyMsg}</option>`}
          ${D[r].map((x) => `<option value="${x.id}" ${x.id == val ? "selected" : ""}>${esc(x.nama || x.no || x.item)}</option>`).join("")}
        </select>
        <button type="button" class="btn btn-sm" onclick="quickAddRef('${r}','sel_${k}')" title="Tambah ${esc(E[r].s)} baru secara langsung">+ ${esc(E[r].s)}</button>
      </div>`;
    } else if (t === "pdf" || t === "pdf?") {
        const isOpt = t === "pdf?";
        const hasExisting = Boolean(val);
        const existingName = (pre && pre.pdf_name) || "Dokumen tersimpan.pdf";
        i = `
      <input type="file" name="${k}_file" accept=".pdf,application/pdf" ${!isOpt && !hasExisting ? "required" : ""}>
      ${hasExisting ? `<div class="hint">✓ ${esc(existingName)} (Pilih file baru jika ingin mengganti)</div>` : ""}
      <input type="hidden" name="${k}" value="${esc(val)}">
      <input type="hidden" name="${k}_name" value="${esc((pre && pre.pdf_name) || "")}">
    `;
    } else if (t === "txt") {
        i = `<textarea name="${k}" placeholder="Tuliskan ${l.toLowerCase()}...">${esc(val)}</textarea>`;
    } else if (t === "n" || t === "q") {
        i = `<input type="number" step="any" min="0" name="${k}" value="${esc(val)}" placeholder="${t === "n" ? "mis. 50000000" : "1"}" required>`;
    } else if (t === "d") {
        i = `<input type="date" name="${k}" value="${esc(val || today())}" required>`;
    } else if (t === "m") {
        i = `<input type="month" name="${k}" value="${esc(val || today().slice(0, 7))}" required>`;
    } else {
        // Default invoice number auto-generator
        const defVal = k === "no" && !val ? nextInvNo() : val;
        const ph = k === "pic" ? "mis. Budi Santoso (Narahubung / Sales Vendor)" : `Masukkan ${l.toLowerCase()}...`;
        i = `<input name="${k}" value="${esc(defVal)}" placeholder="${ph}" ${k === "ket" || k === "kontak" || k === "link" || k === "alamat" || k === "pic" ? "" : "required"}>`;
    }

    return `<label class="${isFull ? "full" : ""}"><span>${l}</span>${i}</label>`;
}

window.openForm = (k, id, pre) => {
    const e = E[k];
    if (!e) return;
    const r = id ? (D[k] || []).find((x) => x.id == id) : null;
    const d = $("#dlg");
    if (!d) return;
    const ctx = r || pre || {};

    d.onclick = (ev) => {
        if (ev.target === d) d.close();
    };

    d.innerHTML = `
    <div class="sheet-h">
      <span class="mega-ico">${I(k)}</span>
      <div>
        <h3>${r ? "Ubah" : "Tambah"} ${esc(e.s)}</h3>
        <p>${r ? "Perbarui informasi yang tersimpan di sistem." : "Lengkapi kolom berikut untuk menyimpan data baru."}</p>
      </div>
      <button type="button" class="icon-btn" onclick="dlg.close()" aria-label="Tutup">${I("x")}</button>
    </div>
    <form method="dialog" id="fm">
      <div class="fgrid">
        ${e.f.map((f) => fld(f, r ? r[f[0]] : null, ctx)).join("")}
      </div>
      <div class="sheet-f">
        <button type="button" class="btn" onclick="dlg.close()">Batal</button>
        <button class="btn btn-primary" type="submit">${I("check")}Simpan Data</button>
      </div>
    </form>`;

    d.showModal();

    const formEl = d.querySelector("#fm") || $("#fm");
    if (!formEl) return;

    if (k === "gaji") {
        const selKar = formEl.querySelector('[name="kar"]');
        const inpNominal = formEl.querySelector('[name="nominal"]');
        const inpPotKasbon = formEl.querySelector('[name="pot_kasbon"]');
        const inpPotRugi = formEl.querySelector('[name="pot_rugi"]');
        const fgrid = formEl.querySelector(".fgrid");

        let calcBox = formEl.querySelector("#gaji_calc_box");
        if (!calcBox && fgrid) {
            calcBox = document.createElement("div");
            calcBox.id = "gaji_calc_box";
            calcBox.style.cssText =
                "grid-column:1/-1;background:var(--surface-2,#f8fafc);border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:12px 14px;font-size:12.5px;display:flex;flex-direction:column;gap:8px;";
            fgrid.appendChild(calcBox);
        }

        const updateGajiCalc = (isKarChange = false) => {
            const karId = selKar ? selKar.value : "";
            const emp = karId ? (D.karyawan || []).find((x) => x.id == karId) : null;

            if (isKarChange && emp) {
                const unpKasbon = (D.kasbon || []).filter(
                    (x) => x.kar == karId && x.status !== "Lunas",
                );
                const totalKasbon = unpKasbon.reduce(
                    (s, x) => s + (+x.nominal || 0),
                    0,
                );

                const unpRugi = (D.gantirugi || []).filter(
                    (x) =>
                        x.kar == karId &&
                        x.status !== "Lunas" &&
                        x.status !== "Sudah Dibayar",
                );
                const totalRugi = unpRugi.reduce(
                    (s, x) => s + (+x.nominal || 0),
                    0,
                );

                if (inpPotKasbon) inpPotKasbon.value = totalKasbon;
                if (inpPotRugi) inpPotRugi.value = totalRugi;
                if (inpNominal && (!r || !inpNominal.value || +inpNominal.value === 0)) {
                    inpNominal.value = emp.gaji || 0;
                }
            }

            const nominalVal = inpNominal ? +inpNominal.value || 0 : 0;
            const potKasbonVal = inpPotKasbon ? +inpPotKasbon.value || 0 : 0;
            const potRugiVal = inpPotRugi ? +inpPotRugi.value || 0 : 0;
            const thp = Math.max(0, nominalVal - potKasbonVal - potRugiVal);

            const unpKasbonList = karId
                ? (D.kasbon || []).filter((x) => x.kar == karId && x.status !== "Lunas")
                : [];
            const unpRugiList = karId
                ? (D.gantirugi || []).filter(
                      (x) =>
                          x.kar == karId &&
                          x.status !== "Lunas" &&
                          x.status !== "Sudah Dibayar",
                  )
                : [];

            if (calcBox) {
                if (!karId) {
                    calcBox.innerHTML = `<span class="muted" style="color:var(--text-3,#64748b);">💡 <b>Petunjuk:</b> Pilih nama karyawan di atas. Sistem akan otomatis mengisi gaji pokok serta menghitung total potongan kasbon dan ganti rugi aktif yang belum lunas.</span>`;
                } else {
                    calcBox.innerHTML = `
                        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border,#e2e8f0);padding-bottom:6px;">
                            <span style="font-weight:700;">📊 Rincian Penggajian: <b>${esc(emp ? emp.nama : "Karyawan")}</b></span>
                            <span class="badge ${thp > 0 ? "ok" : "warn"}" style="font-size:12px;font-weight:700;">Take Home Pay: ${rp(thp)}</span>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;font-size:12px;">
                            <div>• Kasbon Tercatat: <b class="${unpKasbonList.length ? "neg" : ""}">${rp(unpKasbonList.reduce((s, x) => s + (+x.nominal || 0), 0))}</b> <span class="muted">(${unpKasbonList.length} tagihan)</span></div>
                            <div>• Ganti Rugi Tercatat: <b class="${unpRugiList.length ? "neg" : ""}">${rp(unpRugiList.reduce((s, x) => s + (+x.nominal || 0), 0))}</b> <span class="muted">(${unpRugiList.length} tagihan)</span></div>
                            <div>• Gaji Bersih (THP): <b class="pos" style="font-size:13px">${rp(thp)}</b></div>
                        </div>
                        ${
                            unpKasbonList.length || unpRugiList.length
                                ? `<div style="font-size:11.5px;color:var(--text-3,#64748b);line-height:1.4;">💡 Potongan kasbon dan ganti rugi otomatis terisi dari kewajiban aktif karyawan. Saat status disimpan sebagai <b>Lunas</b>, catatan kasbon & ganti rugi tersebut otomatis ditandai lunas.</div>`
                                : `<div style="font-size:11.5px;color:var(--text-3,#64748b);">✓ Karyawan tidak memiliki catatan kasbon atau ganti rugi aktif.</div>`
                        }
                    `;
                }
            }
        };

        if (selKar) selKar.addEventListener("change", () => updateGajiCalc(true));
        if (inpNominal) inpNominal.addEventListener("input", () => updateGajiCalc(false));
        if (inpPotKasbon) inpPotKasbon.addEventListener("input", () => updateGajiCalc(false));
        if (inpPotRugi) inpPotRugi.addEventListener("input", () => updateGajiCalc(false));

        if (!r && selKar && selKar.value) {
            updateGajiCalc(true);
        } else {
            updateGajiCalc(false);
        }
    }

    formEl.onsubmit = async (ev) => {
        ev.preventDefault();
        const o = r || { id: Date.now() };
        const fd = new FormData(ev.target);

        // Baca input file PDF sebagai base64
        const pdfFields = e.f.filter((f) => f[2] === "pdf" || f[2] === "pdf?");
        for (const [fn] of pdfFields) {
            const fileInput = formEl.querySelector(`input[name="${fn}_file"]`);
            const file = fileInput && fileInput.files && fileInput.files[0];
            if (file) {
                if (
                    file.type &&
                    file.type !== "application/pdf" &&
                    !file.name.toLowerCase().endsWith(".pdf")
                ) {
                    alert("Harap pilih file PDF.");
                    return;
                }
                const b64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                o[fn] = b64;
                o[fn + "_name"] = file.name;
            } else if (!r && !o[fn]) {
                o[fn] = fd.get(fn) || "";
                o[fn + "_name"] = fd.get(fn + "_name") || "";
            }
        }

        fd.forEach((v, n) => {
            if (
                !n.endsWith("_file") &&
                !n.endsWith("_name") &&
                !pdfFields.some((pf) => pf[0] === n)
            ) {
                o[n] = v;
            }
        });

        e.f.forEach(([n, , t]) => {
            if (t === "n" || t === "q") o[n] = +o[n] || 0;
        });

        if (!r) D[k].push(o);

        // Pelunasan otomatis kasbon & ganti rugi jika status gaji Lunas
        if (k === "gaji" && o.status === "Lunas" && o.kar) {
            let pelunasanInfo = [];
            if (o.pot_kasbon > 0) {
                let cntKb = 0;
                (D.kasbon || []).forEach((kb) => {
                    if (kb.kar == o.kar && kb.status !== "Lunas") {
                        kb.status = "Lunas";
                        const note = `[Lunas potong gaji ${o.bulan || ""}]`;
                        if (!String(kb.ket || "").includes(note)) {
                            kb.ket = (kb.ket ? kb.ket + " " : "") + note;
                        }
                        cntKb++;
                    }
                });
                if (cntKb) pelunasanInfo.push(`${cntKb} kasbon`);
            }
            if (o.pot_rugi > 0) {
                let cntGr = 0;
                (D.gantirugi || []).forEach((gr) => {
                    if (
                        gr.kar == o.kar &&
                        gr.status !== "Lunas" &&
                        gr.status !== "Sudah Dibayar"
                    ) {
                        gr.status = "Lunas";
                        const note = `[Lunas potong gaji ${o.bulan || ""}]`;
                        if (!String(gr.ket || "").includes(note)) {
                            gr.ket = (gr.ket ? gr.ket + " " : "") + note;
                        }
                        cntGr++;
                    }
                });
                if (cntGr) pelunasanInfo.push(`${cntGr} ganti rugi`);
            }
            if (pelunasanInfo.length) {
                toast(`Otomatis melunasi ${pelunasanInfo.join(" & ")} karyawan`);
            }
        }

        logAct(r ? "Ubah" : "Tambah", k, `${e.s}: ${recLabel(k, o)}`);
        save();
        d.close();
        render(true);
        toast(r ? "Perubahan disimpan" : `${e.s} berhasil ditambahkan`);
    };
};

window.quickAddRef = (targetKey, selectElementId) => {
    const e = E[targetKey];
    if (!e) return;
    const name = prompt(`Masukkan nama ${e.s.toLowerCase()} baru:`);
    if (!name || !name.trim()) return;

    const newItem = { id: Date.now(), nama: name.trim() };
    if (targetKey === "alat") {
        newItem.kode = "Alat Standar";
        newItem.kondisi = "Baik";
        newItem.jumlah = 1;
        newItem.harga = 0;
        newItem.ket = "Gudang Utama";
    } else if (targetKey === "supply" || targetKey === "inv") {
        newItem.kategori = "Material / Bahan";
        newItem.satuan = "Unit";
        newItem.stok = 0;
        newItem.minStok = 5;
        newItem.harga = 0;
    } else if (targetKey === "proj") {
        newItem.klien = "-";
        newItem.alamat = "-";
        newItem.kontak = "-";
        newItem.nilai = 0;
        newItem.mulai = today();
        newItem.status = "Berjalan";
    } else if (targetKey === "karyawan") {
        newItem.posisi = "Staff";
        newItem.kontak = "-";
        newItem.gaji = 0;
    } else if (targetKey === "sales") {
        newItem.divisi = "Sales";
        newItem.kontak = "-";
        newItem.target = 0;
    }

    D[targetKey].push(newItem);
    logAct("Tambah Cepat", targetKey, `${e.s}: ${newItem.nama}`);
    save();

    const sel = document.getElementById(selectElementId);
    if (sel) {
        const wasEmpty = sel.options.length <= 1;
        sel.innerHTML =
            (wasEmpty ? "" : `<option value="">-- Pilih ${e.s} --</option>`) +
            D[targetKey]
                .map(
                    (x) =>
                        `<option value="${x.id}" ${x.id == newItem.id ? "selected" : ""}>${esc(x.nama)}</option>`,
                )
                .join("");
        sel.value = newItem.id;
        sel.dispatchEvent(new Event("change"));
    }
    toast(`${e.s} "${newItem.nama}" ditambahkan!`);
};

window.del = async (k, id) => {
    const r = (D[k] || []).find((x) => x.id == id);
    const label = recLabel(k, r);
    if (
        !(await ask(
            `Hapus ${E[k]?.s || "data"}?`,
            `Data "${label}" akan dihapus permanen.`,
            "Ya, Hapus Data",
        ))
    )
        return;

    D[k] = D[k].filter((x) => x.id != id);
    logAct("Hapus", k, `${E[k]?.s || k}: ${label}`);
    save();
    render(true);
    toast("Data dihapus");
};

window.csv = (k) => {
    const e = E[k];
    if (!e) return;
    const qStr = (s) => '"' + String(s ?? "").replace(/"/g, '""') + '"';
    const rows = [e.f.map((f) => qStr(f[1])).join(",")].concat(
        D[k].map((r) =>
            e.f.map((f) => qStr(disp(f, r[f[0]], true, k, r))).join(","),
        ),
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
        new Blob(["\ufeff" + rows.join("\n")], {
            type: "text/csv;charset=utf-8;",
        }),
    );
    a.download = `satarya-${k}-${today()}.csv`;
    a.click();
};

window.exp = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
        new Blob([JSON.stringify(D, null, 2)], { type: "application/json" }),
    );
    a.download = `satarya-backup-${today()}.json`;
    a.click();
    logAct("Ekspor", "backup", "Ekspor cadangan data JSON");
};

window.imp = async (f) => {
    if (!f) return;
    const text = await f.text();
    try {
        const x = JSON.parse(text);
        if (
            !(await ask(
                "Pulihkan Cadangan?",
                "Import ini akan menimpa seluruh data yang ada saat ini. Pastikan file valid.",
                "Ya, Timpa Data",
            ))
        )
            return;
        D = x;
        normalize();
        logAct("Impor", "backup", `Impor file: ${f.name}`);
        save();
        render();
        toast("Data berhasil dipulihkan!");
    } catch (err) {
        toast("File backup tidak valid: " + err.message, "bad");
    }
};

window.resetAll = async () => {
    if (
        !(await ask(
            "HAPUS SEMUA DATA?",
            "Semua rekaman proyek, kas, dan inventaris akan dikosongkan. Pastikan sudah mengunduh backup.",
            "Hapus Permanen",
        ))
    )
        return;
    localStorage.removeItem(KEY);
    location.reload();
};

/* ---------------------------------------------------------------------
   19. COMMAND PALETTE (CTRL + K)
   --------------------------------------------------------------------- */
window.openCmdk = (mode) => {
    const box = $("#cmdk");
    box.classList.add("open");
    box.setAttribute("aria-hidden", "false");

    const listItems = [];

    // Aksi Cepat Tambah
    Object.keys(E).forEach((k) => {
        if (can(k)) {
            listItems.push({
                cat: "Aksi Cepat",
                title: `Tambah ${E[k].s}`,
                sub: `Buka formulir input ${E[k].t.toLowerCase()}`,
                ico: k,
                act: () => {
                    closeCmdk();
                    openForm(k);
                },
            });
        }
    });

    // Halaman Navigasi
    NAV.forEach((g) => {
        if (g.page && can(g.page)) {
            listItems.push({
                cat: "Navigasi",
                title: g.label,
                sub: `Buka halaman ${g.label}`,
                ico: g.ico,
                act: () => {
                    closeCmdk();
                    go(g.page);
                },
            });
        }
        (g.items || []).forEach(([k, l, d]) => {
            if (can(k)) {
                listItems.push({
                    cat: `Navigasi: ${g.label}`,
                    title: l,
                    sub: d,
                    ico: k,
                    act: () => {
                        closeCmdk();
                        go(k);
                    },
                });
            }
        });
    });

    // Pintasan Khusus
    listItems.push({
        cat: "Tampilan",
        title: "Ganti Tema (Dark / Light)",
        sub: "Beralih antara tema gelap dan terang",
        ico: "moon",
        act: () => {
            closeCmdk();
            toggleTheme();
        },
    });
    listItems.push({
        cat: "Tampilan",
        title: "Halaman Login (Pratinjau Tampilan)",
        sub: "Buka desain antarmuka halaman login",
        ico: "lock",
        act: () => {
            closeCmdk();
            showLogin();
        },
    });

    const renderItems = (filter) => {
        const q = (filter || "").toLowerCase().trim();
        const matched = listItems.filter(
            (i) =>
                !q ||
                i.title.toLowerCase().includes(q) ||
                i.sub.toLowerCase().includes(q) ||
                i.cat.toLowerCase().includes(q),
        );

        const grouped = {};
        matched.forEach((i) => {
            grouped[i.cat] = grouped[i.cat] || [];
            grouped[i.cat].push(i);
        });

        const bodyHtml = Object.keys(grouped)
            .map(
                (cat) => `
        <div class="cmdk-g">${cat}</div>
        ${grouped[cat]
            .map(
                (it, idx) => `
          <button class="cmdk-item" data-idx="${idx}" onclick="cmdkRun(${listItems.indexOf(it)})">
            <span class="mega-ico">${I(it.ico)}</span>
            <div><b>${esc(it.title)}</b><small>${esc(it.sub)}</small></div>
            <span class="go">Jalankan ↵</span>
          </button>`,
            )
            .join("")}`,
            )
            .join("");

        return (
            bodyHtml ||
            '<div class="empty">Tidak ada perintah atau modul yang cocok.</div>'
        );
    };

    window._cmdkItems = listItems;

    box.innerHTML = `
    <div class="cmdk-box" onclick="event.stopPropagation()">
      <div class="cmdk-in">
        ${I("search")}
        <input type="text" placeholder="${mode === "create" ? "Pilih data yang ingin ditambahkan..." : "Ketik untuk mencari modul, perintah, atau tindakan..."}" id="cmdkInput" autofocus>
        <button type="button" class="icon-btn cmdk-close" onclick="closeCmdk()" aria-label="Tutup pencarian" title="Tutup">${I("x")}</button>
      </div>
      <div class="cmdk-list" id="cmdkList">${renderItems(mode === "create" ? "Tambah" : "")}</div>
      <div class="cmdk-foot">
        <span>Gunakan <b>↑ / ↓</b> untuk navigasi</span>
        <span><b>↵</b> untuk memilih</span>
        <span><b>Esc</b> untuk batal</span>
      </div>
    </div>`;

    box.onclick = closeCmdk;
    const input = $("#cmdkInput");
    input.focus();
    input.oninput = (e) => {
        $("#cmdkList").innerHTML = renderItems(e.target.value);
    };
};

window.closeCmdk = () => {
    const box = $("#cmdk");
    box.classList.remove("open");
    box.setAttribute("aria-hidden", "true");
};
window.cmdkRun = (idx) => {
    const it = window._cmdkItems[idx];
    if (it && it.act) it.act();
};

document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if ($("#cmdk").classList.contains("open")) closeCmdk();
        else openCmdk();
    }
    if (e.key === "Escape") {
        if ($("#cmdk").classList.contains("open")) closeCmdk();
        if ($("#drawer").classList.contains("open")) closeDrawer();
    }
});

/* ---------------------------------------------------------------------
   20. VISUALISASI GRAFIK (CHART.JS)
   --------------------------------------------------------------------- */
const getThemeColors = () => {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    return {
        primary: dark ? "#4ADE80" : "#2E7D1B",
        accent: dark ? "#FFE81F" : "#FFE81F",
        text: dark ? "#C5D8BF" : "#344830",
        grid: dark ? "rgba(255,255,255,0.06)" : "#DFEAD8",
        warn: "#FFE81F",
        bad: "#D64545",
    };
};

function charting() {
    if (typeof Chart === "undefined") return;

    const C = getThemeColors();
    Chart.defaults.font.family = "'Manrope', system-ui, sans-serif";
    Chart.defaults.color = C.text;
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;

    const axOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { grid: { display: false } },
            y: {
                grid: { color: C.grid },
                ticks: {
                    callback: (v) => rpS(v),
                },
            },
        },
        plugins: {
            legend: {
                position: "bottom",
                labels: { boxWidth: 12, padding: 12 },
            },
            tooltip: {
                callbacks: {
                    label: (ctx) =>
                        `${ctx.dataset.label || ""}: ${rp(ctx.raw)}`,
                },
            },
        },
    };

    // 1. Dashboard: Cashflow 6 Bulan
    if (S.page === "dash") {
        const el1 = document.getElementById("c1");
        if (el1) {
            const ms = [...Array(6)].map((_, i) => {
                const d = new Date();
                d.setDate(1);
                d.setMonth(d.getMonth() - 5 + i);
                return d.toISOString().slice(0, 7);
            });
            charts.push(
                new Chart(el1, {
                    type: "bar",
                    data: {
                        labels: ms.map(fmtM),
                        datasets: [
                            {
                                label: "Pemasukan (Kas Masuk)",
                                data: ms.map((m) => mSum(m, "masuk")),
                                backgroundColor: "#2E7D1B",
                                borderRadius: 6,
                            },
                            {
                                label: "Pengeluaran (Kas Keluar)",
                                data: ms.map((m) => mSum(m, "keluar")),
                                backgroundColor: "#FFE81F",
                                borderRadius: 6,
                            },
                        ],
                    },
                    options: axOptions,
                }),
            );
        }

        // 2. Dashboard: Status Proyek
        const el2 = document.getElementById("c2");
        if (el2) {
            const stCount = {
                Prospek: 0,
                Berjalan: 0,
                Tertunda: 0,
                Selesai: 0,
            };
            D.proj.forEach((p) => {
                const s = p.status || "Berjalan";
                stCount[s] = (stCount[s] || 0) + 1;
            });
            charts.push(
                new Chart(el2, {
                    type: "doughnut",
                    data: {
                        labels: Object.keys(stCount),
                        datasets: [
                            {
                                data: Object.values(stCount),
                                backgroundColor: [
                                    "#1B4310",
                                    "#2E7D1B",
                                    "#FFE81F",
                                    "#54A836",
                                ],
                                borderWidth: 0,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: "bottom",
                                labels: { boxWidth: 10, padding: 8 },
                            },
                        },
                    },
                }),
            );
        }
    }

    // 3. Stok vs Minimum
    if (S.page === "supply" || S.page === "inv") {
        const el3 = document.getElementById("c3");
        if (el3) {
            const list = (S.page === "supply" ? D.supply : D.inv).slice(0, 15);
            charts.push(
                new Chart(el3, {
                    type: "bar",
                    data: {
                        labels: list.map((i) => i.nama),
                        datasets: [
                            {
                                label: "Stok Tersedia",
                                data: list.map(stok),
                                backgroundColor: "#2E7D1B",
                                borderRadius: 6,
                            },
                            {
                                label: "Batas Minimum",
                                data: list.map((i) => +i.minStok || 0),
                                backgroundColor: "#FFE81F",
                                borderRadius: 6,
                            },
                        ],
                    },
                    options: axOptions,
                }),
            );
        }
    }

    // 4. Kondisi Alat
    if (S.page === "alat") {
        const elAlat = document.getElementById("c_alat");
        if (elAlat) {
            const kond = { Baik: 0, "Rusak Ringan": 0, "Rusak Berat": 0 };
            D.alat.forEach((a) => {
                const k = a.kondisi || "Baik";
                kond[k] = (kond[k] || 0) + (+a.jumlah || 1);
            });
            charts.push(
                new Chart(elAlat, {
                    type: "doughnut",
                    data: {
                        labels: Object.keys(kond),
                        datasets: [
                            {
                                data: Object.values(kond),
                                backgroundColor: [
                                    "#2E7D1B",
                                    "#FFE81F",
                                    "#D64545",
                                ],
                                borderWidth: 0,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: "bottom" } },
                    },
                }),
            );
        }
    }

    // 5. Laporan Kas
    if (S.page === "lap") {
        const el4 = document.getElementById("c4");
        if (el4) {
            const keyFn = {
                hari: (t) => t,
                minggu: (t) => {
                    const d = new Date(t);
                    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
                    return d.toISOString().slice(0, 10);
                },
                bulan: (t) => (t || "").slice(0, 7),
            }[S.per || "bulan"];

            const g = {};
            D.keu.forEach((k) => {
                if (!k.tgl) return;
                const p = keyFn(k.tgl);
                g[p] = g[p] || { m: 0, k: 0 };
                g[p][k.tipe === "masuk" ? "m" : "k"] += +k.nominal || 0;
            });
            const ks = Object.keys(g).sort().slice(-12);

            charts.push(
                new Chart(el4, {
                    type: "bar",
                    data: {
                        labels: ks,
                        datasets: [
                            {
                                label: "Masuk (Penerimaan)",
                                data: ks.map((p) => g[p].m),
                                backgroundColor: "#2E7D1B",
                                borderRadius: 6,
                            },
                            {
                                label: "Keluar (Pengeluaran)",
                                data: ks.map((p) => g[p].k),
                                backgroundColor: "#FFE81F",
                                borderRadius: 6,
                            },
                        ],
                    },
                    options: axOptions,
                }),
            );
        }
    }

    // 6. Sales Target
    if (S.page === "sales") {
        const el5 = document.getElementById("c5");
        if (el5) {
            const sStaff = D.sales.filter(
                (s) => !s.divisi || s.divisi === "Sales",
            );
            charts.push(
                new Chart(el5, {
                    type: "bar",
                    data: {
                        labels: sStaff.map((s) => s.nama),
                        datasets: [
                            {
                                label: "Omzet Tercapai",
                                data: sStaff.map((s) =>
                                    sum(
                                        D.proj.filter((p) => p.sales == s.id),
                                        (p) => p.nilai,
                                    ),
                                ),
                                backgroundColor: C.primary,
                                borderRadius: 6,
                            },
                            {
                                label: "Target Omzet",
                                data: sStaff.map((s) => +s.target || 0),
                                backgroundColor: C.warn,
                                borderRadius: 6,
                            },
                        ],
                    },
                    options: axOptions,
                }),
            );
        }
    }
}

/* ---------------------------------------------------------------------
   21. ROUTER & RENDER UTAMA
   --------------------------------------------------------------------- */
window.go = (pageKey, id) => {
    if (pageKey === "login") {
        showLogin();
        return;
    }
    if (pageKey === "set") pageKey = "dash";
    S.page = pageKey;
    S.id = id != null ? id : null;

    closeDrawer();
    document
        .querySelectorAll("[data-dd].open")
        .forEach((x) => x.classList.remove("open"));
    window.scrollTo(0, 0);
    render();
};

function render(keepFocus) {
    if (S.page === "set") S.page = "dash";
    // Hancurkan grafik sebelumnya agar tidak bocor memori
    charts.forEach((c) => c.destroy());
    charts = [];

    const appEl = $("#app");
    if (appEl) appEl.hidden = false;
    const loginEl = $("#login");
    if (loginEl) loginEl.hidden = true;

    renderTop();
    renderTabbar();

    const mainEl = $("#main");
    if (S.page === "dash") mainEl.innerHTML = dash();
    else if (S.page === "kanban") mainEl.innerHTML = kanban();
    else if (S.page === "alert")
        mainEl.innerHTML =
            head("Pusat Peringatan", pageDesc("alert")) +
            `<div class="card"><div class="card-b">${alertList()}</div></div>`;
    else if (S.page === "lap") mainEl.innerHTML = lap();
    else if (S.page === "pl") mainEl.innerHTML = plPage();
    else if (S.page === "log") mainEl.innerHTML = logPage();
    else if (S.page === "pd") mainEl.innerHTML = projDetail();
    else if (S.page === "kd") mainEl.innerHTML = karyDetail();
    else mainEl.innerHTML = listPage(S.page);

    if (keepFocus) {
        const s = document.getElementById("srch");
        if (s && document.activeElement !== s && S.q[S.page]) {
            s.focus();
            s.setSelectionRange(s.value.length, s.value.length);
        }
    }

    try {
        charting();
    } catch (err) {
        console.warn("Chart rendering failed:", err);
    }
}

// Mulai aplikasi saat DOM siap (Tampilkan halaman login pratinjau terlebih dahulu)
const initApp = () => {
    if (!sessionStorage.getItem("satarya_view_app") || window.location.hash === "#login") {
        showLogin();
    } else {
        render();
    }
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}
