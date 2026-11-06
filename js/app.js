/**
 * WE-WARN Shared Layout & UI Controller
 * Topbar, Navigation, Audio Synthesizer, Flash/Toasts, and Reactive Listeners.
 */

(function () {
  let audioAlertEnabled = false;
  let audioCtx = null;
  let lastPlayedStatus = null;

  // Web Audio Synthesizer
  function handleAudioAlert(status) {
    if (!audioAlertEnabled) return;
    if (status === "RED") {
      playSirenTone(880, 0.35);
    } else if (status === "YELLOW" && lastPlayedStatus !== "YELLOW") {
      playBeepTone(440, 0.25);
    }
    lastPlayedStatus = status;
  }

  function playSirenTone(freq, duration) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.6, audioCtx.currentTime + duration);
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  function playBeepTone(freq, duration) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  // Toast System
  function showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 350);
    }, 3500);
  }

  // Footer Live Clock
  function updateClock() {
    const el = document.getElementById("foot-clock");
    if (el) {
      const now = new Date();
      el.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " (Local)";
    }
  }

  // Hardware Status Chip
  function updateHwChip() {
    const chip = document.getElementById("hw-chip");
    const txt = document.getElementById("hw-status-text");
    if (!chip || !txt) return;

    const hw = window.WEWARN_SIMULATOR ? window.WEWARN_SIMULATOR.getStatus() : { status: "connected", port: "USB" };
    if (hw.status.includes("simulating")) {
      chip.dataset.status = "simulating";
      txt.textContent = "Simulation";
    } else {
      chip.dataset.status = "connected";
      txt.textContent = "Live Sensor";
    }
  }

  // Header Warnings Ticker
  function renderWarningsTicker() {
    let tickerContainer = document.getElementById("warnings-ticker-wrap");
    if (!tickerContainer) return;

    const activeWarnings = window.WEWARN_STORE.getWarnings(true);
    if (!activeWarnings || !activeWarnings.length) {
      tickerContainer.innerHTML = "";
      return;
    }

    const itemsHtml = activeWarnings.map((w) => {
      let icon = "info";
      if (w.severity === "critical") icon = "alert-octagon";
      else if (w.severity === "warning") icon = "alert-triangle";
      return `
        <span class="ticker-item ticker-item--${w.severity}">
          <i data-lucide="${icon}"></i>
          <strong>${w.title}:</strong> ${w.message}
        </span>
      `;
    }).join("");

    tickerContainer.innerHTML = `
      <div class="warnings-ticker" id="warnings-ticker">
        <div class="ticker-label">
          <i data-lucide="megaphone"></i>
          <span>ALERTS</span>
        </div>
        <div class="ticker-track">
          <div class="ticker-content">
            ${itemsHtml}
          </div>
        </div>
      </div>
    `;

    if (typeof lucide !== "undefined") lucide.createIcons();
  }

  // Update Navigation Active Badge (no-op — City Situation nav removed)
  function updateNavBadge() {
    // Single-location prototype — no city situation badge needed
  }

  // Update Auth Widget in Topbar
  function updateAuthHeader() {
    const authContainer = document.getElementById("topbar-auth-slot");
    if (!authContainer) return;

    const user = window.WEWARN_STORE.getCurrentUser();
    if (user) {
      authContainer.innerHTML = `
        <a href="admin-dashboard.html" class="admin-chip" title="Admin Control Center">
          <i data-lucide="shield-check" class="admin-chip-icon"></i>
          <span>${user.displayName}</span>
        </a>
        <button id="admin-logout-btn" class="admin-logout-btn" title="Sign Out">
          <i data-lucide="log-out"></i>
        </button>
      `;
      const logoutBtn = document.getElementById("admin-logout-btn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          window.WEWARN_STORE.logout();
          showToast("Signed out successfully.", "info");
          setTimeout(() => {
            if (window.location.pathname.includes("admin-dashboard")) {
              window.location.href = "index.html";
            } else {
              updateAuthHeader();
            }
          }, 400);
        });
      }
    } else {
      authContainer.innerHTML = `
        <a href="admin-login.html" class="admin-login-link" title="Admin Login">
          <i data-lucide="lock" class="admin-chip-icon"></i>
          <span>Admin</span>
        </a>
      `;
    }

    if (typeof lucide !== "undefined") lucide.createIcons();
  }

  // Audio Button Listener
  function setupAudioButton() {
    const audioBtn = document.getElementById("audio-toggle-btn");
    if (audioBtn) {
      audioBtn.addEventListener("click", () => {
        audioAlertEnabled = !audioAlertEnabled;
        const icon = document.getElementById("audio-icon");
        const label = document.getElementById("audio-label");
        if (icon) icon.textContent = audioAlertEnabled ? "🔊" : "🔇";
        if (label) label.textContent = `Sound Alert: ${audioAlertEnabled ? "On" : "Off"}`;
        audioBtn.classList.toggle("btn--primary", audioAlertEnabled);
        showToast(`Audio alarm siren ${audioAlertEnabled ? "activated" : "muted"}.`, "info");
      });
    }
  }

  // Setup Global Navigation Link Active Class
  function setupActiveNav() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    const isAdminPage = path === "admin-dashboard.html" || path === "admin-login.html";

    document.querySelectorAll(".mainnav .nav-item, .mobile-bottom-nav .m-nav-item").forEach((el) => {
      const href = el.getAttribute("href");
      if (!href) return;
      const isMatch = href === path || (path === "" && href === "index.html") ||
        (isAdminPage && (href === "admin-dashboard.html" || href === "admin-login.html"));
      if (isMatch) {
        el.classList.add(el.classList.contains("nav-item") ? "nav-item--active" : "m-nav-item--active");
      }
    });

    const mAdmin = document.getElementById("m-nav-admin");
    if (mAdmin) {
      const user = window.WEWARN_STORE.getCurrentUser();
      mAdmin.href = user ? "admin-dashboard.html" : "admin-login.html";
    }
  }

  // Expose global methods
  window.showToast = showToast;
  window.handleAudioAlert = handleAudioAlert;

  document.addEventListener("DOMContentLoaded", () => {
    setupActiveNav();
    updateClock();
    setInterval(updateClock, 1000);
    updateHwChip();
    renderWarningsTicker();
    updateNavBadge();
    updateAuthHeader();
    setupAudioButton();

    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  });

  // Global event listener for store changes
  window.addEventListener("wewarn:data-change", (e) => {
    updateHwChip();
    renderWarningsTicker();
    updateNavBadge();
    updateAuthHeader();
    renderPersistentTopEmergencyBanner();
  });

  window.addEventListener("wewarn:reading", (e) => {
    const reading = e.detail;
    if (reading) {
      handleAudioAlert(reading.warning_status);
    }
  });

  // ============================================================
  // REAL-TIME EMERGENCY BROADCAST & NOTIFICATION SYSTEM
  // ============================================================
  let titleFlashInterval = null;
  let originalDocumentTitle = document.title;
  let currentActiveModalAlertId = null;

  function startTitleFlash(text) {
    if (titleFlashInterval) clearInterval(titleFlashInterval);
    let flag = false;
    titleFlashInterval = setInterval(() => {
      document.title = flag ? `🚨 [ALERT] ${text.slice(0, 24)}...` : `⚠️ WE-WARN EMERGENCY`;
      flag = !flag;
    }, 1000);
  }

  function stopTitleFlash() {
    if (titleFlashInterval) {
      clearInterval(titleFlashInterval);
      titleFlashInterval = null;
      document.title = originalDocumentTitle;
    }
  }

  function playEmergencyAlarm(severity = "critical", repeats = 3) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();

      const now = audioCtx.currentTime;
      if (severity === "critical") {
        // Urgent alternating dual-tone siren
        for (let i = 0; i < repeats; i++) {
          const t = now + i * 0.75;
          const osc1 = audioCtx.createOscillator();
          const gain1 = audioCtx.createGain();
          osc1.type = "sawtooth";
          osc1.frequency.setValueAtTime(960, t);
          osc1.frequency.exponentialRampToValueAtTime(1080, t + 0.32);
          gain1.gain.setValueAtTime(0.24, t);
          gain1.gain.linearRampToValueAtTime(0.01, t + 0.35);
          osc1.connect(gain1);
          gain1.connect(audioCtx.destination);
          osc1.start(t);
          osc1.stop(t + 0.35);

          const osc2 = audioCtx.createOscillator();
          const gain2 = audioCtx.createGain();
          osc2.type = "sawtooth";
          osc2.frequency.setValueAtTime(680, t + 0.38);
          osc2.frequency.exponentialRampToValueAtTime(740, t + 0.7);
          gain2.gain.setValueAtTime(0.24, t + 0.38);
          gain2.gain.linearRampToValueAtTime(0.01, t + 0.73);
          osc2.connect(gain2);
          gain2.connect(audioCtx.destination);
          osc2.start(t + 0.38);
          osc2.stop(t + 0.73);
        }
      } else if (severity === "warning") {
        // High attention double pulse
        for (let i = 0; i < repeats; i++) {
          const t = now + i * 0.55;
          [0, 0.2].forEach((offset) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(840, t + offset);
            gain.gain.setValueAtTime(0.2, t + offset);
            gain.gain.exponentialRampToValueAtTime(0.01, t + offset + 0.16);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(t + offset);
            osc.stop(t + offset + 0.16);
          });
        }
      } else if (severity === "all-clear") {
        // Ascending major chord (All-Clear)
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const t = now + idx * 0.16;
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.18, t);
          gain.gain.exponentialRampToValueAtTime(0.005, t + 0.42);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(t);
          osc.stop(t + 0.42);
        });
      } else {
        // Advisory pleasant double chime
        [587.33, 880].forEach((freq, idx) => {
          const t = now + idx * 0.22;
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.18, t);
          gain.gain.exponentialRampToValueAtTime(0.005, t + 0.38);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(t);
          osc.stop(t + 0.38);
        });
      }
    } catch (e) {
      console.warn("Audio alarm blocked or failed:", e);
    }
  }

  function sendBrowserNotification(alert) {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      try {
        const n = new Notification(`🚨 WE-WARN ALERT: ${alert.title}`, {
          body: `${alert.message}\n📍 ${alert.location}`,
          icon: "favicon.svg",
          badge: "favicon.svg",
          tag: "wewarn-alert-" + alert.id,
          renotify: true
        });
        n.onclick = function () {
          window.focus();
          showEmergencyModal(alert, false);
        };
      } catch (e) {}
    } else if (Notification.permission === "default") {
      try {
        Notification.requestPermission();
      } catch (e) {}
    }
  }

  // Render Persistent Top Emergency Strip
  function renderPersistentTopEmergencyBanner() {
    let banner = document.getElementById("wewarn-top-emergency-banner");
    const active = window.WEWARN_STORE.getActiveBroadcast();

    if (!active) {
      if (banner) banner.remove();
      return;
    }

    const sev = (active.severity || "critical").toLowerCase();
    let iconName = sev === "critical" ? "siren" : sev === "warning" ? "alert-triangle" : "info";
    let tagText = sev === "critical" ? "CRITICAL EMERGENCY BROADCAST" : sev === "warning" ? "FLOOD WARNING ADVISORY" : "PUBLIC FLOOD ADVISORY";

    if (!banner) {
      banner = document.createElement("div");
      banner.id = "wewarn-top-emergency-banner";
      const topbar = document.querySelector(".topbar");
      if (topbar && topbar.parentNode) {
        topbar.parentNode.insertBefore(banner, topbar.nextSibling);
      } else {
        document.body.prepend(banner);
      }
    }

    banner.className = `top-emergency-banner top-emergency-banner--${sev} animate-rise`;
    banner.innerHTML = `
      <div class="top-emergency-inner">
        <div class="top-emergency-left">
          <span class="emergency-siren-badge">
            <i data-lucide="${iconName}"></i>
          </span>
          <div class="top-emergency-text">
            <div class="top-emergency-tag">${tagText} &bull; ${active.created_at}</div>
            <strong class="top-emergency-title">${active.title}</strong>
            <span class="top-emergency-loc">&mdash; ${active.location}</span>
          </div>
        </div>
        <div class="top-emergency-actions">
          <button class="btn btn--sm banner-btn-details" id="btn-banner-view-advisory">
            <i data-lucide="eye"></i>
            <span>View Advisory</span>
          </button>
        </div>
      </div>
    `;

    const viewBtn = document.getElementById("btn-banner-view-advisory");
    if (viewBtn) {
      viewBtn.onclick = () => {
        showEmergencyModal(active, false);
      };
    }

    if (typeof lucide !== "undefined") lucide.createIcons();
  }

  // Render Emergency Modal Dialog
  function showEmergencyModal(alert, triggerEffects = true) {
    currentActiveModalAlertId = alert.id;
    let modal = document.getElementById("wewarn-emergency-modal");
    if (modal) modal.remove();

    const sev = (alert.severity || "critical").toLowerCase();
    let badgeText = "CRITICAL EMERGENCY BROADCAST";
    let iconName = "siren";
    if (sev === "warning") {
      badgeText = "FLOOD WARNING ADVISORY";
      iconName = "alert-triangle";
    } else if (sev === "advisory") {
      badgeText = "PUBLIC INFORMATION ADVISORY";
      iconName = "info";
    }

    // Telemetry current reading preview
    let currentReading = { water_level: 25.0, warning_status: "YELLOW", road_status: "Passable" };
    try {
      currentReading = window.WEWARN_STORE.getLatestReading(window.WEWARN_CONFIG.LOCATION_NAME) || currentReading;
    } catch (e) {}

    modal = document.createElement("div");
    modal.id = "wewarn-emergency-modal";
    modal.className = "emergency-modal-backdrop";
    modal.innerHTML = `
      <div class="emergency-modal-card emergency-modal-card--${sev} animate-rise" role="dialog" aria-modal="true">
        <div class="emergency-modal-header">
          <div class="emergency-badge emergency-badge--${sev}">
            <span class="pulse-beacon"></span>
            <span>${badgeText}</span>
          </div>
          <button class="emergency-modal-close" id="btn-close-emergency-modal" title="Dismiss" aria-label="Dismiss">&times;</button>
        </div>

        <div class="emergency-modal-body">
          <div class="emergency-beacon-row">
            <div class="emergency-icon-circle emergency-icon-circle--${sev}">
              <i data-lucide="${iconName}"></i>
            </div>
            <div>
              <span class="mono muted font-sm">ISSUED BY ${alert.created_by.toUpperCase()} &bull; ${alert.created_at}</span>
              <h2 class="emergency-modal-title">${alert.title}</h2>
            </div>
          </div>

          <div class="emergency-location-strip">
            <i data-lucide="map-pin"></i>
            <strong>Target Location:</strong>
            <span>${alert.location}</span>
          </div>

          <div class="emergency-modal-text">
            ${alert.message || "Water level condition requires immediate public vigilance. Please monitor official advisories and execute safety precautions."}
          </div>

          <div class="emergency-telemetry-box">
            <div class="telemetry-box-title">
              <i data-lucide="activity"></i>
              <span>Live Monitored Telemetry Snapshot</span>
            </div>
            <div class="telemetry-box-grid">
              <div class="telemetry-box-item">
                <span class="mono muted">Water Elevation</span>
                <strong>${Number(currentReading.water_level).toFixed(1)} cm</strong>
              </div>
              <div class="telemetry-box-item">
                <span class="mono muted">Alarm Status</span>
                <strong class="color-${currentReading.warning_status.toLowerCase()}">${currentReading.warning_status}</strong>
              </div>
              <div class="telemetry-box-item">
                <span class="mono muted">Road Status</span>
                <strong>${currentReading.road_status}</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="emergency-modal-footer">
          <button class="btn btn--outline" id="btn-modal-dismiss">
            <i data-lucide="check"></i>
            <span>Acknowledge &amp; Dismiss</span>
          </button>
          <a href="dashboard.html" class="btn btn--primary" id="btn-modal-godash">
            <i data-lucide="activity"></i>
            <span>Open Live Dashboard</span>
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = document.getElementById("btn-close-emergency-modal");
    if (closeBtn) closeBtn.onclick = closeEmergencyModal;
    const dismissBtn = document.getElementById("btn-modal-dismiss");
    if (dismissBtn) dismissBtn.onclick = closeEmergencyModal;

    // Close on backdrop click
    modal.onclick = (e) => {
      if (e.target === modal) closeEmergencyModal();
    };

    if (typeof lucide !== "undefined") lucide.createIcons();

    if (triggerEffects) {
      if (alert.sound !== false) {
        playEmergencyAlarm(sev, sev === "critical" ? 4 : 2);
      }
      sendBrowserNotification(alert);
      startTitleFlash(alert.title);
      showToast(`📢 EMERGENCY BROADCAST: ${alert.title}`, sev === "critical" ? "error" : "info");
    }
  }

  function closeEmergencyModal() {
    const modal = document.getElementById("wewarn-emergency-modal");
    if (modal) {
      modal.classList.add("modal-fade-out");
      setTimeout(() => modal.remove(), 250);
    }
    stopTitleFlash();
  }

  function handleAllClearNotice(note) {
    stopTitleFlash();
    playEmergencyAlarm("all-clear", 1);

    // Update persistent top banner into green all-clear then fade
    const banner = document.getElementById("wewarn-top-emergency-banner");
    if (banner) {
      banner.className = "top-emergency-banner top-emergency-banner--allclear animate-rise";
      banner.innerHTML = `
        <div class="top-emergency-inner">
          <div class="top-emergency-left">
            <span class="emergency-siren-badge" style="background:var(--green); color:#000;">
              <i data-lucide="check-circle-2"></i>
            </span>
            <div class="top-emergency-text">
              <div class="top-emergency-tag" style="color:var(--green);">🟢 ALL CLEAR &bull; ADVISORY LIFTED</div>
              <strong class="top-emergency-title">${note || "Flood emergency warning has been lifted. Dr. A. Santos Ave. infront of SM Sucat is clear."}</strong>
            </div>
          </div>
        </div>
      `;
      if (typeof lucide !== "undefined") lucide.createIcons();
      setTimeout(() => {
        if (banner) banner.remove();
      }, 6000);
    }

    // If modal open, show all clear
    const modal = document.getElementById("wewarn-emergency-modal");
    if (modal) {
      const card = modal.querySelector(".emergency-modal-card");
      if (card) {
        card.className = "emergency-modal-card emergency-modal-card--allclear";
        card.innerHTML = `
          <div class="emergency-modal-header">
            <div class="emergency-badge emergency-badge--green">
              <span>ALL CLEAR NOTICE</span>
            </div>
            <button class="emergency-modal-close" onclick="window.wewarnCloseModal()">&times;</button>
          </div>
          <div class="emergency-modal-body" style="text-align:center; padding:24px 16px;">
            <div class="emergency-icon-circle emergency-icon-circle--green" style="margin:0 auto 16px;">
              <i data-lucide="check-circle-2"></i>
            </div>
            <h2 class="emergency-modal-title" style="color:var(--green);">Flood Advisory Lifted</h2>
            <p class="emergency-modal-text">${note || "Flood waters have subsided. Monitored road sections along Dr. A. Santos Ave. infront of SM Sucat are now passable."}</p>
          </div>
          <div class="emergency-modal-footer" style="justify-content:center;">
            <button class="btn btn--primary btn--green" onclick="window.wewarnCloseModal()">Close</button>
          </div>
        `;
        if (typeof lucide !== "undefined") lucide.createIcons();
      }
      setTimeout(closeEmergencyModal, 4500);
    }

    showToast("🟢 Flood warning lifted: Area is All Clear.", "success");
  }

  // Setup Event Listeners for Emergency Broadcasts
  window.addEventListener("wewarn:emergency-alert", (e) => {
    const alert = e.detail;
    if (alert) {
      showEmergencyModal(alert, true);
      renderPersistentTopEmergencyBanner();
    }
  });

  window.addEventListener("wewarn:emergency-alert-cleared", (e) => {
    const note = e.detail ? e.detail.note : null;
    handleAllClearNotice(note);
  });

  // Expose helpers globally
  window.wewarnShowEmergencyModal = showEmergencyModal;
  window.wewarnCloseModal = closeEmergencyModal;
  window.wewarnShowActiveModal = () => {
    const active = window.WEWARN_STORE.getActiveBroadcast();
    if (active) showEmergencyModal(active, false);
  };
  window.wewarnPlayEmergencyAlarm = playEmergencyAlarm;
  window.wewarnRequestNotificationPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((res) => {
        showToast(res === "granted" ? "Browser notifications enabled!" : "Notifications declined.", "info");
      });
    }
  };

  // Check on DOMContentLoaded
  document.addEventListener("DOMContentLoaded", () => {
    renderPersistentTopEmergencyBanner();
  });
})();

