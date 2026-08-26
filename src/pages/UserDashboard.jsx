import React, { useState } from 'react';
import Icon from '../components/Icon';
import { mockStudentDirectory } from '../data/mockAuctionState';

export default function UserDashboard({
  activeTeam,
  teams = [],
  activeRoundName,
  onNavigate,
  onAddTeammate,
}) {
  const [teammateRegInput, setTeammateRegInput] = useState('');
  const [customTeammateName, setCustomTeammateName] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const formatCoins = (value) =>
    new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(value);

  // Calculate percentage of budget remaining (based on 50,000 starting budget)
  const budgetPercentage = Math.round(((activeTeam.coins || 50000) / 50000) * 100);

  // Competing opponent teams (excluding the current user's team)
  const opponentTeams = teams.filter((t) => t.id !== activeTeam.id);

  // Active Team Roster fallback
  const teamMembers = activeTeam.members || [
    {
      name: activeTeam.captain?.name || activeTeam.name + ' Captain',
      regNo: activeTeam.captain?.regNo || '22BCE1000',
      role: 'Captain',
      addedAt: 'Initial Registration',
    },
  ];

  const handleAddTeammateSubmit = (e) => {
    e.preventDefault();
    setFeedbackMessage(null);

    const regNo = teammateRegInput.trim().toUpperCase();

    if (!regNo) {
      setFeedbackMessage({
        type: 'error',
        text: 'Please enter a student Registration Number (e.g. 22BCE1580).',
      });
      return;
    }

    if (regNo.length < 5) {
      setFeedbackMessage({
        type: 'error',
        text: 'Invalid registration number format. Must be at least 5 characters.',
      });
      return;
    }

    // Check if student is already in the team roster
    const alreadyInTeam = teamMembers.some(
      (m) => m.regNo.toUpperCase() === regNo
    );

    if (alreadyInTeam) {
      setFeedbackMessage({
        type: 'error',
        text: `Student with Registration Number "${regNo}" is already in your team!`,
      });
      return;
    }

    // Lookup student in mock directory or fallback to provided name / auto-generated student title
    let resolvedName = mockStudentDirectory[regNo];

    if (!resolvedName) {
      if (customTeammateName.trim()) {
        resolvedName = customTeammateName.trim();
      } else {
        resolvedName = `Student ${regNo}`;
      }
    }

    const newTeammate = {
      name: resolvedName,
      regNo: regNo,
      role: 'Teammate',
      addedAt: 'Just Now',
    };

    if (onAddTeammate) {
      onAddTeammate(activeTeam.id, newTeammate);
    }

    setFeedbackMessage({
      type: 'success',
      text: `System Verified: Added ${resolvedName} (${regNo}) to ${activeTeam.name}!`,
    });

    setTeammateRegInput('');
    setCustomTeammateName('');
  };

  return (
    <div className="figma-dashboard">
      {/* Welcome Banner */}
      <section className="dashboard-header-banner">
        <div>
          <h2>Good morning, {activeTeam.name}!</h2>
          <p>Your team dashboard for the Math Club Auction. Strategize, manage teammates, and bid wisely.</p>
        </div>
        <div className="banner-rank-badge">
          <span className="badge-kicker">Leaderboard Rank</span>
          <strong className="badge-rank-num">#{activeTeam.rank || 1}</strong>
          <span className="badge-total-teams">of {teams.length} Teams</span>
        </div>
      </section>

      {/* Main Grid Layout: MY TEAM & Budget & Teammates */}
      <div className="dashboard-layout-grid">
        {/* Left Column: Team Identity + Teammates Management */}
        <div className="dashboard-left-col">
          {/* Card 1: Team Identity (MY TEAM) */}
          <article className="figma-card team-identity-card my-team-primary">
            <div className="card-top-info">
              <span className="my-team-tag">MY TEAM</span>
              <span className="card-team-no">Team #{activeTeam.number}</span>
              <span className="round-badge">{activeRoundName}</span>
            </div>

            <h1 className="card-team-title">{activeTeam.name}</h1>

            {activeTeam.captain && (
              <div className="captain-info-pill">
                <Icon name="user" size={13} />
                <span>Captain: <strong>{activeTeam.captain.name}</strong> ({activeTeam.captain.regNo})</span>
              </div>
            )}

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

          {/* Card 2: Team Roster & Add Teammates */}
          <article className="figma-card teammates-card">
            <div className="card-header-row">
              <div>
                <h3>Team Roster & Members</h3>
                <p className="section-subtitle">All teammates registered under {activeTeam.name}</p>
              </div>
              <span className="count-label">{teamMembers.length} Members</span>
            </div>

            {/* List of Team Members */}
            <div className="team-members-list">
              {teamMembers.map((member, idx) => (
                <div key={member.regNo + idx} className="member-row-item">
                  <div className="member-avatar">
                    {member.role === 'Captain' ? (
                      <Icon name="shield" size={14} className="gold-icon" />
                    ) : (
                      <Icon name="user" size={14} />
                    )}
                  </div>
                  <div className="member-details">
                    <div className="member-name-line">
                      <strong className="member-name">{member.name}</strong>
                      <span className={`member-role-badge ${member.role.toLowerCase()}`}>
                        {member.role}
                      </span>
                    </div>
                    <span className="member-reg-no">Reg No: {member.regNo} • Added: {member.addedAt}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Form to Add Teammate */}
            <div className="add-teammate-box">
              <h4 className="add-teammate-title">
                <Icon name="plus" size={14} />
                <span>Add Teammate</span>
              </h4>
              <p className="add-teammate-desc">Enter teammate's Registration Number. The system verifies and adds them automatically.</p>

              {feedbackMessage && (
                <div className={`teammate-feedback-alert ${feedbackMessage.type}`}>
                  <Icon name={feedbackMessage.type === 'success' ? 'check' : 'alert'} size={15} />
                  <span>{feedbackMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleAddTeammateSubmit} className="add-teammate-form">
                <div className="teammate-inputs-row">
                  <div className="input-wrap reg-input-wrap">
                    <label htmlFor="teammate-reg-no">Registration Number *</label>
                    <input
                      id="teammate-reg-no"
                      type="text"
                      placeholder="e.g. 22BSE0845"
                      value={teammateRegInput}
                      onChange={(e) => {
                        setTeammateRegInput(e.target.value);
                        if (feedbackMessage) setFeedbackMessage(null);
                      }}
                    />
                  </div>
                  <div className="input-wrap name-input-wrap">
                    <label htmlFor="teammate-name-optional">Student Name (Optional)</label>
                    <input
                      id="teammate-name-optional"
                      type="text"
                      placeholder="Auto-verifies if blank"
                      value={customTeammateName}
                      onChange={(e) => setCustomTeammateName(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="add-teammate-submit-btn">
                  <Icon name="check" size={15} />
                  <span>Verify & Add Teammate</span>
                </button>
              </form>
            </div>
          </article>
        </div>

        {/* Right Column: Available Budget + Numbers Collected + Recent Activity */}
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

          {/* Card 4: Numbers Collected */}
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

          {/* Card 5: Recent Activity */}
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

      {/* OTHER TEAMS (READ-ONLY) & LEADERBOARD Section */}
      <section className="dashboard-other-teams-section">
        <article className="figma-card other-teams-card">
          <div className="card-header-row">
            <div>
              <h3>Tournament Leaderboard & Competing Teams</h3>
              <p className="section-subtitle">Live standings of opponent teams and member counts (Read-Only View)</p>
            </div>
            <span className="read-only-badge">
              <Icon name="shield" size={13} />
              <span>Live Leaderboard</span>
            </span>
          </div>

          <div className="opponent-teams-table-wrap">
            <table className="opponent-teams-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Team Name</th>
                  <th>Captain & Members</th>
                  <th>Coins Balance</th>
                  <th>Numbers Collected</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr
                    key={team.id}
                    className={`opponent-row ${team.id === activeTeam.id ? 'active-my-team-row' : ''}`}
                  >
                    <td>
                      <span className={`rank-pill ${team.rank === 1 ? 'rank-gold' : ''}`}>
                        #{team.rank || '-'}
                      </span>
                    </td>
                    <td>
                      <strong className="opponent-name">{team.name}</strong>
                      {team.id === activeTeam.id && <span className="my-team-inline-tag">YOUR TEAM</span>}
                    </td>
                    <td>
                      <div className="member-count-cell">
                        <Icon name="user" size={13} />
                        <span>{team.members ? team.members.length : 1} Members</span>
                      </div>
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

