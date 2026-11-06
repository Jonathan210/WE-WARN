# WE-WARN — Water Elevation Web-based Alert and Response Network

A dual-mode, real-time flood monitoring and early warning system focused exclusively on **San Dionisio — Dr. A. Santos Ave. infront of SM Sucat**. It provides real-time water depth telemetry, visual water elevation gauge visualization, road passability classification, emergency broadcast dispatching with sirens, resident accounts with warning exclusivity, and a complete relational database (SQLite + In-Browser SQL engine).

---

## 🏗️ Architecture & Dual-Mode Database

WE-WARN operates in **Dual-Mode**, running seamlessly either with a live Python/Flask SQLite backend or as a standalone zero-dependency browser prototype:

```
                            ┌──────────────────────────────────────────┐
                            │        WE-WARN Client Application        │
                            │  (HTML5, CSS3, ES6+, Responsive Design)  │
                            └────────────────────┬─────────────────────┘
                                                 │
                     ┌───────────────────────────┴───────────────────────────┐
                     ▼                                                       ▼
        [Mode 1: Full Backend Server]                           [Mode 2: Standalone Prototype]
          python app.py (Port 5000)                               Double-click index.html
                     │                                                       │
                     ▼                                                       ▼
       REST API (`/api/readings`,                               In-Browser Relational Store
       `/api/auth`, `/api/broadcast`,                           (`WEWARN_STORE`, LocalStorage,
       `/api/db/table`, `/api/db/export`)                       BroadcastChannel, Cross-Tab Sync)
                     │                                                       │
                     ▼                                                       ▼
         Physical SQLite Database                                SQL / JSON Dump Generator
          `database/wewarn.db`                                   (`wewarn_database.sql`)
```

### Option A: Run with Backend SQLite Database (Recommended)
1. Ensure Python 3 is installed.
2. Run the application server:
   ```powershell
   python app.py
   ```
3. Open your browser at:
   ```
   http://localhost:5000
   ```
- The backend automatically connects to the physical SQLite database at `database/wewarn.db`.
- All sensor telemetry injections, emergency alert dispatches, and user registrations persist directly to SQLite on disk.

### Option B: Run as Standalone Prototype (Zero-Dependency)
1. Double-click [`index.html`](index.html) or open it directly in Chrome, Edge, Safari, or Firefox.
2. Or serve statically with any web server (e.g., VS Code Live Server or `npx serve .`).
- No Python, Node.js, or server installation is required.
- The dual-mode database engine automatically detects the static environment and falls back to browser-side structured database persistence without network errors.
- You can export a full `.sql` database script (`wewarn_database.sql`) or `.json` backup directly from the Admin Panel.

---

## 🗄️ Relational Database Schema

Both `database/wewarn.db` (SQLite 3) and `database/schema_and_seeds.sql` follow an identical normalized relational schema:

### 1. `users` Table
Stores authentication credentials, contact numbers, and access roles.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique user identifier |
| `username` | TEXT | UNIQUE, NOT NULL | Account login username |
| `password` | TEXT | NOT NULL | Account password |
| `display_name`| TEXT | NOT NULL | Full name or callsign |
| `role` | TEXT | NOT NULL ('admin', 'user') | Access authorization level |
| `barangay` | TEXT | DEFAULT 'San Dionisio' | Registered resident location |
| `phone` | TEXT | DEFAULT '' | Emergency contact SMS number |
| `created_at` | TEXT | NOT NULL | Account creation timestamp |

### 2. `readings` Table
Time-series water level sensor measurements from Dr. A. Santos Ave.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique reading identifier |
| `water_level` | REAL | NOT NULL | Water elevation depth in centimeters |
| `flood_level` | TEXT | NOT NULL | Depth classification (e.g. "Gutter Level") |
| `warning_status`| TEXT| NOT NULL | Alert category: GREEN, YELLOW, or RED |
| `road_status` | TEXT | NOT NULL | Vehicle passability condition |
| `location` | TEXT | NOT NULL | Monitored station name |
| `timestamp` | TEXT | NOT NULL | Observation timestamp |

### 3. `monitored_areas` Table
Primary monitoring station metadata.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Station ID |
| `district` | TEXT | NOT NULL | City district (District 1) |
| `barangay` | TEXT | NOT NULL | Barangay (San Dionisio) |
| `location` | TEXT | NOT NULL | Dr. A. Santos Ave. infront of SM Sucat |
| `flood_level` | TEXT | NOT NULL | Current flood depth level |
| `remarks` | TEXT | NULL | Road condition and detour notes |
| `updated_at` | TEXT | NOT NULL | Last status update timestamp |

### 4. `broadcasts` Table
Emergency alerts dispatched by PCDRRMO command staff.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Alert ID |
| `title` | TEXT | NOT NULL | Alert heading |
| `message` | TEXT | NOT NULL | Instructions and warnings |
| `severity` | TEXT | NOT NULL | Severity: critical, warning, advisory |
| `location` | TEXT | NOT NULL | Targeted flood hotspot |
| `sound` | INTEGER | NOT NULL (1 or 0) | Audio siren flag |
| `is_active` | INTEGER | NOT NULL (1 or 0) | Active dispatch flag |
| `created_by` | TEXT | NOT NULL | Admin or agency name |
| `created_at` | TEXT | NOT NULL | Dispatch timestamp |

---

## 👥 Demo Accounts & Warning Exclusivity Policy

### Pre-Seeded Accounts:
- **Admin / Staff Account:**
  - Username: `admin`
  - Password: `admin123`
  - Role: `admin` (Command Center Staff)
- **Resident Account:**
  - Username: `resident`
  - Password: `user123`
  - Role: `user` (Barangay San Dionisio Resident)
- **Commuter Account:**
  - Username: `commuter`
  - Password: `user123`
  - Role: `user` (Paranaque City Commuter)

### Warning Exclusivity Policy:
- **Guests / Non-Logged-in Visitors**: Allowed to freely view the home page, live water elevation gauge, and monitoring logs without signing in. However, guests **will not receive emergency alert modals, banner flashes, or audio sirens**.
- **Logged-in Residents & Staff**: Once signed in via [`login.html`](login.html), the user account enters active monitoring mode and immediately receives real-time emergency broadcasts, visual popups, top warning banners, and audio sirens dispatched by the admin.

---

## 🔒 Discreet Administrative Access

The public navigation bar **hides the "Admin" button**, showing only "Sign In" or "My Account" to keep the public interface clean and secure. Command staff can access the administrator portal via four alternative methods:

1. **Keyboard Shortcut**: Press `Alt + A` (or `Ctrl + Shift + A`) from any page.
2. **Logo Triple-Click**: Rapidly click the "WE-WARN" logo 3 times in the top header.
3. **Staff Portal Toggle**: On [`login.html`](login.html), click the discreet *"Staff / PCDRRMO Command Login"* toggle link.
4. **Footer Staff Link**: Click the *"Staff"* link in the page footer.
5. **Direct Navigation**: Navigate directly to [`admin-login.html`](admin-login.html).

---

## ⚡ Emergency Alert Broadcast System

When water depth rises rapidly along Dr. A. Santos Ave., administrators can dispatch real-time emergency warnings from the Admin Panel:
- **Cross-Tab Delivery**: Uses `BroadcastChannel` ("wewarn_alert_channel") and `storage` pings for instant delivery across browser tabs without page reloads.
- **Audio Siren**: Generates an automated Web Audio API pulsing alarm siren.
- **High-Visibility Modal**: Displays actionable guidance (detours, passability, safety measures) directly to logged-in users.
- **Persistent Sticky Banner**: Pins a warning bar across the top of all pages until PCDRRMO clears the alert with an "All Clear".

---

## 📊 Database & SQL Manager in Admin Panel

Navigate to **Admin Dashboard -> Database & SQL Manager** tab:
1. **Live Engine Status Banner**: Displays whether the system is connected to SQLite (`database/wewarn.db`) or running via the in-browser database engine.
2. **Interactive Table Browser**: Select and view rows from `readings`, `users`, `broadcasts`, or `monitored_areas` with formatted badges and column headers.
3. **Export SQL Dump (`.sql`)**: Generates and downloads a complete `wewarn_database.sql` script with table DDL schemas and seed INSERT statements.
4. **Export JSON Dump (`.json`)**: Downloads a comprehensive JSON backup of all tables and system metadata.
5. **Export CSV (`.csv`)**: Downloads time-series water elevation telemetry.
6. **Factory Reset**: Restores all tables back to official initial seed state with one click.

---

## 📁 Project Structure

```
WE-WARN Prototype/
├── app.py                      # Flask backend server exposing REST API & SQLite endpoints
├── database.py                 # SQLite database layer, seeders, CRUD operations, & SQL dumper
├── database/
│   ├── wewarn.db               # SQLite 3 physical relational database
│   └── schema_and_seeds.sql    # Standalone SQL schema and initial seed data
├── index.html                  # Home landing page with live water level readout & station card
├── dashboard.html              # Live water elevation gauge, sparkline, and test sandbox
├── monitoring.html             # Historical telemetry log table with search, filters, & CSV export
├── login.html                  # Resident sign in & free registration portal
├── admin-login.html            # PCDRRMO Command Staff login portal
├── admin-dashboard.html        # Control center: Broadcasts, Telemetry, Station, & SQL Manager
├── favicon.svg                 # Droplet logo icon
├── README.md                   # System documentation
├── css/
│   └── style.css               # Responsive design system centered for mobile, tablet, and PC
└── js/
    ├── app.js                  # Header, navigation, emergency modal, and auth state controller
    ├── dashboard.js            # Gauge animation, sparkline, and station telemetry controller
    ├── data.js                 # Configuration, location defaults, and threshold definitions
    ├── simulator.js            # Ultrasonic sensor telemetry emulator
    └── store.js                # Dual-mode data persistence engine (SQLite API + LocalStorage)
```

---

## 🎯 Verification Checklist

- [x] Monitored Station: San Dionisio — Dr. A. Santos Ave. infront of SM Sucat
- [x] Responsive on all devices (mobile, tablet, desktop) and centered on PC / laptop (`max-width: 1200px; margin: 0 auto;`)
- [x] Physical SQLite Database initialized and seeded (`database/wewarn.db` & `database/schema_and_seeds.sql`)
- [x] Flask Backend Server with REST API (`python app.py`)
- [x] Dual-Mode Frontend Data Engine with automatic SQLite detection and graceful client fallback (`js/store.js`)
- [x] Database & SQL Manager tab in Admin Panel with live table inspector and SQL/JSON dump export
- [x] Emergency Broadcast System with real-time sirens and modals
- [x] Resident Accounts with warning exclusivity (only logged-in users receive alarms)
- [x] Discreet Admin Button with keyboard shortcuts (`Alt+A`) and alternative access routes
