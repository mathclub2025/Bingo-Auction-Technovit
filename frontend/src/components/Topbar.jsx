import React, { useState } from 'react';
import Icon from './Icon';

export default function Topbar({
  currentView,
  onViewChange,
  activeTeamNumber,
  activeTeamName,
  activeTeamCoins,
  onSwitchTeam,
}) {
  const [showExitModal, setShowExitModal] = useState(false);

  const formatCoins = (value) =>
    new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(value || 0);

  const teamDisplayName = activeTeamName || `Team #${activeTeamNumber}`;
  const teamInitial = (activeTeamName || 'T').charAt(0).toUpperCase();

  const handleConfirmExit = () => {
    setShowExitModal(false);
    if (onSwitchTeam) onSwitchTeam();
    else if (onViewChange) onViewChange('landing');
  };

  return (
    <>
      <header className="figma-topbar">
        <div className="topbar-brand-area">
          <div className="topbar-brand-icon">
            <Icon name="grid" size={18} />
          </div>
          <div className="topbar-brand-text">
            <h2>Math Club Auction</h2>
            <span className="topbar-sub">VIT CHENNAI</span>
          </div>
        </div>

        {/* Center Navigation - Only Dashboard */}
        <nav className="topbar-nav" aria-label="Top Navigation">
          <button
            className="topbar-tab active"
            onClick={() => onViewChange && onViewChange('user-dashboard')}
            type="button"
          >
            Dashboard
          </button>
        </nav>

        <div className="topbar-right-area">
          {/* Team Profile Chip with Avatar */}
          <div className="topbar-team-chip" title={`Logged in as ${teamDisplayName}`}>
            <span className="team-avatar-circle">{teamInitial}</span>
            <span className="team-name-text">{teamDisplayName}</span>
          </div>

          {/* Coins Badge */}
          <div className="topbar-coins-pill" title="Current Team Coin Budget">
            <div className="coins-icon-wrap">
              <Icon name="coins" size={14} />
            </div>
            <span className="coins-value-text">{formatCoins(activeTeamCoins)}</span>
            <span className="coins-label-text">Coins</span>
          </div>

          {/* Professional Exit Button */}
          <button
            className="topbar-exit-btn"
            onClick={() => setShowExitModal(true)}
            title="Exit team dashboard"
            type="button"
          >
            <Icon name="arrow-left" size={13} />
            <span>Exit</span>
          </button>
        </div>
      </header>

      {/* Professional Exit Confirmation Modal */}
      {showExitModal && (
        <div className="exit-modal-overlay" onClick={() => setShowExitModal(false)}>
          <div className="exit-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="exit-modal-icon-badge">
              <Icon name="shield" size={24} />
            </div>
            <h3>Exit Team Dashboard?</h3>
            <p className="exit-modal-desc">
              Are you sure you want to leave the <strong>{teamDisplayName}</strong> portal?
              Your team's coin balance and progress are securely saved in the tournament database.
            </p>
            <div className="exit-modal-actions">
              <button
                type="button"
                className="exit-modal-cancel-btn"
                onClick={() => setShowExitModal(false)}
              >
                Stay in Dashboard
              </button>
              <button
                type="button"
                className="exit-modal-confirm-btn"
                onClick={handleConfirmExit}
              >
                Confirm & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
