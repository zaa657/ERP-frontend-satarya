/* =====================================================================
   SATARYA ERP — SKEMA & HELPER FORMAT (schema.js)
   Definisi entitas, icon library, serta formatting utilities
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
    supplier: {
        t: "Supplier (Tempat Belanja)",
        s: "Supplier",
        d: "Direktori toko dan pemasok tempat belanja material, bahan bangunan, serta kebutuhan proyek.",
        f: [
            ["nama", "Nama Supplier / Toko Belanja"],
            [
                "kategori",
                "Kategori Belanja",
                [
                    "Material Bangunan",
                    "Besi & Baja",
                    "Aluminium & Kaca",
                    "Cat & Finishing",
                    "Alat Listrik & Sanitari",
                    "Baut & Perkakas",
                    "Perlengkapan Lapangan",
                    "Lainnya",
                ],
            ],
            ["pic", "Nama Kontak / Sales Toko (PIC)"],
            ["kontak", "Telepon / WhatsApp"],
            ["alamat", "Alamat / Lokasi Toko"],
            ["rating", "Penilaian Toko", ["5", "4", "3", "2", "1"]],
            [
                "ket",
                "Catatan Belanja (Diskon, tempo pembayaran, no. rekening, dll.)",
                "txt",
            ],
        ],
    },
    vendor: {
        t: "Vendor (Partner & Mitra)",
        s: "Vendor / Mitra",
        d: "Direktori partner rekanan, mitra kerja, sub-kontraktor spesialis, dan penyedia sewa alat.",
        f: [
            ["nama", "Nama Vendor / Perusahaan Mitra"],
            [
                "kategori",
                "Bidang Kerjasama",
                [
                    "Sub-kontraktor Spesialis",
                    "Sewa Alat & Mesin",
                    "Jasa Konstruksi / Tukang",
                    "Transportasi & Logistik",
                    "Konsultan & Arsitek",
                    "Mitra Kerjasama",
                    "Lainnya",
                ],
            ],
            ["pic", "Nama PIC / Penanggung Jawab Mitra"],
            ["kontak", "Telepon / WhatsApp"],
            ["alamat", "Alamat Kantor / Workshop"],
            ["rating", "Penilaian Kinerja Mitra", ["5", "4", "3", "2", "1"]],
            [
                "ket",
                "Catatan Kerjasama (Perjanjian, no. rekening bank, lingkup kerja, dll.)",
                "txt",
            ],
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
            ["lampiran", "Bukti / Lampiran (JPG, PDF, Spreadsheet)", "file?"],
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
            ["uraian", "Nama Produk / Pekerjaan"],
            ["harga", "Harga Satuan (Rp)", "n"],
            ["qty", "Jumlah (Qty)", "q"],
            ["nominal", "Total Tagihan (Rp)", "n"],
            ["estimasi", "Estimasi Hari (mis. 7 hari kerja)"],
            ["spesifikasi", "Spesifikasi Pekerjaan (Opsional)", "txt"],
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
    supplier:
        '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    vendor: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
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
    filePdf:
        '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M10 12H8v6h2a1.5 1.5 0 0 0 1.5-1.5v-3A1.5 1.5 0 0 0 10 12z"/>',
    fileSpreadsheet:
        '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h8M12 13v8"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    google: '<path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27A7.06 7.06 0 0 1 4.9 12c0-.79.14-1.57.38-2.27V6.58H1.25A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.25 5.42l4.03-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>',
};
const I = (k, cls) =>
    `<svg class="ico${cls ? " " + cls : ""}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[k] || ICONS.grid}</svg>`;
const WAVES = `<svg class="waves" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true">
  <path fill="rgba(255,255,255,.10)" d="M0 120 C 240 60 480 180 720 130 S 1200 60 1440 110 V220 H0Z"/>
  <path fill="rgba(255,255,255,.12)" d="M0 160 C 300 110 520 210 820 165 S 1240 120 1440 150 V220 H0Z"/>
  <path fill="rgba(94,234,212,.16)" d="M0 190 C 260 160 600 230 900 195 S 1300 170 1440 185 V220 H0Z"/>
</svg>`;

/* ---------------------------------------------------------------------
   HELPER FORMAT & STRING
   --------------------------------------------------------------------- */
const rp = (n) => "Rp " + Math.round(+n || 0).toLocaleString("id-ID");
const formatRibuan = (val) => {
    if (val == null || val === "") return "";
    const str = String(val)
        .replace(/\D/g, "")
        .replace(/^0+(?=\d)/, "");
    if (!str) return val === 0 || val === "0" ? "0" : "";
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
const parseNominal = (val) => {
    if (val == null || val === "") return 0;
    const clean = String(val)
        .replace(/\./g, "")
        .replace(/,/g, ".")
        .replace(/[^\d.-]/g, "");
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
};
function handleNominalInput(inp) {
    if (!inp) return;
    const raw = inp.value;
    const selEnd = inp.selectionEnd != null ? inp.selectionEnd : raw.length;
    const digitsBefore = raw.slice(0, selEnd).replace(/\D/g, "").length;

    const cleanDigits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    const formatted = cleanDigits
        ? cleanDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
        : "";

    inp.value = formatted;

    let newPos = 0;
    let counted = 0;
    while (newPos < formatted.length && counted < digitsBefore) {
        if (/\d/.test(formatted[newPos])) {
            counted++;
        }
        newPos++;
    }
    if (inp.setSelectionRange) {
        inp.setSelectionRange(newPos, newPos);
    }
}

document.addEventListener("input", (e) => {
    if (
        e.target &&
        e.target.matches &&
        e.target.matches('input[data-nominal="1"]')
    ) {
        handleNominalInput(e.target);
    }
});

document.addEventListener("keydown", (e) => {
    if (
        e.target &&
        e.target.matches &&
        e.target.matches('input[data-nominal="1"]')
    ) {
        const inp = e.target;
        if (e.key === "Backspace" && inp.selectionStart === inp.selectionEnd) {
            const pos = inp.selectionStart;
            if (pos > 0 && inp.value[pos - 1] === ".") {
                e.preventDefault();
                const val = inp.value;
                inp.value = val.slice(0, pos - 2) + val.slice(pos);
                handleNominalInput(inp);
            }
        }
    }
});

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
