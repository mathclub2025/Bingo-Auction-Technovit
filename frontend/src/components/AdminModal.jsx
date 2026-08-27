import React, { useState } from 'react';
import Icon from './Icon';
import {
  loginAdmin,
  getAdminToken,
  removeAdminToken,
} from '../services/api';

export default function AdminModal({ isOpen, onClose, onOpenFullAdmin, teams = [] }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => Boolean(getAdminToken()));
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Admin Panel Action States (Frontend UI/UX)
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [coinsDeducted, setCoinsDeducted] = useState('');
  const [answerStatus, setAnswerStatus] = useState('yes'); // 'yes' | 'no'
  const [bonusCoins, setBonusCoins] = useState('');
  const [numberWon, setNumberWon] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [actionErrorMsg, setActionErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('actions'); // 'actions' | 'logs'

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);

    try {
      await loginAdmin({
        username: adminUsername,
        password: adminPassword,
      });
      setIsAdminLoggedIn(true);
      setAdminPassword('');
    } catch (err) {
      setAuthError(err.message || 'Invalid admin credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    removeAdminToken();
    setIsAdminLoggedIn(false);
    setAuthError('');
  };

  const handleUpdatePointsSubmit = (e) => {
    e.preventDefault();
    setActionSuccessMsg('');
    setActionErrorMsg('');

    const team = teams.find((t) => t.id === selectedTeamId) || teams[0];
    const teamLabel = team ? (team.name || team.team_name) : 'Team';

    setActionSuccessMsg(`Point updates recorded for ${teamLabel}!`);
    setCoinsDeducted('');
    setBonusCoins('');
    setNumberWon('');
  };

  const handleResetAll = () => {
    if (window.confirm('⚠️ Are you sure you want to reset all teams back to initial 50,000 coins?')) {
      setActionSuccessMsg('All teams reset to initial 50,000 coins.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-container figma-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="admin-modal-header">
          <div className="admin-badge-title">
            <Icon name="shield" size={18} className="gold-icon" />
            <h3>Source Computer • Admin Control Center</h3>
          </div>
          <button className="admin-close-btn" onClick={onClose} type="button">
            &times;
          </button>
        </div>

        {/* Not Logged In: Show Admin Login Form */}
        {!isAdminLoggedIn ? (
          <form onSubmit={handleLoginSubmit} className="admin-login-form">
            <p className="admin-login-intro">
              Enter authorized administrator credentials to manage team coins, deduct points, and award numbers.
            </p>

            {authError && (
              <div className="login-error-alert">
                <Icon name="alert" size={16} />
                <span>{authError}</span>
              </div>
            )}

            <div className="form-input-group">
              <label htmlFor="admin-user-input">Admin Username</label>
              <input
                id="admin-user-input"
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-input-group">
              <label htmlFor="admin-pass-input">Admin Password</label>
              <input
                id="admin-pass-input"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
            </div>

            <button className="login-submit-btn" type="submit" disabled={isSubmitting}>
              <Icon name="check" size={16} />
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In as Admin'}</span>
            </button>
          </form>
        ) : (
          /* Logged In: Show Admin Dashboard */
          <div className="admin-dashboard-view">
            {/* Tabs */}
            <div className="admin-tabs">
              <button
                type="button"
                className={`tab-btn ${activeTab === 'actions' ? 'active' : ''}`}
                onClick={() => setActiveTab('actions')}
              >
                <Icon name="coins" size={14} />
                <span>Point Controls</span>
              </button>
              <button
                type="button"
                className="tab-btn"
                onClick={() => {
                  if (onClose) onClose();
                  if (onOpenFullAdmin) {
                    onOpenFullAdmin();
                  }
                }}
                style={{ background: '#1e4f95', color: '#fff' }}
              >
                <Icon name="grid" size={14} />
                <span>Open Full Admin Desk ↗</span>
              </button>
              <button type="button" className="admin-logout-btn" onClick={handleLogout}>
                <Icon name="arrow-left" size={13} />
                <span>Sign Out</span>
              </button>
            </div>

            {actionSuccessMsg && (
              <div className="teammate-feedback-alert success">
                <Icon name="check" size={15} />
                <span>{actionSuccessMsg}</span>
              </div>
            )}
            {actionErrorMsg && (
              <div className="teammate-feedback-alert error">
                <Icon name="alert" size={15} />
                <span>{actionErrorMsg}</span>
              </div>
            )}

            {/* TAB 1: Points & Numbers */}
            {activeTab === 'actions' && (
              <form onSubmit={handleUpdatePointsSubmit} className="admin-action-form">
                <div className="form-input-group">
                  <label htmlFor="select-target-team">Target Team *</label>
                  <select
                    id="select-target-team"
                    value={selectedTeamId || (teams[0]?.id || '')}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name || t.team_name} — Balance: {(t.coins || 50000).toLocaleString()} Coins
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-grid">
                  <div className="form-input-group">
                    <label htmlFor="coins-deducted-input">Coins Deducted (Bid/Penalty)</label>
                    <input
                      id="coins-deducted-input"
                      type="number"
                      min="0"
                      step="100"
                      placeholder="e.g. 2000"
                      value={coinsDeducted}
                      onChange={(e) => setCoinsDeducted(e.target.value)}
                    />
                  </div>

                  <div className="form-input-group">
                    <label htmlFor="answer-status-select">Question Answered Correctly?</label>
                    <select
                      id="answer-status-select"
                      value={answerStatus}
                      onChange={(e) => setAnswerStatus(e.target.value)}
                    >
                      <option value="yes">Yes (Award Bonus & Number)</option>
                      <option value="no">No (Deduct Bid Coins Only)</option>
                    </select>
                  </div>
                </div>

                {answerStatus === 'yes' && (
                  <div className="admin-form-grid">
                    <div className="form-input-group">
                      <label htmlFor="bonus-coins-input">Bonus Coins Added</label>
                      <input
                        id="bonus-coins-input"
                        type="number"
                        min="0"
                        step="100"
                        placeholder="e.g. 500"
                        value={bonusCoins}
                        onChange={(e) => setBonusCoins(e.target.value)}
                      />
                    </div>

                    <div className="form-input-group">
                      <label htmlFor="number-won-input">Auction Number Card Won (1–25)</label>
                      <input
                        id="number-won-input"
                        type="number"
                        min="1"
                        max="25"
                        placeholder="e.g. 7"
                        value={numberWon}
                        onChange={(e) => setNumberWon(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="admin-btn-row">
                  <button type="submit" className="login-submit-btn">
                    <Icon name="check" size={16} />
                    <span>Execute Point Update</span>
                  </button>

                  <button
                    type="button"
                    className="admin-reset-btn"
                    onClick={handleResetAll}
                  >
                    <span>Reset All Teams to 50k</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: Audit Logs */}
            {activeTab === 'logs' && (
              <div className="admin-logs-view">
                <ul className="admin-audit-list">
                  <li className="admin-log-item">
                    <div className="log-top-row">
                      <strong>Matrix Masters</strong>
                      <span className="log-time">Just Now</span>
                    </div>
                    <div className="log-details">
                      <span>Deducted: <strong>-2,000</strong></span>
                      <span>Bonus: <strong>+500</strong></span>
                      <span>Won #: <strong>7</strong></span>
                    </div>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
