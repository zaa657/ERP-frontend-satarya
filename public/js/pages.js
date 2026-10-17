/* =====================================================================
   SATARYA ERP — TAMPILAN HALAMAN (pages.js)
   Dashboard, Kanban, List/Table, Detail, Arus Kas, P&L, Settings, Charts
   ===================================================================== */
"use strict";

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
    if (typeof window.notifyOwnerViaN8n === "function") {
        window.notifyOwnerViaN8n(
            `Ubah Status (${old} → ${newStatus})`,
            "proj",
            p,
        );
    }
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
    if (k === "supplier")
        return [
            ["Total Supplier", (D.supplier || []).length],
            [
                "Toko Material",
                (D.supplier || []).filter((v) =>
                    (v.kategori || "").toLowerCase().includes("material"),
                ).length,
            ],
            [
                "Besi & Baja",
                (D.supplier || []).filter((v) =>
                    (v.kategori || "").toLowerCase().includes("besi"),
                ).length,
            ],
            [
                "Aluminium & Kaca",
                (D.supplier || []).filter((v) =>
                    (v.kategori || "").toLowerCase().includes("aluminium"),
                ).length,
            ],
        ];
    if (k === "vendor")
        return [
            ["Total Mitra / Vendor", (D.vendor || []).length],
            [
                "Sub-kontraktor",
                (D.vendor || []).filter(
                    (v) =>
                        (v.kategori || "")
                            .toLowerCase()
                            .includes("sub-kontraktor") ||
                        (v.kategori || "").toLowerCase().includes("subkon"),
                ).length,
            ],
            [
                "Sewa Alat & Mesin",
                (D.vendor || []).filter((v) =>
                    (v.kategori || "").toLowerCase().includes("alat"),
                ).length,
            ],
            [
                "Jasa Konstruksi",
                (D.vendor || []).filter(
                    (v) =>
                        (v.kategori || "").toLowerCase().includes("jasa") ||
                        (v.kategori || "").toLowerCase().includes("tukang"),
                ).length,
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
                    `<div class="quick">
            <button class="btn btn-sm btn-soft" onclick="go('pd',${r.id})">Lihat Detail →</button>
            <button class="btn btn-sm" onclick="printInvoice(null,${r.id})">${I("print")} Cetak</button>
          </div>`,
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
                        (+r.nominal || 0) -
                            (+r.pot_kasbon || 0) -
                            (+r.pot_rugi || 0),
                    );
                    return `<b class="pos">${rp(bersih)}</b>`;
                },
            ],
        ];
    if (k === "vendor" || k === "supplier")
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
    if (k === "keu")
        return [
            [
                "Bukti Kas",
                (r) =>
                    `<button class="btn btn-sm btn-soft" onclick="openBuktiKasModal(${r.id})" title="Cetak atau Ekspor Bukti Kas (PDF/JPG)">${I("filePdf")} Bukti / Kwitansi</button>`,
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
    if (
        t === "pdf" ||
        t === "pdf?" ||
        t === "file" ||
        t === "file?" ||
        f[0] === "pdf" ||
        f[0] === "lampiran"
    ) {
        const name =
            (r && (r[f[0] + "_name"] || r.lampiran_name || r.pdf_name)) ||
            (v ? "Lampiran" : "");
        if (plain) return name || "-";
        if (!v) return '<span class="muted">-</span>';
        const ext = (name.split(".").pop() || "").toLowerCase();
        let ico = "file";
        if (ext === "pdf") ico = "filePdf";
        else if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext))
            ico = "image";
        else if (["xlsx", "xls", "csv", "ods"].includes(ext))
            ico = "fileSpreadsheet";
        return `<a class="file-pill" href="${esc(v)}" download="${esc(name)}" target="_blank" rel="noopener">${I(ico)} ${esc(name)}</a>`;
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
                lampiran: x.lampiran,
                lampiran_name: x.lampiran_name,
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
    ${
        k === "keu"
            ? `<button class="btn btn-soft" onclick="openExportKeuModal('pdf')">${I("filePdf")}Ekspor PDF</button>
    <button class="btn btn-soft" onclick="openExportKeuModal('jpg')">${I("image")}Ekspor JPG</button>`
            : ""
    }
    <button class="btn" onclick="csv('${k}')">${I("download")}Export CSV</button>
    ${k === "proj" ? `<button class="btn" onclick="go('kanban')">${I("kanban")}Papan Kanban</button>` : ""}
    ${k === "invoice" ? `<button class="btn" onclick="printInvoice()">${I("print")}Cetak Template Invoice</button>` : ""}
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
    <button class="btn" onclick="printInvoice(null,${p.id})">${I("print")}Cetak Invoice</button>
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
    <button class="btn" onclick="printInvoice()">${I("print")}Cetak Invoice</button>
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
    <button class="btn btn-soft" onclick="openExportKeuModal('pdf')">${I("filePdf")}Ekspor PDF</button>
    <button class="btn btn-soft" onclick="openExportKeuModal('jpg')">${I("image")}Ekspor JPG</button>
    <button class="btn" onclick="csv('keu')">${I("download")}Export CSV</button>
    <button class="btn btn-primary" onclick="printInvoice()">${I("print")}Cetak Invoice</button>`;

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
    <button class="btn btn-primary" onclick="printInvoice()">${I("print")}Cetak Invoice</button>`;

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
