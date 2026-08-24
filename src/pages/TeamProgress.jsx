import React from 'react';
import Icon from '../components/Icon';
import { mockMilestones, mockCoinHistory } from '../data/mockAuctionState';

export default function TeamProgress({ activeTeam }) {
  const formatCoins = (value) =>
    new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(value);

  // Retrieve dynamic coin history ledger for the active team or fallback to team-1
  const historyLogs = mockCoinHistory[activeTeam.id] || mockCoinHistory['team-1'] || [];

  return (
    <div className="figma-progress">
      {/* Page Header */}
      <section className="progress-header-banner">
        <div>
          <h2>Team Progress: {activeTeam.name}</h2>
          <p>🏆 Rank #{activeTeam.rank || 1} • Total Coins Remaining: {formatCoins(activeTeam.coins)} Coins</p>
        </div>
      </section>

      {/* Grid Layout */}
      <div className="progress-layout-grid">
        {/* Left Column: Number Collection + Tournament Milestones */}
        <div className="progress-left-col">
          {/* Number Collection Card */}
          <article className="figma-card collection-grid-card">
            <div className="card-header-row">
              <h3>
                <Icon name="grid" size={16} className="blue-icon" />
                <span>1–50 Number Collection Grid</span>
              </h3>
              <span className="count-badge">{activeTeam.numbers.length} / 50 Collected</span>
            </div>

            <div className="collection-grid-50">
              {Array.from({ length: 50 }, (_, i) => i + 1).map((n) => {
                const isOwned = activeTeam.numbers.includes(n);
                return (
                  <div key={n} className={`grid-cell-50 ${isOwned ? 'owned' : 'unowned'}`}>
                    <span>{n}</span>
                  </div>
                );
              })}
            </div>
          </article>

          {/* Tournament Milestones Card */}
          <article className="figma-card milestones-card">
            <div className="card-header-row">
              <h3>
                <Icon name="shield" size={16} className="blue-icon" />
                <span>Tournament Milestones</span>
              </h3>
            </div>

            <div className="milestones-horizontal-list">
              {mockMilestones.map((m) => (
                <div key={m.id} className={`milestone-item ${m.status}`}>
                  <div className="milestone-status-icon">
                    {m.status === 'passed' && <Icon name="check" size={12} />}
                    {m.status === 'active' && <span className="active-inner-dot" />}
                    {m.status === 'locked' && <Icon name="shield" size={12} />}
                  </div>
                  <span className="milestone-label">{m.name}</span>
                </div>
              ))}
            </div>
          </article>
        </div>

        {/* Right Column: Coin History Sidebar */}
        <div className="progress-right-col">
          <article className="figma-card coin-history-card">
            <div className="card-header-row">
              <h3>
                <Icon name="coins" size={16} className="blue-icon" />
                <span>Coin History Ledger</span>
              </h3>
            </div>

            <ul className="history-ledger-list" aria-label="Coin transaction history">
              {historyLogs.map((log) => (
                <li key={log.id} className="ledger-item-row">
                  <div className="ledger-info">
                    <strong>{log.description}</strong>
                    <span>{log.round}</span>
                  </div>
                  <div className={`ledger-amount font-mono ${log.amount > 0 ? 'positive' : 'negative'}`}>
                    {log.amount > 0 ? `+${formatCoins(log.amount)} Coins` : `${formatCoins(log.amount)} Coins`}
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </div>
  );
}
