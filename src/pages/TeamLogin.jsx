import React, { useState } from 'react';
import Icon from '../components/Icon';

export default function TeamLogin({ teams, onTeamSubmit, onBackToLanding }) {
  const [teamNameInput, setTeamNameInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedName = teamNameInput.trim();

    if (!trimmedName) {
      setErrorMessage('Team name cannot be empty. Please enter your registered team name.');
      return;
    }

    if (trimmedName.length < 2) {
      setErrorMessage('Please enter a valid team name (at least 2 characters).');
      return;
    }

    // Check if team name matches an existing team (case-insensitive)
    const existingTeam = teams.find(
      (t) => t.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingTeam) {
      onTeamSubmit(existingTeam);
    } else {
      // Register new team entry with 50,000 Coins
      const newTeam = {
        id: `team-${Date.now()}`,
        name: trimmedName,
        number: teams.length + 1,
        coins: 50000,
        numbers: [],
        rank: teams.length + 1,
      };
      onTeamSubmit(newTeam);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card-wrapper">
        {/* Back Link */}
        <button
          className="login-back-btn"
          onClick={onBackToLanding}
          type="button"
        >
          <Icon name="arrow-left" size={14} />
          <span>Back to Home</span>
        </button>

        <article className="figma-card login-card">
          <div className="login-header">
            <div className="brand-mark-login">
              <Icon name="grid" size={24} />
            </div>
            <h2>Welcome to Math Club Auction</h2>
            <p>Enter your team name to join the live auction portal.</p>
          </div>

          {errorMessage && (
            <div className="login-error-alert" role="alert">
              <Icon name="alert" size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="login-form">
            <div className="form-input-group">
              <label htmlFor="team-name-input">
                <span>Team Name</span>
              </label>
              <input
                id="team-name-input"
                type="text"
                placeholder="e.g. Theorem Titans"
                value={teamNameInput}
                onChange={(e) => {
                  setTeamNameInput(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                autoFocus
              />
            </div>

            <button className="login-submit-btn" type="submit">
              <span>Continue to Auction</span>
              <Icon name="check" size={16} />
            </button>
          </form>

          <div className="login-info-box">
            <div className="info-item">
              <span className="info-label">Initial Coins:</span>
              <strong className="info-value font-mono">50,000 Coins</strong>
            </div>
            <div className="info-item">
              <span className="info-label">Initial Numbers:</span>
              <strong className="info-value">None</strong>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
