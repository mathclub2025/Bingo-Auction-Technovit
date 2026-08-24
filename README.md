# Math Club Auction — User Frontend

A React + Vite frontend for participants in the **Math Club Auction**.

The application allows teams to enter their team name, view their live dashboard, participate in mathematical qualification bids, track collected numbers (1–50 grid), and monitor competing teams.

---

## ✨ Actual Features Implemented

### 🏠 Landing Page
- Math Club Auction branding and tagline ("Solve. Bid. Dominate.")
- Overview of starting budget (50,000 Coins), qualification challenges, and number collection
- Entry button routing to team entry

### 🔐 Team Login / Entry
- Team name text input with validation (non-empty, min 2 characters)
- Automatic lookup of existing teams or registration of new teams
- Persistent team session using `localStorage`

### 📊 User Dashboard
- **My Team**: Prominent view of team name, team number, 50,000 Coins balance, collected numbers chips, and quick auction CTA
- **Other Teams**: Read-only table of competing teams (rank, name, coin balance, collected numbers)

### ⚡ Live Auction
- Live item card with qualification math challenge problem
- Bid counter controls in 1,000 Coin steps
- Instant validation states: Correct Answer, Incorrect Answer (1,000 Coins penalty), Insufficient Coins, Waiting, and Completed

### 🔢 Team Progress
- 1–50 number collection grid with owned vs unowned cell highlights
- Tournament milestones status
- Coin transaction history ledger

### 🧭 Navigation & Collapsible Sidebar
- Topbar with hamburger menu toggle button (`☰` / `✕`)
- Smooth sliding drawer sidebar (closed by default)
- Mobile overlay backdrop and Escape key shortcut to close
- Team switching / logout option

---

## 🛠️ Tech Stack

- **React 19**
- **Vite 7**
- **Vanilla CSS**
- **JavaScript (JSX)**

---

## 📁 Project Structure

```text
user/
├── index.html
├── package.json
├── package-lock.json
│
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── styles.css
    ├── components/
    │   ├── Icon.jsx
    │   ├── Sidebar.jsx
    │   └── Topbar.jsx
    ├── data/
    │   └── mockAuctionState.js
    └── pages/
        ├── LandingPage.jsx
        ├── TeamLogin.jsx
        ├── UserDashboard.jsx
        ├── Auction.jsx
        └── TeamProgress.jsx
```

---

## 🚀 How to Run

1. Open terminal in `math-club-auction/user`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```
