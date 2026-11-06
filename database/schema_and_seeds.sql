-- ===========================================================
-- WE-WARN Database SQL Dump
-- Generated at: 2026-11-06 23:45:59
-- Database: wewarn.db (SQLite 3)
-- ===========================================================

PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

DROP TABLE IF EXISTS users;
CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            display_name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            barangay TEXT DEFAULT 'San Dionisio',
            phone TEXT DEFAULT '',
            created_at TEXT NOT NULL
        );

INSERT INTO users (id, username, password, display_name, role, barangay, phone, created_at) VALUES (1, 'admin', 'admin123', 'PCDRRMO Admin', 'admin', 'San Dionisio', '', '2026-11-06 23:45:39');
INSERT INTO users (id, username, password, display_name, role, barangay, phone, created_at) VALUES (2, 'resident', 'user123', 'Juan Dela Cruz', 'user', 'San Dionisio', '0917-555-0192', '2026-11-06 23:45:39');
INSERT INTO users (id, username, password, display_name, role, barangay, phone, created_at) VALUES (3, 'commuter', 'user123', 'Maria Santos', 'user', 'San Dionisio', '0918-555-0143', '2026-11-06 23:45:39');

DROP TABLE IF EXISTS monitored_areas;
CREATE TABLE monitored_areas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            district TEXT NOT NULL,
            barangay TEXT NOT NULL,
            location TEXT NOT NULL,
            flood_level TEXT NOT NULL,
            remarks TEXT,
            updated_at TEXT NOT NULL
        );

INSERT INTO monitored_areas (id, district, barangay, location, flood_level, remarks, updated_at) VALUES (1, 'District 1', 'San Dionisio', 'Dr. A. Santos Ave. infront of SM Sucat', 'Gutter Level', 'Passable to All Types of Vehicles', '2026-11-06 23:45:39');

DROP TABLE IF EXISTS readings;
CREATE TABLE readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            water_level REAL NOT NULL,
            flood_level TEXT NOT NULL,
            warning_status TEXT NOT NULL,
            road_status TEXT NOT NULL,
            location TEXT NOT NULL,
            timestamp TEXT NOT NULL
        );

INSERT INTO readings (id, water_level, flood_level, warning_status, road_status, location, timestamp) VALUES (1, 6.2, 'Ankle to Knee (Gutter)', 'GREEN', 'Passable to All Vehicles', 'Dr. A. Santos Ave. infront of SM Sucat', '2026-11-06 16:50:12');
INSERT INTO readings (id, water_level, flood_level, warning_status, road_status, location, timestamp) VALUES (2, 7.8, 'Ankle to Knee (Gutter)', 'GREEN', 'Passable to All Vehicles', 'Dr. A. Santos Ave. infront of SM Sucat', '2026-11-06 16:52:15');
INSERT INTO readings (id, water_level, flood_level, warning_status, road_status, location, timestamp) VALUES (3, 9.4, 'Ankle to Knee (Gutter)', 'GREEN', 'Passable to All Vehicles', 'Dr. A. Santos Ave. infront of SM Sucat', '2026-11-06 16:54:18');
INSERT INTO readings (id, water_level, flood_level, warning_status, road_status, location, timestamp) VALUES (4, 11.1, 'Ankle to Knee (Gutter)', 'GREEN', 'Passable to All Vehicles', 'Dr. A. Santos Ave. infront of SM Sucat', '2026-11-06 16:56:22');
INSERT INTO readings (id, water_level, flood_level, warning_status, road_status, location, timestamp) VALUES (5, 13.5, 'Ankle to Knee (Gutter)', 'GREEN', 'Passable to All Vehicles', 'Dr. A. Santos Ave. infront of SM Sucat', '2026-11-06 16:58:25');
INSERT INTO readings (id, water_level, flood_level, warning_status, road_status, location, timestamp) VALUES (6, 14.8, 'Ankle to Knee (Gutter)', 'GREEN', 'Passable to All Vehicles', 'Dr. A. Santos Ave. infront of SM Sucat', '2026-11-06 17:00:30');
INSERT INTO readings (id, water_level, flood_level, warning_status, road_status, location, timestamp) VALUES (7, 15.6, 'Knee to Waist', 'YELLOW', 'Not Passable to Light Vehicles', 'Dr. A. Santos Ave. infront of SM Sucat', '2026-11-06 17:02:35');
INSERT INTO readings (id, water_level, flood_level, warning_status, road_status, location, timestamp) VALUES (8, 16.4, 'Knee to Waist', 'YELLOW', 'Not Passable to Light Vehicles', 'Dr. A. Santos Ave. infront of SM Sucat', '2026-11-06 17:04:40');
INSERT INTO readings (id, water_level, flood_level, warning_status, road_status, location, timestamp) VALUES (9, 15.2, 'Knee to Waist', 'YELLOW', 'Not Passable to Light Vehicles', 'Dr. A. Santos Ave. infront of SM Sucat', '2026-11-06 17:06:45');
INSERT INTO readings (id, water_level, flood_level, warning_status, road_status, location, timestamp) VALUES (10, 13.9, 'Ankle to Knee (Gutter)', 'GREEN', 'Passable to All Vehicles', 'Dr. A. Santos Ave. infront of SM Sucat', '2026-11-06 17:08:50');
INSERT INTO readings (id, water_level, flood_level, warning_status, road_status, location, timestamp) VALUES (11, 12.1, 'Ankle to Knee (Gutter)', 'GREEN', 'Passable to All Vehicles', 'Dr. A. Santos Ave. infront of SM Sucat', '2026-11-06 17:10:55');
INSERT INTO readings (id, water_level, flood_level, warning_status, road_status, location, timestamp) VALUES (12, 10.6, 'Ankle to Knee (Gutter)', 'GREEN', 'Passable to All Vehicles', 'Dr. A. Santos Ave. infront of SM Sucat', '2026-11-06 17:13:00');
INSERT INTO readings (id, water_level, flood_level, warning_status, road_status, location, timestamp) VALUES (13, 9.8, 'Ankle to Knee (Gutter)', 'GREEN', 'Passable to All Vehicles', 'Dr. A. Santos Ave. infront of SM Sucat', '2026-11-06 17:15:05');
INSERT INTO readings (id, water_level, flood_level, warning_status, road_status, location, timestamp) VALUES (14, 9.2, 'Ankle to Knee (Gutter)', 'GREEN', 'Passable to All Vehicles', 'Dr. A. Santos Ave. infront of SM Sucat', '2026-11-06 17:18:10');
INSERT INTO readings (id, water_level, flood_level, warning_status, road_status, location, timestamp) VALUES (15, 8.7, 'Ankle to Knee (Gutter)', 'GREEN', 'Passable to All Vehicles', 'Dr. A. Santos Ave. infront of SM Sucat', '2026-11-06 17:20:00');

DROP TABLE IF EXISTS broadcasts;
CREATE TABLE broadcasts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            severity TEXT NOT NULL DEFAULT 'critical',
            location TEXT NOT NULL,
            sound INTEGER NOT NULL DEFAULT 1,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_by TEXT NOT NULL,
            created_at TEXT NOT NULL
        );


DROP TABLE IF EXISTS system_settings;
CREATE TABLE system_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );


COMMIT;