import React, { useMemo, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { initialTeams } from '../data/mockTeams';
import Icon from '../components/Icon';
import { loginAdmin, getAdminToken, removeAdminToken } from '../services/api';

const API_BASE_URL = 'http://localhost:5000';

function formatTeam(t) {
  return {
    id: t.id,
    name: t.team_name || t.name || 'Unnamed Team',
    coins: Number(t.coins) || 0,
    numbers: Array.isArray(t.numbers_collected) ? t.numbers_collected : (Array.isArray(t.numbers) ? t.numbers : [])
  };
}

const formatCoins = (value) =>
  new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(value);

export default function AdminDashboard({ onSwitchToUserView }) {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getAdminToken()));
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard state
  const [teams, setTeams] = useState(initialTeams);
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeams[0]?.id || '');
  const [deduction, setDeduction] = useState('');
  const [answer, setAnswer] = useState('no');
  const [bonus, setBonus] = useState('');
  const [number, setNumber] = useState('');
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch real team records from backend API
  const fetchTeamsFromBackend = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/teams`);
      if (res.ok) {
        const data = await res.json();
        if (data.teams && Array.isArray(data.teams) && data.teams.length > 0) {
          const formatted = data.teams.map(formatTeam);
          setTeams(formatted);
          setSelectedTeamId((prevId) => {
            if (prevId && formatted.some((t) => String(t.id) === String(prevId))) {
              return prevId;
            }
            return prevId || formatted[0].id;
          });
        }
      }
    } catch (err) {
      console.warn('Backend server offline or unreachable, using local fallback:', err.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTeamsFromBackend();

      const socket = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        socket.emit('join_dashboard', { role: 'admin' });
      });

      socket.on('teams:updated', (payload) => {
        if (payload && Array.isArray(payload.teams)) {
          const formatted = payload.teams.map(formatTeam);
          setTeams(formatted);
        }
      });

      socket.on('team:updated', () => {
        fetchTeamsFromBackend();
      });

      const interval = setInterval(fetchTeamsFromBackend, 2000);
      return () => {
        clearInterval(interval);
        socket.disconnect();
      };
    }
  }, [isAuthenticated]);

  const selectedTeam = useMemo(
    () => teams.find((team) => String(team.id) === String(selectedTeamId)) ?? teams[0] ?? { id: '', name: '', coins: 0, numbers: [] },
    [selectedTeamId, teams],
  );

  const resetForm = () => {
    setDeduction('');
    setAnswer('no');
    setBonus('');
    setNumber('');
  };

  // Auto-dismiss success/error notice banner after 30 seconds
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => {
        setNotice(null);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [notice]);

  const selectTeam = (teamId) => {
    setSelectedTeamId(String(teamId));
    setNotice(null);
    resetForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [currentAdminUser, setCurrentAdminUser] = useState(() => {
    return localStorage.getItem('admin_username') || 'admin';
  });

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const res = await loginAdmin({
        username: adminUsername,
        password: adminPassword,
      });
      const name = res.team?.username || res.team?.team_name || adminUsername || 'admin';
      setCurrentAdminUser(name);
      localStorage.setItem('admin_username', name);
      setIsAuthenticated(true);
      setAdminPassword('');
    } catch (err) {
      setAuthError(err.message || 'Invalid admin credentials');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdminLogout = () => {
    removeAdminToken();
    localStorage.removeItem('admin_username');
    setIsAuthenticated(false);
    setAuthError('');
    setAdminPassword('');
  };

  const submitUpdate = async (event) => {
    event.preventDefault();
    setNotice(null);

    const deductionAmount = Number(deduction);
    const bonusAmount = answer === 'yes' ? Number(bonus) : 0;
    const numberObtained = answer === 'yes' && number !== '' ? Number(number) : null;

    if (!Number.isInteger(deductionAmount) || deductionAmount <= 0) {
      setNotice({ type: 'error', text: 'Enter a valid coin deduction greater than 0.' });
      return;
    }

    if (deductionAmount > selectedTeam.coins) {
      setNotice({ type: 'error', text: 'The deduction cannot exceed this team’s current coins.' });
      return;
    }

    if (answer === 'yes') {
      if (!Number.isInteger(bonusAmount) || bonusAmount < 0) {
        setNotice({ type: 'error', text: 'Enter a valid bonus amount of 0 or more.' });
        return;
      }

      if (numberObtained !== null && (!Number.isInteger(numberObtained) || numberObtained < 1 || numberObtained > 25)) {
        setNotice({ type: 'error', text: 'Number obtained must be a whole number from 1 to 25.' });
        return;
      }

      if (numberObtained !== null && selectedTeam.numbers.includes(numberObtained)) {
        setNotice({ type: 'error', text: `Number ${numberObtained} is already recorded for this team.` });
        return;
      }
    }

    setLoading(true);
    const targetTeamName = selectedTeam.name;
    const targetTeamId = selectedTeam.id;

    try {
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/api/auth/admin/update-team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          teamId: targetTeamId,
          teamName: targetTeamName,
          coinsDeducted: deductionAmount,
          questionAnswer: answer,
          bonusCoins: bonusAmount,
          numberObtained: numberObtained
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update team record');
      }

      if (result.allTeams && Array.isArray(result.allTeams)) {
        const formatted = result.allTeams.map(formatTeam);
        setTeams(formatted);
      } else {
        await fetchTeamsFromBackend();
      }

      // Preserve selected team ID
      setSelectedTeamId(targetTeamId);

      setNotice({
        type: 'success',
        text: answer === 'yes'
          ? `Updated ${targetTeamName}: number ${numberObtained ?? 'none'} recorded and balance adjusted.`
          : `Updated ${targetTeamName}: ${formatCoins(deductionAmount)} coins deducted.`,
      });
      resetForm();
    } catch (err) {
      // Fallback local update if API fails
      const coinChange = bonusAmount - deductionAmount;
      const updatedTeam = {
        ...selectedTeam,
        coins: selectedTeam.coins + coinChange,
        numbers: numberObtained ? [...selectedTeam.numbers, numberObtained] : selectedTeam.numbers,
      };

      setTeams((currentTeams) =>
        currentTeams.map((team) => (team.id === targetTeamId ? updatedTeam : team)),
      );
      setNotice({
        type: 'success',
        text: `Updated ${targetTeamName}: ${formatCoins(deductionAmount)} coins deducted.`
      });
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  // IF NOT AUTHENTICATED: Show Admin Login Screen
  if (!isAuthenticated) {
    return (
      <div className="login-page-container">
        <div className="login-card-wrapper" style={{ maxWidth: '440px' }}>
          {onSwitchToUserView && (
            <button
              className="login-back-btn"
              onClick={onSwitchToUserView}
              type="button"
            >
              <Icon name="arrow-left" size={14} />
              <span>Back to Portal</span>
            </button>
          )}

          <article className="figma-card login-card">
            <div className="login-header">
              <div className="brand-mark-login" style={{ background: '#173d7a' }}>
                <Icon name="shield" size={24} />
              </div>
              <h2>Admin Control Desk</h2>
              <p>Sign in with organizer credentials to access the live host control desk.</p>
            </div>

            {authError && (
              <div className="login-error-alert" role="alert">
                <Icon name="alert" size={16} />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} noValidate className="login-form">
              <div className="form-input-group">
                <label htmlFor="admin-username-input">
                  <span>Admin Username</span>
                </label>
                <input
                  id="admin-username-input"
                  type="text"
                  value={adminUsername}
                  onChange={(e) => {
                    setAdminUsername(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  autoFocus
                />
              </div>

              <div className="form-input-group">
                <label htmlFor="admin-password-input">
                  <span>Admin Password</span>
                </label>
                <input
                  id="admin-password-input"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    if (authError) setAuthError('');
                  }}
                />
              </div>

              <button className="login-submit-btn" type="submit" disabled={authLoading}>
                <span>{authLoading ? 'Signing in...' : 'Sign In to Control Desk'}</span>
                <Icon name="check" size={16} />
              </button>
            </form>

            <div className="login-info-box">
              <div className="info-item">
                <span className="info-label">Access Level:</span>
                <strong className="info-value font-mono">Source Computer</strong>
              </div>
              <div className="info-item">
                <span className="info-label">Privileges:</span>
                <strong className="info-value">Deductions & Awards</strong>
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  }

  // IF AUTHENTICATED: Show Full Admin Control Desk
  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Icon name="grid" size={19} /></div>
          <div>
            <p className="eyebrow">VIT Chennai · Mathematics Club</p>
            <h1>Math Club Auction · Admin Desk</h1>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="admin-status" aria-label="Admin status">
            <span className="status-dot" />
            <span>Admin: <strong>{currentAdminUser}</strong></span>
          </div>
          <button
            type="button"
            onClick={handleAdminLogout}
            className="select-button"
            style={{ padding: '8px 14px', fontSize: '0.78rem', color: '#a43c3c', borderColor: '#f9dddd', fontWeight: 700 }}
            title="Sign out of Admin Control Desk"
          >
            Sign Out
          </button>
        </div>
      </header>

      <section className="page-intro" aria-labelledby="dashboard-title">
        <div>
          <p className="section-kicker">Auction control desk</p>
          <h2 id="dashboard-title">Team records</h2>
          <p>Review standings and update one team at a time.</p>
        </div>
        <div className="secured-note"><Icon name="shield" size={17} /> Editing access enabled</div>
      </section>

      <section className="dashboard-grid">
        <article className="team-summary card" aria-labelledby="selected-team-title">
          <div className="card-heading">
            <div>
              <p className="section-kicker">Selected team</p>
              <h2 id="selected-team-title">{selectedTeam.name}</h2>
            </div>
            <span className="team-index">#{teams.findIndex((team) => team.id === selectedTeam.id) + 1}</span>
          </div>

          <div className="summary-metrics">
            <div className="metric">
              <div className="metric-icon coin-icon"><Icon name="coins" size={20} /></div>
              <div>
                <span>Current coins</span>
                <strong>₹ {formatCoins(selectedTeam.coins)}</strong>
              </div>
            </div>
            <div className="metric">
              <div className="metric-icon number-icon"><Icon name="grid" size={19} /></div>
              <div>
                <span>Numbers collected</span>
                <strong>{selectedTeam.numbers.length}</strong>
              </div>
            </div>
          </div>

          <div className="numbers-box">
            <span>Numbers obtained</span>
            {selectedTeam.numbers.length > 0 ? (
              <div className="number-chips" aria-label="Numbers obtained">
                {selectedTeam.numbers.map((teamNumber) => <b key={teamNumber}>{teamNumber}</b>)}
              </div>
            ) : (
              <p>No numbers collected yet.</p>
            )}
          </div>
        </article>

        <section className="update-panel card" aria-labelledby="update-title">
          <div className="card-heading form-heading">
            <div>
              <p className="section-kicker">Admin Controls</p>
              <h2 id="update-title">Update team record</h2>
            </div>
          </div>

          <form onSubmit={submitUpdate} noValidate>
            <label>
              <span>Team name</span>
              <select value={selectedTeamId} onChange={(event) => selectTeam(event.target.value)}>
                {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
            </label>

            <label>
              <span>Coins to deduct</span>
              <div className="input-with-prefix">
                <span>₹</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  placeholder="e.g. 5,000"
                  value={deduction}
                  onChange={(event) => setDeduction(event.target.value)}
                />
              </div>
            </label>

            <fieldset>
              <legend>Question answer</legend>
              <div className="answer-toggle">
                <button type="button" className={answer === 'no' ? 'active no-answer' : ''} onClick={() => setAnswer('no')}>No</button>
                <button type="button" className={answer === 'yes' ? 'active yes-answer' : ''} onClick={() => setAnswer('yes')}>Yes</button>
              </div>
            </fieldset>

            {answer === 'yes' && (
              <div className="conditional-fields">
                <label>
                  <span>Bonus coins</span>
                  <div className="input-with-prefix">
                    <span>₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      placeholder="e.g. 2,000"
                      value={bonus}
                      onChange={(event) => setBonus(event.target.value)}
                    />
                  </div>
                </label>
                <label>
                  <span>Number obtained</span>
                  <input
                    type="number"
                    min="1"
                    max="25"
                    step="1"
                    inputMode="numeric"
                    placeholder="1–25"
                    value={number}
                    onChange={(event) => setNumber(event.target.value)}
                  />
                </label>
              </div>
            )}

            {notice && (
              <div className={`notice ${notice.type}`} role="status">
                <Icon name={notice.type === 'success' ? 'check' : 'alert'} size={18} />
                <span>{notice.text}</span>
              </div>
            )}

            <button className="update-button" type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update record'} <Icon name="arrow" size={18} />
            </button>
          </form>
        </section>
      </section>

      <section className="standings card" aria-labelledby="standings-title">
        <div className="standings-heading">
          <div>
            <p className="section-kicker">View only</p>
            <h2 id="standings-title">All team records</h2>
          </div>
          <span>{teams.length} registered teams</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th>Coins</th>
                <th>Numbers collected</th>
                <th aria-label="Select team" />
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id} className={team.id === selectedTeamId ? 'selected-row' : ''}>
                  <td><strong>{team.name}</strong>{team.id === selectedTeamId && <span className="selected-tag">Selected</span>}</td>
                  <td className="coins-cell">₹ {formatCoins(team.coins)}</td>
                  <td>
                    {team.numbers.length ? (
                      <div className="table-numbers">{team.numbers.map((teamNumber) => <span key={teamNumber}>{teamNumber}</span>)}</div>
                    ) : <span className="empty-value">None</span>}
                  </td>
                  <td><button className="select-button" type="button" onClick={() => selectTeam(team.id)}>Select</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}//AdminDashboarrd.jsx should be edited by naren
