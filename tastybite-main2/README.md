# TastyBite - Catering Management System

A web application that connects users with professional caterers for events like weddings, corporate events, and parties.

## Features

- **Dual login system** — separate portals for Users and Caterers
- **Caterer discovery** — browse and search caterers by name, location, or cuisine type
- **Menu management** — caterers can add, edit, and delete menu items
- **Availability calendar** — caterers set available dates; users book accordingly
- **Booking system** — users create bookings with food item selection, guest count, and special requests
- **Booking management** — caterers can accept/reject bookings; users can track booking status
- **Profile management** — both users and caterers can update their profiles

## Tech Stack

- **Backend:** Python, Flask
- **Database:** SQLite (`data2.db`)
- **Frontend:** HTML, CSS, JavaScript
- **Auth:** Firebase Authentication

## Project Structure

```
tastybite-main2/
├── app.py              # Flask app — routes and API endpoints
├── data2.db            # SQLite database
├── static/
│   ├── firebase.js     # Firebase initialization
│   ├── style.css       # Global styles
│   ├── booking.js/css  # Booking page logic
│   ├── menu.js/css     # Menu management
│   ├── available.js/css# Availability management
│   └── images/         # Caterer images
└── templates/          # Jinja2 HTML templates
```

## Setup & Run

1. **Install dependencies**
   ```bash
   pip install flask
   ```

2. **Run the app**
   ```bash
   python app.py
   ```

3. Open `http://127.0.0.1:5000` in your browser.

The database and tables are created automatically on first run.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/caterers` | List all caterers (supports `?search=`) |
| GET | `/api/caterers/<id>` | Get caterer details |
| GET/POST | `/api/menu` | Get or add menu items |
| PUT/DELETE | `/api/menu/<id>` | Update or delete a menu item |
| GET/POST | `/api/availability` | Get or add available dates |
| DELETE | `/api/availability/<date>` | Remove an available date |
| GET/POST | `/api/bookings` | Get or create bookings |
| PUT/DELETE | `/api/bookings/<id>` | Update or cancel a booking |
| GET/PUT | `/api/user/profile` | Get or update user profile |
| GET/PUT | `/api/caterer/profile` | Get or update caterer profile |
| GET | `/api/caterer/stats` | Get caterer dashboard stats |

## Database Schema

- `user_details` — registered users
- `caterer_details` — registered caterers (includes FSSAI license)
- `menu_items` — food items per caterer
- `availability` — available dates per caterer
- `booking` — event bookings linking users and caterers
- `booking_items` — food items selected per booking

## Notes

- The database file (`data2.db`) must stay inside the `tastybite-main2/` directory.
- Passwords are stored in plain text — consider hashing them (e.g., with `bcrypt`) before deploying to production.
- Firebase config in `static/firebase.js` should be moved to environment variables for production use.
