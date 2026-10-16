/* =====================================================================
   SATARYA ERP — KOMPONEN ANTARMUKA (ui.js)
   Topbar, Drawer, Tabbar, Kalender, Form Sheet, Modals & Command Palette
   ===================================================================== */
"use strict";

const $ = (s, r) => (r || document).querySelector(s);

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
            return `<div class="nav-item"><button class="nav-btn ${isOn(g.page) ? "on" : ""}" onclick="go('${g.page}')">${I(g.ico)}<span>${g.label}</span></button></div>`;
        }
        const items = groupItems(g);
        if (!items.length) return "";
        const active = items.some((i) => isOn(i[0]));
        return `<div class="nav-item" data-dd>
      <button class="nav-btn ${active ? "on" : ""}" onclick="toggleDD(this.parentNode,event)" aria-haspopup="true">${I(g.ico)}<span>${g.label}</span>${I("chev", "caret")}</button>
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
      <span class="brand-logo"><img src="/img/logo.png" alt="Satarya"></span>
      <span><span class="brand-name">SATARYA</span><span class="brand-sub">Sistem Operasional</span></span>
    </button>
    <nav class="nav" aria-label="Navigasi utama">${navHtml}</nav>
    <div class="top-actions">
      <button class="search-trigger" onclick="openCmdk()">${I("search")}<span>Cari apa saja…</span><kbd>Ctrl K</kbd></button>
      ${renderCalWidget()}
      <button class="icon-btn" onclick="toggleTheme()" title="${dark ? "Mode terang" : "Mode gelap"}" aria-label="Ganti tema">${I(dark ? "sun" : "moon")}</button>
      <button class="icon-btn" onclick="go('alert')" title="${n} peringatan" aria-label="${n} peringatan">${I("alert")}${n ? `<span class="cnt">${n > 99 ? "99+" : n}</span>` : ""}</button>
      ${
          currentAuthUser
              ? `
        <div class="nav-account-wrap" data-dd id="nav_account_wrap">
          <button type="button" class="nav-account-btn" onclick="toggleDD(this.parentNode,event)" title="Profil Akun: ${esc(currentAuthUser.email)} (${currentAuthUser.role.toUpperCase()})" aria-label="Akun Saya" aria-haspopup="true">
            <span class="nav-account-avatar ${currentAuthUser.role}">${currentAuthUser.role === "owner" ? "OW" : "AD"}</span>
            <span class="nav-account-badge ${currentAuthUser.role}">${currentAuthUser.role.toUpperCase()}</span>
            ${I("chev", "caret")}
          </button>
          <div class="nav-account-dropdown">
            <div class="account-menu-header">
              <span class="account-menu-avatar ${currentAuthUser.role}">${currentAuthUser.role === "owner" ? "OW" : "AD"}</span>
              <div class="account-menu-info">
                <b>${esc(currentAuthUser.displayName || currentAuthUser.email.split("@")[0])}</b>
                <span>${esc(currentAuthUser.email)}</span>
              </div>
            </div>
            <div class="account-menu-divider"></div>
            <button type="button" class="account-menu-item" onclick="go('log')">
              ${I("clock")} <span>Log Aktivitas</span>
            </button>
            <button type="button" class="account-menu-item logout" onclick="logoutUser()">
              ${I("logout")} <span>Keluar / Ganti Akun</span>
            </button>
          </div>
        </div>
      `
              : `
        <div class="nav-account-wrap" data-dd id="nav_account_wrap">
          <button type="button" class="nav-account-btn" onclick="showLogin()" title="Masuk Akun" aria-label="Masuk Akun">
            <span class="nav-account-avatar" style="background:var(--lemon-600)">${I("user")}</span>
            <span class="nav-account-badge" style="background:rgba(255,255,255,0.2);color:#fff">MASUK</span>
          </button>
        </div>
      `
      }
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
      <button class="drawer-link" style="padding-left:12px" onclick="closeDrawer();showLogin()">${I("lock")}Halaman Login ${currentAuthUser ? `(${currentAuthUser.role.toUpperCase()})` : ""}</button>
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
    } else if (t === "n") {
        const displayVal = val != null && val !== "" ? formatRibuan(val) : "";
        const ph =
            k === "harga"
                ? "mis. 150.000"
                : k === "target" || k === "nilai"
                  ? "mis. 100.000.000"
                  : "mis. 5.000.000";
        const isOptN = k === "harga" || k === "pot_kasbon" || k === "pot_rugi";
        i = `<input type="text" inputmode="numeric" name="${k}" value="${esc(displayVal)}" placeholder="${ph}" data-nominal="1" autocomplete="off" ${isOptN ? "" : "required"}>`;
    } else if (t === "q") {
        const qVal = val != null && val !== "" ? val : 1;
        i = `<input type="number" step="any" min="0" name="${k}" value="${esc(qVal)}" placeholder="1" required>`;
    } else if (t === "d") {
        i = `<input type="date" name="${k}" value="${esc(val || today())}" required>`;
    } else if (t === "m") {
        i = `<input type="month" name="${k}" value="${esc(val || today().slice(0, 7))}" required>`;
    } else {
        // Default invoice number auto-generator
        const defVal = k === "no" && !val ? nextInvNo() : val;
        const entityKey = pre && pre._entity;
        const ph =
            k === "pic"
                ? entityKey === "supplier"
                    ? "mis. Ko Asen (Sales / Kasir Toko)"
                    : entityKey === "vendor"
                      ? "mis. Supriadi (PIC / Penanggung Jawab Mitra)"
                      : "mis. Ko Asen (Sales Toko) / Supriadi (PIC Mitra)"
                : k === "nama" && entityKey === "supplier"
                  ? "mis. TB. Sinar Abadi (Toko Bangunan)"
                  : k === "nama" && entityKey === "vendor"
                    ? "mis. PT. Sinergi Konstruksi Mandiri"
                    : k === "estimasi"
                      ? "mis. 7 hari kerja"
                      : `Masukkan ${l.toLowerCase()}...`;
        const isOptTxt =
            k === "ket" ||
            k === "kontak" ||
            k === "link" ||
            k === "alamat" ||
            k === "pic" ||
            k === "estimasi";
        i = `<input name="${k}" value="${esc(defVal)}" placeholder="${ph}" ${isOptTxt ? "" : "required"}>`;
    }

    return `<label class="${isFull ? "full" : ""}"><span>${l}</span>${i}</label>`;
}

window.openForm = (k, id, pre) => {
    const e = E[k];
    if (!e) return;
    const r = id ? (D[k] || []).find((x) => x.id == id) : null;
    const d = $("#dlg");
    if (!d) return;
    const ctx = { ...(r || pre || {}), _entity: k };

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
            const emp = karId
                ? (D.karyawan || []).find((x) => x.id == karId)
                : null;

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

                if (inpPotKasbon)
                    inpPotKasbon.value = formatRibuan(totalKasbon);
                if (inpPotRugi) inpPotRugi.value = formatRibuan(totalRugi);
                if (
                    inpNominal &&
                    (!r ||
                        !inpNominal.value ||
                        parseNominal(inpNominal.value) === 0)
                ) {
                    inpNominal.value = formatRibuan(emp.gaji || 0);
                }
            }

            const nominalVal = inpNominal ? parseNominal(inpNominal.value) : 0;
            const potKasbonVal = inpPotKasbon
                ? parseNominal(inpPotKasbon.value)
                : 0;
            const potRugiVal = inpPotRugi ? parseNominal(inpPotRugi.value) : 0;
            const thp = Math.max(0, nominalVal - potKasbonVal - potRugiVal);

            const unpKasbonList = karId
                ? (D.kasbon || []).filter(
                      (x) => x.kar == karId && x.status !== "Lunas",
                  )
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

        if (selKar)
            selKar.addEventListener("change", () => updateGajiCalc(true));
        if (inpNominal)
            inpNominal.addEventListener("input", () => updateGajiCalc(false));
        if (inpPotKasbon)
            inpPotKasbon.addEventListener("input", () => updateGajiCalc(false));
        if (inpPotRugi)
            inpPotRugi.addEventListener("input", () => updateGajiCalc(false));

        if (!r && selKar && selKar.value) {
            updateGajiCalc(true);
        } else {
            updateGajiCalc(false);
        }
    }

    if (k === "invoice") {
        const inpHarga = formEl.querySelector('[name="harga"]');
        const inpQty = formEl.querySelector('[name="qty"]');
        const inpNom = formEl.querySelector('[name="nominal"]');
        const syncInvTotal = () => {
            const h = inpHarga ? parseNominal(inpHarga.value) : 0;
            const q = inpQty ? +inpQty.value || 1 : 1;
            if (h > 0 && inpNom) {
                inpNom.value = formatRibuan(Math.round(h * q));
            }
        };
        if (inpHarga) inpHarga.addEventListener("input", syncInvTotal);
        if (inpQty) inpQty.addEventListener("input", syncInvTotal);
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
            if (t === "n") {
                o[n] = parseNominal(o[n]);
            } else if (t === "q") {
                o[n] = +o[n] || 0;
            }
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
                toast(
                    `Otomatis melunasi ${pelunasanInfo.join(" & ")} karyawan`,
                );
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
    if (currentAuthUser && currentAuthUser.role === "admin") {
        toast(
            "Akses Terbatas: Sebagai Admin, Anda hanya dapat menambah data (penghapusan memerlukan persetujuan Owner).",
            "w",
        );
        return;
    }
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
