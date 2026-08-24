# Math Club Auction — Backend API & Realtime Engine

This is the Node.js + Express + Socket.io + Supabase backend for the **Bingo Auction Arena**.

## Features

- **Supabase Auth:** Team and Admin registration/login.
- **Bingo Matrix Engine:** Generates randomized 5x5 boards (numbers 1-25) and verifies row, column, and diagonal Bingo victories.
- **Real-Time Bidding & Influx:** Tracks active highest bids, wallet sufficiency, and automatically grants **+250 points** to all teams every 5th bid.
- **Round Resolution:** Atomic deduction of bid amounts, awarding bonus points for correct answers, marking claimed numbers, and penalty deduction for wrong answers.
- **Socket.io Integration:** Real-time synchronization between Admin, Teams, and Projector screen.

## Setup & Running

1. Open terminal in this directory:
   ```bash
   cd D:\MathsClub\math-club-auction-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```env
   PORT=5000
   SUPABASE_URL=https://your-supabase-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```
4. Start development server:
   ```bash
   npm run dev
   ```
5. Server will run at: `http://localhost:5000`

## API Endpoints

### 1. Authentication
* **Sign Up (Team/Admin):** `POST http://localhost:5000/api/auth/signup`
  ```json
  {
    "teamName": "Theorem Titans",
    "password": "Password123!",
    "role": "team"
  }
  ```
* **Sign In:** `POST http://localhost:5000/api/auth/signin`
  ```json
  {
    "teamName": "Theorem Titans",
    "password": "Password123!"
  }
  ```
- `GET /api/auth/profile` - Get authenticated profile & team wallet

### 🎲 Game Operations (`/api/game`)
- `POST /api/game/init` - Initialize new game session
- `POST /api/game/rng-roll` - Roll a random number (1-25)
- `POST /api/game/resolve-round` - Settle question answer, points, and bingo check
- `GET /api/game/standings` - Get live standings of all teams

### 🔨 Bidding Engine (`/api/bidding`)
- `POST /api/bidding/place` - Place a live bid (triggers +250 influx on every 5th bid)
- `GET /api/bidding/history/:gameId` - View round bid audit log

### ❓ Question Bank (`/api/questions`)
- `GET /api/questions?number=X&tier=Y` - Fetch question for active number & tier
- `POST /api/questions/seed` - Seed 125 sample mathematical questions (25 numbers x 5 tiers)
