/* =====================================================================
   SATARYA ERP — EKSPOR DOKUMEN & CETAK (export.js)
   Cetak Invoice, Ekspor Kas Harian (PDF & JPG), Bukti Kas BKM/BKK
   ===================================================================== */
"use strict";


/* ---------------------------------------------------------------------
   15. CETAK INVOICE & PELUNASAN KE KAS
   --------------------------------------------------------------------- */
function renderInvoiceTemplate(id, projId) {
    const area = $("#print");
    if (!area) return;

    const inv =
        id != null
            ? D.invoice.find((x) => x.id == id)
            : projId != null
              ? D.invoice
                    .slice()
                    .reverse()
                    .find((x) => x.proj == projId) || null
              : null;
    const p =
        inv && inv.proj
            ? D.proj.find((x) => x.id == inv.proj) || {}
            : projId != null
              ? D.proj.find((x) => x.id == projId) || {}
              : {};

    const cleanStr = (v) => {
        const s = String(v == null ? "" : v).trim();
        return s === "-" ? "" : s;
    };

    const fmtSlashDate = (s) => {
        const c = cleanStr(s);
        if (!c) return "";
        const parts = c.split("-");
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return c;
    };

    const rpPlain = (n) => {
        const val = +n || 0;
        return val > 0 ? "Rp" + Math.round(val).toLocaleString("id-ID") : "";
    };

    const klienName = inv ? cleanStr(p.klien || inv.klien) : cleanStr(p.klien);
    const tglStr = inv ? fmtSlashDate(inv.tgl) : "";
    const alamatStr = inv
        ? cleanStr(p.alamat || inv.alamat)
        : cleanStr(p.alamat);
    const noInv = inv ? cleanStr(inv.no) : "";

    const hasProd = Boolean(inv && (cleanStr(inv.uraian) || +inv.nominal > 0));
    const prodName = hasProd ? cleanStr(inv.uraian) : "";
    const qtyVal = hasProd ? +inv.qty || 1 : "";
    const totalVal = hasProd ? +inv.nominal || 0 : 0;
    const priceVal = hasProd
        ? +inv.harga > 0
            ? +inv.harga
            : totalVal / (+inv.qty || 1)
        : 0;

    const specLines =
        inv && inv.spesifikasi
            ? String(inv.spesifikasi)
                  .split(/\r?\n/)
                  .map((s) => s.trim())
                  .filter(Boolean)
            : [];

    const estimasiStr = inv ? cleanStr(inv.estimasi) : "";

    area.innerHTML = `
    <div class="inv-doc">
      <svg class="inv-bg-arc" viewBox="0 0 380 230" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="invArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f7f7f8" />
            <stop offset="100%" stop-color="#e5e6e8" />
          </linearGradient>
        </defs>
        <path d="M 110,0 A 230,200 0 0,0 380,175 L 380,110 A 165,135 0 0,1 185,0 Z" fill="url(#invArcGrad)" />
      </svg>

      <div class="inv-body">
        <div class="inv-header">
          <div class="inv-company">
            <img src="img/invoice-logo.png" alt="CV. Satu Atap Karya" class="inv-logo-img">
            <div class="inv-comp-name">CV. SATU ATAP KARYA</div>
            <div class="inv-comp-sub">Sub-kontraktor Spesialis</div>
          </div>
          <div class="inv-heading">
            <div class="inv-h1">INVOICE</div>
            <div class="inv-h1">PENAWARAN</div>
          </div>
        </div>

        <div class="inv-info-row">
          <div class="inv-client">
            <div class="inv-client-name">${esc(klienName)}</div>
            <div class="inv-client-meta">${esc(tglStr)}</div>
            <div class="inv-client-meta">${esc(alamatStr)}</div>
          </div>
          <div class="inv-num-box">
            <div class="inv-num-lbl">INVOICE#</div>
            <div class="inv-num-val">${esc(noInv)}</div>
          </div>
        </div>

        <table class="inv-prod-tbl">
          <thead>
            <tr>
              <th style="text-align:left">PRODUCTS</th>
              <th style="text-align:center;width:160px">PRICE</th>
              <th style="text-align:center;width:90px">QTY</th>
              <th style="text-align:right;width:170px">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr class="inv-spacer-row"><td colspan="4"></td></tr>
            <tr class="inv-row-alt">
              <td>${esc(prodName)}</td>
              <td style="text-align:center">${rpPlain(priceVal)}</td>
              <td style="text-align:center">${esc(qtyVal)}</td>
              <td style="text-align:right">${rpPlain(totalVal)}</td>
            </tr>
            <tr class="inv-row-white">
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr class="inv-row-alt">
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <div class="inv-spec-wrap">
          <div class="inv-spec-head">${specLines.length ? "SPESIFIKASI :" : ""}</div>
          <div class="inv-spec-row inv-row-white">${specLines[0] ? `• ${esc(specLines[0].replace(/^[•\-*]\s*/, ""))}` : ""}</div>
          <div class="inv-spec-row inv-row-alt">${specLines[1] ? `• ${esc(specLines[1].replace(/^[•\-*]\s*/, ""))}` : ""}</div>
          ${specLines
              .slice(2)
              .map(
                  (line, idx) =>
                      `<div class="inv-spec-row ${idx % 2 === 0 ? "inv-row-white" : "inv-row-alt"}">• ${esc(line.replace(/^[•\-*]\s*/, ""))}</div>`,
              )
              .join("")}
        </div>

        <div class="inv-summary-row">
          <div class="inv-pay-method">
            <div class="inv-pay-title">METODE PEMBAYARAN</div>
            <div class="inv-pay-line">BANK BRI ACCOUNT : 042001039964500</div>
            <div class="inv-pay-line">NAME: MUHAMMAD APRIL CAHYADI</div>
          </div>
          <div class="inv-sub-box">
            <div class="inv-sub-line">
              <span>SUBTOTAL</span>
              <span>${rpPlain(totalVal)}</span>
            </div>
            <div class="inv-sub-line">
              <span>ESTIMASI HARI</span>
              <span>${esc(estimasiStr)}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="inv-footer">
        <div class="inv-contact-wrap">
          <img src="img/invoice-contact.png" alt="satuatapkarya.com | 0896-3018-1621 | satuatapkarya@gmail.com" class="inv-contact-img">
        </div>
      </div>
    </div>`;
}

window.printInvoice = (id, projId) => {
    renderInvoiceTemplate(id, projId);
    const area = $("#print");
    if (!area) return;

    document.body.classList.add("printing-inv");
    const imgs = Array.from(area.querySelectorAll("img"));
    Promise.all(
        imgs.map((img) =>
            img.complete
                ? Promise.resolve()
                : new Promise((res) => {
                      img.onload = res;
                      img.onerror = res;
                  }),
        ),
    ).then(() => {
        setTimeout(() => {
            window.print();
        }, 60);
    });
};

window.addEventListener("beforeprint", () => {
    const area = $("#print");
    if (area && !area.innerHTML.trim()) {
        renderInvoiceTemplate(null, S.page === "pd" ? S.id : null);
    }
    document.body.classList.add("printing-inv");
});

window.addEventListener("afterprint", () => {
    document.body.classList.remove("printing-inv");
});

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
   15B. EKSPOR DOKUMEN KAS HARIAN (PDF & JPG)
   --------------------------------------------------------------------- */
function terbilang(n) {
    n = Math.abs(Math.round(n));
    if (n === 0) return "Nol";
    const bil = [
        "",
        "Satu",
        "Dua",
        "Tiga",
        "Empat",
        "Lima",
        "Enam",
        "Tujuh",
        "Delapan",
        "Sembilan",
        "Sepuluh",
        "Sebelas",
    ];
    if (n < 12) return bil[n];
    if (n < 20) return (terbilang(n - 10) + " Belas").trim();
    if (n < 100)
        return (
            terbilang(Math.floor(n / 10)) +
            " Puluh " +
            terbilang(n % 10)
        ).trim();
    if (n < 200) return ("Seratus " + terbilang(n - 100)).trim();
    if (n < 1000)
        return (
            terbilang(Math.floor(n / 100)) +
            " Ratus " +
            terbilang(n % 100)
        ).trim();
    if (n < 2000) return ("Seribu " + terbilang(n - 1000)).trim();
    if (n < 1000000)
        return (
            terbilang(Math.floor(n / 1000)) +
            " Ribu " +
            terbilang(n % 1000)
        ).trim();
    if (n < 1000000000)
        return (
            terbilang(Math.floor(n / 1000000)) +
            " Juta " +
            terbilang(n % 1000000)
        ).trim();
    if (n < 1000000000000)
        return (
            terbilang(Math.floor(n / 1000000000)) +
            " Miliar " +
            terbilang(n % 1000000000)
        ).trim();
    return (
        terbilang(Math.floor(n / 1000000000000)) +
        " Triliun " +
        terbilang(n % 1000000000000)
    ).trim();
}

window.printElement = (node) => {
    const area = $("#print");
    if (!area) return;
    area.innerHTML = node.outerHTML;
    document.body.classList.add("printing-inv");
    const imgs = Array.from(area.querySelectorAll("img"));
    Promise.all(
        imgs.map((img) =>
            img.complete
                ? Promise.resolve()
                : new Promise((res) => {
                      img.onload = res;
                      img.onerror = res;
                  }),
        ),
    ).then(() => {
        setTimeout(() => {
            window.print();
        }, 60);
    });
};

window.exportNodeToJpg = async (node, filename) => {
    try {
        toast("Sedang memproses ekspor gambar JPG...", "info");
        if (typeof html2canvas === "undefined") {
            const s = document.createElement("script");
            s.src = "js/html2canvas.min.js";
            await new Promise((res, rej) => {
                s.onload = res;
                s.onerror = rej;
                document.head.appendChild(s);
            });
        }
        const canvas = await html2canvas(node, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            logging: false,
        });
        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
        const a = document.createElement("a");
        a.download = (filename || "Laporan_Kas_Harian") + ".jpg";
        a.href = dataUrl;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast("Dokumen JPG berhasil diunduh!", "ok");
    } catch (err) {
        console.error("Export JPG error:", err);
        toast("Gagal mengekspor gambar JPG: " + err.message, "bad");
    }
};

window.exportNodeToPdf = async (node, filename, orientation = "p") => {
    try {
        toast("Sedang memproses ekspor dokumen PDF...", "info");
        if (typeof html2canvas === "undefined") {
            const s1 = document.createElement("script");
            s1.src = "js/html2canvas.min.js";
            await new Promise((res, rej) => {
                s1.onload = res;
                s1.onerror = rej;
                document.head.appendChild(s1);
            });
        }
        if (
            typeof window.jspdf === "undefined" &&
            typeof window.jsPDF === "undefined"
        ) {
            const s2 = document.createElement("script");
            s2.src = "js/jspdf.umd.min.js";
            await new Promise((res, rej) => {
                s2.onload = res;
                s2.onerror = rej;
                document.head.appendChild(s2);
            });
        }
        const canvas = await html2canvas(node, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            logging: false,
        });
        const imgData = canvas.toDataURL("image/jpeg", 0.95);

        const jsPDFClass = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
        if (!jsPDFClass) {
            throw new Error("Library PDF tidak dapat diinisialisasi.");
        }
        const pdf = new jsPDFClass(orientation, "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const printableWidth = pageWidth - margin * 2;
        const imgHeight = (canvas.height * printableWidth) / canvas.width;

        if (imgHeight <= pageHeight - margin * 2) {
            pdf.addImage(
                imgData,
                "JPEG",
                margin,
                margin,
                printableWidth,
                imgHeight,
            );
        } else {
            let heightLeft = imgHeight;
            let sY = 0;
            const sliceCanvasHeight =
                (canvas.width * (pageHeight - margin * 2)) / printableWidth;
            let pageNum = 0;

            while (heightLeft > 0) {
                const pageCanvas = document.createElement("canvas");
                pageCanvas.width = canvas.width;
                pageCanvas.height = Math.min(
                    sliceCanvasHeight,
                    canvas.height - sY,
                );
                const ctx = pageCanvas.getContext("2d");
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
                ctx.drawImage(
                    canvas,
                    0,
                    sY,
                    canvas.width,
                    pageCanvas.height,
                    0,
                    0,
                    canvas.width,
                    pageCanvas.height,
                );

                const pageData = pageCanvas.toDataURL("image/jpeg", 0.95);
                if (pageNum > 0) pdf.addPage();
                const renderHeight =
                    (pageCanvas.height * printableWidth) / canvas.width;
                pdf.addImage(
                    pageData,
                    "JPEG",
                    margin,
                    margin,
                    printableWidth,
                    renderHeight,
                );

                sY += sliceCanvasHeight;
                heightLeft -= pageHeight - margin * 2;
                pageNum++;
            }
        }

        pdf.save((filename || "Laporan_Kas_Harian") + ".pdf");
        toast("Dokumen PDF berhasil diunduh!", "ok");
    } catch (err) {
        console.error("Export PDF error:", err);
        toast("Gagal mengekspor dokumen PDF: " + err.message, "bad");
    }
};

function renderKeuDocHtml(filter = {}) {
    let list = [...(D.keu || [])];
    if (filter.proj) {
        list = list.filter((x) => x.proj == filter.proj);
    }
    if (filter.tipe && filter.tipe !== "all") {
        list = list.filter((x) => x.tipe === filter.tipe);
    }
    if (filter.bulan) {
        list = list.filter((x) => String(x.tgl || "").startsWith(filter.bulan));
    }
    if (filter.q) {
        const q = filter.q.toLowerCase();
        list = list.filter(
            (x) =>
                (x.ket || "").toLowerCase().includes(q) ||
                (x.kategori || "").toLowerCase().includes(q) ||
                (x.proj ? nm("proj", x.proj).toLowerCase().includes(q) : false),
        );
    }
    list.sort((a, b) => (a.tgl || "").localeCompare(b.tgl || ""));

    let running = 0;
    let totalIn = 0;
    let totalOut = 0;
    const rows = list
        .map((x, idx) => {
            const isMasuk = x.tipe === "masuk";
            const nominal = +x.nominal || 0;
            if (isMasuk) {
                running += nominal;
                totalIn += nominal;
            } else {
                running -= nominal;
                totalOut += nominal;
            }
            return `
            <tr>
                <td class="cen">${idx + 1}</td>
                <td><b>${fmtD(x.tgl)}</b></td>
                <td><span style="display:inline-block;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:700;background:${isMasuk ? "#dcfce7;color:#166534" : "#fee2e2;color:#991b1b"}">${isMasuk ? "KAS MASUK" : "KAS KELUAR"}</span></td>
                <td>${esc(x.kategori || "-")}</td>
                <td>${esc(x.proj ? nm("proj", x.proj) : "Kas Operasional Umum")}</td>
                <td>${esc(x.ket || "-")}</td>
                <td class="num" style="color:#166534;font-weight:600">${isMasuk ? "+" + rp(nominal) : "-"}</td>
                <td class="num" style="color:#991b1b;font-weight:600">${!isMasuk ? "-" + rp(nominal) : "-"}</td>
                <td class="num" style="font-weight:700;color:${running < 0 ? "#991b1b" : "#0f172a"}">${rp(running)}</td>
            </tr>
        `;
        })
        .join("");

    const netPeriod = totalIn - totalOut;
    const periodLabel = filter.bulan ? fmtM(filter.bulan) : "Semua Periode";
    const docNo =
        "BKH/" +
        today().replace(/-/g, "") +
        "/" +
        String(list.length).padStart(3, "0");

    return `
    <div id="keuDocContent" class="doc-export-preview">
        <div class="doc-header-kop">
            <div class="doc-kop-brand">
                <img src="img/logo.png" alt="Satarya" class="doc-kop-logo">
                <div>
                    <h1 class="doc-kop-title">SATARYA ERP</h1>
                    <div class="doc-kop-sub">Sistem Operasional Manajemen Kontraktor & Konstruksi</div>
                </div>
            </div>
            <div class="doc-kop-meta">
                <div><b>No. Dokumen:</b> ${docNo}</div>
                <div><b>Tanggal Cetak:</b> ${fmtD(today())}</div>
                <div><b>Status:</b> Terverifikasi Sistem</div>
            </div>
        </div>

        <div class="doc-title-block">
            <h2 class="doc-main-title">LAPORAN BUKU KAS HARIAN</h2>
            <div class="doc-sub-title">Periode: ${periodLabel} ${filter.proj ? "· Proyek: " + esc(nm("proj", filter.proj)) : ""}</div>
        </div>

        <div class="doc-summary-cards">
            <div class="doc-summary-card in">
                <small>Total Pemasukan</small>
                <b>+${rp(totalIn)}</b>
            </div>
            <div class="doc-summary-card out">
                <small>Total Pengeluaran</small>
                <b>-${rp(totalOut)}</b>
            </div>
            <div class="doc-summary-card net">
                <small>Surplus / Defisit</small>
                <b style="color:${netPeriod < 0 ? "#991b1b" : "#0369a1"}">${rp(netPeriod)}</b>
            </div>
            <div class="doc-summary-card">
                <small>Total Transaksi</small>
                <b>${list.length} Catatan</b>
            </div>
        </div>

        <table class="doc-table">
            <thead>
                <tr>
                    <th class="cen" style="width:36px">No</th>
                    <th style="width:85px">Tanggal</th>
                    <th style="width:90px">Jenis</th>
                    <th style="width:110px">Kategori</th>
                    <th style="width:120px">Proyek</th>
                    <th>Uraian Transaksi</th>
                    <th class="num" style="width:95px">Masuk</th>
                    <th class="num" style="width:95px">Keluar</th>
                    <th class="num" style="width:105px">Saldo</th>
                </tr>
            </thead>
            <tbody>
                ${rows || '<tr><td colspan="9" style="text-align:center;padding:24px;color:#64748b">Tidak ada catatan transaksi pada filter periode ini.</td></tr>'}
            </tbody>
            <tfoot>
                <tr>
                    <th colspan="6" style="text-align:right">TOTAL PERIODE INI</th>
                    <th class="num" style="color:#166534">+${rp(totalIn)}</th>
                    <th class="num" style="color:#991b1b">-${rp(totalOut)}</th>
                    <th class="num" style="color:${netPeriod < 0 ? "#991b1b" : "#0f172a"}">${rp(netPeriod)}</th>
                </tr>
            </tfoot>
        </table>

        <div class="doc-sign-grid">
            <div class="doc-sign-box">
                <div class="doc-sign-role">Dibuat Oleh (Admin/Kasir):</div>
                <div class="doc-sign-name">${esc(ME ? ME.n : "Admin Finansial")}</div>
            </div>
            <div class="doc-sign-box">
                <div class="doc-sign-role">Diperiksa Oleh:</div>
                <div class="doc-sign-name">( Finance Manager )</div>
            </div>
            <div class="doc-sign-box">
                <div class="doc-sign-role">Mengetahui & Menyetujui:</div>
                <div class="doc-sign-name">( Owner / Direktur )</div>
            </div>
        </div>
    </div>
    `;
}

window.openExportKeuModal = (autoFormat) => {
    let docDlg = document.getElementById("docDlg");
    if (!docDlg) {
        docDlg = document.createElement("dialog");
        docDlg.id = "docDlg";
        docDlg.className = "sheet";
        docDlg.style.maxWidth = "960px";
        docDlg.style.width = "95vw";
        docDlg.onclick = (e) => {
            if (e.target === docDlg) docDlg.close();
        };
        document.body.appendChild(docDlg);
    }

    const curMonth = today().slice(0, 7);
    let filter = { bulan: curMonth, tipe: "all", proj: "", q: "" };

    const updatePreview = () => {
        const previewContainer = docDlg.querySelector("#exportPreviewWrap");
        if (previewContainer) {
            previewContainer.innerHTML = renderKeuDocHtml(filter);
        }
    };

    docDlg.innerHTML = `
    <div class="export-modal-wrap">
        <div class="sheet-h" style="padding-bottom:12px;border-bottom:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:12px">
                <span class="mega-ico" style="width:42px;height:42px;background:var(--primary-subtle);color:var(--primary)">${I("filePdf")}</span>
                <div>
                    <h2 style="font-size:17px;font-weight:800;color:var(--text);margin:0">Ekspor Dokumen Kas Harian</h2>
                    <p style="font-size:12px;color:var(--muted);margin:2px 0 0">Unduh laporan resmi kas harian dalam format dokumen PDF atau gambar resolusi tinggi JPG.</p>
                </div>
            </div>
            <button class="icon-btn" onclick="document.getElementById('docDlg').close()">${I("x")}</button>
        </div>

        <div class="export-ctrl-bar">
            <div class="export-ctrl-left">
                <label style="font-size:12px;font-weight:700;color:var(--text-2);display:inline-flex;align-items:center;gap:6px">
                    Bulan:
                    <input type="month" value="${curMonth}" id="exportFilterMonth" style="height:34px;padding:0 8px;border-radius:var(--r-sm);border:1px solid var(--border);background:var(--surface)">
                </label>

                <label style="font-size:12px;font-weight:700;color:var(--text-2);display:inline-flex;align-items:center;gap:6px">
                    Jenis:
                    <select id="exportFilterType" style="height:34px;padding:0 8px;border-radius:var(--r-sm);border:1px solid var(--border);background:var(--surface)">
                        <option value="all">Semua (Masuk & Keluar)</option>
                        <option value="masuk">Kas Masuk Saja</option>
                        <option value="keluar">Kas Keluar Saja</option>
                    </select>
                </label>

                <label style="font-size:12px;font-weight:700;color:var(--text-2);display:inline-flex;align-items:center;gap:6px">
                    Proyek:
                    <select id="exportFilterProj" style="height:34px;padding:0 8px;border-radius:var(--r-sm);border:1px solid var(--border);background:var(--surface)">
                        <option value="">Semua Proyek & Operasional</option>
                        ${(D.proj || []).map((p) => `<option value="${p.id}">${esc(p.nama)}</option>`).join("")}
                    </select>
                </label>
            </div>

            <div class="export-ctrl-right">
                <button class="btn btn-primary" id="btnDownloadPdf" style="gap:6px">
                    ${I("filePdf")} Unduh PDF (.pdf)
                </button>
                <button class="btn btn-soft" id="btnDownloadJpg" style="gap:6px">
                    ${I("image")} Unduh JPG (.jpg)
                </button>
                <button class="btn btn-ghost" id="btnPrintDoc" style="gap:6px">
                    ${I("print")} Cetak
                </button>
            </div>
        </div>

        <div class="export-scroll-area">
            <div id="exportPreviewWrap">
                ${renderKeuDocHtml(filter)}
            </div>
        </div>
    </div>
    `;

    docDlg.showModal();

    const monthInput = docDlg.querySelector("#exportFilterMonth");
    const typeSelect = docDlg.querySelector("#exportFilterType");
    const projSelect = docDlg.querySelector("#exportFilterProj");

    monthInput.onchange = () => {
        filter.bulan = monthInput.value;
        updatePreview();
    };
    typeSelect.onchange = () => {
        filter.tipe = typeSelect.value;
        updatePreview();
    };
    projSelect.onchange = () => {
        filter.proj = projSelect.value;
        updatePreview();
    };

    const getFilename = () => {
        const periodStr = filter.bulan ? filter.bulan : today();
        return `Laporan_Kas_Harian_${periodStr}`;
    };

    docDlg.querySelector("#btnDownloadPdf").onclick = () => {
        const target = docDlg.querySelector("#keuDocContent");
        exportNodeToPdf(target, getFilename());
    };

    docDlg.querySelector("#btnDownloadJpg").onclick = () => {
        const target = docDlg.querySelector("#keuDocContent");
        exportNodeToJpg(target, getFilename());
    };

    docDlg.querySelector("#btnPrintDoc").onclick = () => {
        const target = docDlg.querySelector("#keuDocContent");
        printElement(target);
    };

    if (autoFormat === "pdf") {
        setTimeout(() => {
            const target = docDlg.querySelector("#keuDocContent");
            exportNodeToPdf(target, getFilename());
        }, 350);
    } else if (autoFormat === "jpg") {
        setTimeout(() => {
            const target = docDlg.querySelector("#keuDocContent");
            exportNodeToJpg(target, getFilename());
        }, 350);
    }
};

function renderBuktiKasHtml(id) {
    const r = (D.keu || []).find((x) => x.id == id);
    if (!r) return "<div>Data transaksi tidak ditemukan.</div>";
    const isMasuk = r.tipe === "masuk";
    const voucherType = isMasuk
        ? "BUKTI KAS MASUK (BKM)"
        : "BUKTI KAS KELUAR (BKK)";
    const voucherNo =
        (isMasuk ? "BKM" : "BKK") +
        "-" +
        (r.tgl || today()).replace(/-/g, "").slice(2) +
        "-" +
        String(r.id).slice(-4);
    const nominal = +r.nominal || 0;
    const terbilangStr = terbilang(nominal) + " Rupiah";

    return `
    <div id="buktiKasContent" class="bkm-voucher">
        <div class="bkm-head">
            <div style="display:flex;align-items:center;gap:12px">
                <img src="img/logo.png" alt="Satarya" style="width:44px;height:44px;object-fit:cover;border-radius:8px">
                <div>
                    <div style="font-size:18px;font-weight:900;color:#1b4310;line-height:1.1">SATARYA ERP</div>
                    <div style="font-size:11px;color:#64748b;font-weight:600">Kontraktor & Manajemen Konstruksi</div>
                </div>
            </div>
            <div style="text-align:right;font-size:11px;color:#64748b">
                <div><b>Tanggal:</b> ${fmtD(r.tgl)}</div>
                <div><b>No. Bukti:</b> <span style="font-family:monospace;font-weight:700;color:#0f172a">${voucherNo}</span></div>
            </div>
        </div>

        <div class="bkm-title-box">
            <span class="bkm-title-badge ${isMasuk ? "in" : "out"}">${voucherType}</span>
            <div class="bkm-no">Dokumen Transaksi Keuangan Resmi</div>
        </div>

        <div class="bkm-grid">
            <div class="bkm-lbl">${isMasuk ? "Diterima Dari" : "Dibayarkan Kepada"}</div>
            <div class="bkm-val">: ${esc(r.ket || "-")}</div>

            <div class="bkm-lbl">Kategori Transaksi</div>
            <div class="bkm-val">: <span style="display:inline-block;padding:2px 8px;border-radius:4px;background:#f1f5f9;border:1px solid #cbd5e1;font-size:11.5px">${esc(r.kategori || "-")}</span></div>

            <div class="bkm-lbl">Proyek Terkait</div>
            <div class="bkm-val">: ${esc(r.proj ? nm("proj", r.proj) : "Kas Operasional Umum")}</div>

            <div class="bkm-lbl">Uraian / Keterangan</div>
            <div class="bkm-val">: ${esc(r.ket || "-")}</div>

            ${
                r.lampiran
                    ? `
            <div class="bkm-lbl">Lampiran / Bukti</div>
            <div class="bkm-val">: <b>${esc(r.lampiran_name || "File Bukti Terlampir")}</b></div>
            `
                    : ""
            }
        </div>

        <div class="bkm-amount-box">
            <div>
                <small style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.04em">Jumlah Nominal Uang</small>
                <div class="bkm-amount-val" style="color:${isMasuk ? "#166534" : "#991b1b"}">${rp(nominal)}</div>
            </div>
            <div style="font-size:11px;color:#64748b;text-align:right">
                Status: <b>LUNAS / SELESAI</b><br>
                Kas: <b>Buku Kas Harian</b>
            </div>
        </div>

        <div class="bkm-terbilang-box">
            <div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px">Terbilang:</div>
            <b>## ${terbilangStr} ##</b>
        </div>

        <div class="bkm-sign-grid">
            <div class="bkm-sign-box">
                <div class="bkm-sign-role">Dibukukan Oleh:</div>
                <div class="bkm-sign-name">${esc(ME ? ME.n : "Kasir Operasional")}</div>
            </div>
            <div class="bkm-sign-box">
                <div class="bkm-sign-role">${isMasuk ? "Penyetor / Dari" : "Penerima Uang"}:</div>
                <div class="bkm-sign-name">( ................................... )</div>
            </div>
            <div class="bkm-sign-box">
                <div class="bkm-sign-role">Mengetahui / Menyetujui:</div>
                <div class="bkm-sign-name">( Pimpinan / Owner )</div>
            </div>
        </div>
    </div>
    `;
}

window.openBuktiKasModal = (id, autoFormat) => {
    let docDlg = document.getElementById("docDlg");
    if (!docDlg) {
        docDlg = document.createElement("dialog");
        docDlg.id = "docDlg";
        docDlg.className = "sheet";
        docDlg.style.maxWidth = "800px";
        docDlg.style.width = "95vw";
        docDlg.onclick = (e) => {
            if (e.target === docDlg) docDlg.close();
        };
        document.body.appendChild(docDlg);
    }

    const r = (D.keu || []).find((x) => x.id == id);
    if (!r) {
        toast("Data transaksi tidak ditemukan.", "bad");
        return;
    }

    const filename =
        (r.tipe === "masuk" ? "Bukti_Kas_Masuk" : "Bukti_Kas_Keluar") +
        "_" +
        r.id;

    docDlg.innerHTML = `
    <div class="export-modal-wrap" style="max-width:760px">
        <div class="sheet-h" style="padding-bottom:12px;border-bottom:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:12px">
                <span class="mega-ico" style="width:42px;height:42px;background:var(--primary-subtle);color:var(--primary)">${I("filePdf")}</span>
                <div>
                    <h2 style="font-size:17px;font-weight:800;color:var(--text);margin:0">Ekspor Bukti Kas / Kwitansi</h2>
                    <p style="font-size:12px;color:var(--muted);margin:2px 0 0">Kwitansi resmi ${r.tipe === "masuk" ? "Bukti Kas Masuk (BKM)" : "Bukti Kas Keluar (BKK)"} senilai ${rp(r.nominal)}.</p>
                </div>
            </div>
            <button class="icon-btn" onclick="document.getElementById('docDlg').close()">${I("x")}</button>
        </div>

        <div class="export-ctrl-bar">
            <div style="font-size:12.5px;font-weight:700;color:var(--text)">
                Pilih format unduhan dokumen:
            </div>
            <div class="export-ctrl-right">
                <button class="btn btn-primary" id="btnBkmPdf" style="gap:6px">
                    ${I("filePdf")} Unduh PDF (.pdf)
                </button>
                <button class="btn btn-soft" id="btnBkmJpg" style="gap:6px">
                    ${I("image")} Unduh JPG (.jpg)
                </button>
                <button class="btn btn-ghost" id="btnBkmPrint" style="gap:6px">
                    ${I("print")} Cetak Bukti
                </button>
                ${
                    r.lampiran
                        ? `<a class="btn btn-soft" href="${esc(r.lampiran)}" download="${esc(r.lampiran_name || "Bukti_Transaksi")}" target="_blank" rel="noopener" style="gap:6px">
                    ${I("download")} Lampiran (${esc(r.lampiran_name || "File")})
                </a>`
                        : ""
                }
            </div>
        </div>

        <div class="export-scroll-area">
            <div id="buktiKasWrap">
                ${renderBuktiKasHtml(id)}
            </div>
        </div>
    </div>
    `;

    docDlg.showModal();

    docDlg.querySelector("#btnBkmPdf").onclick = () => {
        const target = docDlg.querySelector("#buktiKasContent");
        exportNodeToPdf(target, filename);
    };

    docDlg.querySelector("#btnBkmJpg").onclick = () => {
        const target = docDlg.querySelector("#buktiKasContent");
        exportNodeToJpg(target, filename);
    };

    docDlg.querySelector("#btnBkmPrint").onclick = () => {
        const target = docDlg.querySelector("#buktiKasContent");
        printElement(target);
    };

    if (autoFormat === "pdf") {
        setTimeout(() => {
            const target = docDlg.querySelector("#buktiKasContent");
            exportNodeToPdf(target, filename);
        }, 350);
    } else if (autoFormat === "jpg") {
        setTimeout(() => {
            const target = docDlg.querySelector("#buktiKasContent");
            exportNodeToJpg(target, filename);
        }, 350);
    }
};
