// WE-WARN Seed Data — Monitored Location: San Dionisio, Dr. A. Santos Ave. infront of SM Sucat
window.WEWARN_CONFIG = {
  GREEN_MAX_CM: 15.0,
  YELLOW_MAX_CM: 60.0,
  LOCATION_NAME: "Dr. A. Santos Ave. infront of SM Sucat",
  BARANGAY: "San Dionisio",
  DISTRICT: "District 1",
  LOCATION_LAT: 14.4962,
  LOCATION_LNG: 120.9995,
  ADMIN_DEFAULT: {
    username: "admin",
    password: "admin123",
    displayName: "Station Admin",
    role: "admin"
  }
};

window.WEWARN_INITIAL_AREAS = [
  {
    id: 1,
    district: "District 1",
    barangay: "San Dionisio",
    location: "Dr. A. Santos Ave. infront of SM Sucat",
    flood_level: "Gutter Level",
    remarks: "Passable to All Types of Vehicles"
  }
];

window.WEWARN_INITIAL_WARNINGS = [
  {
    id: 1,
    title: "Flood Advisory — SM Sucat Corridor",
    message: "Minor standing water reported along Dr. A. Santos Ave. infront of SM Sucat (Southbound). All vehicles may pass with caution. Drive slowly.",
    severity: "info",
    is_active: true,
    created_by: "Station Admin",
    created_at: "2026-11-06 15:20:00",
    updated_at: "2026-11-06 15:20:00"
  },
  {
    id: 2,
    title: "Moderate Rainfall Alert — San Dionisio",
    message: "Intermittent rainfall recorded at Dr. A. Santos Ave. Water level remains within normal threshold. Exercise caution when navigating curbside lanes.",
    severity: "warning",
    is_active: true,
    created_by: "Station Admin",
    created_at: "2026-11-06 16:45:00",
    updated_at: "2026-11-06 16:45:00"
  }
];

window.WEWARN_INITIAL_READINGS = [
  { id: 1, water_level: 6.2, flood_level: "Ankle to Knee (Gutter)", warning_status: "GREEN", road_status: "Passable to All Vehicles", location: "Dr. A. Santos Ave. infront of SM Sucat", timestamp: "2026-11-06 16:50:12" },
  { id: 2, water_level: 7.8, flood_level: "Ankle to Knee (Gutter)", warning_status: "GREEN", road_status: "Passable to All Vehicles", location: "Dr. A. Santos Ave. infront of SM Sucat", timestamp: "2026-11-06 16:52:15" },
  { id: 3, water_level: 9.4, flood_level: "Ankle to Knee (Gutter)", warning_status: "GREEN", road_status: "Passable to All Vehicles", location: "Dr. A. Santos Ave. infront of SM Sucat", timestamp: "2026-11-06 16:54:18" },
  { id: 4, water_level: 11.1, flood_level: "Ankle to Knee (Gutter)", warning_status: "GREEN", road_status: "Passable to All Vehicles", location: "Dr. A. Santos Ave. infront of SM Sucat", timestamp: "2026-11-06 16:56:22" },
  { id: 5, water_level: 13.5, flood_level: "Ankle to Knee (Gutter)", warning_status: "GREEN", road_status: "Passable to All Vehicles", location: "Dr. A. Santos Ave. infront of SM Sucat", timestamp: "2026-11-06 16:58:25" },
  { id: 6, water_level: 14.8, flood_level: "Ankle to Knee (Gutter)", warning_status: "GREEN", road_status: "Passable to All Vehicles", location: "Dr. A. Santos Ave. infront of SM Sucat", timestamp: "2026-11-06 17:00:30" },
  { id: 7, water_level: 15.6, flood_level: "Knee to Waist", warning_status: "YELLOW", road_status: "Not Passable to Light Vehicles", location: "Dr. A. Santos Ave. infront of SM Sucat", timestamp: "2026-11-06 17:02:35" },
  { id: 8, water_level: 16.4, flood_level: "Knee to Waist", warning_status: "YELLOW", road_status: "Not Passable to Light Vehicles", location: "Dr. A. Santos Ave. infront of SM Sucat", timestamp: "2026-11-06 17:04:40" },
  { id: 9, water_level: 15.2, flood_level: "Knee to Waist", warning_status: "YELLOW", road_status: "Not Passable to Light Vehicles", location: "Dr. A. Santos Ave. infront of SM Sucat", timestamp: "2026-11-06 17:06:45" },
  { id: 10, water_level: 13.9, flood_level: "Ankle to Knee (Gutter)", warning_status: "GREEN", road_status: "Passable to All Vehicles", location: "Dr. A. Santos Ave. infront of SM Sucat", timestamp: "2026-11-06 17:08:50" },
  { id: 11, water_level: 12.1, flood_level: "Ankle to Knee (Gutter)", warning_status: "GREEN", road_status: "Passable to All Vehicles", location: "Dr. A. Santos Ave. infront of SM Sucat", timestamp: "2026-11-06 17:10:55" },
  { id: 12, water_level: 10.6, flood_level: "Ankle to Knee (Gutter)", warning_status: "GREEN", road_status: "Passable to All Vehicles", location: "Dr. A. Santos Ave. infront of SM Sucat", timestamp: "2026-11-06 17:13:00" },
  { id: 13, water_level: 9.8, flood_level: "Ankle to Knee (Gutter)", warning_status: "GREEN", road_status: "Passable to All Vehicles", location: "Dr. A. Santos Ave. infront of SM Sucat", timestamp: "2026-11-06 17:15:05" },
  { id: 14, water_level: 9.2, flood_level: "Ankle to Knee (Gutter)", warning_status: "GREEN", road_status: "Passable to All Vehicles", location: "Dr. A. Santos Ave. infront of SM Sucat", timestamp: "2026-11-06 17:18:10" },
  { id: 15, water_level: 8.7, flood_level: "Ankle to Knee (Gutter)", warning_status: "GREEN", road_status: "Passable to All Vehicles", location: "Dr. A. Santos Ave. infront of SM Sucat", timestamp: "2026-11-06 17:20:00" }
];
