# QuickSlot (Backend Server)

The Node.js and Express backend server for the QuickSlot sports booking system. It handles user authentication, venue management, slot availability, and slot reservation transactions. 

The system leverages database-level constraints with Prisma and PostgreSQL to ensure double-booking prevention under highly concurrent loads.

## 🛠 Tech Stack

- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Security:** JWT (JSON Web Tokens) for session validation & bcrypt for password hashing

---

## 💾 Database Schema

The database model is structured to guarantee consistency and concurrency safety:

- **`User`:** Stores user credentials and profile details.
- **`Venue`:** Represents the turfs or courts available for bookings.
- **`Slot`:** Individual 1-hour bookable slots. A composite unique index on `(venue_id, start_at)` prevents duplicate slots from being generated for the same venue at the same time.
- **`Booking`:** Maps a `User` to a `Slot`. The field `slot_id` has a `UNIQUE` constraint, which serves as the primary guard against double-booking. PostgreSQL will immediately reject concurrent duplicate bookings at the transaction level, preventing race conditions.

---

## 📡 API Endpoints

All endpoints are prefixed with `/api/v1`.

### Authentication
- `POST /auth/login`
  - Validates user credentials.
  - Returns a JWT access token and user profile payload.

### Venues & Slots
- `GET /venues`
  - Lists all available sports venues.
- `GET /venues/:id/slots?date=YYYY-MM-DD`
  - Returns all slots (both available and booked) for a specific venue on the requested date.

### Bookings
- `POST /bookings`
  - Creates a booking for a specific slot.
  - Authenticated endpoint. Checks if the slot is already reserved.
- `DELETE /bookings/:id`
  - Cancels an existing booking.
  - Authenticated endpoint.

---

## 🚀 Getting Started

### 1. Installation & Environment Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environmental variables in a `.env` file in the root folder:
   ```env
   PORT=5001
   DATABASE_URL="postgresql://username:password@localhost:5432/quickslot?schema=public"
   JWT_SECRET="your_jwt_secret_key"
   ```

### 2. Database Migrations & Seeding
1. Run Prisma migrations to set up the tables:
   ```bash
   npx prisma migrate dev
   ```
2. Run the seed script to populate venues, slots, and test accounts:
   ```bash
   npx prisma db seed
   ```
   *Note: The seed script generates 5 venues, 3 users, and 560 slots (operating daily from 6:00 AM to 10:00 PM).*

### 3. Running the Server
- Start the server in development mode (with hot reloading via `nodemon`):
  ```bash
  npm run dev
  ```
- Start in production mode:
  ```bash
  npm start
  ```

---

## 🔮 What I'd Do with More Time

1. **WebSocket Integration:** Replace client-side HTTP polling with WebSockets (using `socket.io`) to push real-time slot booking states instantly to all connected clients.
2. **Expired Slots Backend Validation:** Filter out slots whose start times have already passed directly in the Prisma/SQL query layer, instead of returning the full 24-hour day schedule to the client and delegating expired filtering to the frontend view logic.
3. **API Rate Limiting:** Implement middleware (like `express-rate-limit`) to prevent abuse on booking and authentication endpoints.
