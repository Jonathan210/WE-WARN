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
  });

  window.addEventListener("wewarn:reading", (e) => {
    const reading = e.detail;
    if (reading) {
      handleAudioAlert(reading.warning_status);
    }
  });
})();

