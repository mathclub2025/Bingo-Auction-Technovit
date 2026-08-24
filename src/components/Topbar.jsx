import React from 'react';
import Icon from './Icon';

export default function Topbar({
  currentView,
  onViewChange,
  activeTeamNumber,
  activeTeamName,
  activeTeamCoins,
  onSwitchTeam,
  sidebarOpen,
  onToggleSidebar
}) {
  const formatCoins = (value) =>
    new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <header className="figma-topbar">
      <div className="topbar-brand-area">
        {/* Menu / Hamburger Toggle Button */}
        <button
          className="topbar-menu-toggle"
          onClick={onToggleSidebar}
          title={sidebarOpen ? "Close sidebar menu" : "Open sidebar menu"}
          aria-label={sidebarOpen ? "Close sidebar menu" : "Open sidebar menu"}
          aria-expanded={sidebarOpen}
          type="button"
        >
          <Icon name={sidebarOpen ? "x" : "menu"} size={20} />
        </button>

        <h2>Math Club Auction</h2>
      </div>

      <nav className="topbar-nav" aria-label="Top Navigation">
        <button
          className={`topbar-tab ${currentView === 'user-dashboard' ? 'active' : ''}`}
          onClick={() => onViewChange('user-dashboard')}
          type="button"
        >
          Dashboard
        </button>
        <button
          className={`topbar-tab ${currentView === 'user-auction' ? 'active' : ''}`}
          onClick={() => onViewChange('user-auction')}
          type="button"
        >
          Current Auction
        </button>
        <button
          className={`topbar-tab ${currentView === 'user-progress' ? 'active' : ''}`}
          onClick={() => onViewChange('user-progress')}
          type="button"
        >
          Team Progress
        </button>
      </nav>

      <div className="topbar-right-area">
        {/* Team Identification tag */}
        <div className="topbar-team-tag">
          <span>{activeTeamName || `Team #${activeTeamNumber}`}</span>
        </div>

        {/* Coin Balance Pill */}
        <div className="topbar-coins-badge">
          <Icon name="coins" size={14} className="gold-icon" />
          <span>{formatCoins(activeTeamCoins)} Coins</span>
        </div>

        {/* Switch / Change Team Button */}
        {onSwitchTeam && (
          <button
            className="topbar-switch-team-btn"
            onClick={onSwitchTeam}
            title="Switch Team"
            type="button"
          >
            <Icon name="logout" size={14} />
          </button>
        )}
      </div>
    </header>
  );
}
