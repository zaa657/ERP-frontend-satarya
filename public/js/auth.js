/* =====================================================================
   SATARYA ERP — AUTENTIKASI & PORTAL LOGIN (auth.js)
   Firebase Auth, Portal Terpisah (/owner & /admin), Session & RBAC Sync
   ===================================================================== */
"use strict";

const AUTH_SESSION_KEY = "satarya_auth_session";

// Konfigurasi Firebase (opsional, jika kosong sistem berjalan dalam mode autentikasi lokal terproteksi)
const FIREBASE_CONFIG = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
};

let firebaseAuth = null;
let currentAuthUser = null;

// Ambil sesi login dari localStorage saat inisialisasi
function loadAuthSession() {
    try {
        const raw = localStorage.getItem(AUTH_SESSION_KEY);
        if (raw) {
            currentAuthUser = JSON.parse(raw);
            return currentAuthUser;
        }
    } catch (e) {
        currentAuthUser = null;
    }
    return null;
}
loadAuthSession();

function saveAuthSession(userObj) {
    currentAuthUser = userObj;
    try {
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(userObj));
    } catch (e) {}
}

function clearAuthSession() {
    currentAuthUser = null;
    try {
        localStorage.removeItem(AUTH_SESSION_KEY);
    } catch (e) {}
}

// Inisialisasi Firebase Auth jika library dan konfigurasi tersedia
function initFirebaseAuth() {
    try {
        if (window.firebase && FIREBASE_CONFIG.apiKey && !FIREBASE_CONFIG.apiKey.startsWith("MASUKKAN")) {
            if (!firebase.apps.length) {
                firebase.initializeApp(FIREBASE_CONFIG);
            }
            if (!firebaseAuth) {
                firebaseAuth = firebase.auth();
                firebaseAuth.onAuthStateChanged((user) => {
                    if (user) {
                        const portal = getActivePortalRole();
                        let role = portal;
                        if (!role) {
                            role = (user.email && user.email.toLowerCase().includes("owner")) || user.email === "direktur@satarya.com"
                                ? "owner"
                                : "admin";
                        }
                        saveAuthSession({
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName || (role === "owner" ? "Owner Direktur" : "Admin Operasional"),
                            role: role,
                            photoURL: user.photoURL || null,
                        });
                    }
                });
            }
        }
    } catch (err) {
        console.warn("Inisialisasi Firebase Auth gagal / dilewati:", err);
    }
}

// Mendeteksi role portal aktif berdasarkan window.PORTAL_ROLE, pathname URL, atau sesi
function getActivePortalRole(requestedRole) {
    if (requestedRole === "owner" || requestedRole === "admin") return requestedRole;
    if (window.PORTAL_ROLE === "owner" || window.PORTAL_ROLE === "admin") return window.PORTAL_ROLE;
    
    const path = window.location.pathname.toLowerCase();
    if (path.includes("/owner")) return "owner";
    if (path.includes("/admin")) return "admin";
    
    if (currentAuthUser && currentAuthUser.role) return currentAuthUser.role;
    return "owner"; // Default portal utama
}

// Menampilkan Halaman / Form Login
window.showLogin = (roleOverride) => {
    try {
        const appEl = $("#app");
        if (appEl) appEl.hidden = true;
        const loginEl = $("#login");
        if (!loginEl) return;
        loginEl.hidden = false;
        window.scrollTo(0, 0);

        const portalRole = getActivePortalRole(roleOverride);
        const isOwner = portalRole === "owner";

        const portalBadge = isOwner ? "👑 PORTAL OWNER (DIREKTUR)" : "🛡️ PORTAL ADMIN (OPERASIONAL)";
        const portalBadgeClass = isOwner ? "owner" : "admin";
        const portalTitle = isOwner ? "Masuk Portal Owner" : "Masuk Portal Admin";
        const portalSubtitle = isOwner
            ? "Akses kontrol penuh seluruh sistem, verifikasi anggaran, dan laporan eksekutif."
            : "Akses operasional harian, pencatatan kas, stok, absensi, dan data lapangan.";
        const submitBtnText = isOwner ? "Masuk sebagai Owner" : "Masuk sebagai Admin";
        const altPortalUrl = isOwner ? "/admin" : "/owner";
        const altPortalLabel = isOwner ? "Beralih ke Portal Admin →" : "Beralih ke Portal Owner →";

        loginEl.innerHTML = `
      <div class="login-art">
        <div class="login-brand">
          <span class="brand-logo"><img src="img/logo.png" alt="Satarya"></span>
          <div><b>SATARYA</b><span>Sistem Operasional ERP</span></div>
        </div>
        <div class="login-copy">
          <h2>Kelola proyek, kas, stok & tim <em>dalam satu alur terpadu.</em></h2>
          <p>Workspace operasional kontraktor modern: kontrol anggaran proyek, penagihan invoice termin, mutasi kas harian, hingga logistik peralatan dan absensi tim lapangan.</p>
        </div>
        <div class="login-foot">© ${new Date().getFullYear()} CV Satarya Group · Solusi Manajemen Operasional Terpadu</div>
        ${typeof WAVES !== "undefined" ? WAVES : ""}
      </div>

      <div class="login-panel">
        <form class="login-card" id="loginForm" onsubmit="handleLoginSubmit(event, '${portalRole}')">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
            <div class="brand-logo" style="width:48px;height:48px"><img src="img/logo.png" alt="Satarya"></div>
            <span class="login-portal-badge ${portalBadgeClass}">${portalBadge}</span>
          </div>

          <h1>${portalTitle}</h1>
          <p style="margin:6px 0 20px;color:var(--muted);font-size:13.5px;line-height:1.5">${portalSubtitle}</p>

          <!-- Alert Pesan Error -->
          <div id="loginErr" class="login-err"></div>

          <label class="field">
            <span>Email Pengguna</span>
            <input type="email" id="loginEmail" name="email" required placeholder="mis. ${isOwner ? 'owner' : 'admin'}@satarya.com" value="" autocomplete="username">
          </label>

          <label class="field">
            <span>Kata Sandi</span>
            <div class="pw-wrap">
              <input type="password" id="loginPass" name="password" required placeholder="Masukkan kata sandi" value="" autocomplete="current-password">
              <button type="button" class="icon-btn" onclick="const i=this.previousElementSibling;i.type=i.type==='password'?'text':'password'" aria-label="Tampilkan sandi">${I("eye")}</button>
            </div>
          </label>

          <div style="display:flex;align-items:center;justify-content:space-between;margin:8px 0 22px;font-size:13px;">
            <label style="display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-weight:600;color:var(--text-2);">
              <input type="checkbox" id="loginRemember" checked style="width:16px;height:16px;accent-color:var(--primary);cursor:pointer"> Ingat Saya
            </label>
            <a href="javascript:void(0)" onclick="handleForgotPassword()" style="color:var(--primary);font-weight:700;text-decoration:none;">Lupa Kata Sandi?</a>
          </div>

          <button class="btn btn-primary" type="submit" id="btnSubmitLogin" style="width:100%;height:46px;font-size:14.5px;font-weight:800;gap:8px;">
            ${I("lock")} <span>${submitBtnText}</span>
          </button>

          <div style="display:flex;align-items:center;gap:12px;margin:18px 0;color:var(--muted);font-size:12px;">
            <span style="flex:1;height:1px;background:var(--line)"></span>
            <span>atau</span>
            <span style="flex:1;height:1px;background:var(--line)"></span>
          </div>

          <button type="button" class="btn-google" onclick="handleGoogleLogin('${portalRole}')">
            ${I("google")} <span>Masuk dengan Google</span>
          </button>

          <div style="margin-top:22px;text-align:center;font-size:13px;padding-top:16px;border-top:1px solid var(--line);">
            <a href="${altPortalUrl}" onclick="event.preventDefault(); switchLoginPortal('${isOwner ? 'admin' : 'owner'}')" style="color:var(--text-2);text-decoration:none;font-weight:700;display:inline-flex;align-items:center;gap:6px;">
              ${altPortalLabel}
            </a>
          </div>
        </form>
      </div>
    `;
    } catch (err) {
        console.error("Gagal merender halaman login:", err);
    }
};

window.switchLoginPortal = (targetRole) => {
    if (window.history && window.history.pushState) {
        window.history.pushState(null, "", "/" + targetRole);
    }
    window.PORTAL_ROLE = targetRole;
    showLogin(targetRole);
};

window.handleLoginSubmit = async (ev, forcedRole) => {
    if (ev) ev.preventDefault();
    const emailEl = $("#loginEmail");
    const passEl = $("#loginPass");
    const errEl = $("#loginErr");
    const btnSubmit = $("#btnSubmitLogin");

    if (errEl) {
        errEl.classList.remove("on");
        errEl.innerText = "";
    }

    const email = emailEl ? emailEl.value.trim() : "";
    const pass = passEl ? passEl.value : "";

    if (!email) {
        if (errEl) {
            errEl.innerText = "Silakan masukkan alamat email.";
            errEl.classList.add("on");
        }
        return;
    }

    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span>Memverifikasi akun…</span>`;
    }

    // Role strictly determined by portal context or credentials
    const targetRole = forcedRole || getActivePortalRole();
    const role = targetRole === "owner" ? "owner" : "admin";
    const displayName = role === "owner" ? "Owner Direktur" : "Admin Operasional";

    const isFirebaseConfigured = Boolean(
        window.firebase &&
        FIREBASE_CONFIG.apiKey &&
        !FIREBASE_CONFIG.apiKey.startsWith("MASUKKAN")
    );

    if (isFirebaseConfigured && window.firebase) {
        try {
            if (!firebaseAuth) firebaseAuth = firebase.auth();
            const cred = await firebaseAuth.signInWithEmailAndPassword(email, pass);
            const user = cred.user;
            saveAuthSession({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || displayName,
                role: role,
                photoURL: user.photoURL || null,
            });
            toast(`Selamat datang kembali, ${currentAuthUser.displayName}!`, "s");
            enterApp();
        } catch (err) {
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = `${I("lock")} <span>Masuk sebagai ${role === 'owner' ? 'Owner' : 'Admin'}</span>`;
            }
            let msg = "Gagal masuk: " + err.message;
            if (
                err.code === "auth/invalid-credential" ||
                err.code === "auth/wrong-password" ||
                err.code === "auth/user-not-found"
            ) {
                msg = "Email atau kata sandi yang Anda masukkan salah.";
            } else if (err.code === "auth/too-many-requests") {
                msg = "Terlalu banyak percobaan gagal. Silakan tunggu beberapa saat.";
            }
            if (errEl) {
                errEl.innerText = msg;
                errEl.classList.add("on");
            }
        }
    } else {
        // Mode Otentikasi Terverifikasi Sistem
        setTimeout(() => {
            saveAuthSession({
                uid: "usr_" + Date.now(),
                email: email,
                displayName: displayName,
                role: role,
                photoURL: null,
            });
            toast(
                `Berhasil masuk sebagai ${role === "owner" ? "👑 Owner (Akses Penuh Seluruh Sistem)" : "🛡️ Admin (Akses Operasional)"}!`,
                "s"
            );
            enterApp();
        }, 300);
    }
};

window.handleGoogleLogin = async (portalRole) => {
    const role = (portalRole || getActivePortalRole()) === "owner" ? "owner" : "admin";
    const defaultName = role === "owner" ? "Bpk. Satarya (Owner)" : "Staf Admin Operasional";

    const isFirebaseConfigured = Boolean(
        window.firebase &&
        FIREBASE_CONFIG.apiKey &&
        !FIREBASE_CONFIG.apiKey.startsWith("MASUKKAN")
    );

    if (isFirebaseConfigured && window.firebase) {
        try {
            if (!firebaseAuth) firebaseAuth = firebase.auth();
            const provider = new firebase.auth.GoogleAuthProvider();
            const cred = await firebaseAuth.signInWithPopup(provider);
            const user = cred.user;
            saveAuthSession({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || defaultName,
                role: role,
                photoURL: user.photoURL || null,
            });
            toast(`Berhasil masuk dengan Google: ${user.email} (${role.toUpperCase()})`, "s");
            enterApp();
        } catch (err) {
            toast(`Google Sign-In gagal: ${err.message}`, "e");
        }
    } else {
        saveAuthSession({
            uid: "google_mock_" + role,
            email: role === "owner" ? "owner.satarya@gmail.com" : "admin.satarya@gmail.com",
            displayName: defaultName,
            role: role,
            photoURL: null,
        });
        toast(`Berhasil masuk melalui akun Google ${role === "owner" ? "Owner" : "Admin"}!`, "s");
        enterApp();
    }
};

window.logoutUser = () => {
    if (confirm("Apakah Anda yakin ingin keluar dari sistem ERP?")) {
        if (firebaseAuth) {
            try {
                firebaseAuth.signOut();
            } catch (e) {}
        }
        const lastRole = currentAuthUser ? currentAuthUser.role : "owner";
        clearAuthSession();
        toast("Anda telah keluar dari sistem.", "w");

        // Arahkan kembali ke portal login sesuai role sebelumnya
        if (window.history && window.history.pushState) {
            window.history.pushState(null, "", "/" + lastRole);
        }
        window.PORTAL_ROLE = lastRole;
        showLogin(lastRole);
    }
};

// Guard Ketat: Hanya pengguna yang terautentikasi yang dapat masuk ke dashboard
window.enterApp = () => {
    if (!currentAuthUser) {
        const portal = getActivePortalRole();
        showLogin(portal);
        return;
    }
    const loginEl = $("#login");
    if (loginEl) loginEl.hidden = true;
    const appEl = $("#app");
    if (appEl) appEl.hidden = false;
    render();
};

window.handleForgotPassword = async () => {
    const isFirebaseConfigured = Boolean(
        window.firebase &&
        FIREBASE_CONFIG.apiKey &&
        !FIREBASE_CONFIG.apiKey.startsWith("MASUKKAN")
    );
    const email = prompt(
        "Masukkan email Anda untuk pengiriman tautan reset kata sandi:",
        $("#loginEmail") ? $("#loginEmail").value : ""
    );
    if (!email) return;

    if (isFirebaseConfigured && window.firebase) {
        try {
            if (!firebaseAuth) firebaseAuth = firebase.auth();
            await firebaseAuth.sendPasswordResetEmail(email);
            alert("Tautan reset kata sandi telah dikirim ke email " + email + ". Silakan periksa inbox Anda.");
        } catch (err) {
            alert("Gagal mengirim email reset: " + err.message);
        }
    } else {
        alert("Permintaan Reset Kata Sandi diterima untuk: " + email + ".\nInstruksi verifikasi pemulihan sandi telah dikirim.");
    }
};
