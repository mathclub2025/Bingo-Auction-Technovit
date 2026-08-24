import React from 'react';
import Icon from '../components/Icon';

export default function LandingPage({ onEnterAuction }) {
  return (
    <div className="landing-page-container">
      {/* Hero Header Section */}
      <section className="landing-hero-section">
        <div className="landing-badge">
          <Icon name="shield" size={14} className="blue-icon" />
          <span>MATH CLUB VIT CHENNAI • ANNUAL AUCTION</span>
        </div>

        <h1 className="landing-title">
          Solve. Bid. <span className="gradient-text">Dominate.</span>
        </h1>

        <p className="landing-subtitle">
          Welcome to the Math Club Auction platform. Engage in real-time mathematical problem-solving,
          strategically bid with your team's starting balance of <strong>50,000 Coins</strong>, and collect key numbers to claim victory.
        </p>

        <div className="landing-cta-group">
          <button
            className="landing-primary-btn"
            onClick={onEnterAuction}
            type="button"
          >
            <Icon name="coins" size={18} />
            <span>Enter Auction Portal</span>
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
            Every participating team starts with a clean slate of 50,000 Auction Coins. Manage your bids wisely across rounds.
          </p>
        </article>

        <article className="figma-card feature-card">
          <div className="feature-icon-wrapper green">
            <Icon name="shield" size={22} />
          </div>
          <h3>Qualification Challenges</h3>
          <p>
            Solve speed mathematical questions to qualify your bid before competing with opponent teams in the live auction.
          </p>
        </article>

        <article className="figma-card feature-card">
          <div className="feature-icon-wrapper gold">
            <Icon name="grid" size={22} />
          </div>
          <h3>1–50 Number Collection</h3>
          <p>
            Acquire target number cards to unlock milestone rewards and climb the tournament leaderboard.
          </p>
        </article>
      </section>

      {/* Tournament Overview Banner */}
      <section className="figma-card landing-overview-banner">
        <div className="overview-content">
          <h2>Ready to compete?</h2>
          <p>Provide your team name to join the live auction viewing and bidding dashboard.</p>
        </div>
        <button
          className="landing-secondary-btn"
          onClick={onEnterAuction}
          type="button"
        >
          <span>Continue to Team Entry →</span>
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span>© 2026 Math Club VIT Chennai. All rights reserved.</span>
      </footer>
    </div>
  );
}
