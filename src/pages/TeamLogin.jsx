import React, { useState, useEffect } from 'react';
import Icon from '../components/Icon';

export default function TeamLogin({ teams, onTeamSubmit, onBackToLanding, initialTab = 'register' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'register' | 'entry'

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Form State for Register Team
  const [captainName, setCaptainName] = useState('');
  const [captainRegNo, setCaptainRegNo] = useState('');
  const [registerTeamName, setRegisterTeamName] = useState('');

  // Form State for Team Entry (Existing Team Login)
  const [entryTeamName, setEntryTeamName] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  // Handle Create Team submit
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedCaptain = captainName.trim();
    const trimmedRegNo = captainRegNo.trim().toUpperCase();
    const trimmedTeam = registerTeamName.trim();

    if (!trimmedCaptain) {
      setErrorMessage('Please enter the Team Captain name.');
      return;
    }

    if (!trimmedRegNo) {
      setErrorMessage('Please enter the Team Captain registration number.');
      return;
    }

    if (!trimmedTeam) {
      setErrorMessage('Please enter a Team Name.');
      return;
    }

    // Check if team name already exists (case insensitive)
    const nameExists = teams.some(
      (t) => t.name.toLowerCase() === trimmedTeam.toLowerCase()
    );

    if (nameExists) {
      setErrorMessage(`A team with the name "${trimmedTeam}" is already registered. Switch to "Continue to Team Entry" to log in, or choose another team name.`);
      return;
    }

    const newTeam = {
      id: `team-${Date.now()}`,
      name: trimmedTeam,
      number: teams.length + 1,
      coins: 50000,
      numbers: [],
      rank: teams.length + 1,
      captain: {
        name: trimmedCaptain,
        regNo: trimmedRegNo,
      },
      members: [
        {
          name: trimmedCaptain,
          regNo: trimmedRegNo,
          role: 'Captain',
          addedAt: 'Initial Registration',
        },
      ],
    };

    onTeamSubmit(newTeam);
  };

  // Handle Existing Team Entry submit
  const handleEntrySubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedName = entryTeamName.trim();

    if (!trimmedName) {
      setErrorMessage('Please enter your registered Team Name to access the dashboard.');
      return;
    }

    const existingTeam = teams.find(
      (t) => t.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingTeam) {
      onTeamSubmit(existingTeam);
    } else {
      setErrorMessage(`No registered team found with name "${trimmedName}". Please check the spelling or switch to "Register Team".`);
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
            <h2>Math Club Auction Entry</h2>
            <p>Register your team or enter your team name to access the dashboard.</p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="login-tabs">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('register');
                setErrorMessage('');
                window.history.replaceState({}, '', '/TeamLogin?tab=register');
              }}
            >
              <Icon name="user" size={15} />
              <span>Register Team</span>
            </button>

            <button
              type="button"
              className={`tab-btn ${activeTab === 'entry' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('entry');
                setErrorMessage('');
                window.history.replaceState({}, '', '/TeamLogin?tab=entry');
              }}
            >
              <Icon name="shield" size={15} />
              <span>Continue to Team Entry</span>
            </button>
          </div>

          {errorMessage && (
            <div className="login-error-alert" role="alert">
              <Icon name="alert" size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: Register Team */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} noValidate className="login-form">
              <div className="form-input-group">
                <label htmlFor="captain-name-input">
                  <span>Team Captain Name *</span>
                </label>
                <input
                  id="captain-name-input"
                  type="text"
                  placeholder="e.g. Siddharth Roy"
                  value={captainName}
                  onChange={(e) => {
                    setCaptainName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoFocus
                />
              </div>

              <div className="form-input-group">
                <label htmlFor="captain-reg-input">
                  <span>Captain Registration Number *</span>
                </label>
                <input
                  id="captain-reg-input"
                  type="text"
                  placeholder="e.g. 22BCE1580"
                  value={captainRegNo}
                  onChange={(e) => {
                    setCaptainRegNo(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                />
              </div>

              <div className="form-input-group">
                <label htmlFor="team-name-register-input">
                  <span>Team Name *</span>
                </label>
                <input
                  id="team-name-register-input"
                  type="text"
                  placeholder="e.g. Matrix Masters"
                  value={registerTeamName}
                  onChange={(e) => {
                    setRegisterTeamName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                />
              </div>

              <button className="login-submit-btn" type="submit">
                <Icon name="plus" size={16} />
                <span>Create Team & Continue</span>
              </button>
            </form>
          )}

          {/* TAB 2: Continue to Team Entry */}
          {activeTab === 'entry' && (
            <form onSubmit={handleEntrySubmit} noValidate className="login-form">
              <div className="form-input-group">
                <label htmlFor="team-name-entry-input">
                  <span>Enter Registered Team Name</span>
                </label>
                <input
                  id="team-name-entry-input"
                  type="text"
                  placeholder="e.g. Theorem Titans"
                  value={entryTeamName}
                  onChange={(e) => {
                    setEntryTeamName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoFocus
                />
              </div>

              {/* Quick Select Suggestion Dropdown */}
              {teams.length > 0 && (
                <div className="quick-select-teams">
                  <span className="quick-select-label">Or select registered team:</span>
                  <div className="team-chips-select">
                    {teams.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className="team-select-chip"
                        onClick={() => {
                          setEntryTeamName(t.name);
                          setErrorMessage('');
                        }}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button className="login-submit-btn" type="submit">
                <span>Access Team Dashboard</span>
                <Icon name="check" size={16} />
              </button>
            </form>
          )}

          <div className="login-info-box">
            <div className="info-item">
              <span className="info-label">Initial Coins:</span>
              <strong className="info-value font-mono">50,000 Coins</strong>
            </div>
            <div className="info-item">
              <span className="info-label">Teammate Support:</span>
              <strong className="info-value">Auto-Verification</strong>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

