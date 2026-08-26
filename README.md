# 🎯 Bingo Auction Arena — Technovit & Math Club

A unified full-stack auction engine and interactive dashboard platform built with **React**, **Node.js (Express)**, **Supabase (PostgreSQL)**, and **Socket.io** for real-time live auction scoring and team tracking.

---

## 🏗️ Architecture & Project Structure

```text
Bingo-Auction-Technovit/
├── .gitignore                   # Centralized project-wide gitignore
├── README.md                    # Unified global documentation
├── backend/                     # Node.js + Express + Supabase API & WebSockets
│   ├── schema.sql               # PostgreSQL tables & Supabase Realtime schema
│   ├── package.json             # Backend dependencies & npm scripts
│   ├── .env                     # Backend environment variables
│   └── src/
│       ├── server.js            # Express app entry & Socket.io server
│       ├── config/
│       │   └── supabase.js      # Supabase client & fallback store configuration
│       ├── controllers/
│       │   ├── authController.js# Team signup/login & profile handling
│       │   └── teamController.js# Points, bidding deductions & bonus management
│       ├── middleware/
│       │   └── authMiddleware.js# JWT & RBAC protection (admin / team)
│       ├── routes/
│       │   ├── authRoutes.js    # Authentication API endpoints
│       │   └── teamRoutes.js    # Team data & admin scoring endpoints
│       └── services/
│           ├── socketService.js # Live WebSocket broadcasts
│           └── teamStore.js     # Hybrid Supabase / in-memory data store
└── frontend/                    # Vite + React Modern Interactive UI
    ├── package.json             # Frontend dependencies & npm scripts
    ├── index.html               # Web application entry HTML
    └── src/
        ├── App.jsx              # Main router & app shell
        ├── main.jsx             # React DOM root render
        ├── styles.css           # Custom design system & animations
        ├── pages/
        │   ├── LandingPage.jsx  # Event landing & role chooser
        │   ├── TeamLogin.jsx    # Team signin & onboarding
        │   ├── AdminDashboard.jsx # Source computer auction master controls
        │   └── UserDashboard.jsx# Live team bingo board & stats viewer
        ├── components/          # Reusable UI widgets & modals
        ├── data/                # Initial seeds & mock state
        └── services/            # API client & WebSocket connections
```

---

## ⚡ Core Features

- 🪙 **Initial Balance & Number Collection**: Each team starts with **50,000 coins** and collects numbers on their bingo matrix as rounds proceed.
- 🎮 **Source Computer Admin Controls**:
  - **Answer = NO**: Deduct bid coins with instant validation.
  - **Answer = YES**: Deduct bid coins, award round bonus coins, and register the winning matrix number.
  - Reset competition & real-time audit log tracking.
- 🔄 **Real-Time Live Sync (Socket.io + Supabase Realtime)**: Instant point updates, leaderboard re-ranking, and notification alerts pushed live to all connected screens without page refreshes.
- 🛡️ **Role-Based Access Control (RBAC)**: Secure JWT authentication separating `team` view permissions from `admin` scoring controls.
- 💾 **Hybrid Resilience**: Full Supabase PostgreSQL integration with memory-fallback operation for development flexibility.

---

## ⚙️ Environment Setup & Database

### 1. Supabase Database Setup
Execute [`backend/schema.sql`](file:///backend/schema.sql) in your **Supabase SQL Editor**:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams & Admin credentials table
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

-- Score Audit Trail
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

-- Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
```

### 2. Backend `.env` Configuration
Create `backend/.env`:

```env
PORT=5000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
JWT_SECRET=super_secret_bingo_math_club_key_2026
ADMIN_KEY=admin123
CLIENT_ORIGIN=http://localhost:5173
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- `npm` or `yarn`

### 1. Run Backend Server
```bash
cd backend
npm install
npm run dev
```
*Backend runs at `http://localhost:5000` with WebSocket support.*

### 2. Run Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173`.*

---

## 📡 API Reference Overview

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register a new team (starts with 50,000 coins) |
| `POST` | `/api/auth/signin` | Sign in team or admin user |
| `GET` | `/api/auth/profile` | Retrieve profile of authenticated user |

### 🏆 Team Standings (`/api/teams`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/teams` | Public/Team view: fetch all team standings |
| `GET` | `/api/teams/:id` | Fetch specific team details |

### 🛠️ Admin Scoring Controls (`/api/teams/admin`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/teams/admin/update` | Settle round points, deduct bids, add bonuses & won numbers |
| `POST` | `/api/teams/admin/reset-all` | Reset all team balances and matrix numbers |
| `GET` | `/api/teams/admin/logs` | Fetch historical scoring audit logs |

---

## ⚡ Socket.io Real-Time Events

| Event Name | Direction | Payload Description |
|---|---|---|
| `join` | Client ➔ Server | Join room with `{ role, teamName, teamId }` |
| `team_updated` | Server ➔ Client | `{ team, details }` on coin/number change |
| `all_teams_updated` | Server ➔ Client | Full refreshed leaderboard array |
| `point_alert` | Server ➔ Client | Flash notification / audio cue alert |

---

## 🔒 Security & Best Practices

- All `.env` files, API keys, credentials, and certificates are excluded from version control via the root [.gitignore](file:///d:/Final%20Update/Bingo-Auction-Technovit/.gitignore).
- Production deployments should ensure strong `JWT_SECRET` and secure headers.
