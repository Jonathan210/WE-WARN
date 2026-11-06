/**
 * WE-WARN Sensor Simulator
 * Emulates the Arduino Uno & HC-SR04 ultrasonic sensor telemetry stream.
 */

(function () {
  let simTimer = null;
  let currentSimLevel = 9.2;
  let waveStep = 0;

  const WEWARN_SIMULATOR = {
    getStatus: function () {
      const isSim = window.WEWARN_STORE.getSimulationMode();
      if (isSim) {
        return {
          status: "simulating (auto-fluctuation)",
          port: "Virtual COM (Demo Mode)"
        };
      }
      return {
        status: "connected",
        port: "Arduino Uno (USB Serial)"
      };
    },

    injectReading: function (levelCm, location) {
      currentSimLevel = parseFloat(levelCm);
      const reading = window.WEWARN_STORE.insertReading(currentSimLevel, location);
      return reading;
    },

    toggleSimulation: function (enable) {
      window.WEWARN_STORE.setSimulationMode(enable);
      if (enable) {
        this.startLoop();
      } else {
        this.stopLoop();
      }
      return this.getStatus();
    },

    startLoop: function () {
      if (simTimer) return;
      simTimer = setInterval(() => {
        if (!window.WEWARN_STORE.getSimulationMode()) {
          this.stopLoop();
          return;
        }
        // Smooth sine wave + slight random noise to simulate natural water movement
        waveStep += 0.25;
        const wave = Math.sin(waveStep) * 6;
        const noise = (Math.random() - 0.5) * 1.5;
        let newLevel = Math.max(3.0, Math.min(85.0, currentSimLevel + wave * 0.15 + noise));
        currentSimLevel = Math.round(newLevel * 10) / 10;

        window.WEWARN_STORE.insertReading(currentSimLevel);
      }, 2500);
    },

    stopLoop: function () {
      if (simTimer) {
        clearInterval(simTimer);
        simTimer = null;
      }
    },

    init: function () {
      if (window.WEWARN_STORE.getSimulationMode()) {
        this.startLoop();
      }
    }
  };

  window.WEWARN_SIMULATOR = WEWARN_SIMULATOR;

  document.addEventListener("DOMContentLoaded", () => {
    WEWARN_SIMULATOR.init();
  });
})();

