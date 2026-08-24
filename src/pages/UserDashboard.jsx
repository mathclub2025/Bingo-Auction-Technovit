import React from 'react';
import Icon from '../components/Icon';

export default function UserDashboard({ activeTeam, teams = [], activeRoundName, onNavigate }) {
  const formatCoins = (value) =>
    new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(value);

  // Calculate percentage of budget remaining (based on 50,000 starting budget)
  const budgetPercentage = Math.round((activeTeam.coins / 50000) * 100);

  // Competing opponent teams (excluding the current user's team)
  const opponentTeams = teams.filter((t) => t.id !== activeTeam.id);

  return (
    <div className="figma-dashboard">
      {/* Welcome Banner */}
      <section className="dashboard-header-banner">
        <h2>Good morning, {activeTeam.name}!</h2>
        <p>Your team dashboard for the Math Club Auction. Strategize and bid wisely.</p>
      </section>

      {/* Main Grid Layout: MY TEAM & Budget */}
      <div className="dashboard-layout-grid">
        {/* Left Column: Team Status + Collection */}
        <div className="dashboard-left-col">
          {/* Card 1: Team Identity (MY TEAM) */}
          <article className="figma-card team-identity-card my-team-primary">
            <div className="card-top-info">
              <span className="my-team-tag">MY TEAM</span>
              <span className="card-team-no">Team #{activeTeam.number}</span>
              <span className="round-badge">{activeRoundName}</span>
            </div>
            
            <h1 className="card-team-title">{activeTeam.name}</h1>
            
            <div className="status-container">
              <span className="status-label">Current Status:</span>
              <span className="status-value">Awaiting next bid</span>
            </div>

            <button
              className="dashboard-action-btn"
              onClick={() => onNavigate('user-auction')}
              type="button"
            >
              <Icon name="coins" size={16} />
              <span>Enter Current Auction Round</span>
            </button>
          </article>

          {/* Card 2: Numbers Collected */}
          <article className="figma-card collection-card-simple">
            <div className="card-header-row">
              <h3>Numbers Collected</h3>
              <span className="count-label">{activeTeam.numbers.length} Total</span>
            </div>

            <div className="circular-chips-list">
              {activeTeam.numbers.length > 0 ? (
                activeTeam.numbers.map((n) => (
                  <div key={n} className="circular-number-chip">
                    <span>{n}</span>
                  </div>
                ))
              ) : (
                <span className="empty-numbers-note">No numbers collected yet in current rounds.</span>
              )}
            </div>
          </article>
        </div>

        {/* Right Column: Available Budget + Recent Activity */}
        <div className="dashboard-right-col">
          {/* Card 3: Available Budget */}
          <article className="figma-card budget-card-dark">
            <span className="budget-kicker">AVAILABLE BUDGET</span>
            <div className="budget-value">
              {formatCoins(activeTeam.coins)} <span className="currency-unit">Coins</span>
            </div>
            <div className="budget-footer-text">
              {budgetPercentage}% of initial 50,000 Coins remaining
            </div>
          </article>

          {/* Card 4: Recent Activity */}
          <article className="figma-card activity-card">
            <div className="card-header-row">
              <h3>Recent Activity</h3>
              <button
                className="activity-refresh-btn"
                onClick={() => alert("Activity log is fully up-to-date.")}
                title="Refresh log"
                type="button"
              >
                <Icon name="clock" size={14} />
              </button>
            </div>

            <ul className="activity-list" aria-label="Recent activity log">
              {activeTeam.numbers.length > 0 ? (
                <>
                  <li className="activity-item">
                    <div className="activity-icon-wrapper purchased">
                      <Icon name="coins" size={13} />
                    </div>
                    <div className="activity-details">
                      <p>Purchased number <strong>'{activeTeam.numbers[activeTeam.numbers.length - 1]}'</strong> for <strong>4,500 Coins</strong></p>
                      <span>10 mins ago</span>
                    </div>
                  </li>
                  <li className="activity-item">
                    <div className="activity-icon-wrapper system">
                      <Icon name="check" size={13} />
                    </div>
                    <div className="activity-details">
                      <p>Round 1 Completed</p>
                      <span>45 mins ago</span>
                    </div>
                  </li>
                </>
              ) : (
                <p className="empty-activity-text">No activity recorded yet for this round.</p>
              )}
            </ul>
          </article>
        </div>
      </div>

      {/* OTHER TEAMS (READ-ONLY) Section */}
      <section className="dashboard-other-teams-section">
        <article className="figma-card other-teams-card">
          <div className="card-header-row">
            <div>
              <h3>Other Competing Teams</h3>
              <p className="section-subtitle">Live standings of opponent teams (Read-Only View)</p>
            </div>
            <span className="read-only-badge">
              <Icon name="shield" size={13} />
              <span>Viewing Only</span>
            </span>
          </div>

          <div className="opponent-teams-table-wrap">
            <table className="opponent-teams-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Team Name</th>
                  <th>Coins Balance</th>
                  <th>Numbers Collected</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {opponentTeams.map((team) => (
                  <tr key={team.id} className="opponent-row">
                    <td>
                      <span className="rank-pill">#{team.rank || '-'}</span>
                    </td>
                    <td>
                      <strong className="opponent-name">{team.name}</strong>
                    </td>
                    <td>
                      <span className="opponent-coins font-mono">
                        {formatCoins(team.coins)} Coins
                      </span>
                    </td>
                    <td>
                      <div className="table-numbers">
                        {team.numbers && team.numbers.length > 0 ? (
                          team.numbers.map((n) => <span key={n}>{n}</span>)
                        ) : (
                          <span className="empty-value">None</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="opponent-status-tag">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      {/* Footer Area */}
      <footer className="figma-footer">
        <div className="footer-left">
          <span>Math Club Auction</span>
          <span className="copyright-year">© 2026 Math Club VIT Chennai.</span>
        </div>
        <div className="footer-links">
          <button onClick={() => alert("Terms of Play:\n1. Respect time limits.\n2. Keep mathematical bids honest.\n3. Collusion is prohibited.")} type="button">Terms of Play</button>
          <button onClick={() => alert("Privacy Policy:\nAll event state data is ephemeral and used solely for the duration of the auction.")} type="button">Privacy Policy</button>
          <button onClick={() => alert("Contact Organizers:\nRaise your hand or proceed to the Source Computer control desk.")} type="button">Contact Organizers</button>
        </div>
      </footer>
    </div>
  );
}
