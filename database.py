"""
WE-WARN Database Management Module (SQLite)
Handles persistent storage for water level readings, user accounts,
station status, and emergency alerts.
"""

import sqlite3
import os
import json
from datetime import datetime

DB_DIR = os.path.join(os.path.dirname(__file__), "database")
DB_PATH = os.path.join(DB_DIR, "wewarn.db")


def get_connection():
    """Returns a SQLite connection with Row factory enabled."""
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db(force_reseed=False):
    """Initializes tables and seeds default records if empty."""
    conn = get_connection()
    cur = conn.cursor()

    # 1. User Accounts Table (Admins and Residents)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            display_name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            barangay TEXT DEFAULT 'San Dionisio',
            phone TEXT DEFAULT '',
            created_at TEXT NOT NULL
        )
    """)

    # 2. Water Elevation Readings Table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            water_level REAL NOT NULL,
            flood_level TEXT NOT NULL,
            warning_status TEXT NOT NULL,
            road_status TEXT NOT NULL,
            location TEXT NOT NULL,
            timestamp TEXT NOT NULL
        )
    """)

    # 3. Monitored Area Status Table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS monitored_areas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            district TEXT NOT NULL,
            barangay TEXT NOT NULL,
            location TEXT NOT NULL,
            flood_level TEXT NOT NULL,
            remarks TEXT,
            updated_at TEXT NOT NULL
        )
    """)

    # 4. Emergency Broadcasts Table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS broadcasts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            severity TEXT NOT NULL DEFAULT 'critical',
            location TEXT NOT NULL,
            sound INTEGER NOT NULL DEFAULT 1,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_by TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    # 5. System Key-Value Settings Table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS system_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
    """)

    conn.commit()

    now_ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Seed Default Users if empty
    cur.execute("SELECT COUNT(*) AS c FROM users")
    if cur.fetchone()["c"] == 0 or force_reseed:
        default_users = [
            ("admin", "admin123", "PCDRRMO Admin", "admin", "San Dionisio", "", now_ts),
            ("resident", "user123", "Juan Dela Cruz", "user", "San Dionisio", "0917-555-0192", now_ts),
            ("commuter", "user123", "Maria Santos", "user", "San Dionisio", "0918-555-0143", now_ts),
        ]
        cur.executemany("""
            INSERT OR IGNORE INTO users (username, password, display_name, role, barangay, phone, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, default_users)
        conn.commit()

    # Seed Monitored Station if empty
    cur.execute("SELECT COUNT(*) AS c FROM monitored_areas")
    if cur.fetchone()["c"] == 0 or force_reseed:
        cur.execute("""
            INSERT OR REPLACE INTO monitored_areas (id, district, barangay, location, flood_level, remarks, updated_at)
            VALUES (1, 'District 1', 'San Dionisio', 'Dr. A. Santos Ave. infront of SM Sucat', 'Gutter Level', 'Passable to All Types of Vehicles', ?)
        """, (now_ts,))
        conn.commit()

    # Seed Initial Historical Readings if empty
    cur.execute("SELECT COUNT(*) AS c FROM readings")
    if cur.fetchone()["c"] == 0 or force_reseed:
        initial_readings = [
            (6.2, "Ankle to Knee (Gutter)", "GREEN", "Passable to All Vehicles", "Dr. A. Santos Ave. infront of SM Sucat", "2026-11-06 16:50:12"),
            (7.8, "Ankle to Knee (Gutter)", "GREEN", "Passable to All Vehicles", "Dr. A. Santos Ave. infront of SM Sucat", "2026-11-06 16:52:15"),
            (9.4, "Ankle to Knee (Gutter)", "GREEN", "Passable to All Vehicles", "Dr. A. Santos Ave. infront of SM Sucat", "2026-11-06 16:54:18"),
            (11.1, "Ankle to Knee (Gutter)", "GREEN", "Passable to All Vehicles", "Dr. A. Santos Ave. infront of SM Sucat", "2026-11-06 16:56:22"),
            (13.5, "Ankle to Knee (Gutter)", "GREEN", "Passable to All Vehicles", "Dr. A. Santos Ave. infront of SM Sucat", "2026-11-06 16:58:25"),
            (14.8, "Ankle to Knee (Gutter)", "GREEN", "Passable to All Vehicles", "Dr. A. Santos Ave. infront of SM Sucat", "2026-11-06 17:00:30"),
            (15.6, "Knee to Waist", "YELLOW", "Not Passable to Light Vehicles", "Dr. A. Santos Ave. infront of SM Sucat", "2026-11-06 17:02:35"),
            (16.4, "Knee to Waist", "YELLOW", "Not Passable to Light Vehicles", "Dr. A. Santos Ave. infront of SM Sucat", "2026-11-06 17:04:40"),
            (15.2, "Knee to Waist", "YELLOW", "Not Passable to Light Vehicles", "Dr. A. Santos Ave. infront of SM Sucat", "2026-11-06 17:06:45"),
            (13.9, "Ankle to Knee (Gutter)", "GREEN", "Passable to All Vehicles", "Dr. A. Santos Ave. infront of SM Sucat", "2026-11-06 17:08:50"),
            (12.1, "Ankle to Knee (Gutter)", "GREEN", "Passable to All Vehicles", "Dr. A. Santos Ave. infront of SM Sucat", "2026-11-06 17:10:55"),
            (10.6, "Ankle to Knee (Gutter)", "GREEN", "Passable to All Vehicles", "Dr. A. Santos Ave. infront of SM Sucat", "2026-11-06 17:13:00"),
            (9.8, "Ankle to Knee (Gutter)", "GREEN", "Passable to All Vehicles", "Dr. A. Santos Ave. infront of SM Sucat", "2026-11-06 17:15:05"),
            (9.2, "Ankle to Knee (Gutter)", "GREEN", "Passable to All Vehicles", "Dr. A. Santos Ave. infront of SM Sucat", "2026-11-06 17:18:10"),
            (8.7, "Ankle to Knee (Gutter)", "GREEN", "Passable to All Vehicles", "Dr. A. Santos Ave. infront of SM Sucat", "2026-11-06 17:20:00"),
        ]
        cur.executemany("""
            INSERT INTO readings (water_level, flood_level, warning_status, road_status, location, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        """, initial_readings)
        conn.commit()

    conn.close()
    return True


# --- Read Operations ---

def get_table_counts():
    """Returns total row counts for all database tables."""
    conn = get_connection()
    tables = ["users", "readings", "monitored_areas", "broadcasts"]
    counts = {}
    for t in tables:
        try:
            r = conn.execute(f"SELECT COUNT(*) AS c FROM {t}").fetchone()
            counts[t] = r["c"]
        except Exception:
            counts[t] = 0
    conn.close()
    return counts


def get_readings(limit=100, location=None):
    conn = get_connection()
    if location:
        rows = conn.execute(
            "SELECT * FROM readings WHERE location = ? ORDER BY id DESC LIMIT ?",
            (location, limit)
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM readings ORDER BY id DESC LIMIT ?",
            (limit,)
        ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_latest_reading(location=None):
    conn = get_connection()
    if location:
        row = conn.execute(
            "SELECT * FROM readings WHERE location = ? ORDER BY id DESC LIMIT 1",
            (location,)
        ).fetchone()
    else:
        row = conn.execute(
            "SELECT * FROM readings ORDER BY id DESC LIMIT 1"
        ).fetchone()
    conn.close()
    return dict(row) if row else None


def add_reading(water_level, flood_level, warning_status, road_status, location=None):
    loc = location or "Dr. A. Santos Ave. infront of SM Sucat"
    now_ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO readings (water_level, flood_level, warning_status, road_status, location, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (float(water_level), flood_level, warning_status, road_status, loc, now_ts))
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return {
        "id": new_id,
        "water_level": float(water_level),
        "flood_level": flood_level,
        "warning_status": warning_status,
        "road_status": road_status,
        "location": loc,
        "timestamp": now_ts
    }


def clear_readings():
    conn = get_connection()
    conn.execute("DELETE FROM readings")
    conn.commit()
    conn.close()
    return True


# --- User Authentication & Management ---

def get_users():
    conn = get_connection()
    rows = conn.execute("SELECT id, username, display_name, role, barangay, phone, created_at FROM users ORDER BY id ASC").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def authenticate_user(username, password):
    conn = get_connection()
    row = conn.execute(
        "SELECT id, username, display_name, role, barangay, phone FROM users WHERE LOWER(username) = LOWER(?) AND password = ?",
        (username.strip(), password)
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def register_user(username, password, display_name, barangay="San Dionisio", phone=""):
    clean_u = username.strip()
    conn = get_connection()
    existing = conn.execute("SELECT id FROM users WHERE LOWER(username) = LOWER(?)", (clean_u,)).fetchone()
    if existing:
        conn.close()
        return {"success": False, "message": "Username already taken."}

    now_ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO users (username, password, display_name, role, barangay, phone, created_at)
        VALUES (?, ?, ?, 'user', ?, ?, ?)
    """, (clean_u, password, display_name.strip() or clean_u, barangay.strip(), phone.strip(), now_ts))
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return {
        "success": True,
        "user": {
            "id": new_id,
            "username": clean_u,
            "display_name": display_name.strip() or clean_u,
            "role": "user",
            "barangay": barangay.strip()
        }
    }


# --- Emergency Broadcast Management ---

def get_active_broadcast():
    conn = get_connection()
    row = conn.execute("SELECT * FROM broadcasts WHERE is_active = 1 ORDER BY id DESC LIMIT 1").fetchone()
    conn.close()
    return dict(row) if row else None


def get_broadcast_history(limit=20):
    conn = get_connection()
    rows = conn.execute("SELECT * FROM broadcasts ORDER BY id DESC LIMIT ?", (limit,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def add_broadcast(title, message, severity, location=None, sound=1, created_by="PCDRRMO Admin"):
    loc = location or "Dr. A. Santos Ave. infront of SM Sucat"
    now_ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO broadcasts (title, message, severity, location, sound, is_active, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, 1, ?, ?)
    """, (title.strip(), message.strip(), severity.strip().lower(), loc, 1 if sound else 0, created_by, now_ts))
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return {
        "id": new_id,
        "title": title.strip(),
        "message": message.strip(),
        "severity": severity.strip().lower(),
        "location": loc,
        "sound": bool(sound),
        "is_active": True,
        "created_by": created_by,
        "created_at": now_ts
    }


def clear_active_broadcast():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE broadcasts SET is_active = 0 WHERE is_active = 1")
    conn.commit()
    affected = cur.rowcount
    conn.close()
    return affected > 0


def get_table_rows(table_name, limit=100):
    """Fetches records for a given table with safety restrictions."""
    allowed = ["users", "monitored_areas", "readings", "broadcasts", "system_settings"]
    if table_name not in allowed:
        return []
    conn = get_connection()
    if table_name == "users":
        rows = conn.execute(
            "SELECT id, username, display_name, role, barangay, phone, created_at FROM users ORDER BY id ASC LIMIT ?",
            (limit,)
        ).fetchall()
    elif table_name == "readings":
        rows = conn.execute("SELECT * FROM readings ORDER BY id DESC LIMIT ?", (limit,)).fetchall()
    elif table_name == "broadcasts":
        rows = conn.execute("SELECT * FROM broadcasts ORDER BY id DESC LIMIT ?", (limit,)).fetchall()
    else:
        rows = conn.execute(f"SELECT * FROM {table_name} LIMIT ?", (limit,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# --- SQL Dump Generator ---

def export_sql():
    """Generates a complete standalone SQL script recreating the database and its seed records."""
    conn = get_connection()
    lines = [
        "-- ===========================================================",
        "-- WE-WARN Database SQL Dump",
        f"-- Generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "-- Database: wewarn.db (SQLite 3)",
        "-- ===========================================================\n",
        "PRAGMA foreign_keys = OFF;",
        "BEGIN TRANSACTION;\n"
    ]

    tables = ["users", "monitored_areas", "readings", "broadcasts", "system_settings"]
    for t in tables:
        try:
            # Schema
            schema = conn.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name=?", (t,)).fetchone()
            if schema and schema["sql"]:
                lines.append(f"DROP TABLE IF EXISTS {t};")
                lines.append(schema["sql"] + ";\n")

            # Data
            rows = conn.execute(f"SELECT * FROM {t}").fetchall()
            for r in rows:
                cols = list(r.keys())
                vals = []
                for val in r:
                    if val is None:
                        vals.append("NULL")
                    elif isinstance(val, (int, float)):
                        vals.append(str(val))
                    else:
                        escaped = str(val).replace("'", "''")
                        vals.append(f"'{escaped}'")
                col_names = ", ".join(cols)
                val_list = ", ".join(vals)
                lines.append(f"INSERT INTO {t} ({col_names}) VALUES ({val_list});")
            lines.append("")
        except Exception:
            pass

    lines.append("COMMIT;")
    conn.close()
    return "\n".join(lines)


if __name__ == "__main__":
    print(f"Initializing WE-WARN SQLite Database at: {DB_PATH}")
    init_db()
    counts = get_table_counts()
    print("Database Initialized Successfully!")
    for tbl, cnt in counts.items():
        print(f"  - Table '{tbl}': {cnt} records")
