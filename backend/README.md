# Math Club Auction Engine — Backend API & Database (Project 2)

A robust, high-performance Node.js + Express + Supabase + Socket.io backend API engine built for **Math Club Auction Arena (Project 2)**.

---

## 📁 Project Structure

```text
math-club-auction-backend/
├── schema.sql           # Exact Supabase PostgreSQL tables & replication SQL
├── package.json         # Node.js dependencies & scripts
├── .env                 # Environment configuration (Supabase URL, Keys, JWT)
├── .env.example         # Environment template
├── README.md            # Complete API & setup documentation
└── src/
    ├── config/          # Supabase client setup & connection handling
    │   └── supabase.js
    ├── middleware/      # JWT Verification & Role-Based Access Control (RBAC)
    │   └── authMiddleware.js
    ├── controllers/     # Authentication & Team Point modification business logic
    │   ├── authController.js
    │   └── teamController.js
    ├── routes/          # REST API route declarations
    │   ├── authRoutes.js
    │   └── teamRoutes.js
    ├── services/        # Realtime WebSocket broadcasting & audit logging
    │   ├── socketService.js
    │   └── teamStore.js
    └── server.js        # Express application entry point & Socket.io server
```

---

## 🎯 Features Implemented

1. **Supabase Database Schema**:
   - `teams` table: Stores registered teams with initial **50,000 coins** and empty numbers collected (`[]`).
   - `score_audit_logs` table: Maintains a complete historical audit trail of all score deductions, bonus awards, and won numbers performed by the source computer.
   - Real-time replication enabled via `supabase_realtime`.

2. **Role-Based Access Control (RBAC)**:
   - **Team Role (`'team'`)**: Can register, log in, view their own profile, and fetch public team standings (Read-only).
   - **Admin Role (`'admin'`)**: Authenticated Source Computer with exclusive permissions to deduct coins, grant bonus coins, award numbers, and reset competition points.

3. **Real-Time WebSockets (Socket.io)**:
   - Instantly broadcasts team score updates, rank adjustments, and activity alerts to all connected screens without requiring page refreshes.

---

## 🗄️ Database Setup (Supabase)

1. Open your **Supabase Dashboard** > **SQL Editor**.
2. Run the script in [`schema.sql`](file:///c:/math-club-auction-backend/schema.sql):

```sql
-- 1. EXTENSIONS & CLEANUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS public.score_audit_logs CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;

-- 2. TEAMS & ADMIN USERS TABLE
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_name TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'team')) NOT NULL DEFAULT 'team',
    coins INT DEFAULT 50000 CHECK (coins >= 0),
    numbers_collected JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. AUDIT LOG TABLE (Tracks every change made by the Admin)
CREATE TABLE public.score_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    coins_deducted INT NOT NULL,
    bonus_added INT DEFAULT 0,
    number_won INT,
    answer_status TEXT CHECK (answer_status IN ('yes', 'no')),
    previous_coins INT NOT NULL,
    new_coins INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. DISABLE RLS (Permissions enforced strictly via Node.js API Middleware)
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_audit_logs DISABLE ROW LEVEL SECURITY;

-- 5. REALTIME REPLICATION (For instant live updates across screens)
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=5000
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
JWT_SECRET=math_club_auction_secret_key_2026
ADMIN_KEY=admin123
```

---

## 🚀 How to Run

```bash
# 1. Install dependencies
npm install

# 2. Start development server with auto-reload
npm run dev

# Or standard production start
npm start
```
Server runs at `http://localhost:5000`.

---

## 📡 API Reference & Usage Guide

### 1. Authentication Endpoints (`/api/auth`)

#### `POST /api/auth/signup` (or `/api/auth/register`)
Registers a new team. Automatically initializes balance with **50,000 coins** and **empty numbers (`[]`)**.
* **Request:**
```json
{
  "teamName": "Theorem Titans",
  "password": "Password123!",
  "role": "team"
}
```
* **Response (201 Created):**
```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOi...",
  "team": {
    "id": "b422b39f-d798-4023-80f6-44e0c12df3d8",
    "team_name": "Theorem Titans",
    "role": "team",
    "coins": 50000,
    "numbers_collected": []
  }
}
```

#### `POST /api/auth/signin` (or `/api/auth/login`)
Signs in an existing team or Admin user.
* **Request:**
```json
{
  "teamName": "Theorem Titans",
  "password": "Password123!"
}
```
* **Response (200 OK):**
```json
{
  "message": "Sign in successful",
  "token": "eyJhbGciOi...",
  "team": { ... }
}
```

#### `GET /api/auth/profile`
Fetches the current authenticated user profile.
* **Headers:** `Authorization: Bearer <token>`

---

### 2. Team Standings Endpoints (`/api/teams`)

#### `GET /api/teams`
Public/Team view: Fetches all competing teams and their current coin balances and numbers collected (sorted by coins descending).
* **Response (200 OK):**
```json
{
  "success": true,
  "teams": [
    {
      "id": "e21c1824-9ce1-4ae4-afa5-5f815982c354",
      "team_name": "Matrix Masters",
      "role": "team",
      "coins": 52000,
      "numbers_collected": [17]
    },
    {
      "id": "b422b39f-d798-4023-80f6-44e0c12df3d8",
      "team_name": "Theorem Titans",
      "role": "team",
      "coins": 48000,
      "numbers_collected": []
    }
  ]
}
```

#### `GET /api/teams/:id`
Fetches details of a single team by its UUID.

---

### 3. Source Computer Admin Controls (`/api/teams/admin`)
> 🔒 **Protected**: Requires `Authorization: Bearer <admin_token>` or `x-admin-key: admin123` header.

#### `POST /api/teams/admin/update`
Main update endpoint for the Source Computer to settle round points.

##### Case A: Question Answered = `NO` (Deduct Bid Coins Only)
```json
{
  "teamId": "b422b39f-d798-4023-80f6-44e0c12df3d8",
  "coinsDeducted": 2000,
  "isQuestionAnswered": false
}
```
* **Result**: Deducts 2,000 coins (`coins = max(0, 50000 - 2000) = 48000`).

##### Case B: Question Answered = `YES` (Deduct Bid + Award Bonus Coins + Won Number)
```json
{
  "teamId": "e21c1824-9ce1-4ae4-afa5-5f815982c354",
  "coinsDeducted": 3000,
  "isQuestionAnswered": true,
  "bonusCoins": 5000,
  "numberObtained": 17
}
```
* **Result**:
  - `coins = max(0, 50000 - 3000 + 5000) = 52000`
  - Appends `17` to `numbers_collected`.
  - Creates record in `score_audit_logs`.
  - Broadcasts live WebSocket event to all connected screens.

* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully updated Matrix Masters",
  "team": {
    "id": "e21c1824-9ce1-4ae4-afa5-5f815982c354",
    "team_name": "Matrix Masters",
    "role": "team",
    "coins": 52000,
    "numbers_collected": [17]
  },
  "auditLog": {
    "id": "c5f32f1c-6a08-4532-89eb-60031a9979fb",
    "team_id": "e21c1824-9ce1-4ae4-afa5-5f815982c354",
    "coins_deducted": 3000,
    "bonus_added": 5000,
    "number_won": 17,
    "answer_status": "yes",
    "previous_coins": 50000,
    "new_coins": 52000,
    "created_at": "2026-08-24T18:44:14.173Z"
  }
}
```

#### `POST /api/teams/admin/reset-all`
Resets all teams back to **50,000 coins** and **empty numbers (`[]`)** for a new competition.

#### `GET /api/teams/admin/logs`
Returns recent historical audit entries from `score_audit_logs`.

---

## ⚡ Real-Time Socket.io Events

Connect your frontend to `ws://localhost:5000`:

```javascript
import { io } from 'socket.io-client';
const socket = io('http://localhost:5000');

// Join auction arena
socket.emit('join', { role: 'team', teamName: 'Theorem Titans', teamId: '...' });

// Listen for live point & number updates
socket.on('team_updated', ({ team, details }) => {
  console.log('Team updated:', team);
});

// Listen for full standings updates
socket.on('all_teams_updated', (teams) => {
  console.log('Live Standings:', teams);
});

// Listen for point alerts & toasts
socket.on('point_alert', (alert) => {
  console.log('Alert:', alert.message);
});
```
