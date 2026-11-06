/**
 * WE-WARN Data Store & LocalStorage Persistence Engine
 * Complete client-side database replacement for prototype mode.
 */

(function () {
  const STORE_KEY_PREFIX = "wewarn_";

  function getStorage(key, defaultVal) {
    try {
      const val = localStorage.getItem(STORE_KEY_PREFIX + key);
      return val ? JSON.parse(val) : defaultVal;
    } catch (e) {
      console.error("Error reading localStorage:", e);
      return defaultVal;
    }
  }

  function setStorage(key, val) {
    try {
      localStorage.setItem(STORE_KEY_PREFIX + key, JSON.stringify(val));
    } catch (e) {
      console.error("Error writing localStorage:", e);
    }
  }

  function formatTimestamp(d) {
    const date = d || new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const mins = pad(date.getMinutes());
    const secs = pad(date.getSeconds());
    return `${year}-${month}-${day} ${hours}:${mins}:${secs}`;
  }

  const WEWARN_STORE = {
    init: function () {
      const isInit = localStorage.getItem(STORE_KEY_PREFIX + "initialized_v3");
      if (!isInit) {
        this.resetToDefaults(false);
        localStorage.setItem(STORE_KEY_PREFIX + "initialized_v3", "true");
      }
    },

    resetToDefaults: function (notify = true) {
      // 1. Monitored Areas
      const areasWithId = (window.WEWARN_INITIAL_AREAS || []).map((a, idx) => ({
        id: idx + 1,
        district: a.district,
        barangay: a.barangay,
        location: a.location,
        flood_level: a.flood_level,
        remarks: a.remarks || "",
        updated_at: formatTimestamp()
      }));
      setStorage("areas", areasWithId);

      // 2. Alternative Routes
      setStorage("routes", window.WEWARN_INITIAL_ROUTES || []);

      // 3. Admin Warnings
      setStorage("warnings", window.WEWARN_INITIAL_WARNINGS || []);

      // 4. History Readings
      const initialReadings = [...(window.WEWARN_INITIAL_READINGS || [])];
      setStorage("readings", initialReadings);

      // 5. Auth State (Keep logged out initially or default)
      setStorage("auth", null);

      // 6. Simulation Mode Flag
      setStorage("sim_mode", false);

      if (notify) {
        this.emitChange("reset", null);
      }
    },

    classify: function (waterLevelCm) {
      const cfg = window.WEWARN_CONFIG || { GREEN_MAX_CM: 15.0, YELLOW_MAX_CM: 60.0 };
      const level = parseFloat(waterLevelCm);
      if (level < cfg.GREEN_MAX_CM) {
        return {
          flood_level: "Ankle to Knee (Gutter)",
          warning_status: "GREEN",
          road_status: "Passable to All Vehicles"
        };
      } else if (level < cfg.YELLOW_MAX_CM) {
        return {
          flood_level: "Knee to Waist",
          warning_status: "YELLOW",
          road_status: "Not Passable to Light Vehicles"
        };
      } else {
        return {
          flood_level: "Waist and Above",
          warning_status: "RED",
          road_status: "Not Passable to All / Danger"
        };
      }
    },

    // --- Readings & Telemetry ---
    getLatestReading: function (location) {
      const readings = getStorage("readings", []);
      if (location) {
        for (let i = readings.length - 1; i >= 0; i--) {
          if (readings[i].location === location) return readings[i];
        }
        // If no reading exists yet for this location, synthesize a realistic initial reading matching the area's flood status
        const areas = getStorage("areas", []);
        const area = areas.find((a) => a.location === location);
        let defaultLevel = 8.5;
        if (area) {
          if (area.flood_level.includes("Waist")) defaultLevel = 72.4;
          else if (area.flood_level.includes("Knee")) defaultLevel = 34.2;
          else if (area.flood_level.includes("Gutter")) defaultLevel = 12.8;
          else defaultLevel = 6.4;
        }
        return this.insertReading(defaultLevel, location);
      }
      if (!readings || !readings.length) {
        const initial = this.classify(9.2);
        return {
          id: 1,
          water_level: 9.2,
          ...initial,
          location: location || window.WEWARN_CONFIG.LOCATION_NAME,
          timestamp: formatTimestamp()
        };
      }
      return readings[readings.length - 1];
    },

    getHistory: function (limit = 100, location = null) {
      let readings = getStorage("readings", []);
      if (location) {
        let locReadings = readings.filter((r) => r.location === location);
        if (locReadings.length === 0) {
          this.getLatestReading(location);
          readings = getStorage("readings", []);
          locReadings = readings.filter((r) => r.location === location);
        }
        readings = locReadings;
      }
      // Return reverse order (newest first)
      const sorted = [...readings].sort((a, b) => b.id - a.id);
      return limit ? sorted.slice(0, limit) : sorted;
    },

    insertReading: function (waterLevelCm, location) {
      const readings = getStorage("readings", []);
      const numLevel = parseFloat(waterLevelCm);
      const classification = this.classify(numLevel);
      const loc = location || (readings.length > 0 ? readings[readings.length - 1].location : window.WEWARN_CONFIG.LOCATION_NAME);
      const nextId = readings.length > 0 ? Math.max(...readings.map((r) => r.id || 0)) + 1 : 1;
      
      const newReading = {
        id: nextId,
        water_level: Math.round(numLevel * 10) / 10,
        flood_level: classification.flood_level,
        warning_status: classification.warning_status,
        road_status: classification.road_status,
        location: loc,
        timestamp: formatTimestamp()
      };

      readings.push(newReading);
      // Keep up to 500 history records to prevent unlimited growth in localStorage
      if (readings.length > 500) {
        readings.splice(0, readings.length - 500);
      }
      setStorage("readings", readings);

      window.dispatchEvent(new CustomEvent("wewarn:reading", { detail: newReading }));
      this.emitChange("readings", newReading);
      return newReading;
    },

    clearHistory: function () {
      setStorage("readings", []);
      this.emitChange("readings_cleared", null);
      return true;
    },

    // --- Monitored Hotspots & Areas ---
    getMonitoredAreas: function (floodedOnly = false) {
      let areas = getStorage("areas", []);
      if (floodedOnly) {
        return areas.filter((a) => a.flood_level !== "No Reported/Monitored Flooded Area");
      }
      return areas;
    },

    getAreaById: function (id) {
      const areas = getStorage("areas", []);
      return areas.find((a) => a.id === parseInt(id));
    },

    updateAreaFloodStatus: function (areaId, floodLevel, remarks) {
      const areas = getStorage("areas", []);
      const idx = areas.findIndex((a) => a.id === parseInt(areaId));
      if (idx !== -1) {
        areas[idx].flood_level = floodLevel;
        if (remarks !== undefined) areas[idx].remarks = remarks;
        areas[idx].updated_at = formatTimestamp();
        setStorage("areas", areas);
        this.emitChange("areas", areas[idx]);
        return true;
      }
      return false;
    },

    getSituationSummary: function () {
      const areas = this.getMonitoredAreas();
      let active_flooded = 0;
      let impassable_roads = 0;
      let normal_clear = 0;

      areas.forEach((a) => {
        const lvl = a.flood_level || "";
        const rem = a.remarks || "";
        if (lvl !== "No Reported/Monitored Flooded Area") {
          active_flooded++;
        } else {
          normal_clear++;
        }
        if (
          lvl.includes("Waist") ||
          lvl.includes("Knee") ||
          rem.includes("Not Passable")
        ) {
          impassable_roads++;
        }
      });

      return {
        total_monitored: areas.length,
        active_flooded: active_flooded,
        impassable_roads: impassable_roads,
        normal_clear: normal_clear
      };
    },

    // --- Alternative Detour Routes ---
    getRoutes: function () {
      return getStorage("routes", []);
    },

    addRoute: function (affectedRoad, alternativeRoute, notes) {
      const routes = getStorage("routes", []);
      const nextId = routes.length > 0 ? Math.max(...routes.map((r) => r.id || 0)) + 1 : 1;
      const newRoute = {
        id: nextId,
        affected_road: affectedRoad.trim(),
        alternative_route: alternativeRoute.trim(),
        notes: notes ? notes.trim() : ""
      };
      routes.push(newRoute);
      setStorage("routes", routes);
      this.emitChange("routes", newRoute);
      return newRoute;
    },

    deleteRoute: function (routeId) {
      let routes = getStorage("routes", []);
      const initialLen = routes.length;
      routes = routes.filter((r) => r.id !== parseInt(routeId));
      if (routes.length !== initialLen) {
        setStorage("routes", routes);
        this.emitChange("routes_deleted", routeId);
        return true;
      }
      return false;
    },

    // --- Admin Warnings & Advisories ---
    getWarnings: function (activeOnly = true) {
      const warnings = getStorage("warnings", []);
      if (activeOnly) {
        return warnings.filter((w) => w.is_active);
      }
      return warnings;
    },

    addWarning: function (title, message, severity, createdBy) {
      const warnings = getStorage("warnings", []);
      const nextId = warnings.length > 0 ? Math.max(...warnings.map((w) => w.id || 0)) + 1 : 1;
      const now = formatTimestamp();
      const newWarning = {
        id: nextId,
        title: title.trim(),
        message: message.trim(),
        severity: severity || "info",
        is_active: true,
        created_by: createdBy || "PCDRRMO Admin",
        created_at: now,
        updated_at: now
      };
      warnings.unshift(newWarning);
      setStorage("warnings", warnings);
      this.emitChange("warnings", newWarning);
      return newWarning;
    },

    updateWarning: function (id, data) {
      const warnings = getStorage("warnings", []);
      const idx = warnings.findIndex((w) => w.id === parseInt(id));
      if (idx !== -1) {
        if (data.title !== undefined) warnings[idx].title = data.title.trim();
        if (data.message !== undefined) warnings[idx].message = data.message.trim();
        if (data.severity !== undefined) warnings[idx].severity = data.severity;
        if (data.is_active !== undefined) warnings[idx].is_active = Boolean(data.is_active);
        warnings[idx].updated_at = formatTimestamp();
        setStorage("warnings", warnings);
        this.emitChange("warnings", warnings[idx]);
        return true;
      }
      return false;
    },

    deleteWarning: function (id) {
      let warnings = getStorage("warnings", []);
      const initialLen = warnings.length;
      warnings = warnings.filter((w) => w.id !== parseInt(id));
      if (warnings.length !== initialLen) {
        setStorage("warnings", warnings);
        this.emitChange("warnings_deleted", id);
        return true;
      }
      return false;
    },

    // --- Admin Auth ---
    getCurrentUser: function () {
      return getStorage("auth", null);
    },

    login: function (username, password) {
      const defaultAdmin = window.WEWARN_CONFIG.ADMIN_DEFAULT;
      if (username === defaultAdmin.username && password === defaultAdmin.password) {
        const user = {
          username: defaultAdmin.username,
          displayName: defaultAdmin.displayName,
          role: defaultAdmin.role
        };
        setStorage("auth", user);
        this.emitChange("auth", user);
        return user;
      }
      return null;
    },

    logout: function () {
      setStorage("auth", null);
      this.emitChange("auth", null);
      return true;
    },

    // --- Simulation Settings ---
    getSimulationMode: function () {
      return Boolean(getStorage("sim_mode", false));
    },

    setSimulationMode: function (enable) {
      setStorage("sim_mode", Boolean(enable));
      this.emitChange("simulation_mode", Boolean(enable));
    },

    // --- CSV Export Helper ---
    exportCsv: function () {
      const history = this.getHistory(1000);
      const headers = ["ID", "Timestamp", "Water Level (cm)", "Flood Depth", "Warning Status", "Road Status", "Location"];
      const rows = history.map((r) => [
        r.id,
        `"${r.timestamp}"`,
        r.water_level,
        `"${r.flood_level}"`,
        `"${r.warning_status}"`,
        `"${r.road_status}"`,
        `"${r.location}"`
      ]);
      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "wewarn_history.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },

    // --- Event Dispatcher ---
    emitChange: function (type, payload) {
      window.dispatchEvent(
        new CustomEvent("wewarn:data-change", {
          detail: { type, payload, summary: this.getSituationSummary() }
        })
      );
    }
  };

  // Auto-initialize on load
  WEWARN_STORE.init();
  window.WEWARN_STORE = WEWARN_STORE;

  // Cross-tab synchronization
  window.addEventListener("storage", function (e) {
    if (e.key && e.key.startsWith(STORE_KEY_PREFIX)) {
      window.dispatchEvent(
        new CustomEvent("wewarn:data-change", {
          detail: { type: "cross_tab_sync", key: e.key }
        })
      );
    }
  });
})();

