/* =====================================================================
   SATARYA ERP — MASTER ROUTER & ORCHESTRATOR (erp.js)
   Mengatur navigasi halaman, siklus hidup render, dan guard akses
   ===================================================================== */
"use strict";

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
    // Guard: Pastikan sesi pengguna valid sebelum merender halaman operasional
    if (!currentAuthUser) {
        showLogin();
        return;
    }

    if (S.page === "set" || S.page === "login") S.page = "dash";

    // Hancurkan grafik sebelumnya agar tidak bocor memori
    if (Array.isArray(charts)) {
        charts.forEach((c) => {
            if (c && typeof c.destroy === "function") c.destroy();
        });
        charts = [];
    }

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
        renderInvoiceTemplate(null, S.page === "pd" ? S.id : null);
    } catch (err) {}

    try {
        charting();
    } catch (err) {
        console.warn("Chart rendering failed:", err);
    }
}

// Inisialisasi awal saat halaman siap dimuat
const initApp = () => {
    try {
        initFirebaseAuth();
    } catch (e) {
        console.warn("initFirebaseAuth error:", e);
    }

    const path = window.location.pathname.toLowerCase();
    const isOwnerRoute = path.includes("/owner") || window.PORTAL_ROLE === "owner";
    const isAdminRoute = path.includes("/admin") || window.PORTAL_ROLE === "admin";

    // Jika belum login, selalu arahkan ke login portal yang sesuai
    if (!currentAuthUser) {
        if (isAdminRoute) {
            showLogin("admin");
        } else {
            showLogin("owner");
        }
        return;
    }

    // Jika sudah login, cek apakah pengguna berada di route spesifik yang berbeda role
    if (isOwnerRoute && currentAuthUser.role !== "owner") {
        showLogin("owner");
        return;
    }
    if (isAdminRoute && currentAuthUser.role !== "admin") {
        showLogin("admin");
        return;
    }

    // Pengguna terotentikasi sah -> render dashboard workspace
    render();
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}
