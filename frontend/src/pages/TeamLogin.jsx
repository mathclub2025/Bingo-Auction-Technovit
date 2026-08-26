import React, { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import { registerTeam, loginTeam } from '../services/api';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Create Team submit (calls backend)
  const handleRegisterSubmit = async (e) => {
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

    setIsSubmitting(true);
    try {
      const response = await registerTeam({
        teamName: trimmedTeam,
        captainName: trimmedCaptain,
        captainRegNo: trimmedRegNo,
      });

      const teamData = response.team || {
        id: response.id || `team-${Date.now()}`,
        name: trimmedTeam,
        team_name: trimmedTeam,
        coins: 50000,
        numbers: [],
        captain: { name: trimmedCaptain, regNo: trimmedRegNo },
        members: [{ name: trimmedCaptain, regNo: trimmedRegNo, role: 'Captain' }],
      };

      onTeamSubmit(teamData);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to register team. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Existing Team Entry submit (calls backend)
  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedName = entryTeamName.trim();

    if (!trimmedName) {
      setErrorMessage('Please enter your registered Team Name to access the dashboard.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await loginTeam({ teamName: trimmedName });

      const teamData = response.team;
      if (teamData) {
        onTeamSubmit(teamData);
      } else {
        setErrorMessage(`No registered team found with name "${trimmedName}".`);
      }
    } catch (err) {
      setErrorMessage(err.message || `No registered team found with name "${trimmedName}".`);
    } finally {
      setIsSubmitting(false);
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
          {/* Dedicated Header for Register Mode */}
          {activeTab === 'register' && (
            <div className="login-header">
              <div className="brand-mark-login">
                <Icon name="user" size={24} />
              </div>
              <h2>Register Your Team</h2>
              <p>Enter your captain details and team name to register for the live auction tournament.</p>
            </div>
          )}

          {/* Dedicated Header for Team Entry Mode */}
          {activeTab === 'entry' && (
            <div className="login-header">
              <div className="brand-mark-login" style={{ background: '#1d5ec9' }}>
                <Icon name="grid" size={24} />
              </div>
              <h2>Team Entry</h2>
              <p>Enter your registered team name to access the live tournament dashboard.</p>
            </div>
          )}

          {errorMessage && (
            <div className="login-error-alert" role="alert">
              <Icon name="alert" size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* MODE 1: Register Team */}
          {activeTab === 'register' && (
            <>
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

                <button className="login-submit-btn" type="submit" disabled={isSubmitting}>
                  <Icon name="plus" size={16} />
                  <span>{isSubmitting ? 'Creating Team...' : 'Create Team & Continue'}</span>
                </button>
              </form>

              <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.86rem', color: '#627084' }}>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('entry');
                    setErrorMessage('');
                    window.history.replaceState({}, '', '/TeamLogin?tab=entry');
                  }}
                  style={{ color: '#1a56db', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Continue to Team Entry →
                </button>
              </div>
            </>
          )}

          {/* MODE 2: Continue to Team Entry */}
          {activeTab === 'entry' && (
            <>
              <form onSubmit={handleEntrySubmit} noValidate className="login-form">
                <div className="form-input-group">
                  <label htmlFor="team-name-entry-input">
                    <span>Enter Registered Team Name *</span>
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

                <button className="login-submit-btn" type="submit" disabled={isSubmitting}>
                  <span>{isSubmitting ? 'Verifying...' : 'Access Team Dashboard'}</span>
                  <Icon name="check" size={16} />
                </button>
              </form>

              <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.86rem', color: '#627084' }}>
                Need to register a new team?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMessage('');
                    window.history.replaceState({}, '', '/TeamLogin?tab=register');
                  }}
                  style={{ color: '#1a56db', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Register Team here →
                </button>
              </div>
            </>
          )}
        </article>
      </div>
    </div>
  );
}
