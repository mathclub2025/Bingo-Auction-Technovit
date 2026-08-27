import React from 'react';
import Icon from './Icon';

export default function Footer() {
  return (
    <footer className="portal-footer-modern">
      <div className="footer-content-wrap">
        <div className="footer-brand-section">
          <div className="footer-brand-badge">
            <div className="footer-mini-mark">
              <Icon name="grid" size={15} />
            </div>
            <strong>Bingo Auction Arena</strong>
          </div>
          <p className="footer-desc">
            Conducted by Mathematics Club VITCC for TechnoVIT
          </p>
        </div>

        <div className="footer-center-status">
          <div className="live-status-pill">
            <span className="live-dot" />
            <span>Live Database Synchronized</span>
          </div>
        </div>

        <div className="footer-right-section">
          <span>© 2026 Mathematics Club VITCC · TechnoVIT.</span>
          <span className="footer-rights">All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
