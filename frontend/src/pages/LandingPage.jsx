import React, { useState } from 'react';
import Icon from '../components/Icon';
import AdminModal from '../components/AdminModal';
import Footer from '../components/Footer';

export default function LandingPage({ onEnterAuction, onOpenAdmin, teams = [] }) {
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  const handleRegisterClick = () => {
    if (onEnterAuction) onEnterAuction('register');
  };

  const handleEntryClick = () => {
    if (onEnterAuction) onEnterAuction('entry');
  };

  const handleAdminClick = () => {
    if (onOpenAdmin) {
      onOpenAdmin();
    } else if (onEnterAuction) {
      onEnterAuction('admin');
    }
  };

  return (
    <div className="landing-page-container">
      {/* Top Header with Admin Login */}
      <header className="landing-top-nav">
        <div className="landing-nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/maths-club-logo.png" alt="Maths Club Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          <span>MATHEMATICS CLUB VITCC • TECHNOVIT</span>
        </div>
        <button
          className="landing-admin-btn"
          onClick={handleAdminClick}
          type="button"
        >
          <Icon name="shield" size={14} />
          <span>Admin Control Desk</span>
        </button>
      </header>

      {/* Hero Header Section */}
      <section className="landing-hero-section">
        <div className="landing-badge">
          <Icon name="shield" size={14} className="blue-icon" />
          <span>BINGO AUCTION ARENA • TECHNOVIT • MATHEMATICS CLUB VITCC</span>
        </div>

        <h1 className="landing-title">
          Bingo Auction Arena
        </h1>

        <p className="landing-subtitle">
          Conducted by <strong>Mathematics Club VITCC</strong> for <strong>TechnoVIT</strong>. Engage in real-time mathematical problem-solving,
          strategically bid with your team's starting balance of <strong>50,000 Coins</strong>, and complete 3 Bingo lines (Horizontal, Vertical, and Diagonal) to claim victory.
        </p>

        <div className="landing-cta-group">
          <button
            className="landing-primary-btn"
            onClick={handleRegisterClick}
            type="button"
          >
            <Icon name="user" size={18} />
            <span>Register Team</span>
          </button>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="landing-features-grid">
        <article className="figma-card feature-card">
          <div className="feature-icon-wrapper blue">
            <Icon name="coins" size={22} />
          </div>
          <h3>50,000 Coins Budget</h3>
          <p>
            Every participating team starts with an initial balance of 50,000 Auction Coins. Manage your bids wisely across rounds.
          </p>
        </article>

        <article className="figma-card feature-card">
          <div className="feature-icon-wrapper green">
            <Icon name="shield" size={22} />
          </div>
          <h3>Direct Teammate Entry</h3>
          <p>
            Captains can add teammates directly via Registration Number and Name to synchronize their live competition roster.
          </p>
        </article>

        <article className="figma-card feature-card">
          <div className="feature-icon-wrapper gold">
            <Icon name="grid" size={22} />
          </div>
          <h3>1–25 Number Cards</h3>
          <p>
            Acquire target number cards, unlock milestone bonuses, and lead your team to the top of the live tournament leaderboard.
          </p>
        </article>
      </section>

      {/* Tournament Overview Banner */}
      <section className="figma-card landing-overview-banner">
        <div className="overview-content">
          <h2>Ready to compete?</h2>
          <p>Enter your registered team name to access the live dashboard.</p>
        </div>
        <div className="landing-overview-cta-group">
          <button
            className="landing-secondary-btn"
            onClick={handleEntryClick}
            type="button"
          >
            <span>Continue to Team Entry →</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Admin Login & Controls Modal */}
      <AdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        teams={teams}
      />
    </div>
  );
}
