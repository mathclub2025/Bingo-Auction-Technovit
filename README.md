# Math Club Auction

A complete web platform for the VIT Chennai Mathematics Club auction event, cleanly split into independent Admin and User applications.

## Repository Structure

```text
math-club-auction/
├── user/                      # Participant user portal application
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── styles.css
│       ├── components/
│       ├── data/
│       └── pages/
│           ├── UserDashboard.jsx
│           ├── Auction.jsx
│           └── TeamProgress.jsx
│
├── .gitignore
└── README.md
```

## Running the User Application

1. Open a terminal in `math-club-auction/user`.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the address printed by Vite (typically `http://localhost:5174` or specified port).

---
*Created for VIT Chennai Mathematics Club Auction.*
