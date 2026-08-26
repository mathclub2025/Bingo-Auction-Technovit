import React, { useState, useMemo, useEffect } from 'react';
import Icon from '../components/Icon';
import Footer from '../components/Footer';
import { addTeammateToDatabase } from '../services/api';

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

  // Auto-dismiss feedback message after 20 seconds
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => {
        setFeedbackMessage(null);
      }, 20000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  const formatCoins = (value) =>
    new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(value || 0);

  // Calculate percentage of budget remaining (based on 50,000 starting budget)
  const budgetPercentage = Math.round(((activeTeam.coins ?? 50000) / 50000) * 100);

  // Active Team Roster fallback
  const teamMembers = activeTeam.members && activeTeam.members.length > 0
    ? activeTeam.members
    : [
        {
          name: activeTeam.captain?.name || activeTeam.captain_name || (activeTeam.name || activeTeam.team_name) + ' Captain',
          regNo: activeTeam.captain?.regNo || activeTeam.captain_reg_no || '22BCE1000',
          role: 'Captain',
          addedAt: 'Initial Registration',
        },
      ];

  const numbersList = activeTeam.numbers || activeTeam.numbers_collected || [];

  // Backend DB connected UI state handler for adding teammates
  const handleAddTeammateSubmit = async (e) => {
    e.preventDefault();
    setFeedbackMessage(null);

    const regNo = teammateRegInput.trim().toUpperCase();
    const name = customTeammateName.trim();

    if (!regNo) {
      setFeedbackMessage({
        type: 'error',
        text: 'Please enter teammate Registration Number (e.g. 22BSE0845).',
      });
      return;
    }

    if (!name) {
      setFeedbackMessage({
        type: 'error',
        text: 'Please enter teammate Name (e.g. Ananya Sharma).',
      });
      return;
    }

    // Check if student is already in the team roster locally
    const alreadyInTeam = teamMembers.some(
      (m) => (m.reg_no || m.regNo || '').toUpperCase() === regNo
    );

    if (alreadyInTeam) {
      setFeedbackMessage({
        type: 'error',
        text: `Student with Registration Number "${regNo}" is already in your team!`,
      });
      return;
    }

    const newMember = {
      name,
      regNo,
      reg_no: regNo,
      role: 'Teammate',
      addedAt: 'Just Now',
      added_at: new Date().toISOString()
    };

    try {
      // 1. Save directly into Supabase database (team_members table)
      if (activeTeam.id) {
        await addTeammateToDatabase(activeTeam.id, { name, regNo, role: 'Teammate' });
      }

      // 2. Update local state
      if (onAddTeammate) {
        onAddTeammate(activeTeam.id, newMember);
      }

      setFeedbackMessage({
        type: 'success',
        text: `Added ${name} (${regNo}) to ${activeTeam.name || activeTeam.team_name}!`,
      });

      setTeammateRegInput('');
      setCustomTeammateName('');
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Failed to save teammate to database.',
      });
    }
  };

  const currentTeamName = activeTeam.name || activeTeam.team_name || 'Team';
  const captainMember = (teamMembers && teamMembers.find((m) => (m.role || '').toLowerCase() === 'captain')) || (activeTeam.members && activeTeam.members.find((m) => (m.role || '').toLowerCase() === 'captain')) || teamMembers[0];
  const displayCaptainName = activeTeam.captain_name || activeTeam.captain?.name || captainMember?.name || '';
  const displayCaptainRegNo = activeTeam.captain_reg_no || activeTeam.captain?.regNo || captainMember?.reg_no || captainMember?.regNo || '';

  return (
    <div className="figma-dashboard">
      {/* Welcome Banner */}
      <section className="dashboard-header-banner">
        <div>
          <h2>Good morning, {currentTeamName}!</h2>
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
              <span className="card-team-no">Team #{activeTeam.number || 1}</span>
            </div>

            <h1 className="card-team-title">{currentTeamName}</h1>

            <div
              className="captain-info-pill"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                width: 'fit-content',
                maxWidth: 'fit-content',
                padding: '6px 12px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                marginBottom: '18px'
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '6px',
                  background: '#1d4ed8',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Icon name="shield" size={13} />
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  width: 'auto'
                }}
              >
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>
                  Team Captain:
                </span>
                {displayCaptainName && (
                  <strong style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
                    {displayCaptainName}
                  </strong>
                )}
                {displayCaptainRegNo && (
                  <span
                    style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#1d4ed8',
                      background: '#eff6ff',
                      padding: '1px 7px',
                      borderRadius: '5px',
                      border: '1px solid #bfdbfe',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {displayCaptainRegNo}
                  </span>
                )}
              </div>
            </div>

            <div className="status-container">
              <span className="status-label">Current Status:</span>
              <span className="status-value">Active & Ready</span>
            </div>

            {/* Inspiring Tournament Winning Quote Banner */}
            <div className="winning-quote-banner">
              <div className="quote-icon-badge">
                <Icon name="star" size={16} />
              </div>
              <div className="quote-text-wrap">
                <p className="quote-main">
                  "Strategy is the bridge between numbers and triumph. Solve with speed, bid with conviction, and conquer the board!"
                </p>
                <span className="quote-author">— Math Club VIT Chennai</span>
              </div>
            </div>
          </article>

          {/* Card 2: Add Team Members Tool */}
          <article className="figma-card teammates-card">
            <div className="card-header-row" style={{ marginBottom: '16px' }}>
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon name="user-plus" size={16} />
                  <span>Add Team Members</span>
                </h3>
                <p className="section-subtitle">Register teammates to compete under {currentTeamName}</p>
              </div>
            </div>

            {/* Form to Add Teammate */}
            <div className="add-teammate-box">
              <p className="add-teammate-desc" style={{ marginBottom: '14px' }}>
                Enter teammate's Registration Number & Name to directly add them to your team.
              </p>

              {feedbackMessage && (
                <div className={`teammate-feedback-alert ${feedbackMessage.type}`} style={{ marginBottom: '16px' }}>
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
                    <label htmlFor="teammate-name-input">Teammate Name *</label>
                    <input
                      id="teammate-name-input"
                      type="text"
                      placeholder="e.g. Ananya Sharma"
                      value={customTeammateName}
                      onChange={(e) => {
                        setCustomTeammateName(e.target.value);
                        if (feedbackMessage) setFeedbackMessage(null);
                      }}
                    />
                  </div>
                </div>

                <button type="submit" className="add-teammate-submit-btn">
                  <Icon name="check" size={15} />
                  <span>Add Teammate to Roster</span>
                </button>
              </form>
            </div>
          </article>
        </div>

        {/* Right Column: Available Budget + Numbers Collected */}
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
              <span className="count-label">{numbersList.length} Total</span>
            </div>

            <div className="circular-chips-list">
              {numbersList.length > 0 ? (
                numbersList.map((n) => (
                  <div key={n} className="circular-number-chip">
                    <span>{n}</span>
                  </div>
                ))
              ) : (
                <span className="empty-numbers-note">No numbers collected yet in current rounds.</span>
              )}
            </div>
          </article>

          {/* Card 5: Team Members Details (Below Numbers Collected) */}
          <article className="figma-card collection-card-simple team-members-summary-card" style={{ marginTop: '16px' }}>
            <div className="card-header-row">
              <h3>Team Members Details</h3>
              <span className="count-label">{teamMembers.length} Registered</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 14px' }}>
              All teammates registered under <strong>{activeTeam.name || activeTeam.team_name}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {teamMembers.map((member, idx) => {
                const mName = member.name || member.captain_name || `Teammate #${idx + 1}`;
                const mReg = member.regNo || member.reg_no || member.captain_reg_no || 'N/A';
                const mRole = member.role || (idx === 0 ? 'Captain' : 'Teammate');

                return (
                  <div
                    key={member.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: mRole.toLowerCase() === 'captain' ? '#eff6ff' : '#f1f5f9',
                          color: mRole.toLowerCase() === 'captain' ? '#1d4ed8' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem'
                        }}
                      >
                        {mName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{mName}</strong>
                          <span
                            className={`member-role-badge ${mRole.toLowerCase()}`}
                            style={{ fontSize: '0.68rem', padding: '2px 6px' }}
                          >
                            {mRole}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'DM Mono, monospace' }}>
                          Reg No: {mReg}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        </div>
      </div>

      {/* OTHER TEAMS & LEADERBOARD Section */}
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
                {(() => {
                  const myTeam = teams.find(
                    (t) => String(t.id) === String(activeTeam.id) || (t.name || t.team_name) === currentTeamName
                  );
                  const otherTeams = teams.filter(
                    (t) => String(t.id) !== String(activeTeam.id) && (t.name || t.team_name) !== currentTeamName
                  );
                  const displayList = myTeam ? [myTeam, ...otherTeams] : teams;

                  return displayList.map((team, idx) => {
                    const tName = team.name || team.team_name;
                    const isCurrent = String(team.id) === String(activeTeam.id) || tName === currentTeamName;
                    const tMembers = team.members || (isCurrent ? teamMembers : []);
                    const tNumbers = team.numbers || team.numbers_collected || [];
                    const originalRank = teams.findIndex((t) => String(t.id) === String(team.id)) + 1 || (idx + 1);

                    return (
                      <tr
                        key={team.id || idx}
                        className={`opponent-row ${isCurrent ? 'active-my-team-row' : ''}`}
                        style={isCurrent ? { background: '#eff6ff', borderLeft: '4px solid #1d4ed8' } : {}}
                      >
                        <td>
                          <span className={`rank-pill ${isCurrent ? 'rank-gold' : (originalRank === 1 ? 'rank-gold' : '')}`}>
                            #{originalRank}
                          </span>
                        </td>
                        <td>
                          <strong className="opponent-name">{tName}</strong>
                          {isCurrent && <span className="my-team-inline-tag" style={{ marginLeft: '8px', background: '#1d4ed8', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>YOUR TEAM</span>}
                        </td>
                        <td>
                          <div className="member-count-cell">
                            <Icon name="user" size={13} />
                            <span>{tMembers.length > 0 ? `${tMembers.length} Members` : (team.captain_name ? `1 Captain (${team.captain_name})` : '1 Captain')}</span>
                          </div>
                        </td>
                        <td>
                          <span className="opponent-coins font-mono" style={isCurrent ? { fontWeight: 700, color: '#1d4ed8' } : {}}>
                            {formatCoins(team.coins)} Coins
                          </span>
                        </td>
                        <td>
                          <div className="table-numbers">
                            {tNumbers.length > 0 ? (
                              tNumbers.map((n) => <span key={n}>{n}</span>)
                            ) : (
                              <span className="empty-value">None</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="opponent-status-tag" style={isCurrent ? { background: '#dcfce7', color: '#15803d', fontWeight: 700 } : {}}>Active</span>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      {/* Footer Area */}
      <Footer />
    </div>
  );
}
