from flask import Flask, render_template, request, jsonify, redirect, url_for, session
import sqlite3
import uuid
from datetime import datetime
import os

app = Flask(__name__)
app.secret_key = "supersecret"     # Needed for session

# ⚠️ DATABASE LOCATION: ALWAYS in this directory (tastybite-main2)
# DO NOT create duplicate database files in other locations
# This ensures all data is in ONE place and prevents data loss
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data2.db")


# --------------------------------------------------------
# DATABASE FUNCTIONS
# --------------------------------------------------------
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def create_tables():
    conn = get_db()
    cur = conn.cursor()

    # User table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS user_details(
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            firebase_uid TEXT UNIQUE,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            phone TEXT NOT NULL,
            address TEXT NOT NULL
        )
    """)
    
    # Add password column if it doesn't exist
    try:
        cur.execute("ALTER TABLE user_details ADD COLUMN password TEXT NOT NULL DEFAULT ''")
    except:
        pass
    
    # Caterer table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS caterer_details(
            caterer_id INTEGER PRIMARY KEY AUTOINCREMENT,
            firebase_uid TEXT UNIQUE,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            phone TEXT NOT NULL,
            address TEXT NOT NULL,
            fssai TEXT NOT NULL,
            description TEXT DEFAULT '',
            cuisine_type TEXT DEFAULT 'Multi-cuisine'
        )
    """)
    
    # Add password column if it doesn't exist
    try:
        cur.execute("ALTER TABLE caterer_details ADD COLUMN password TEXT NOT NULL DEFAULT ''")
    except:
        pass

    # Menu items table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS menu_items(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            caterer_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            price INTEGER NOT NULL,
            type TEXT NOT NULL,
            category TEXT NOT NULL,
            FOREIGN KEY (caterer_id) REFERENCES caterer_details(caterer_id)
        )
    """)

    # Availability table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS availability(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            caterer_id INTEGER NOT NULL,
            available_date TEXT NOT NULL,
            FOREIGN KEY (caterer_id) REFERENCES caterer_details(caterer_id),
            UNIQUE(caterer_id, available_date)
        )
    """)

    # Booking table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS booking(
            booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            caterer_id INTEGER NOT NULL,
            event_date TEXT NOT NULL,
            event_time TEXT,
            location TEXT,
            guest_count INTEGER DEFAULT 50,
            special_requests TEXT DEFAULT '',
            status TEXT DEFAULT 'pending',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (caterer_id) REFERENCES caterer_details(caterer_id),
            FOREIGN KEY (user_id) REFERENCES user_details(user_id)
        )
    """)

    # Booking items table (food items selected for a booking)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS booking_items(
            booking_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id INTEGER NOT NULL,
            menu_item_id INTEGER NOT NULL,
            quantity INTEGER DEFAULT 1,
            FOREIGN KEY (booking_id) REFERENCES booking(booking_id),
            FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
        )
    """)

    conn.commit()
    conn.close()


# --------------------------------------------------------
# ROUTES (PAGES)
# --------------------------------------------------------
@app.route("/")
def login():
    return render_template("login.html")


@app.route("/catererlogin")
def catererlogin():
    return render_template("catererlogin.html")


@app.route("/userlogin")
def userlogin():
    return render_template("userlogin.html")


@app.route("/submit_user_login", methods=["POST"])
def submit_user_login():
    firebase_uid = request.form.get("firebase_uid", str(uuid.uuid4()))
    name = request.form.get("name", "")
    email = request.form.get("email", "")
    password = request.form.get("password", "")
    phone = request.form.get("phone", "")
    address = request.form.get("address", "")
    is_signup = request.form.get("is_signup", "false") == "true"
    
    session["firebase_uid"] = firebase_uid
    session["user_type"] = "user"
    session["user_email"] = email
    
    conn = get_db()
    cur = conn.cursor()
    
    try:
        if is_signup:
            # Registration flow
            cur.execute("""
                INSERT INTO user_details (firebase_uid, name, email, password, phone, address)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (firebase_uid, name, email, password, phone, address))
            session["user_id"] = cur.lastrowid
        else:
            # Login flow
            cur.execute("SELECT * FROM user_details WHERE email=? AND password=?", (email, password))
            user = cur.fetchone()
            if not user:
                conn.close()
                return redirect(url_for("userlogin") + "?error=invalid_credentials")
            session["user_id"] = user["user_id"]
            session["firebase_uid"] = user["firebase_uid"]
        
        conn.commit()
        conn.close()
        return redirect(url_for("user_dashboard"))
    except sqlite3.IntegrityError as e:
        conn.close()
        return redirect(url_for("userlogin") + "?error=email_exists")


@app.route("/submit_caterer_login", methods=["POST"])
def submit_caterer_login():
    firebase_uid = request.form.get("firebase_uid", str(uuid.uuid4()))
    name = request.form.get("name", "")
    email = request.form.get("email", "")
    password = request.form.get("password", "")
    phone = request.form.get("phone", "")
    address = request.form.get("address", "")
    fssai = request.form.get("fssai", "")
    is_signup = request.form.get("is_signup", "false") == "true"
    
    session["firebase_uid"] = firebase_uid
    session["user_type"] = "caterer"
    session["caterer_email"] = email
    
    conn = get_db()
    cur = conn.cursor()
    
    try:
        if is_signup:
            # Registration flow
            cur.execute("""
                INSERT INTO caterer_details (firebase_uid, name, email, password, phone, address, fssai)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (firebase_uid, name, email, password, phone, address, fssai))
            session["caterer_id"] = cur.lastrowid
        else:
            # Login flow
            cur.execute("SELECT * FROM caterer_details WHERE email=? AND password=?", (email, password))
            caterer = cur.fetchone()
            if not caterer:
                conn.close()
                return redirect(url_for("catererlogin") + "?error=invalid_credentials")
            session["caterer_id"] = caterer["caterer_id"]
            session["firebase_uid"] = caterer["firebase_uid"]
        
        conn.commit()
        conn.close()
        return redirect(url_for("caterer_dashboard"))
    except sqlite3.IntegrityError as e:
        conn.close()
        return redirect(url_for("catererlogin") + "?error=email_exists")


@app.route("/user_dashboard")
def user_dashboard():
    return render_template("user_dashboard.html")


@app.route("/caterer_dashboard")
def caterer_dashboard():
    return render_template("caterer_dashboard.html")


@app.route("/my_booking")
def my_booking():
    return render_template("my_booking.html")


@app.route("/my_profile")
def my_profile():
    return render_template("my_profile.html")


@app.route("/availability")
def availability():
    return render_template("availability.html")


@app.route("/caterer_bookings")
def caterer_bookings():
    return render_template("cbooking.html")


@app.route("/caterer_profile")
def caterer_profile():
    return render_template("cmy_profile.html")


@app.route("/view_caterer/<int:caterer_id>")
def view_caterer(caterer_id):
    return render_template("detail.html", caterer_id=caterer_id)


# --------------------------------------------------------
# SUBMIT USER DETAILS
# --------------------------------------------------------
# --------------------------------------------------------
# CATERERS API
# --------------------------------------------------------
@app.route("/api/caterers", methods=["GET"])
def api_get_caterers():
    search = request.args.get("search", "").lower()
    
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM caterer_details")
    rows = cur.fetchall()
    conn.close()
    
    caterers = [dict(r) for r in rows]
    
    # Filter by search term
    if search:
        caterers = [c for c in caterers if 
                   search in c["name"].lower() or 
                   search in c["address"].lower() or
                   search in c.get("cuisine_type", "").lower()]
    
    return jsonify(caterers)


@app.route("/api/caterers/<int:caterer_id>", methods=["GET"])
def api_get_caterer(caterer_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM caterer_details WHERE caterer_id=?", (caterer_id,))
    row = cur.fetchone()
    conn.close()
    
    if row:
        return jsonify(dict(row))
    return jsonify({"error": "Caterer not found"}), 404


# --------------------------------------------------------
# MENU API
# --------------------------------------------------------
@app.route("/manage_menu")
def manage_menu():
    return render_template("menu.html")


@app.route("/api/menu", methods=["GET"])
def api_get_menu():
    caterer_id = request.args.get("caterer_id", None)

    conn = get_db()
    cur = conn.cursor()

    if caterer_id:
        cur.execute("SELECT * FROM menu_items WHERE caterer_id=?", (caterer_id,))
    else:
        # Get menu for logged-in caterer
        firebase_uid = session.get("firebase_uid")
        if firebase_uid:
            cur.execute("""
                SELECT m.* FROM menu_items m 
                JOIN caterer_details c ON m.caterer_id = c.caterer_id
                WHERE c.firebase_uid=?
            """, (firebase_uid,))
        else:
            cur.execute("SELECT * FROM menu_items")

    rows = cur.fetchall()
    conn.close()

    return jsonify([dict(r) for r in rows])


@app.route("/api/menu", methods=["POST"])
def api_add_menu():
    data = request.get_json()
    firebase_uid = session.get("firebase_uid")

    conn = get_db()
    cur = conn.cursor()

    # get caterer ID using firebase uid
    cur.execute("SELECT caterer_id FROM caterer_details WHERE firebase_uid=?", (firebase_uid,))
    row = cur.fetchone()
    
    if not row:
        conn.close()
        return jsonify({"error": "Caterer not found"}), 404
        
    caterer_id = row["caterer_id"]

    cur.execute("""
        INSERT INTO menu_items (caterer_id, name, price, type, category)
        VALUES (?, ?, ?, ?, ?)
    """, (
        caterer_id,
        data["name"],
        data["price"],
        data["type"],
        data["category"]
    ))

    conn.commit()
    new_id = cur.lastrowid
    conn.close()

    return jsonify({"message": "Menu item added", "id": new_id})


@app.route("/api/menu/<int:item_id>", methods=["PUT"])
def api_update_menu(item_id):
    data = request.get_json()

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        UPDATE menu_items
        SET name=?, price=?, type=?, category=?
        WHERE id=?
    """, (data["name"], data["price"], data["type"], data["category"], item_id))

    conn.commit()
    conn.close()

    return jsonify({"message": "Menu item updated"})


@app.route("/api/menu/<int:item_id>", methods=["DELETE"])
def api_delete_menu(item_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM menu_items WHERE id=?", (item_id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Menu item deleted"})


# --------------------------------------------------------
# AVAILABILITY API
# --------------------------------------------------------
@app.route("/api/availability", methods=["GET"])
def api_get_availability():
    caterer_id = request.args.get("caterer_id", None)
    
    conn = get_db()
    cur = conn.cursor()
    
    if caterer_id:
        cur.execute("SELECT * FROM availability WHERE caterer_id=? ORDER BY available_date", (caterer_id,))
    else:
        # Get for logged-in caterer
        firebase_uid = session.get("firebase_uid")
        if firebase_uid:
            cur.execute("""
                SELECT a.* FROM availability a 
                JOIN caterer_details c ON a.caterer_id = c.caterer_id
                WHERE c.firebase_uid=?
                ORDER BY a.available_date
            """, (firebase_uid,))
        else:
            cur.execute("SELECT * FROM availability ORDER BY available_date")
    
    rows = cur.fetchall()
    conn.close()
    
    return jsonify([dict(r) for r in rows])


@app.route("/api/availability", methods=["POST"])
def api_add_availability():
    data = request.get_json()
    firebase_uid = session.get("firebase_uid")
    
    conn = get_db()
    cur = conn.cursor()
    
    # get caterer ID
    cur.execute("SELECT caterer_id FROM caterer_details WHERE firebase_uid=?", (firebase_uid,))
    row = cur.fetchone()
    
    if not row:
        conn.close()
        return jsonify({"error": "Caterer not found"}), 404
    
    caterer_id = row["caterer_id"]
    
    try:
        cur.execute("""
            INSERT INTO availability (caterer_id, available_date)
            VALUES (?, ?)
        """, (caterer_id, data["date"]))
        conn.commit()
        new_id = cur.lastrowid
        conn.close()
        return jsonify({"message": "Date added", "id": new_id})
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"message": "Date already exists"}), 400


@app.route("/api/availability/<date>", methods=["DELETE"])
def api_delete_availability(date):
    firebase_uid = session.get("firebase_uid")
    
    conn = get_db()
    cur = conn.cursor()
    
    # get caterer ID
    cur.execute("SELECT caterer_id FROM caterer_details WHERE firebase_uid=?", (firebase_uid,))
    row = cur.fetchone()
    
    if row:
        caterer_id = row["caterer_id"]
        cur.execute("DELETE FROM availability WHERE caterer_id=? AND available_date=?", (caterer_id, date))
        conn.commit()
    
    conn.close()
    return jsonify({"message": "Date removed"})


# --------------------------------------------------------
# BOOKING API
# --------------------------------------------------------
@app.route("/api/bookings", methods=["GET"])
def api_get_bookings():
    user_type = session.get("user_type", "")
    firebase_uid = session.get("firebase_uid", "")
    
    conn = get_db()
    cur = conn.cursor()
    
    if user_type == "user":
        # Get user's bookings
        cur.execute("""
            SELECT b.*, c.name as caterer_name, c.phone as caterer_phone, c.address as caterer_address
            FROM booking b
            JOIN caterer_details c ON b.caterer_id = c.caterer_id
            JOIN user_details u ON b.user_id = u.user_id
            WHERE u.firebase_uid = ?
            ORDER BY b.created_at DESC
        """, (firebase_uid,))
    elif user_type == "caterer":
        # Get caterer's bookings
        cur.execute("""
            SELECT b.*, u.name as user_name, u.phone as user_phone, u.address as user_address
            FROM booking b
            JOIN user_details u ON b.user_id = u.user_id
            JOIN caterer_details c ON b.caterer_id = c.caterer_id
            WHERE c.firebase_uid = ?
            ORDER BY b.created_at DESC
        """, (firebase_uid,))
    else:
        conn.close()
        return jsonify([])
    
    rows = cur.fetchall()
    conn.close()
    
    return jsonify([dict(r) for r in rows])


@app.route("/api/bookings", methods=["POST"])
def api_create_booking():
    data = request.get_json()
    firebase_uid = session.get("firebase_uid")
    
    conn = get_db()
    cur = conn.cursor()
    
    # Get user ID
    cur.execute("SELECT user_id FROM user_details WHERE firebase_uid=?", (firebase_uid,))
    row = cur.fetchone()
    
    if not row:
        conn.close()
        return jsonify({"error": "User not found"}), 404
    
    user_id = row["user_id"]
    
    cur.execute("""
        INSERT INTO booking (user_id, caterer_id, event_date, event_time, location, guest_count, special_requests, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    """, (
        user_id,
        data["caterer_id"],
        data["event_date"],
        data.get("event_time", ""),
        data.get("location", ""),
        data.get("guest_count", 50),
        data.get("special_requests", "")
    ))
    
    conn.commit()
    booking_id = cur.lastrowid
    
    # Add food items to booking if provided
    food_items = data.get("food_items", [])
    for item in food_items:
        cur.execute("""
            INSERT INTO booking_items (booking_id, menu_item_id, quantity)
            VALUES (?, ?, 1)
        """, (booking_id, item["menu_item_id"]))
    
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Booking created", "booking_id": booking_id})


@app.route("/api/bookings/<int:booking_id>", methods=["PUT"])
def api_update_booking(booking_id):
    data = request.get_json()
    
    conn = get_db()
    cur = conn.cursor()
    
    if "status" in data:
        cur.execute("UPDATE booking SET status=? WHERE booking_id=?", (data["status"], booking_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Booking updated"})


@app.route("/api/bookings/<int:booking_id>", methods=["DELETE"])
def api_delete_booking(booking_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM booking WHERE booking_id=?", (booking_id,))
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Booking deleted"})


@app.route("/api/booking_items/<int:booking_id>", methods=["GET"])
def api_get_booking_items(booking_id):
    conn = get_db()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT bi.booking_item_id, bi.menu_item_id, bi.quantity, m.name, m.price, m.category
        FROM booking_items bi
        JOIN menu_items m ON bi.menu_item_id = m.id
        WHERE bi.booking_id = ?
    """, (booking_id,))
    
    rows = cur.fetchall()
    conn.close()
    
    return jsonify([dict(r) for r in rows])


# --------------------------------------------------------
# USER PROFILE API
# --------------------------------------------------------
@app.route("/api/user/profile", methods=["GET"])
def api_get_user_profile():
    firebase_uid = session.get("firebase_uid")
    
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM user_details WHERE firebase_uid=?", (firebase_uid,))
    row = cur.fetchone()
    conn.close()
    
    if row:
        return jsonify(dict(row))
    return jsonify({"error": "User not found"}), 404


@app.route("/api/user/profile", methods=["PUT"])
def api_update_user_profile():
    data = request.get_json()
    firebase_uid = session.get("firebase_uid")
    
    conn = get_db()
    cur = conn.cursor()
    
    cur.execute("""
        UPDATE user_details SET name=?, phone=?, address=?, email=?
        WHERE firebase_uid=?
    """, (data["name"], data["phone"], data["address"], data.get("email", ""), firebase_uid))
    
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Profile updated"})


# --------------------------------------------------------
# CATERER PROFILE API
# --------------------------------------------------------
@app.route("/api/caterer/profile", methods=["GET"])
def api_get_caterer_profile():
    firebase_uid = session.get("firebase_uid")
    
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM caterer_details WHERE firebase_uid=?", (firebase_uid,))
    row = cur.fetchone()
    conn.close()
    
    if row:
        return jsonify(dict(row))
    return jsonify({"error": "Caterer not found"}), 404


@app.route("/api/caterer/profile", methods=["PUT"])
def api_update_caterer_profile():
    data = request.get_json()
    firebase_uid = session.get("firebase_uid")
    
    conn = get_db()
    cur = conn.cursor()
    
    cur.execute("""
        UPDATE caterer_details 
        SET name=?, phone=?, address=?, fssai=?, email=?, description=?, cuisine_type=?
        WHERE firebase_uid=?
    """, (
        data["name"], 
        data["phone"], 
        data["address"], 
        data["fssai"],
        data.get("email", ""),
        data.get("description", ""),
        data.get("cuisine_type", "Multi-cuisine"),
        firebase_uid
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Profile updated"})


# --------------------------------------------------------
# CATERER STATS API
# --------------------------------------------------------
@app.route("/api/caterer/stats", methods=["GET"])
def api_get_caterer_stats():
    firebase_uid = session.get("firebase_uid")
    
    conn = get_db()
    cur = conn.cursor()
    
    # Get caterer ID
    cur.execute("SELECT caterer_id FROM caterer_details WHERE firebase_uid=?", (firebase_uid,))
    row = cur.fetchone()
    
    if not row:
        conn.close()
        return jsonify({"error": "Caterer not found"}), 404
    
    caterer_id = row["caterer_id"]
    
    # Get stats
    cur.execute("SELECT COUNT(*) as total FROM booking WHERE caterer_id=?", (caterer_id,))
    total_bookings = cur.fetchone()["total"]
    
    cur.execute("SELECT COUNT(*) as pending FROM booking WHERE caterer_id=? AND status='pending'", (caterer_id,))
    pending_bookings = cur.fetchone()["pending"]
    
    cur.execute("SELECT COUNT(*) as accepted FROM booking WHERE caterer_id=? AND status='accepted'", (caterer_id,))
    accepted_bookings = cur.fetchone()["accepted"]
    
    cur.execute("SELECT COUNT(*) as menu FROM menu_items WHERE caterer_id=?", (caterer_id,))
    menu_items = cur.fetchone()["menu"]
    
    cur.execute("SELECT COUNT(*) as avail FROM availability WHERE caterer_id=?", (caterer_id,))
    available_dates = cur.fetchone()["avail"]
    
    conn.close()
    
    return jsonify({
        "total_bookings": total_bookings,
        "pending_bookings": pending_bookings,
        "accepted_bookings": accepted_bookings,
        "menu_items": menu_items,
        "available_dates": available_dates
    })


# --------------------------------------------------------
# RUN APP
# --------------------------------------------------------
if __name__ == "__main__":
    create_tables()
    app.run(debug=True)
