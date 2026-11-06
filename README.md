# WE-WARN — Water Elevation Web-based Alert and Response Network

A standalone real-time flood monitoring prototype for **San Dionisio — Dr. A. Santos Ave. infront of SM Sucat**. It provides real-time water depth telemetry, water elevation gauge visualization, road passability classification, continuous time-series logs with CSV export, and an administrative control panel with interactive telemetry simulation.

## 🚀 Standalone Prototype (HTML, CSS, JS Only)

This project runs as a **pure frontend prototype using only HTML, CSS, and JavaScript**. **No Python, Node.js, database, or backend installation is required!**

### How to Run:
1. Open [`index.html`](index.html) directly in any web browser (double-click it from File Explorer, or open with Chrome, Edge, Safari, Firefox).
2. Or serve statically with any web server (e.g., VS Code Live Server or `npx serve .`).

### Monitored Location:
- **Location:** Dr. A. Santos Ave. infront of SM Sucat
- **Barangay:** San Dionisio
- **District:** District 1

### Prototype Features:
- **Client-Side Telemetry Simulator**: Emulates sensor telemetry directly in JavaScript with continuous wave fluctuations and manual depth injection.
- **LocalStorage Data Engine**: All time-series sensor readings, station settings, and credentials persist in browser `localStorage`.
- **Live Gauge & Trend Chart**: Visual water depth tube gauge with zone thresholds and interactive SVG trend graph.
- **Monitoring & Telemetry Logs**: Searchable and filterable data table with instant `.csv` spreadsheet export.
- **Admin Control Center**: Sign in with default demo credentials (`admin` / `admin123`) to manage station status or inject custom water levels.

### Folder Structure:
```
WE-WARN Prototype/
├── index.html              # Home landing page and live status readout
├── dashboard.html          # Live water elevation gauge, sparkline, and test sandbox
├── monitoring.html         # Continuous telemetry history table & CSV export
├── admin-login.html        # Administrator authentication page
├── admin-dashboard.html    # Administrative control center & simulation testbed
├── favicon.svg             # Project droplet icon
├── README.md               # Prototype documentation
├── css/
│   └── style.css           # Styling and design system
└── js/
    ├── app.js              # Header, navigation, and UI controllers
    ├── dashboard.js        # Gauge animation, sparkline, and station telemetry
    ├── data.js             # Initial station seed data
    ├── simulator.js        # HC-SR04 ultrasonic sensor telemetry emulator
    └── store.js            # Client-side LocalStorage data engine
```
