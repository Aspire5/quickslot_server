# QuickSlot (Backend Server)

The Node.js and Express backend server for the QuickSlot sports booking system. It handles user authentication, venue management, slot availability, and slot reservation transactions. 

The system leverages database-level constraints with Prisma and PostgreSQL to ensure double-booking prevention under highly concurrent loads.

---

## 🛠 Tech Stack

- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Security:** JWT (JSON Web Tokens) for session validation & bcrypt for password hashing

---

## 💾 Database Schema & Relations

### Tabular Schema Details

#### 1. User (`users`)
| Field | Type | Key / Constraint | Description |
|---|---|---|---|
| `id` | UUID | `PRIMARY KEY` | Unique identifier for each user |
| `firstName` | VarChar(100) | `@map("first_name")` | First name of the user |
| `lastName` | VarChar(100)? | `@map("last_name")` | Optional last name of the user |
| `username` | VarChar(60) | `UNIQUE` | Unique login handle |
| `password` | VarChar(255) | | Bcrypt-hashed password |
| `createdAt` | DateTime | `@default(now())`, `@map("created_at")` | Creation timestamp |

#### 2. Venue (`venues`)
| Field | Type | Key / Constraint | Description |
|---|---|---|---|
| `id` | UUID | `PRIMARY KEY` | Unique identifier for each venue |
| `name` | VarChar(150) | | Name of the court, turf, or center |
| `location` | VarChar(255)? | | Location address |
| `createdAt` | DateTime | `@default(now())`, `@map("created_at")` | Creation timestamp |

#### 3. Slot (`slots`)
| Field | Type | Key / Constraint | Description |
|---|---|---|---|
| `id` | UUID | `PRIMARY KEY` | Unique identifier for each time block |
| `venueId` | UUID | `FOREIGN KEY` | Maps to `Venue.id` |
| `startAt` | DateTime | `@map("start_at")` | Slot starting time (UTC) |
| `endAt` | DateTime | `@map("end_at")` | Slot ending time (UTC) |

- **Composite Unique Index:** `@@unique([venueId, startAt])` prevents creating duplicate timeslots for the same venue at the same time.

#### 4. Booking (`bookings`)
| Field | Type | Key / Constraint | Description |
|---|---|---|---|
| `id` | UUID | `PRIMARY KEY` | Unique identifier for each booking |
| `userId` | UUID | `FOREIGN KEY` | Maps to `User.id` |
| `slotId` | UUID | `FOREIGN KEY`, `UNIQUE` | Maps to `Slot.id` |
| `createdAt` | DateTime | `@default(now())`, `@map("created_at")` | Booking registration timestamp |

- **One Booking per Slot Constraint:** The `UNIQUE` constraint on `slotId` enforces that a slot cannot be booked by more than one user. PostgreSQL automatically rolls back concurrent insert requests on the same slot to prevent race conditions.

### Relational Schema Map

```
   ┌───────────┐                 ┌──────────────┐
   │   User    │ (1) ─────── (*) │   Booking    │
   └───────────┘                 └──────┬───────┘
                                        │ (1)
                                        │
                                        │ (1)
   ┌───────────┐                 ┌──────┴───────┐
   │   Venue   │ (1) ─────── (*) │     Slot     │
   └───────────┘                 └──────────────┘
```

- **User to Booking (One-to-Many):** A User can make multiple bookings (`User.id` ──> `Booking.userId`).
- **Venue to Slot (One-to-Many):** A Venue can contain multiple 1-hour slots (`Venue.id` ──> `Slot.venueId`).
- **Slot to Booking (One-to-One):** A Slot can have at most one active Booking (`Slot.id` <──> `Booking.slotId` [Unique]).

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

---

## 🤖 Use of AI

I used AI heavily to build this project. Specifically:
- **Antigravity** was used for code generation, file modifications, running tests, and debugging in the workspace.
- **ChatGPT** was used to validate my core logic details, generate development prompts and clear any general doubts.

 - One thing it got wrong that I caught and fixed :- One issue I noticed was that the AI initially used an int datatype to store slot timings like startAt and endAt, assuming a 24-hour format (e.g., 6 for 6 AM).

This approach works for fixed 1-hour slots but isn’t scalable if we want to support flexible durations like 30 or 90 minutes.

So I refactored it to use DateTime, which allows more precise and flexible time handling, and makes the system easier to extend in the future.

---

## 💻 Process of Building via AI

My build process involved the following structured steps:
1. **Requirements Gathering:** Documented and organized software requirements specifications on my notepad.
2. **Feature Selection:** Selected the precise set of features that I wanted to integrate.
3. **Architecture Planning:** Sketched out the database schema, normalized entities, and mapped their logical relations.
4. **AI Consultation:** Discussed and argued ideas with ChatGPT, asking it to look for architectural flaws, validate new ideas, and point out edge cases I might have missed.
5. **Schema Setup:** Once finalized, generated a multi-phase implementation plan to deploy the Prisma schema, set up relations, and accepted the correct code edits generated by Antigravity in real-time.
6. **API Flow Drafting & Prompting:** Discussed API endpoint structures and payloads with ChatGPT to save Antigravity context tokens. I then had ChatGPT generate structured prompts summarizing the designs, verified them, applied manual edits, and input them to Antigravity to perform code modifications.
7. **Backend as Reference:** Once the backend server was verified, used it as a strict reference contract to write the frontend, ensuring the API parsing structure matches exactly.
8. **Deployment:** Manually deployed the backend instance to Railway, configured env variables, and verified that everything connected successfully.
