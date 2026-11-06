"""
WE-WARN Backend Server (Flask + SQLite)
Serves static frontend prototype and provides persistent REST API endpoints
connected directly to database/wewarn.db.
"""

import os
from flask import Flask, request, jsonify, send_from_directory, Response
import database

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, static_folder=BASE_DIR, static_url_path="")

# Ensure database is initialized
database.init_db()


# --- Static Frontend Serving ---

@app.route("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/<path:filename>")
def serve_static(filename):
    if os.path.exists(os.path.join(BASE_DIR, filename)):
        return send_from_directory(BASE_DIR, filename)
    return send_from_directory(BASE_DIR, "index.html"), 404


# --- API Endpoints ---

@app.route("/api/health", methods=["GET"])
def api_health():
    counts = database.get_table_counts()
    return jsonify({
        "status": "ok",
        "engine": "SQLite 3",
        "database_file": "database/wewarn.db",
        "tables": counts
    })


@app.route("/api/readings", methods=["GET", "POST", "DELETE"])
def api_readings():
    if request.method == "GET":
        limit = request.args.get("limit", default=100, type=int)
        location = request.args.get("location", default=None)
        rows = database.get_readings(limit=limit, location=location)
        return jsonify(rows)

    elif request.method == "POST":
        data = request.get_json(force=True, silent=True) or {}
        water_level = data.get("water_level", 0.0)
        flood_level = data.get("flood_level", "Ankle to Knee (Gutter)")
        warning_status = data.get("warning_status", "GREEN")
        road_status = data.get("road_status", "Passable to All Vehicles")
        location = data.get("location", None)
        record = database.add_reading(water_level, flood_level, warning_status, road_status, location)
        return jsonify(record), 201

    elif request.method == "DELETE":
        database.clear_readings()
        return jsonify({"success": True, "message": "All readings cleared."})


@app.route("/api/readings/latest", methods=["GET"])
def api_latest_reading():
    location = request.args.get("location", default=None)
    reading = database.get_latest_reading(location=location)
    return jsonify(reading or {})


@app.route("/api/auth/login", methods=["POST"])
def api_login():
    data = request.get_json(force=True, silent=True) or {}
    username = data.get("username", "")
    password = data.get("password", "")
    user = database.authenticate_user(username, password)
    if user:
        return jsonify({"success": True, "user": user})
    return jsonify({"success": False, "message": "Invalid username or password"}), 401


@app.route("/api/auth/register", methods=["POST"])
def api_register():
    data = request.get_json(force=True, silent=True) or {}
    res = database.register_user(
        username=data.get("username", ""),
        password=data.get("password", ""),
        display_name=data.get("displayName", ""),
        barangay=data.get("barangay", "San Dionisio"),
        phone=data.get("phone", "")
    )
    if res.get("success"):
        return jsonify(res), 201
    return jsonify(res), 400


@app.route("/api/auth/users", methods=["GET"])
def api_users():
    return jsonify(database.get_users())


@app.route("/api/broadcast", methods=["GET", "POST"])
def api_broadcast():
    if request.method == "GET":
        active = database.get_active_broadcast()
        return jsonify(active or {})

    elif request.method == "POST":
        data = request.get_json(force=True, silent=True) or {}
        record = database.add_broadcast(
            title=data.get("title", "EMERGENCY FLOOD ALERT"),
            message=data.get("message", ""),
            severity=data.get("severity", "critical"),
            location=data.get("location", None),
            sound=data.get("sound", 1),
            created_by=data.get("created_by", "PCDRRMO Admin")
        )
        return jsonify(record), 201


@app.route("/api/broadcast/clear", methods=["POST"])
def api_clear_broadcast():
    cleared = database.clear_active_broadcast()
    return jsonify({"success": True, "cleared": cleared})


@app.route("/api/broadcast/history", methods=["GET"])
def api_broadcast_history():
    return jsonify(database.get_broadcast_history())


@app.route("/api/db/stats", methods=["GET"])
def api_db_stats():
    return jsonify({
        "engine": "SQLite 3",
        "file": "database/wewarn.db",
        "counts": database.get_table_counts()
    })


@app.route("/api/db/table/<name>", methods=["GET"])
def api_table_data(name):
    allowed = ["users", "monitored_areas", "readings", "broadcasts", "system_settings"]
    if name not in allowed:
        return jsonify({"error": "Invalid table"}), 400
    limit = request.args.get("limit", default=100, type=int)
    rows = database.get_table_rows(name, limit=limit)
    return jsonify(rows)


@app.route("/api/db/export", methods=["GET"])
def api_db_export():
    sql = database.export_sql()
    return Response(
        sql,
        mimetype="text/plain",
        headers={"Content-Disposition": "attachment;filename=wewarn_backup.sql"}
    )


@app.route("/api/db/reset", methods=["POST"])
def api_db_reset():
    database.init_db(force_reseed=True)
    return jsonify({"success": True, "message": "Database reset to factory seeds."})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 WE-WARN Server running at: http://localhost:{port}")
    print(f"📁 Database connected: {database.DB_PATH}")
    app.run(host="0.0.0.0", port=port, debug=False)
