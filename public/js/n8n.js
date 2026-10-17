/* =====================================================================
   SATARYA ERP — INTEGRASI WEBHOOK N8N & WHATSAPP (n8n.js)
   Mengirim notifikasi otomatis ke WhatsApp Owner melalui Laravel -> n8n -> Fonnte
   ===================================================================== */
"use strict";

const DEFAULT_N8N_WEBHOOK_URL = "";
const DEFAULT_FONNTE_TOKEN = "";
const DEFAULT_FONNTE_TARGET = "";

// Sinkronisasi localStorage agar cache lama yang tidak valid dibersihkan
try {
    const savedUrl = localStorage.getItem("satarya_n8n_webhook_url");
    if (savedUrl && savedUrl.includes("erp-notif")) {
        localStorage.removeItem("satarya_n8n_webhook_url");
    }
} catch (e) {}

/**
 * Resolusi nama relasi (proyek/karyawan/peralatan) agar pesan WA mudah dibaca.
 */
function resolveEntityRef(entityKey, itemData) {
    if (!itemData) return "-";
    if (itemData.klien) return itemData.klien;
    if (itemData.divisi) return itemData.divisi;
    if (itemData.posisi) return itemData.posisi;
    if (itemData.kategori) return itemData.kategori;

    if (itemData.proj && typeof D !== "undefined" && Array.isArray(D.proj)) {
        const p = D.proj.find((x) => x.id == itemData.proj);
        if (p && p.nama) return `Proyek: ${p.nama}`;
    }

    if (itemData.kar && typeof D !== "undefined" && Array.isArray(D.karyawan)) {
        const k = D.karyawan.find((x) => x.id == itemData.kar);
        if (k && k.nama) return `Karyawan: ${k.nama}`;
    }

    return (typeof E !== "undefined" && E[entityKey]?.s) || "-";
}

/**
 * Resolusi nilai nominal / anggaran / kuantitas untuk ditampilkan di WA.
 */
function resolveEntityValue(itemData) {
    if (!itemData) return "-";
    const rawNominal =
        itemData.nilai ??
        itemData.nominal ??
        itemData.harga ??
        itemData.rencana ??
        itemData.gaji ??
        itemData.target;

    if (rawNominal !== undefined && rawNominal !== null && rawNominal !== "") {
        const num = Number(rawNominal);
        if (!isNaN(num) && num > 0 && typeof rp === "function") {
            return rp(num);
        }
    }

    if (itemData.jumlah !== undefined) {
        return `${itemData.jumlah} Unit`;
    }
    if (itemData.stok !== undefined) {
        return `${itemData.stok} ${itemData.satuan || "Unit"}`;
    }
    if (itemData.qty !== undefined) {
        return `${itemData.qty} Unit`;
    }

    return "-";
}

/**
 * Kirim notifikasi update ERP ke endpoint Laravel (/notify-n8n) -> diteruskan ke n8n & Fonnte.
 */
async function notifyOwnerViaN8n(actionType, entityKey, itemData) {
    if (entityKey === "invoice") {
        return {
            ok: true,
            skipped: true,
            reason: "Invoice excluded from WhatsApp notification",
        };
    }

    try {
        const entityMeta =
            typeof E !== "undefined" && E[entityKey]
                ? E[entityKey]
                : { t: entityKey, s: entityKey };

        const itemLabel =
            (typeof recLabel === "function"
                ? recLabel(entityKey, itemData)
                : null) ||
            itemData?.nama ||
            itemData?.item ||
            itemData?.uraian ||
            itemData?.no ||
            itemData?.ket ||
            "-";

        const userActor =
            typeof currentAuthUser !== "undefined" && currentAuthUser
                ? `${currentAuthUser.email} (${String(currentAuthUser.role || "admin").toUpperCase()})`
                : "Admin ERP";

        const customWebhookUrl =
            localStorage.getItem("satarya_n8n_webhook_url") ||
            DEFAULT_N8N_WEBHOOK_URL;
        const fonnteToken =
            localStorage.getItem("satarya_fonnte_token") ||
            DEFAULT_FONNTE_TOKEN;
        const fonnteTarget =
            localStorage.getItem("satarya_fonnte_target") ||
            DEFAULT_FONNTE_TARGET;

        const payload = {
            aksi: actionType,
            modul: entityMeta.t || entityMeta.s || entityKey,
            nama_item: String(itemLabel),
            divisi: String(resolveEntityRef(entityKey, itemData)),
            nilai: String(resolveEntityValue(itemData)),
            status: String(
                itemData?.status ||
                    itemData?.kondisi ||
                    itemData?.tipe ||
                    "Aktif",
            ),
            admin: userActor,
            waktu: new Date().toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "short",
            }),
            ...(customWebhookUrl ? { webhook_url: customWebhookUrl } : {}),
            ...(fonnteToken ? { fonnte_token: fonnteToken } : {}),
            ...(fonnteTarget ? { fonnte_target: fonnteTarget } : {}),
        };

        const csrfMeta = document.querySelector('meta[name="csrf-token"]');
        const headers = {
            "Content-Type": "application/json",
            Accept: "application/json",
        };
        if (csrfMeta && csrfMeta.content) {
            headers["X-CSRF-TOKEN"] = csrfMeta.content;
        }

        const res = await fetch("/notify-n8n", {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
        });

        const result = await res.json().catch(() => ({}));
        if (res.ok && result.ok) {
            if (typeof toast === "function") {
                toast("Notifikasi WhatsApp terkirim ke Owner");
            }
        } else {
            const n8nMsg =
                result?.fonnte_response?.reason ||
                result?.n8n_response?.message ||
                result?.error ||
                "Webhook n8n belum aktif / URL belum sesuai";
            console.warn("Respons n8n/Fonnte:", result);
            if (typeof toast === "function") {
                toast(`Info WA: ${n8nMsg}`, "bad");
            }
        }
        return result;
    } catch (err) {
        console.warn("Gagal mengirim notifikasi WA via n8n:", err);
        return { ok: false, error: err.message };
    }
}

/**
 * Modal Pengaturan & Tes Langsung Integrasi WhatsApp (n8n + Fonnte)
 */
window.openWaConfigModal = () => {
    const d = document.getElementById("dlg");
    if (!d) return;

    document
        .querySelectorAll("[data-dd].open")
        .forEach((x) => x.classList.remove("open"));

    const curWebhook =
        localStorage.getItem("satarya_n8n_webhook_url") ||
        DEFAULT_N8N_WEBHOOK_URL;
    const curToken =
        localStorage.getItem("satarya_fonnte_token") || DEFAULT_FONNTE_TOKEN;
    const curTarget =
        localStorage.getItem("satarya_fonnte_target") || DEFAULT_FONNTE_TARGET;

    d.onclick = (ev) => {
        if (ev.target === d) d.close();
    };

    d.innerHTML = `
    <div class="sheet-h">
      <span class="mega-ico">${typeof I === "function" ? I("alert") : "🔔"}</span>
      <div>
        <h3>Integrasi WhatsApp (n8n & Fonnte)</h3>
        <p>Konfigurasi & uji coba pengiriman notifikasi otomatis ke WhatsApp Owner.</p>
      </div>
      <button type="button" class="icon-btn" onclick="dlg.close()" aria-label="Tutup">${typeof I === "function" ? I("x") : "✕"}</button>
    </div>
    <form method="dialog" id="waCfgForm">
      <div class="fgrid">
        <label class="full">
          <span>URL Production Webhook n8n</span>
          <input type="url" name="webhook_url" value="${esc(curWebhook)}" placeholder="https://example.app.n8n.cloud/webhook/..." required>
        </label>
        <label>
          <span>Nomor WA Owner Penerima (Target)</span>
          <input type="text" name="fonnte_target" value="${esc(curTarget)}" placeholder="mis. 6281234567890">
        </label>
        <label>
          <span>Token Device Fonnte (Dari tombol 🔒 Token)</span>
          <input type="text" name="fonnte_token" value="${esc(curToken)}" placeholder="Tempel Token Device Fonnte di sini...">
        </label>
        <div class="full" style="background:var(--surface-2,#f8fafc);border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:12px 14px;font-size:12.5px;line-height:1.5;">
          <b>💡 Cara Kerja Ganda (Pasti Masuk WA):</b>
          <ul style="margin:6px 0 0 18px;padding:0;">
            <li>Sistem selalu mengirim data ke <b>Webhook n8n</b> di atas (baik format <code>$json.body</code> maupun <code>$json.query</code>).</li>
            <li>Dengan terisinya <b>Token Device Fonnte</b> & <b>Nomor WA Owner</b>, sistem juga langsung memastikan pesan WA terkirim ke nomor target.</li>
          </ul>
        </div>
      </div>
      <div class="sheet-f">
        <button type="button" class="btn" onclick="dlg.close()">Tutup</button>
        <button type="submit" class="btn btn-primary" id="btnWaTest">${typeof I === "function" ? I("check") : ""}Simpan & Kirim Tes WA Sekarang</button>
      </div>
    </form>`;

    d.showModal();

    const form = d.querySelector("#waCfgForm");
    if (!form) return;

    form.onsubmit = async (ev) => {
        ev.preventDefault();
        const fd = new FormData(form);
        const wUrl = (fd.get("webhook_url") || "").toString().trim();
        const fToken = (fd.get("fonnte_token") || "").toString().trim();
        const fTarget = (fd.get("fonnte_target") || "").toString().trim();

        try {
            if (wUrl) localStorage.setItem("satarya_n8n_webhook_url", wUrl);
            localStorage.setItem("satarya_fonnte_token", fToken);
            if (fTarget) localStorage.setItem("satarya_fonnte_target", fTarget);
        } catch (e) {}

        const btn = form.querySelector("#btnWaTest");
        if (btn) {
            btn.disabled = true;
            btn.textContent = "Mengirim Tes WA...";
        }

        const res = await notifyOwnerViaN8n("Tes Koneksi Integrasi WA", "proj", {
            nama: "Proyek Uji Coba Notifikasi WA",
            klien: "PT. Satarya Mandiri",
            nilai: 150000000,
            status: "Berjalan",
        });

        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `${typeof I === "function" ? I("check") : ""}Simpan & Kirim Tes WA Sekarang`;
        }

        if (res && res.ok) {
            d.close();
        }
    };
};

window.notifyOwnerViaN8n = notifyOwnerViaN8n;
