const E = {
  alat: {
    t: "Inventaris Peralatan (Tools)",
    s: "Peralatan",
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
    t: "Laporan Kerusakan Peralatan",
    s: "Laporan Kerusakan",
    f: [
      ["tgl", "Tanggal laporan", "d"],
      ["alat", "Peralatan", "ref:alat"],
      ["jumlah", "Jumlah rusak", "q"],
      ["kondisi", "Tingkat kerusakan", ["Rusak Ringan", "Rusak Berat", "Rusak Total"]],
      ["proj", "Lokasi proyek (opsional)", "ref:proj?"],
      ["pelapor", "Nama pelapor / Mandor"],
      ["status", "Status perbaikan", ["Dilaporkan", "Sedang Diperbaiki", "Selesai", "Afkir/Rusak Total"]],
      ["ket", "Keterangan kerusakan / Tindak lanjut"],
    ],
  },
  supply: {
    t: "Inventaris Perlengkapan (Bahan Habis Pakai)",
    s: "Perlengkapan",
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
    t: "Stok Masuk & Pemakaian Perlengkapan",
    s: "Mutasi Perlengkapan",
    f: [
      ["tgl", "Tanggal", "d"],
      ["supply", "Perlengkapan / Bahan", "ref:supply"],
      ["tipe", "Jenis mutasi", ["masuk", "keluar"]],
      ["qty", "Jumlah", "q"],
      ["proj", "Untuk proyek (opsional)", "ref:proj?"],
      ["ket", "Keterangan / Supplier / Bagian"],
    ],
  },
  sales: {
    t: "Data Sales & Tim",
    s: "Anggota Tim",
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
    f: [
      ["nama", "Nama proyek"],
      ["klien", "Nama klien"],
      ["alamat", "Alamat proyek"],
      ["kontak", "Kontak klien"],
      ["sales", "Sales", "ref:sales"],
      ["nilai", "Nilai proyek", "n"],
      ["mulai", "Tanggal mulai", "d"],
      ["status", "Status", ["Berjalan", "Selesai", "Tertunda"]],
    ],
  },
  rab: {
    t: "RAB (Rencana Anggaran Biaya)",
    s: "Dokumen RAB",
    f: [
      ["proj", "Proyek", "ref:proj"],
      ["nama", "Keterangan / Judul RAB"],
      ["pdf", "File PDF RAB", "pdf"],
    ],
  },
  budget: {
    t: "Budgeting Proyek",
    s: "Item Budgeting",
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
    f: [
      ["tgl", "Tanggal", "d"],
      ["kar", "Karyawan", "ref:karyawan"],
      ["nominal", "Nominal ganti rugi", "n"],
      ["status", "Status", ["Belum Dibayar", "Lunas"]],
      ["ket", "Alasan / Kerusakan / Barang"],
    ],
  },
  gaji: {
    t: "Pembayaran Gaji Karyawan",
    s: "Pembayaran Gaji",
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
    t: "Formulir Permintaan Barang",
    s: "Formulir",
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
};
const NAV = [
  [
    "Ringkasan",
    [
      ["dash", "Dashboard"],
      ["alert", "Peringatan"],
    ],
  ],
  [
    "Peralatan",
    [
      ["alat", "Inventaris Peralatan"],
      ["rusak", "Laporan Kerusakan"],
    ],
  ],
  [
    "Perlengkapan & Bahan",
    [
      ["supply", "Stok Perlengkapan"],
      ["mov", "Bertambah & Pemakaian"],
      ["form", "Formulir Permintaan"],
    ],
  ],
  [
    "Proyek",
    [
      ["proj", "Proyek klien"],
      ["rab", "RAB (Upload PDF)"],
      ["budget", "Budgeting proyek"],
      ["biaya", "Penggunaan anggaran"],
      ["dok", "Dokumentasi"],
    ],
  ],
  [
    "SDM",
    [
      ["karyawan", "Karyawan"],
      ["gaji", "Gaji"],
      ["kasbon", "Kasbon"],
      ["gantirugi", "Ganti rugi"],
      ["absen", "Absensi"],
    ],
  ],
  [
    "Keuangan",
    [
      ["keu", "Kas harian"],
      ["lap", "Laporan keuangan"],
    ],
  ],
  ["Kinerja", [["sales", "Sales"]]],
];
const TITLE = {
  dash: "Dashboard",
  alert: "Peringatan",
  lap: "Laporan Keuangan",
  set: "Backup dan Data",
  pd: "Detail Proyek",
  kd: "Detail Profil Karyawan",
  alat: "Inventaris Peralatan (Tools & Mesin)",
  rusak: "Laporan Kerusakan & Perbaikan Peralatan",
  supply: "Inventaris Perlengkapan & Bahan",
  mov: "Stok Masuk & Pemakaian Perlengkapan",
  rab: "RAB (Rencana Anggaran Biaya)",
  budget: "Budgeting Proyek",
  sales: "Sales",
  kasbon: "Kasbon Karyawan",
  gantirugi: "Ganti Rugi Karyawan",
};
const KEY = "mgmt_internal_v2";
let D;
try {
  D = JSON.parse(localStorage.getItem(KEY)) || {};
} catch (e) {
  D = {};
}
Object.keys(E).forEach((k) => (D[k] = Array.isArray(D[k]) ? D[k] : []));

let cur = "dash",
  curP = null,
  curK = null,
  per = "bulan",
  Q = {},
  charts = [];
const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(D));
  } catch (e) {
    toast("Gagal menyimpan data: " + e.message);
  }
};
const rp = (n) => "Rp " + Math.round(+n || 0).toLocaleString("id-ID");
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
const today = () => new Date().toISOString().slice(0, 10);
const sum = (a, f) => a.reduce((s, x) => s + (+f(x) || 0), 0);
const nm = (e, id) => (D[e].find((x) => x.id == id) || {}).nama || "-";
const spent = (p) =>
  sum(
    (D.biaya || []).filter((b) => b.proj == p.id),
    (b) => b.nominal,
  ) +
  sum(
    (D.keu || []).filter((k) => k.proj == p.id && k.tipe == "keluar"),
    (k) => k.nominal,
  );
const rabOf = (p) =>
  sum(
    (D.budget || []).filter((r) => r.proj == p.id),
    (r) => r.rencana,
  );
const stok = (i) =>
  (+i.stok || 0) +
  sum(
    (D.mov || []).filter((m) => (m.supply == i.id || m.inv == i.id) && m.tipe == "masuk"),
    (m) => m.qty,
  ) -
  sum(
    (D.mov || []).filter((m) => (m.supply == i.id || m.inv == i.id) && m.tipe == "keluar"),
    (m) => m.qty,
  );
const kas = () =>
  sum(
    D.keu.filter((k) => k.tipe == "masuk"),
    (k) => k.nominal,
  ) -
  sum(
    D.keu.filter((k) => k.tipe == "keluar"),
    (k) => k.nominal,
  );
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
const badge = (s) => {
  const c = {
    Berjalan: "ok",
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
    izin: "warn",
    sakit: "warn",
    alpha: "bad",
    masuk: "ok",
    keluar: "bad",
    Baik: "ok",
    "Rusak Ringan": "warn",
    "Rusak Berat": "bad",
    "Rusak Total": "bad",
    Dilaporkan: "warn",
    "Sedang Diperbaiki": "warn",
    "Afkir/Rusak Total": "bad",
  }[s];
  return c === undefined
    ? esc(s)
    : `<span class="badge ${c}">${esc(s)}</span>`;
};
function toast(m) {
  const t = document.getElementById("toast");
  t.textContent = m;
  t.classList.add("on");
  clearTimeout(toast.h);
  toast.h = setTimeout(() => t.classList.remove("on"), 2200);
}

function alerts() {
  const a = [];
  (D.supply || []).forEach((i) => {
    const s = stok(i);
    if (s <= (+i.minStok || 0))
      a.push([
        "w",
        `Stok perlengkapan ${esc(i.nama)} tinggal ${s} ${esc(i.satuan || "")}, batas minimum ${i.minStok || 0}.`,
        "supply",
      ]);
  });
  (D.rusak || []).filter((r) => r.status === "Dilaporkan" || r.status === "Sedang Diperbaiki").forEach((r) => {
    a.push([
      "b",
      `Peralatan ${esc(nm("alat", r.alat))} rusak (${esc(r.kondisi)}): ${esc(r.ket || "-")} [Status: ${esc(r.status)}]`,
      "rusak",
    ]);
  });
  D.proj.forEach((p) => {
    const sp = spent(p),
      rb = rabOf(p);
    if (p.nilai && sp > +p.nilai)
      a.push([
        "b",
        `Proyek rugi: ${esc(p.nama)} sudah mengeluarkan ${rp(sp)}, melebihi nilai proyek ${rp(p.nilai)}.`,
        "pd",
        p.id,
      ]);
    else if (rb && sp > rb)
      a.push([
        "w",
        `Anggaran melebihi RAB: ${esc(p.nama)} terpakai ${rp(sp)} dari RAB ${rp(rb)}.`,
        "pd",
        p.id,
      ]);
    if (p.status == "Berjalan" && !D.dok.some((d) => d.proj == p.id))
      a.push([
        "w",
        `${esc(p.nama)} belum punya dokumentasi.`,
        "pd",
        p.id,
      ]);
  });
  D.sales.forEach((s) => {
    const last = D.proj
      .filter((p) => p.sales == s.id)
      .map((p) => p.mulai || "")
      .sort()
      .pop();
    const d = last
      ? Math.floor((Date.now() - new Date(last)) / 864e5)
      : null;
    if (d === null || d > 30)
      a.push([
        "w",
        `${esc(s.nama)} ${d === null ? "belum pernah membawa proyek" : "belum membawa proyek baru selama " + d + " hari"}.`,
        "sales",
      ]);
  });
  if (kas() < 0) a.push(["b", `Saldo kas negatif: ${rp(kas())}.`, "keu"]);
  return a;
}

function stats(a) {
  return `<div class="st">${a.map((x) => `<div><span>${x[0]}</span><b>${x[1]}</b></div>`).join("")}</div>`;
}
function alertList(max) {
  const a = alerts().slice(0, max || 99);
  return a.length
    ? a
        .map(
          (x) =>
            `<div class="al ${x[0]}"><i></i><div>${x[1]} <a class="lk" onclick="go('${x[2]}',${x[3] || "null"})">Buka</a></div></div>`,
        )
        .join("")
    : '<div class="empty">Tidak ada peringatan. Semua indikator dalam batas aman.</div>';
}

function dash() {
  const run = D.proj.filter((p) => p.status == "Berjalan");
  const lowSupply = (D.supply || []).filter((i) => stok(i) <= (+i.minStok || 0)).length;
  const rusakPending = (D.rusak || []).filter((r) => r.status === "Dilaporkan" || r.status === "Sedang Diperbaiki").length;
  return (
    stats([
      ["Saldo kas", rp(kas())],
      ["Proyek berjalan", run.length],
      ["Nilai proyek berjalan", rp(sum(run, (p) => p.nilai))],
      ["Perlengkapan menipis", lowSupply],
      ["Peralatan rusak aktif", rusakPending],
      ["Peringatan aktif", alerts().length],
    ]) +
    `<div class="g2"><div class="panel"><h3>Arus kas 6 bulan terakhir</h3><div class="pb"><canvas id="c1"></canvas></div></div>
  <div class="panel"><h3>Kesehatan anggaran proyek</h3><div class="pb">${
    D.proj.length
? D.proj
    .slice(-5)
    .map((p) => budgetBar(p))
    .join("")
: '<div class="empty">Tambahkan proyek untuk melihat kondisi anggaran.</div>'
  }</div></div></div>
  <div class="g2" style="margin-top:18px"><div class="panel"><h3>Peringatan terbaru</h3>${alertList(5)}</div><div class="panel"><h3>Status proyek</h3><div class="pb"><canvas id="c2"></canvas></div></div></div>`
  );
}
function budgetBar(p) {
  const rb = rabOf(p),
    sp = spent(p),
    base = rb || +p.nilai || 0,
    pc = base ? Math.min(100, (sp / base) * 100) : 0;
  return `<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between"><a class="lk" onclick="go('pd',${p.id})">${esc(p.nama)}</a><span class="num">${base ? Math.round((sp / base) * 100) : 0}%</span></div><div class="meter ${base && sp > base ? "o" : ""}"><i style="width:${pc}%"></i></div><small style="color:var(--mut)">Terpakai ${rp(sp)} dari ${rb ? "RAB" : "nilai"} ${rp(base)}</small></div>`;
}

function listPage(k) {
  const e = E[k],
    q = (Q[k] || "").toLowerCase();

  // If viewing 'biaya' (Penggunaan Anggaran), pull directly from D.keu project expenses and manual D.biaya
  let sourceData = D[k];
  if (k == "biaya") {
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
    const directBiaya = (D.biaya || []).map((x) => ({ ...x, _src: "biaya" }));
    // Merge without duplicates by id
    const seen = new Set();
    sourceData = [...directBiaya, ...keuExpenses].filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }

  let rows = sourceData
    .slice()
    .reverse()
    .filter(
      (r) =>
        !q ||
        JSON.stringify(e.f.map((f) => disp(f, r[f[0]], true)))
          .toLowerCase()
          .includes(q),
    );
  const ex = extra(k);
  let head = stats(topStats(k));
  return (
    head +
    `<div class="bar"><input type="search" placeholder="Cari di ${e.t.toLowerCase()}" value="${esc(Q[k] || "")}" oninput="Q['${k}']=this.value;render(true)" id="srch"><span class="sp"></span><button class="btn" onclick="csv('${k}')">Export CSV</button><button class="btn p" onclick="openForm('${k}')">Tambah ${e.s.toLowerCase()}</button></div>
 <div class="panel"><div class="tw"><table><tr>${e.f.map((f) => `<th class="${f[2] == "n" || f[2] == "q" ? "n" : ""}">${f[1]}</th>`).join("")}${ex.map((x) => `<th>${x[0]}</th>`).join("")}<th></th></tr>
 ${rows.map((r) => `<tr>${e.f.map((f) => `<td class="${f[2] == "n" || f[2] == "q" ? "n" : ""}">${disp(f, r[f[0]], false, k, r)}</td>`).join("")}${ex.map((x) => `<td>${x[1](r)}</td>`).join("")}<td style="white-space:nowrap"><button class="btn s" onclick="openForm('${r._src || k}',${r.id})">Ubah</button> <button class="btn s x" onclick="del('${r._src || k}',${r.id})">Hapus</button></td></tr>`).join("") || `<tr><td colspan="99" class="empty">${q ? "Tidak ada data yang cocok dengan pencarian." : 'Belum ada data. Klik "Tambah ' + e.s.toLowerCase() + '" untuk memulai.'}</td></tr>`}
 </table></div></div>` +
    (k == "supply" || k == "inv"
      ? `<div class="panel"><h3>Stok dibanding batas minimum</h3><div class="pb"><canvas id="c3"></canvas></div></div>`
      : "") +
    (k == "alat"
      ? `<div class="panel"><h3>Kondisi Peralatan</h3><div class="pb"><canvas id="c_alat"></canvas></div></div>`
      : "") +
    (k == "sales" ? salesKpi() : "") +
    (k == "budget"
      ? `<div class="panel"><h3>Rencana dibanding realisasi</h3><div class="pb">${D.proj.map(budgetBar).join("") || '<div class="empty">Belum ada proyek.</div>'}</div></div>`
      : "")
  );
}
function extra(k) {
  if (k == "alat")
    return [
      [
        "Status Kerusakan",
        (r) => {
          const lapor = (D.rusak || []).filter((x) => x.alat == r.id && (x.status === "Dilaporkan" || x.status === "Sedang Diperbaiki"));
          return lapor.length
            ? `<span class="badge bad">${lapor.length} dlm perbaikan</span>`
            : '<span class="badge ok">Normal</span>';
        },
      ],
      [
        "Total Nilai Aset",
        (r) => rp((+r.jumlah || 0) * (+r.harga || 0)),
      ],
      [
        "Aksi Cepat",
        (r) => `<button class="btn s" onclick="openForm('rusak',null,{alat:${r.id}})">Laporkan Rusak</button>`,
      ],
    ];
  if (k == "rusak")
    return [
      [
        "Status Tiket",
        (r) => badge(r.status),
      ],
    ];
  if (k == "supply" || k == "inv")
    return [
      [
        "Stok kini",
        (r) => `<b class="num">${stok(r)}</b> ${esc(r.satuan || "")}`,
      ],
      [
        "Kondisi",
        (r) =>
          stok(r) <= (+r.minStok || 0)
            ? '<span class="badge bad">Menipis</span>'
            : '<span class="badge ok">Aman</span>',
      ],
      [
        "Aksi Cepat",
        (r) => `<button class="btn s" onclick="openForm('mov',null,{supply:${r.id},tipe:'masuk'})">+ Masuk</button> <button class="btn s" onclick="openForm('mov',null,{supply:${r.id},tipe:'keluar'})">- Pakai</button>`,
      ],
    ];
  if (k == "proj")
    return [
      ["Terpakai", (r) => rp(spent(r))],
      [
        "Sisa nilai",
        (r) => {
          const s = (+r.nilai || 0) - spent(r);
          return `<span class="${s < 0 ? "neg" : ""}">${rp(s)}</span>`;
        },
      ],
    ];
  if (k == "karyawan")
    return [
      ["Kehadiran", (r) => hadirPct(r)],
      [
        "Kasbon Aktif",
        (r) => {
          const unpaid = sum(
            (D.kasbon || []).filter((x) => x.kar == r.id && x.status === "Belum Lunas"),
            (x) => x.nominal,
          );
          return unpaid ? `<span class="neg">${rp(unpaid)}</span>` : '<span class="pos">Rp 0</span>';
        },
      ],
      [
        "Ganti Rugi",
        (r) => {
          const unpaid = sum(
            (D.gantirugi || []).filter((x) => x.kar == r.id && x.status === "Belum Dibayar"),
            (x) => x.nominal,
          );
          return unpaid ? `<span class="neg">${rp(unpaid)}</span>` : '<span class="pos">Rp 0</span>';
        },
      ],
      [
        "Aksi Cepat",
        (r) => `<button class="btn s" onclick="go('kd',${r.id})">Rincian Profil</button>`,
      ],
    ];
  if (k == "biaya")
    return [
      [
        "Sumber Data",
        (r) =>
          r._src === "keu"
            ? '<span class="badge ok">Kas Harian</span>'
            : '<span class="badge warn">Input Anggaran</span>',
      ],
    ];
  return [];
}
function topStats(k) {
  if (k == "alat")
    return [
      ["Total jenis alat", (D.alat || []).length],
      ["Total unit alat", sum(D.alat || [], (x) => x.jumlah)],
      ["Total nilai aset alat", rp(sum(D.alat || [], (x) => (+x.jumlah || 0) * (+x.harga || 0)))],
      ["Dalam laporan rusak", (D.rusak || []).filter((x) => x.status === "Dilaporkan" || x.status === "Sedang Diperbaiki").length],
    ];
  if (k == "rusak")
    return [
      ["Total laporan", (D.rusak || []).length],
      ["Perlu perbaikan", (D.rusak || []).filter((x) => x.status === "Dilaporkan").length],
      ["Sedang diperbaiki", (D.rusak || []).filter((x) => x.status === "Sedang Diperbaiki").length],
      ["Selesai diperbaiki", (D.rusak || []).filter((x) => x.status === "Selesai").length],
    ];
  if (k == "supply")
    return [
      ["Jenis perlengkapan", (D.supply || []).length],
      ["Nilai persediaan", rp(sum(D.supply || [], (i) => stok(i) * i.harga))],
      [
        "Stok menipis",
        (D.supply || []).filter((i) => stok(i) <= (+i.minStok || 0)).length,
      ],
    ];
  if (k == "mov")
    return [
      ["Total transaksi mutasi", (D.mov || []).length],
      ["Mutasi masuk (stok nambah)", (D.mov || []).filter((m) => m.tipe === "masuk").length],
      ["Pemakaian proyek", (D.mov || []).filter((m) => m.tipe === "keluar").length],
    ];
  if (k == "inv")
    return [
      ["Jenis barang", (D.inv || []).length],
      ["Nilai persediaan", rp(sum(D.inv || [], (i) => stok(i) * i.harga))],
      [
        "Stok menipis",
        (D.inv || []).filter((i) => stok(i) <= (+i.minStok || 0)).length,
      ],
    ];
  if (k == "proj")
    return [
      ["Total proyek", D.proj.length],
      ["Total nilai", rp(sum(D.proj, (p) => p.nilai))],
      ["Total biaya terpakai", rp(sum(D.proj, spent))],
    ];
  if (k == "rab")
    return [
      ["Total dokumen RAB", (D.rab || []).length],
      ["Proyek terikat", new Set((D.rab || []).map((x) => x.proj).filter(Boolean)).size],
    ];
  if (k == "budget")
    return [
      ["Total item anggaran", (D.budget || []).length],
      ["Total rencana anggaran", rp(sum(D.budget || [], (x) => x.rencana))],
      ["Total biaya terpakai", rp(sum(D.proj, spent))],
    ];
  if (k == "biaya") {
    const keuExpenses = (D.keu || []).filter((x) => x.tipe === "keluar" && x.proj);
    const totalKeu = sum(keuExpenses, (x) => x.nominal);
    const totalDirect = sum(D.biaya || [], (x) => x.nominal);
    const totalBorongan = sum(keuExpenses.filter((x) => x.kategori === "Borongan Tukang"), (x) => x.nominal);
    return [
      ["Total Pengeluaran Proyek", rp(totalKeu + totalDirect)],
      ["Dari Kas Harian", rp(totalKeu)],
      ["Borongan Tukang", rp(totalBorongan)],
      ["Input Langsung", rp(totalDirect)],
    ];
  }
  if (k == "sales") {
    const sOnly = (D.sales || []).filter((s) => !s.divisi || s.divisi === "Sales");
    return [
      ["Total tim", (D.sales || []).length],
      ["Staff sales", sOnly.length],
      ["Total target sales", rp(sum(sOnly, (x) => x.target))],
      ["Total omzet masuk", rp(sum(D.proj || [], (p) => p.nilai))],
    ];
  }
  if (k == "karyawan")
    return [
      ["Jumlah karyawan", D.karyawan.length],
      ["Total gaji pokok", rp(sum(D.karyawan, (x) => x.gaji))],
      ["Kasbon aktif", rp(sum((D.kasbon || []).filter((x) => x.status === "Belum Lunas"), (x) => x.nominal))],
      ["Ganti rugi aktif", rp(sum((D.gantirugi || []).filter((x) => x.status === "Belum Dibayar"), (x) => x.nominal))],
    ];
  if (k == "kasbon")
    return [
      ["Total transaksi kasbon", (D.kasbon || []).length],
      ["Belum lunas", rp(sum((D.kasbon || []).filter((x) => x.status === "Belum Lunas"), (x) => x.nominal))],
      ["Sudah lunas", rp(sum((D.kasbon || []).filter((x) => x.status === "Lunas"), (x) => x.nominal))],
    ];
  if (k == "gantirugi")
    return [
      ["Total transaksi", (D.gantirugi || []).length],
      ["Belum dibayar", rp(sum((D.gantirugi || []).filter((x) => x.status === "Belum Dibayar"), (x) => x.nominal))],
      ["Sudah lunas", rp(sum((D.gantirugi || []).filter((x) => x.status === "Lunas"), (x) => x.nominal))],
    ];
  if (k == "gaji")
    return [
      ["Total pembayaran", (D.gaji || []).length],
      ["Total dibayarkan", rp(sum(D.gaji || [], (x) => x.nominal - (+x.pot_kasbon || 0) - (+x.pot_rugi || 0)))],
    ];
  if (k == "keu") {
    const totalBorongan = sum((D.keu || []).filter((x) => x.kategori === "Borongan Tukang"), (x) => x.nominal);
    return [
      ["Saldo kas", rp(kas())],
      [
        "Total masuk",
        rp(
          sum(
            (D.keu || []).filter((x) => x.tipe == "masuk"),
            (x) => x.nominal,
          ),
        ),
      ],
      [
        "Total keluar",
        rp(
          sum(
            (D.keu || []).filter((x) => x.tipe == "keluar"),
            (x) => x.nominal,
          ),
        ),
      ],
      ["Pengeluaran Borongan", rp(totalBorongan)],
    ];
  }
  if (k == "form")
    return [
      ["Diajukan", D.form.filter((x) => x.status == "Diajukan").length],
      ["Disetujui", D.form.filter((x) => x.status == "Disetujui").length],
      ["Ditolak", D.form.filter((x) => x.status == "Ditolak").length],
    ];
  return [["Jumlah data", D[k].length]];
}
function disp(f, v, plain, k, r) {
  const t = f[2];
  if (typeof t == "string" && t.startsWith("ref:"))
    return esc(v ? nm(t.slice(4).replace("?", ""), v) : "-");
  if (plain) return String(v ?? "");
  if (k == "proj" && f[0] == "nama")
    return `<a class="lk" onclick="go('pd',${r.id})">${esc(v)}</a>`;
  if (k == "karyawan" && f[0] == "nama")
    return `<a class="lk" onclick="go('kd',${r.id})">${esc(v)}</a>`;
  if (f[0] == "link")
    return v
      ? `<a class="lk" href="${esc(v)}" target="_blank" rel="noopener">Buka</a>`
      : "-";
  if (t == "pdf" || t == "pdf?" || f[0] == "pdf") {
    if (!v) return '<span style="color:var(--mut)">-</span>';
    const name = r.pdf_name || "Dokumen.pdf";
    return `<a class="lk" href="${esc(v)}" download="${esc(name)}" target="_blank" rel="noopener">📄 ${esc(name)}</a>`;
  }
  if (f[0] == "status" || f[0] == "tipe") return badge(v);
  if (t == "n") return rp(v);
  return esc(v);
}
function salesKpi() {
  const sList = (D.sales || []).filter((s) => !s.divisi || s.divisi === "Sales");
  return `<div class="panel"><h3>Capaian target sales</h3><div class="tw"><table><tr><th>Nama Sales</th><th class="n">Jumlah proyek</th><th class="n">Omzet</th><th class="n">Target</th><th style="min-width:180px">Capaian</th></tr>${
    sList
      .map((s) => {
        const ps = D.proj.filter((p) => p.sales == s.id),
          o = sum(ps, (p) => p.nilai),
          pc = s.target ? (o / s.target) * 100 : 0;
        return `<tr><td>${esc(s.nama)}</td><td class="n">${ps.length}</td><td class="n">${rp(o)}</td><td class="n">${rp(s.target)}</td><td><div class="meter"><i style="width:${Math.min(100, pc)}%"></i></div>${pc.toFixed(0)}%</td></tr>`;
      })
      .join("") ||
    '<tr><td colspan="5" class="empty">Belum ada data staf divisi Sales.</td></tr>'
  }</table></div></div>
 <div class="panel"><h3>Omzet dibanding target</h3><div class="pb"><canvas id="c5"></canvas></div></div>`;
}

function projDetail() {
  const p = D.proj.find((x) => x.id == curP);
  if (!p) return '<div class="empty">Proyek tidak ditemukan.</div>';
  const rb = rabOf(p),
    sp = spent(p),
    sisa = (+p.nilai || 0) - sp;
  const mini = (k, rows, cols) =>
    `<div class="panel"><h3>${E[k].t}<button class="btn s p" onclick="openForm('${k}',null,{proj:${p.id}})">Tambah</button></h3><div class="tw"><table>${
      rows.length
        ? `<tr>${cols.map((c) => `<th>${E[k].f.find((f) => f[0] == c)[1]}</th>`).join("")}<th></th></tr>` +
          rows
            .map(
              (r) =>
                `<tr>${cols
                  .map(
                    (c) =>
                      `<td>${disp(
                        E[k].f.find((f) => f[0] == c),
                        r[c],
                        false,
                        k,
                        r,
                      )}</td>`,
                  )
                  .join(
                    "",
                  )}<td><button class="btn s" onclick="openForm('${k}',${r.id})">Ubah</button> <button class="btn s x" onclick="del('${k}',${r.id})">Hapus</button></td></tr>`,
            )
            .join("")
        : '<tr><td class="empty">Belum ada data.</td></tr>'
    }</table></div></div>`;
  const cats = [
    "Kontrak",
    "Gambar dan desain",
    "Foto progres",
    "Laporan",
    "Lainnya",
  ];
  const docs = D.dok.filter((d) => d.proj == p.id);
  return (
    `<div class="bar"><button class="btn" onclick="go('proj')">Kembali ke daftar proyek</button><span class="sp"></span><button class="btn" onclick="window.print()">Cetak</button><button class="btn" onclick="openForm('proj',${p.id})">Ubah proyek</button></div>
 <div class="panel"><div class="pb"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><h2 style="margin:0;font:600 24px Fraunces,Georgia,serif">${esc(p.nama)}</h2>${badge(p.status)}</div>
 <p style="color:var(--mut);margin:6px 0 0">Klien: ${esc(p.klien)} | ${esc(p.alamat)} | Kontak: ${esc(p.kontak)} | Sales: ${esc(nm("sales", p.sales))} | Mulai: ${esc(p.mulai)}</p></div></div>` +
    stats([
      ["Nilai proyek", rp(p.nilai)],
      ["Total RAB", rp(rb)],
      ["Biaya terpakai", rp(sp)],
      [
        sisa < 0 ? "Kerugian" : "Sisa nilai",
        `<span class="${sisa < 0 ? "neg" : "pos"}">${rp(Math.abs(sisa))}</span>`,
      ],
    ]) +
    `<div class="panel"><div class="pb">${budgetBar(p)}</div></div>` +
    mini(
      "rab",
      D.rab.filter((r) => r.proj == p.id),
      ["nama", "pdf"],
    ) +
    mini(
      "budget",
      (D.budget || []).filter((r) => r.proj == p.id),
      ["item", "rencana", "pdf"],
    ) +
    mini(
      "biaya",
      (D.biaya || []).filter((r) => r.proj == p.id),
      ["tgl", "kategori", "nominal", "ket"],
    ) +
    mini(
      "keu",
      (D.keu || []).filter((r) => r.proj == p.id),
      ["tgl", "tipe", "kategori", "nominal", "ket"],
    ) +
    `<div class="panel"><h3>Katalog dokumentasi<button class="btn s p" onclick="openForm('dok',null,{proj:${p.id}})">Tambah dokumen</button></h3><div class="pb" style="display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">${cats
      .map(
        (c) =>
          `<div><b>${c}</b> <span class="badge">${docs.filter((d) => d.katalog == c).length}</span>${
            docs
              .filter((d) => d.katalog == c)
              .map(
                (d) =>
                  `<div style="padding:6px 0;border-bottom:1px solid var(--ln)"><a class="lk" href="${esc(d.link)}" target="_blank" rel="noopener">${esc(d.nama)}</a> <button class="btn s x" onclick="del('dok',${d.id})">Hapus</button></div>`,
              )
              .join("") ||
            '<div style="color:var(--mut);padding:6px 0">Kosong</div>'
          }</div>`,
      )
      .join("")}</div></div>`
  );
}

function karyDetail() {
  const k = (D.karyawan || []).find((x) => x.id == curK);
  if (!k) return '<div class="empty">Karyawan tidak ditemukan. <a class="lk" onclick="go(\'karyawan\')">Kembali ke daftar</a></div>';
  
  const gajis = (D.gaji || []).filter((g) => g.kar == k.id);
  const kasbons = (D.kasbon || []).filter((b) => b.kar == k.id);
  const rugis = (D.gantirugi || []).filter((r) => r.kar == k.id);
  const absens = (D.absen || []).filter((a) => a.kar == k.id);

  const totalGajiDibayar = sum(gajis, (x) => (+x.nominal || 0) - (+x.pot_kasbon || 0) - (+x.pot_rugi || 0));
  const totalKasbon = sum(kasbons, (x) => x.nominal);
  const sisaKasbon = sum(kasbons.filter((x) => x.status === "Belum Lunas"), (x) => x.nominal);
  const totalRugi = sum(rugis, (x) => x.nominal);
  const sisaRugi = sum(rugis.filter((x) => x.status === "Belum Dibayar"), (x) => x.nominal);
  const totalHadir = absens.filter((x) => x.status === "hadir").length;

  const miniTable = (title, addBtnKey, headers, rowsHtml) =>
    `<div class="panel"><h3>${title}<button class="btn s p" onclick="openForm('${addBtnKey}',null,{kar:${k.id}})">Tambah</button></h3>
    <div class="tw"><table><tr>${headers.map((h) => `<th>${h}</th>`).join("")}<th></th></tr>
    ${rowsHtml || `<tr><td colspan="99" class="empty">Belum ada riwayat data.</td></tr>`}
    </table></div></div>`;

  const gajiRows = gajis.slice().reverse().map((g) => {
    const bersih = (+g.nominal || 0) - (+g.pot_kasbon || 0) - (+g.pot_rugi || 0);
    return `<tr><td>${esc(g.bulan || "-")}</td><td class="n">${rp(g.nominal)}</td><td class="n neg">-${rp(g.pot_kasbon)}</td><td class="n neg">-${rp(g.pot_rugi)}</td><td class="n pos"><b>${rp(bersih)}</b></td><td>${badge(g.status)}</td><td>${esc(g.ket || "-")}</td><td><button class="btn s" onclick="openForm('gaji',${g.id})">Ubah</button> <button class="btn s x" onclick="del('gaji',${g.id})">Hapus</button></td></tr>`;
  }).join("");

  const kasbonRows = kasbons.slice().reverse().map((b) => {
    return `<tr><td>${esc(b.tgl || "-")}</td><td class="n">${rp(b.nominal)}</td><td>${badge(b.status)}</td><td>${esc(b.ket || "-")}</td><td><button class="btn s" onclick="openForm('kasbon',${b.id})">Ubah</button> <button class="btn s x" onclick="del('kasbon',${b.id})">Hapus</button></td></tr>`;
  }).join("");

  const rugiRows = rugis.slice().reverse().map((r) => {
    return `<tr><td>${esc(r.tgl || "-")}</td><td class="n">${rp(r.nominal)}</td><td>${badge(r.status)}</td><td>${esc(r.ket || "-")}</td><td><button class="btn s" onclick="openForm('gantirugi',${r.id})">Ubah</button> <button class="btn s x" onclick="del('gantirugi',${r.id})">Hapus</button></td></tr>`;
  }).join("");

  const absenRows = absens.slice().reverse().map((a) => {
    return `<tr><td>${esc(a.tgl || "-")}</td><td>${badge(a.status)}</td><td>${esc(a.ket || "-")}</td><td><button class="btn s" onclick="openForm('absen',${a.id})">Ubah</button> <button class="btn s x" onclick="del('absen',${a.id})">Hapus</button></td></tr>`;
  }).join("");

  return (
    `<div class="bar"><button class="btn" onclick="go('karyawan')">Kembali ke daftar karyawan</button><span class="sp"></span><button class="btn" onclick="window.print()">Cetak Profil</button><button class="btn p" onclick="openForm('karyawan',${k.id})">Ubah data karyawan</button></div>
    <div class="panel"><div class="pb">
      <h2 style="margin:0;font:600 24px Fraunces,Georgia,serif">${esc(k.nama)}</h2>
      <p style="color:var(--mut);margin:6px 0 0">Posisi: <b>${esc(k.posisi || "-")}</b> | Kontak: ${esc(k.kontak || "-")} | Gaji Pokok Terdaftar: <b>${rp(k.gaji)}</b></p>
    </div></div>` +
    stats([
      ["Gaji Pokok", rp(k.gaji)],
      ["Sisa Kasbon Aktif", `<span class="${sisaKasbon ? "neg" : "pos"}">${rp(sisaKasbon)}</span>`],
      ["Sisa Ganti Rugi", `<span class="${sisaRugi ? "neg" : "pos"}">${rp(sisaRugi)}</span>`],
      ["Total Riwayat Pembayaran Gaji", rp(totalGajiDibayar)],
      ["Tingkat Kehadiran", `${hadirPct(k)} (${totalHadir} hadir)`],
    ]) +
    miniTable("Riwayat Pembayaran Gaji", "gaji", ["Bulan", "Gaji Pokok", "Pot. Kasbon", "Pot. Ganti Rugi", "Gaji Bersih", "Status", "Keterangan"], gajiRows) +
    miniTable("Riwayat Kasbon Karyawan", "kasbon", ["Tanggal", "Nominal", "Status", "Keperluan"], kasbonRows) +
    miniTable("Riwayat Ganti Rugi Karyawan", "gantirugi", ["Tanggal", "Nominal", "Status", "Alasan / Kerusakan"], rugiRows) +
    miniTable("Riwayat Absensi", "absen", ["Tanggal", "Status Kehadiran", "Keterangan"], absenRows)
  );
}

function lap() {
  const key = {
    hari: (t) => t,
    minggu: (t) => {
      const d = new Date(t);
      d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      return d.toISOString().slice(0, 10);
    },
    bulan: (t) => t.slice(0, 7),
  }[per];
  const g = {};
  D.keu.forEach((k) => {
    if (!k.tgl) return;
    const p = key(k.tgl);
    g[p] = g[p] || { m: 0, k: 0 };
    g[p][k.tipe == "masuk" ? "m" : "k"] += +k.nominal || 0;
  });
  const ks = Object.keys(g)
    .sort()
    .reverse()
    .slice(0, per == "hari" ? 31 : per == "minggu" ? 12 : 12);
  const lab = { hari: "Tanggal", minggu: "Minggu mulai", bulan: "Bulan" }[
    per
  ];
  const tm = sum(ks, (p) => g[p].m),
    tk = sum(ks, (p) => g[p].k);
  return (
    `<div class="bar"><div class="tabs">${[
      ["hari", "Harian"],
      ["minggu", "Mingguan"],
      ["bulan", "Bulanan"],
    ]
      .map(
        ([v, l]) =>
          `<button class="${per == v ? "on" : ""}" onclick="per='${v}';render()">${l}</button>`,
      )
      .join(
        "",
      )}</div><span class="sp"></span><button class="btn" onclick="csv('keu')">Export CSV</button><button class="btn p" onclick="window.print()">Cetak laporan</button></div>` +
    stats([
      ["Pemasukan", rp(tm)],
      ["Pengeluaran", rp(tk)],
      [
        "Selisih",
        `<span class="${tm - tk < 0 ? "neg" : "pos"}">${rp(tm - tk)}</span>`,
      ],
      ["Saldo kas saat ini", rp(kas())],
    ]) +
    `<div class="panel"><h3>Grafik ${lab.toLowerCase()}</h3><div class="pb"><canvas id="c4"></canvas></div></div>
 <div class="panel"><div class="tw"><table><tr><th>${lab}</th><th class="n">Masuk</th><th class="n">Keluar</th><th class="n">Selisih</th></tr>${
   ks
     .map((p) => {
 const s = g[p].m - g[p].k;
 return `<tr><td>${p}</td><td class="n pos">${rp(g[p].m)}</td><td class="n neg">${rp(g[p].k)}</td><td class="n ${s < 0 ? "neg" : ""}">${rp(s)}</td></tr>`;
     })
     .join("") ||
   '<tr><td colspan="4" class="empty">Belum ada transaksi di Kas Harian.</td></tr>'
 }</table></div></div>`
  );
}
function settings() {
  return `<div class="panel"><h3>Backup dan pemulihan</h3><div class="pb"><p style="margin-top:0;color:var(--mut)">Data tersimpan otomatis di browser pada perangkat ini. Export backup secara rutin, misalnya tiap minggu, agar data aman jika browser dibersihkan atau perangkat diganti.</p><button class="btn p" onclick="exp()">Export backup (JSON)</button> <label style="display:inline-flex;margin-left:10px">Import backup<input type="file" accept=".json" onchange="imp(this.files[0])"></label></div></div>
 <div class="panel"><h3>Hapus semua data</h3><div class="pb"><button class="btn x" onclick="resetAll()">Hapus semua data</button></div></div>`;
}

/* forms */
function fld(f, v, pre) {
  const [k, l, t] = f;
  const val = v != null ? v : pre && pre[k] != null ? pre[k] : "";
  let i;
  const full =
    k == "ket" ||
    k == "alamat" ||
    k == "link" ||
    k == "item" ||
    (k == "nama" && false)
      ? ' style="grid-column:1/-1"'
      : "";
  if (Array.isArray(t))
    i = `<select name="${k}">${t.map((o) => `<option ${o == val ? "selected" : ""}>${o}</option>`).join("")}</select>`;
  else if (typeof t == "string" && t.startsWith("ref:")) {
    const opt = t.endsWith("?"),
      r = t.slice(4).replace("?", "");
    const emptyMsg = 'Belum ada data ' + E[r].s.toLowerCase() + ' (Klik "+ Tambah ' + E[r].s + '")';
    i = `
      <div class="ref-wrap">
        <select name="${k}" id="sel_${k}" ${opt ? "" : "required"}>
          ${opt ? '<option value="">Tidak ada</option>' : D[r].length ? '<option value="">-- Pilih ' + E[r].s + ' --</option>' : '<option value="">' + emptyMsg + '</option>'}
          ${D[r].map((x) => `<option value="${x.id}" ${x.id == val ? "selected" : ""}>${esc(x.nama)}</option>`).join("")}
        </select>
        <button type="button" class="btn s ref-btn" onclick="quickAddRef('${r}','sel_${k}')" title="Tambah ${esc(E[r].s)} baru secara langsung">+ Tambah ${esc(E[r].s)}</button>
      </div>`;
  } else if (t == "pdf" || t == "pdf?") {
    const isOpt = t == "pdf?";
    const hasExisting = Boolean(val);
    const existingName = (pre && pre.pdf_name) || "Dokumen tersimpan";
    i = `
      <input type="file" name="${k}_file" accept=".pdf,application/pdf" ${!isOpt && !hasExisting ? "required" : ""} style="padding:6px">
      ${hasExisting ? `<div style="font-size:12px;color:var(--pri);margin-top:4px">✓ ${esc(existingName)} (Pilih file baru jika ingin mengganti)</div>` : ""}
      <input type="hidden" name="${k}" value="${esc(val)}">
      <input type="hidden" name="${k}_name" value="${esc(pre && pre.pdf_name ? pre.pdf_name : "")}">
    `;
  } else if (t == "n" || t == "q")
    i = `<input type="number" step="any" min="0" name="${k}" value="${esc(val)}" required>`;
  else if (t == "d")
    i = `<input type="date" name="${k}" value="${esc(val || today())}" required>`;
  else if (t == "m")
    i = `<input type="month" name="${k}" value="${esc(val || today().slice(0, 7))}" required>`;
  else
    i = `<input name="${k}" value="${esc(val)}" ${k == "ket" || k == "kontak" || k == "link" || (k == "kategori" && false) ? "" : "required"}>`;
  return `<label${full}>${l}${i}</label>`;
}
window.openForm = (k, id, pre) => {
  const e = E[k],
    r = id ? D[k].find((x) => x.id == id) : null,
    d = document.getElementById("dlg");
  const ctx = r || pre || {};
  d.innerHTML = `<h3>${r ? "Ubah" : "Tambah"} ${e.s.toLowerCase()}</h3><form method="dialog" id="fm">${e.f.map((f) => fld(f, r ? r[f[0]] : null, ctx)).join("")}<div class="full"><button type="button" class="btn" onclick="dlg.close()">Batal</button><button class="btn p">Simpan</button></div></form>`;
  d.showModal();
  const formEl = document.getElementById("fm");
  formEl.onsubmit = async (ev) => {
    ev.preventDefault();
    const o = r || { id: Date.now() };
    const fd = new FormData(ev.target);

    // Read any PDF file inputs as base64 data URLs
    const pdfFields = e.f.filter((f) => f[2] == "pdf" || f[2] == "pdf?");
    for (const [fn] of pdfFields) {
      const fileInput = formEl.querySelector(`input[name="${fn}_file"]`);
      const file = fileInput && fileInput.files && fileInput.files[0];
      if (file) {
        if (file.type && file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
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
      if (!n.endsWith("_file") && !n.endsWith("_name") && !pdfFields.some((pf) => pf[0] === n)) {
        o[n] = v;
      }
    });

    e.f.forEach(([n, , t]) => {
      if (t == "n" || t == "q") o[n] = +o[n] || 0;
    });

    if (!r) D[k].push(o);
    save();
    d.close();
    render(true);
    toast(r ? "Perubahan disimpan" : e.s + " ditambahkan");
  };
};

window.quickAddRef = (targetKey, selectElementId) => {
  const e = E[targetKey];
  if (!e) return;
  // Prompt user with a simple quick add dialog or prompt
  const name = prompt(`Masukkan nama ${e.s.toLowerCase()} baru:`);
  if (!name || !name.trim()) return;

  const newItem = { id: Date.now(), nama: name.trim() };
  // Default values for common entity fields
  if (targetKey === "alat") {
    newItem.kode = "Alat Standar";
    newItem.kondisi = "Baik";
    newItem.jumlah = 1;
    newItem.harga = 0;
    newItem.ket = "Gudang Peralatan";
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
  save();

  // Update the select element inside the active dialog
  const sel = document.getElementById(selectElementId);
  if (sel) {
    const isOpt = sel.querySelector('option[value=""]');
    const wasEmpty = sel.options.length <= 1;
    // Rebuild options
    const optHtml = (wasEmpty ? '' : '<option value="">-- Pilih ' + e.s + ' --</option>') +
      D[targetKey].map((x) => `<option value="${x.id}" ${x.id == newItem.id ? "selected" : ""}>${esc(x.nama)}</option>`).join("");
    sel.innerHTML = optHtml;
    sel.value = newItem.id;
  }
  toast(`${e.s} "${newItem.nama}" berhasil ditambahkan & terpilih!`);
};
window.del = (k, id) => {
  if (confirm("Hapus data ini? Tindakan ini tidak bisa dibatalkan.")) {
    D[k] = D[k].filter((x) => x.id != id);
    save();
    render(true);
    toast("Data dihapus");
  }
};
window.csv = (k) => {
  const e = E[k],
    q = (s) => '"' + String(s).replace(/"/g, '""') + '"';
  const rows = [e.f.map((f) => q(f[1])).join(",")].concat(
    D[k].map((r) => e.f.map((f) => q(disp(f, r[f[0]], true))).join(",")),
  );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob(["\ufeff" + rows.join("\n")], { type: "text/csv" }),
  );
  a.download = k + "-" + today() + ".csv";
  a.click();
};
window.exp = () => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([JSON.stringify(D, null, 2)], { type: "application/json" }),
  );
  a.download = "backup-" + today() + ".json";
  a.click();
};
window.imp = (f) => {
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const x = JSON.parse(r.result);
      if (!confirm("Import akan menimpa data saat ini. Lanjutkan?"))
        return;
      D = x;
      Object.keys(E).forEach((k) => (D[k] = D[k] || []));
      save();
      render();
      toast("Import berhasil");
    } catch (e) {
      toast("File backup tidak valid");
    }
  };
  r.readAsText(f);
};
window.resetAll = () => {
  if (confirm("Hapus SEMUA data? Pastikan sudah export backup.")) {
    localStorage.removeItem(KEY);
    location.reload();
  }
};
window.go = (k, id) => {
  cur = k;
  if (k == "pd") curP = id;
  if (k == "kd") curK = id;
  document.getElementById("side").classList.remove("open");
  render();
  window.scrollTo(0, 0);
};
window.showDate = () => toast(document.getElementById("dt").textContent);

/* charts */
const css = getComputedStyle(document.documentElement);
Chart.defaults.font.family = "'IBM Plex Sans',system-ui,sans-serif";
Chart.defaults.color = "#5F6F55";
Chart.defaults.responsive = true;
Chart.defaults.maintainAspectRatio = false;
const mk = (id, c) => {
  const el = document.getElementById(id);
  if (el) charts.push(new Chart(el, c));
};
const ax = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        maxRotation: 45,
        minRotation: 0,
        font: { size: window.innerWidth < 600 ? 11 : 12 },
      },
    },
    y: {
      grid: { color: "#EBF2E3" },
      ticks: {
        font: { size: window.innerWidth < 600 ? 11 : 12 },
        callback: (v) => {
          if (Math.abs(v) >= 1e9) return (v / 1e9).toFixed(1).replace(/\.0$/, "") + " M";
          if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1).replace(/\.0$/, "") + " jt";
          if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(0) + " rb";
          return v;
        },
      },
    },
  },
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        boxWidth: 12,
        padding: 12,
        font: { size: 12 },
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.dataset.label || ""}: ${rp(ctx.raw)}`,
      },
    },
  },
};
function charting() {
  if (cur == "dash") {
    const ms = [...Array(6)].map((_, i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - 5 + i);
      return d.toISOString().slice(0, 7);
    });
    mk("c1", {
      type: "bar",
      data: {
        labels: ms,
        datasets: [
          {
            label: "Masuk",
            data: ms.map((m) => mSum(m, "masuk")),
            backgroundColor: "#3B7D23",
          },
          {
            label: "Keluar",
            data: ms.map((m) => mSum(m, "keluar")),
            backgroundColor: "#FFE81F",
          },
        ],
      },
      options: ax,
    });
    const st = {};
    D.proj.forEach((p) => (st[p.status] = (st[p.status] || 0) + 1));
    mk("c2", {
      type: "doughnut",
      data: {
        labels: Object.keys(st),
        datasets: [
          {
            data: Object.values(st),
            backgroundColor: ["#3B7D23", "#A8D58C", "#FFE81F"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              boxWidth: 12,
              padding: 10,
              font: { size: 12 },
            },
          },
        },
      },
    });
  }
  if (cur == "supply" || cur == "inv") {
    const list = cur == "supply" ? D.supply : D.inv;
    mk("c3", {
      type: "bar",
      data: {
        labels: list.map((i) => i.nama),
        datasets: [
          {
            label: "Stok kini",
            data: list.map(stok),
            backgroundColor: "#3B7D23",
          },
          {
            label: "Minimum",
            data: list.map((i) => +i.minStok || 0),
            backgroundColor: "#FFE81F",
          },
        ],
      },
      options: ax,
    });
  }
  if (cur == "alat") {
    const kondisiCount = { Baik: 0, "Rusak Ringan": 0, "Rusak Berat": 0 };
    (D.alat || []).forEach((a) => {
      const k = a.kondisi || "Baik";
      kondisiCount[k] = (kondisiCount[k] || 0) + (+a.jumlah || 1);
    });
    mk("c_alat", {
      type: "doughnut",
      data: {
        labels: Object.keys(kondisiCount),
        datasets: [
          {
            data: Object.values(kondisiCount),
            backgroundColor: ["#3B7D23", "#FFE81F", "#B93A2B"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              boxWidth: 12,
              padding: 10,
              font: { size: 12 },
            },
          },
        },
      },
    });
  }
  if (cur == "sales") {
    const sStaff = (D.sales || []).filter((s) => !s.divisi || s.divisi === "Sales");
    mk("c5", {
      type: "bar",
      data: {
        labels: sStaff.map((s) => s.nama),
        datasets: [
          {
            label: "Omzet",
            data: sStaff.map((s) =>
              sum(
                D.proj.filter((p) => p.sales == s.id),
                (p) => p.nilai,
              ),
            ),
            backgroundColor: "#3B7D23",
          },
          {
            label: "Target",
            data: sStaff.map((s) => +s.target || 0),
            backgroundColor: "#FFE81F",
          },
        ],
      },
      options: ax,
    });
  }
  if (cur == "lap") {
    const key = {
      hari: (t) => t,
      minggu: (t) => {
        const d = new Date(t);
        d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
        return d.toISOString().slice(0, 10);
      },
      bulan: (t) => t.slice(0, 7),
    }[per];
    const g = {};
    D.keu.forEach((k) => {
      if (!k.tgl) return;
      const p = key(k.tgl);
      g[p] = g[p] || { m: 0, k: 0 };
      g[p][k.tipe == "masuk" ? "m" : "k"] += +k.nominal || 0;
    });
    const ks = Object.keys(g).sort().slice(-12);
    mk("c4", {
      type: "bar",
      data: {
        labels: ks,
        datasets: [
          {
            label: "Masuk",
            data: ks.map((p) => g[p].m),
            backgroundColor: "#3B7D23",
          },
          {
            label: "Keluar",
            data: ks.map((p) => g[p].k),
            backgroundColor: "#FFE81F",
          },
        ],
      },
      options: ax,
    });
  }
}

function render(keepFocus) {
  charts.forEach((c) => c.destroy());
  charts = [];
  const n = alerts().length;
  document.getElementById("side").innerHTML =
    `<div class="brand">Manajemen Operasional</div><small>Kontraktor dan proyek</small>` +
    NAV.map(
      ([g, items]) =>
        `<div class="grp">${g}</div>` +
        items
          .map(
            ([k, l]) =>
              `<button class="${k == cur || (cur == "pd" && k == "proj") || (cur == "kd" && k == "karyawan") ? "on" : ""}" onclick="go('${k}')">${l}${k == "alert" && n ? `<span class="bd">${n}</span>` : ""}</button>`,
          )
          .join(""),
    ).join("");
  document.getElementById("ttl").textContent = TITLE[cur] || E[cur].t;
  const tgl = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  document.getElementById("dt").textContent = tgl;
  const cal = document.getElementById("cal");
  cal.title = tgl;
  cal.setAttribute("aria-label", tgl);
  const bell = document.getElementById("bell");
  const bellTxt = n ? n + " peringatan" : "Tidak ada peringatan";
  bell.innerHTML =
    `<span class="bt">${bellTxt}</span><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>` +
    (n ? `<span class="cnt">${n > 99 ? "99+" : n}</span>` : "");
  bell.title = bellTxt;
  bell.setAttribute("aria-label", bellTxt);
  document.getElementById("main").innerHTML =
    cur == "dash"
      ? dash()
      : cur == "alert"
        ? `<div class="panel">${alertList()}</div>`
        : cur == "lap"
          ? lap()
          : cur == "set"
            ? settings()
            : cur == "pd"
              ? projDetail()
              : cur == "kd"
                ? karyDetail()
                : listPage(cur);
  if (keepFocus) {
    const s = document.getElementById("srch");
    if (s && document.activeElement !== s && Q[cur]) {
      s.focus();
      s.setSelectionRange(s.value.length, s.value.length);
    }
  }
  charting();
}
render();
