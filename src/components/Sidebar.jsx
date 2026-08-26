import React from 'react';
import Icon from './Icon';

export default function Sidebar({
  currentView,
  onViewChange,
  activeTeamName,
  activeRoundName,
  onPlaceBidClick,
  onSwitchTeam,
  isOpen,
  onClose
}) {
  const handleNavClick = (view) => {
    onViewChange(view);
    if (onClose) onClose();
  };

  const handleBidClick = () => {
    onPlaceBidClick();
    if (onClose) onClose();
  };

  const handleSwitchClick = () => {
    if (onSwitchTeam) onSwitchTeam();
    if (onClose) onClose();
  };

  return (
    <aside className={`participant-sidebar ${isOpen ? 'open' : 'closed'}`} aria-hidden={!isOpen}>
      {/* Team Profile Box */}
      <div className="sidebar-profile">
        <div className="sidebar-avatar-wrapper">
          <div className="sidebar-avatar">
            <Icon name="grid" size={20} />
          </div>
        </div>
        <div className="sidebar-profile-info">
          <h3>{activeTeamName}</h3>
          <p>{activeRoundName}</p>
        </div>
        {onClose && (
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            title="Close sidebar"
            aria-label="Close sidebar"
            type="button"
          >
            <Icon name="x" size={18} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-menu" aria-label="Sidebar Navigation">
        <button
          className={`menu-item ${currentView === 'user-dashboard' ? 'active' : ''}`}
          onClick={() => handleNavClick('user-dashboard')}
          type="button"
        >
          <Icon name="grid" size={17} />
          <span>Dashboard</span>
        </button>
      </nav>

      {/* Bottom Rules / Support Links */}
      <div className="sidebar-footer">
        {onSwitchTeam && (
          <button
            className="sidebar-footer-link switch-team-link"
            onClick={handleSwitchClick}
            title="Switch or re-enter team"
            type="button"
          >
            <Icon name="logout" size={14} />
            <span>Switch Team</span>
          </button>
        )}
        <button
          className="sidebar-footer-link"
          onClick={() => {
            alert("Math Club Auction Rules:\n1. Solve the qualification challenge to unlock bidding.\n2. Submit bid increments of 1,000 Coins.\n3. Highest correct bidder wins the target number.\n4. Incorrect answer incurs a 1,000 Coins penalty.");
            if (onClose) onClose();
          }}
          type="button"
        >
          <Icon name="shield" size={14} />
          <span>Rules</span>
        </button>
        <button
          className="sidebar-footer-link"
          onClick={() => {
            alert("For support, contact the math club organizers at the main control computer desk.");
            if (onClose) onClose();
          }}
          type="button"
        >
          <Icon name="alert" size={14} />
          <span>Support</span>
        </button>
      </div>
    </aside>
  );
}
