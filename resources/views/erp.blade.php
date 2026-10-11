<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
    <title>Satarya ERP - Sistem Manajemen Operasional Kontraktor</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Cabinet+Grotesk:wght@700;800;900&display=swap"
      rel="stylesheet"
    />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
    <link rel="stylesheet" href="css/erp.css" />
  </head>
  <body>
    <!-- FIGMA CURVED ACTIVE NOTCH SIDEBAR -->
    <aside id="side" class="side-panel"></aside>
    
    <!-- MOBILE SCRIM BACKDROP -->
    <div id="scrim" onclick="document.getElementById('side').classList.remove('open')"></div>

    <!-- MAIN APP CANVAS -->
    <div class="wrap">
      <!-- FIGMA APP TOPBAR -->
      <header class="app-header">
        <div class="header-left">
          <button
            class="header-btn burger-trigger"
            id="burger"
            aria-label="Toggle Sidebar"
            onclick="document.getElementById('side').classList.toggle('open')"
          >
            <svg class="ico" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          
          <div class="header-title-box">
            <span class="header-badge" id="hdr_badge">SATARYA • OPERASIONAL</span>
            <h1 id="ttl">Dashboard</h1>
          </div>
        </div>

        <div class="header-right">
          <!-- Figma Live Date Pill -->
          <div class="header-pill date-pill" id="dt_pill">
            <svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span class="dt" id="dt"></span>
          </div>

          <!-- Quick Date on Mobile -->
          <button class="header-btn mobile-only" id="cal" type="button" onclick="showDate()" title="Lihat Tanggal">
            <svg class="ico" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
          </button>

          <!-- Figma Notification Bell with Badge -->
          <button class="header-btn bell-btn" onclick="go('alert')" id="bell" title="Peringatan Operasional">
            <svg class="ico" viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </button>

          <!-- Figma User Profile Pill -->
          <div class="header-profile-card">
            <div class="header-avatar">A</div>
            <div class="header-user-info">
              <span class="header-user-name">Administrator</span>
              <span class="header-user-role">Super Admin</span>
            </div>
          </div>
        </div>
      </header>

      <!-- VIEWPORT MAIN CONTENT -->
      <main id="main" class="main-viewport"></main>
    </div>

    <!-- MODAL POPUP DIALOG -->
    <dialog id="dlg" class="app-dialog"></dialog>

    <!-- FLOATING TOAST FEEDBACK -->
    <div id="toast" class="app-toast"></div>

    <script src="js/erp.js"></script>
  </body>
</html>
