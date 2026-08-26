# Math Club Auction — Admin Frontend

A responsive React frontend for the **source-computer/admin dashboard** of the VIT Chennai Mathematics Club auction event.

## Included

- View all registered teams, coins, and numbers collected.
- Select a team and view its details prominently.
- Deduct coins for an answer marked **No**.
- Deduct coins, award bonus coins, and add a number for an answer marked **Yes**.
- Client-side validation and temporary in-memory updates for demonstration.

The project deliberately does **not** include login, database access, Supabase, Node.js APIs, or persistence. Refreshing the page restores the initial sample records.

## Run it locally

1. Install [Node.js](https://nodejs.org/) (version 20 or later).
2. Open a terminal in this project folder.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the local address shown in the terminal (normally `http://localhost:5173`).

For a production check, run:

```bash
npm run build
```

## Backend handoff

The temporary starter data is isolated in `src/data/mockTeams.js`. The update behavior currently lives in `src/App.jsx` and only updates React state. The backend team can replace the initial-data load and `setTeams` update with their Node.js/Supabase API calls while keeping the interface unchanged.

Each team record uses this shape:

```js
{
  id: 'team-1',
  name: 'Theorem Titans',
  coins: 50000,
  numbers: []
}
```
