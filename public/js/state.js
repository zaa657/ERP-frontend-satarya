/* =====================================================================
   SATARYA ERP — STORE & BUSINESS LOGIC (state.js)
   Navigasi, State D & S, Rumus Kalkulasi, Log Aktivitas & Peringatan
   ===================================================================== */
"use strict";

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
            [
                "supplier",
                "Supplier",
                "Tempat belanja material & toko kebutuhan",
                1,
            ],
            ["vendor", "Vendor / Mitra", "Partner rekanan, subkon & sewa alat"],
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
    if (!D.supplier) D.supplier = [];

    // Pisahkan otomatis toko/material belanja dari vendor jika D.supplier masih kosong
    if (
        Array.isArray(D.vendor) &&
        D.vendor.length > 0 &&
        D.supplier.length === 0
    ) {
        const toMove = [];
        D.vendor = D.vendor.filter((v) => {
            const kat = (v.kategori || "").toLowerCase();
            const nm = (v.nama || "").toLowerCase();
            if (
                kat.includes("material") ||
                nm.includes("toko") ||
                nm.includes("tb.") ||
                nm.includes("depo") ||
                nm.includes("supplier") ||
                nm.includes("bangunan")
            ) {
                toMove.push({
                    ...v,
                    kategori: "Material Bangunan",
                });
                return false;
            }
            return true;
        });
        if (toMove.length > 0) {
            D.supplier.push(...toMove);
        }
    }

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
   KALKULASI BISNIS & PERHITUNGAN
   --------------------------------------------------------------------- */
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


/* ---------------------------------------------------------------------
   LOG AKTIVITAS (MEMORI SEMENTARA)
   --------------------------------------------------------------------- */
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
