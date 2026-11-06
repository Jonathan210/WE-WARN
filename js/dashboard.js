/**
 * WE-WARN Dashboard Controller
 * Live telemetry polling, visual gauge tube, SVG trend chart,
 * station switcher, and prototype simulation controls.
 */

(function () {
  const GAUGE_MAX_CM = 90;
  let currentStation = "";

  function statusColorVar(status) {
    if (status === "RED") return "var(--red)";
    if (status === "YELLOW") return "var(--yellow)";
    return "var(--green)";
  }

  function setGauge(levelCm, status) {
    const fill = document.getElementById("gauge-fill");
    const waterline = document.getElementById("gauge-waterline");
    if (!fill) return;

    const pct = Math.max(0, Math.min(100, (levelCm / GAUGE_MAX_CM) * 100));
    fill.style.height = pct + "%";
    fill.style.background = statusColorVar(status || "GREEN");
    if (waterline) waterline.style.bottom = `calc(${pct}% - 1px)`;
  }

  function applyReading(data) {
    if (!data || data.water_level === undefined) return;

    setGauge(data.water_level, data.warning_status);

    const levelEl = document.getElementById("level-number");
    if (levelEl) {
      levelEl.innerHTML = Number(data.water_level).toFixed(1) + '<span class="unit">cm</span>';
    }

    const pill = document.getElementById("status-pill");
    const label = document.getElementById("status-label");
    if (pill && label) {
      pill.dataset.status = data.warning_status;
      label.textContent = data.warning_status;
    }

    const flood = document.getElementById("flood-level");
    if (flood) flood.textContent = data.flood_level;

    const road = document.getElementById("road-status");
    if (road) road.textContent = data.road_status;

    const updated = document.getElementById("last-update");
    if (updated) updated.textContent = data.timestamp;

    const heroEl = document.querySelector(".hero");
    if (heroEl) heroEl.dataset.status = data.warning_status;

    const safetyBox = document.getElementById("safety-box");
    if (safetyBox) safetyBox.dataset.status = data.warning_status;

    const messages = {
      GREEN: "Water level is at ankle-to-knee depth. Road is passable for light to heavy vehicles. Drive with caution.",
      YELLOW: "Water level has reached knee-to-waist depth. Road is not passable for light to heavy vehicles. Prepare for or proceed with evacuation when necessary.",
      RED: "DANGER: Water has reached chest level or higher. Extremely dangerous condition. Road is impassable for all vehicles. Evacuate immediately and move to a safer location!"
    };
    const msgEl = document.getElementById("safety-message");
    if (msgEl && messages[data.warning_status]) {
      msgEl.textContent = messages[data.warning_status];
    }
  }

  function updateTrendChart(history) {
    const svg = document.getElementById("trend-svg");
    if (!svg || !history || !history.length) return;

    // Take the last 20 readings in chronological order
    const points = [...history].reverse().slice(-20);
    const maxW = 500;
    const maxH = 110;
    const padding = 10;
    const innerH = maxH - padding * 2;

    const maxVal = Math.max(80, ...points.map((p) => p.water_level));
    const minVal = 0;

    const getX = (i) => (i / Math.max(1, points.length - 1)) * (maxW - 20) + 10;
    const getY = (val) => maxH - padding - ((val - minVal) / (maxVal - minVal)) * innerH;

    const coords = points.map((p, i) => [getX(i), getY(p.water_level)]);

    // Line path
    const lineD = coords.reduce((acc, [x, y], i) => (i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`), "");
    const lineEl = document.getElementById("trend-line");
    if (lineEl) lineEl.setAttribute("d", lineD);

    // Area path
    if (coords.length > 1) {
      const firstX = coords[0][0];
      const lastX = coords[coords.length - 1][0];
      const areaD = `${lineD} L ${lastX} ${maxH} L ${firstX} ${maxH} Z`;
      const areaEl = document.getElementById("trend-area");
      if (areaEl) areaEl.setAttribute("d", areaD);
    }

    // Dots
    const pointsGroup = document.getElementById("trend-points");
    if (pointsGroup) {
      pointsGroup.innerHTML = "";
      coords.forEach(([x, y], idx) => {
        const p = points[idx];
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", idx === coords.length - 1 ? "4.5" : "2.5");
        circle.setAttribute("fill", p.warning_status === "RED" ? "var(--red)" : p.warning_status === "YELLOW" ? "var(--yellow)" : "var(--accent)");
        pointsGroup.appendChild(circle);
      });
    }
  }

  function refreshDashboard() {
    const reading = window.WEWARN_STORE.getLatestReading(currentStation);
    applyReading(reading);
    const history = window.WEWARN_STORE.getHistory(20, currentStation);
    updateTrendChart(history);
  }

  function populateStationDropdown() {
    const select = document.getElementById("station-select");
    if (!select) return;

    const allAreas = window.WEWARN_STORE.getMonitoredAreas();
    const floodedAreas = allAreas.filter((a) => a.flood_level !== "No Reported/Monitored Flooded Area");
    const normalAreas = allAreas.filter((a) => a.flood_level === "No Reported/Monitored Flooded Area");

    let html = `<optgroup label="Active Monitored Hotspots">`;
    floodedAreas.forEach((f) => {
      const selected = f.location === currentStation ? "selected" : "";
      html += `<option value="${f.location}" ${selected}>[${f.barangay}] ${f.location} (${f.flood_level})</option>`;
    });
    html += `</optgroup><optgroup label="Other Monitored Locations">`;
    normalAreas.forEach((a) => {
      const selected = a.location === currentStation ? "selected" : "";
      html += `<option value="${a.location}" ${selected}>[${a.barangay}] ${a.location}</option>`;
    });
    html += `</optgroup>`;
    select.innerHTML = html;
  }

  // Station Switcher
  window.switchStation = function (loc) {
    if (!loc) return;
    currentStation = loc;
    window.currentDashboardStation = loc;
    const url = new URL(window.location.href);
    url.searchParams.set("location", loc);
    window.history.replaceState({}, "", url.toString());
    refreshDashboard();
    window.showToast(`Switched active telemetry station to: ${loc}`, "info");
  };

  // Prototype Test Reading Injection
  window.testReading = function (val) {
    const reading = window.WEWARN_SIMULATOR.injectReading(val, currentStation);
    applyReading(reading);
    refreshDashboard();
    window.showToast(`Injected depth: ${val.toFixed(1)} cm (${reading.warning_status})`, "info");
  };

  // Toggle Continuous Fluctuating Simulation
  window.toggleSimulationMode = function (enable) {
    const status = window.WEWARN_SIMULATOR.toggleSimulation(enable);
    window.showToast(enable ? "Continuous wave simulation enabled" : "Continuous wave simulation paused", "info");
    const simChk = document.getElementById("sim-toggle-chk");
    if (simChk) simChk.checked = enable;
    const adminSimChk = document.getElementById("admin-sim-toggle");
    if (adminSimChk) adminSimChk.checked = enable;
  };

  document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentStation = urlParams.get("location") || window.WEWARN_CONFIG.LOCATION_NAME;
    window.currentDashboardStation = currentStation;

    populateStationDropdown();
    refreshDashboard();

    // Sync Simulation Checkbox
    const simChk = document.getElementById("sim-toggle-chk");
    if (simChk) {
      simChk.checked = window.WEWARN_STORE.getSimulationMode();
    }

    // Slider setup
    const slider = document.getElementById("manual-level-slider");
    const sliderDisplay = document.getElementById("slider-val-display");
    if (slider && sliderDisplay) {
      slider.addEventListener("input", function () {
        sliderDisplay.textContent = parseFloat(this.value).toFixed(1) + " cm";
      });
    }

    // Listen to real-time events from store or simulator
    window.addEventListener("wewarn:reading", (e) => {
      const r = e.detail;
      if (!currentStation || r.location === currentStation) {
        applyReading(r);
        const history = window.WEWARN_STORE.getHistory(20, currentStation);
        updateTrendChart(history);
      }
    });

    window.addEventListener("wewarn:data-change", (e) => {
      refreshDashboard();
    });
  });
})();

