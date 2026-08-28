import React, { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import { registerTeam, loginTeam } from '../services/api';
import { BINGO_CARD_SETS } from '../data/bingoGrids';
import mathsClubLogo from '../assets/maths-club-logo.png';

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
  const [entryCaptainRegNo, setEntryCaptainRegNo] = useState('');

  // Post-Registration Allotted Card Modal State
  const [allottedCardData, setAllottedCardData] = useState(null);

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
        captainRegNo: trimmedRegNo
      });

      const teamData = response.team || {
        id: response.id || `team-${Date.now()}`,
        name: trimmedTeam,
        team_name: trimmedTeam,
        bingo_card_set: response.bingo_card_set || 1,
        coins: 50000,
        numbers: [],
        captain: { name: trimmedCaptain, regNo: trimmedRegNo },
        members: [{ name: trimmedCaptain, regNo: trimmedRegNo, role: 'Captain' }],
      };

      // Show the Allotted Bingo Card screen to the team
      setAllottedCardData(teamData);
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
    const trimmedRegNo = entryCaptainRegNo.trim().toUpperCase();

    if (!trimmedName) {
      setErrorMessage('Please enter your registered Team Name to access the dashboard.');
      return;
    }

    if (!trimmedRegNo) {
      setErrorMessage('Please enter the Team Captain Registration Number to access the dashboard.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await loginTeam({
        teamName: trimmedName,
        captainRegNo: trimmedRegNo
      });

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

  // IF REGISTRATION JUST SUCCEEDED: SHOW ALLOTTED BINGO CARD MODAL
  if (allottedCardData) {
    const setNum = allottedCardData.bingo_card_set || allottedCardData.bingoCardSet || 1;
    const gridMatrix = BINGO_CARD_SETS[setNum] || BINGO_CARD_SETS[1];

    return (
      <div className="login-page-container">
        <div className="login-card-wrapper" style={{ maxWidth: '560px' }}>
          <article className="figma-card login-card" style={{ padding: '32px' }}>
            <div className="login-header" style={{ marginBottom: '20px' }}>
              <div className="brand-mark-login" style={{ background: 'transparent', boxShadow: 'none', width: '56px', height: '56px' }}>
                <img src={mathsClubLogo} alt="Maths Club Logo" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
              </div>
              <p className="eyebrow" style={{ color: '#047857', marginTop: '10px' }}>Registration Confirmed</p>
              <h2 style={{ fontSize: '1.5rem', margin: '4px 0 6px' }}>{allottedCardData.name || allottedCardData.team_name}</h2>
              <span className="team-index" style={{ display: 'inline-grid', margin: '6px 0', fontSize: '0.86rem', padding: '4px 12px' }}>
                Allotted Bingo Card: Set #{setNum}
              </span>
              <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '8px 0 0' }}>
                Below is your official 5×5 Bingo Matrix. Complete any single horizontal, vertical, or diagonal line during the auction to win the tournament!
              </p>
            </div>

            {/* 5x5 Bingo Matrix Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '8px',
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                marginBottom: '24px'
              }}
            >
              {gridMatrix.map((row, rIdx) =>
                row.map((num, cIdx) => (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    style={{
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '8px',
                      fontFamily: "'DM Mono', monospace",
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      color: '#1e3a8a',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                    }}
                  >
                    {num}
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              className="login-submit-btn"
              onClick={() => onTeamSubmit(allottedCardData)}
              style={{ width: '100%', padding: '14px', fontSize: '0.98rem' }}
            >
              <span>Proceed to Team Dashboard</span>
              <Icon name="arrow" size={18} />
            </button>
          </article>
        </div>
      </div>
    );
  }

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
              <div className="brand-mark-login" style={{ background: 'transparent', boxShadow: 'none' }}>
                <img src={mathsClubLogo} alt="Maths Club Logo" style={{ width: '52px', height: '52px', objectFit: 'contain' }} />
              </div>
              <h2>Register Your Team</h2>
              <p>Bingo Auction Arena at TechnoVIT • Conducted by Mathematics Club VITCC.</p>
            </div>
          )}

          {/* Dedicated Header for Team Entry Mode */}
          {activeTab === 'entry' && (
            <div className="login-header">
              <div className="brand-mark-login" style={{ background: 'transparent', boxShadow: 'none' }}>
                <img src={mathsClubLogo} alt="Maths Club Logo" style={{ width: '52px', height: '52px', objectFit: 'contain' }} />
              </div>
              <h2>Team Entry</h2>
              <p>Enter your registered team name to access the TechnoVIT Bingo Auction Arena dashboard.</p>
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
                  <span>{isSubmitting ? 'Registering...' : 'Register Team & Reveal Card'}</span>
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

                <div className="form-input-group">
                  <label htmlFor="team-captain-reg-entry-input">
                    <span>Captain Registration Number *</span>
                  </label>
                  <input
                    id="team-captain-reg-entry-input"
                    type="text"
                    placeholder="e.g. 24BPS1125"
                    value={entryCaptainRegNo}
                    onChange={(e) => {
                      setEntryCaptainRegNo(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
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
