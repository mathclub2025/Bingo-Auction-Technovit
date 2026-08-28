import React, { useMemo, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { initialTeams } from '../data/mockTeams';
import Icon from '../components/Icon';
import { loginAdmin, getAdminToken, removeAdminToken, awardRoundBonus, deleteTeamFromDatabase, clearDatabaseFromAdmin, getApiBaseUrl } from '../services/api';
import { evaluateBingoCard } from '../data/bingoGrids';
import mathsClubLogo from '../assets/maths-club-logo.png';

const API_BASE_URL = getApiBaseUrl();

function formatTeam(t) {
  return {
    id: t.id,
    name: t.team_name || t.name || 'Unnamed Team',
    coins: Number(t.coins) || 0,
    numbers: Array.isArray(t.numbers_collected) ? t.numbers_collected : (Array.isArray(t.numbers) ? t.numbers : []),
    bingo_card_set: t.bingo_card_set || t.bingoCardSet || 1,
    requiredNumbers: t.requiredNumbers || []
  };
}

const formatCoins = (value) =>
  new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function AdminDashboard({ onSwitchToUserView }) {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getAdminToken()));
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Socket
  const [socket, setSocket] = useState(null);

  // Dashboard state
  const [teams, setTeams] = useState(initialTeams);
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeams[0]?.id || '');
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Send Question Form State
  const [sendTeamId, setSendTeamId] = useState('');
  const [sendNumberBidded, setSendNumberBidded] = useState('');
  const [initialBid, setInitialBid] = useState('500');
  const [finalBid, setFinalBid] = useState('2000');
  const [sendSuccess, setSendSuccess] = useState('');

  // 2. Manual Update Form State (Handles all point deductions, bonuses, numbers & Level 5 settlements)
  const [deduction, setDeduction] = useState('');
  const [answer, setAnswer] = useState('no');
  const [bonus, setBonus] = useState('');
  const [number, setNumber] = useState('');

  // Compute Delta for Send Question Tool
  const calculatedDelta = useMemo(() => {
    const init = Math.max(0, Number(initialBid) || 0);
    const fin = Math.max(0, Number(finalBid) || 0);
    return Math.max(0, fin - init);
  }, [initialBid, finalBid]);

  // Compute Eligible Levels preview:
  // 0 - 3000 -> [1, 2, 3]
  // 3001 - 7000 -> [2, 3]
  // 7001 - 9500 -> [3]
  // > 9500 -> [4] (PPT Dare Round activated)
  const eligibleLevelsPreview = useMemo(() => {
    const delta = calculatedDelta;
    if (delta <= 3000) return [1, 2, 3];
    if (delta <= 7000) return [2, 3];
    if (delta <= 9500) return [3];
    return [4];
  }, [calculatedDelta]);

  // Fetch real team records from backend API
  const fetchTeamsFromBackend = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/teams`);
      if (res.ok) {
        const data = await res.json();
        const rawTeams = Array.isArray(data) ? data : (data.teams || []);
        if (Array.isArray(rawTeams)) {
          const formatted = rawTeams.map(formatTeam);
          setTeams(formatted);
          setSelectedTeamId((prevId) => {
            if (prevId && formatted.some((t) => String(t.id) === String(prevId))) {
              return prevId;
            }
            return formatted[0]?.id || '';
          });
          setSendTeamId((prev) => prev || formatted[0]?.id || '');
        }
      }
    } catch (err) {
      console.warn('Backend server offline or unreachable:', err.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTeamsFromBackend();

      const newSocket = io(API_BASE_URL, {
        transports: ['websocket', 'polling'],
      });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        newSocket.emit('join_dashboard', { role: 'admin' });
      });

      newSocket.on('teams:updated', (payload) => {
        if (payload && Array.isArray(payload.teams)) {
          const formatted = payload.teams.map(formatTeam);
          setTeams(formatted);
        }
      });

      newSocket.on('teams:all', (payload) => {
        if (payload && Array.isArray(payload.teams)) {
          const formatted = payload.teams.map(formatTeam);
          setTeams(formatted);
        }
      });

      newSocket.on('team:updated', () => {
        fetchTeamsFromBackend();
      });

      // Notification when a team chooses Level 4 PPT Dare/Puzzle
      const handlePendingPpt = (payload) => {
        setSelectedTeamId(payload.teamId);
        setDeduction(String(payload.finalBid || ''));
        setNumber(String(payload.numberBidded || ''));
        setAnswer('yes');
        setBonus('5000');
        setNotice({
          type: 'success',
          text: `${payload.teamName} selected Level 4 (Offline PPT). Manual score adjustment pre-filled below.`
        });
      };

      newSocket.on('auction:admin_level_4_pending', handlePendingPpt);
      newSocket.on('auction:admin_level_5_pending', handlePendingPpt);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated]);

  // Debounced Match-Point Check: when organizer enters target number, wait 2.5s and check if any team is on the verge of winning
  useEffect(() => {
    const num = Number(sendNumberBidded);
    if (!num || isNaN(num) || num < 1 || num > 25 || !socket) return;

    const timer = setTimeout(() => {
      console.log(`📡 [Admin Target Number Check] Checking if #${num} is a match-point winning number...`);
      socket.emit('admin:check_target_number', { number: num });
    }, 2500);

    return () => clearTimeout(timer);
  }, [sendNumberBidded, socket]);

  useEffect(() => {
    const num = Number(number);
    if (!num || isNaN(num) || num < 1 || num > 25 || !socket) return;

    const timer = setTimeout(() => {
      console.log(`📡 [Admin Target Number Check (Manual Form)] Checking if #${num} is a match-point winning number...`);
      socket.emit('admin:check_target_number', { number: num });
    }, 2500);

    return () => clearTimeout(timer);
  }, [number, socket]);

  const selectedTeam = useMemo(
    () => teams.find((team) => String(team.id) === String(selectedTeamId)) ?? teams[0] ?? { id: '', name: '', coins: 0, numbers: [] },
    [selectedTeamId, teams],
  );

  const selectedTeamBingo = useMemo(() => {
    return evaluateBingoCard(selectedTeam.bingo_card_set || 1, selectedTeam.numbers || []);
  }, [selectedTeam]);

  // Handle Admin Login
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
  };

  // 1. Send Question to Team Submit
  const handleSendQuestionSubmit = (e) => {
    e.preventDefault();
    setSendSuccess('');

    const targetId = sendTeamId || selectedTeamId || teams[0]?.id;
    const targetTeam = teams.find((t) => String(t.id) === String(targetId));
    if (!targetTeam) return;

    const init = Math.max(0, Number(initialBid) || 0);
    const fin = Math.max(0, Number(finalBid) || 0);
    const numBidded = sendNumberBidded ? Number(sendNumberBidded) : null;

    if (fin < init) {
      setNotice({ type: 'error', text: 'Final bid must be greater than or equal to initial bid.' });
      return;
    }

    if (socket) {
      socket.emit('admin:send_question', {
        teamId: targetTeam.id,
        initialBid: init,
        finalBid: fin,
        numberBidded: numBidded
      });
    }

    setSendSuccess(`Question choices (Levels ${eligibleLevelsPreview.join(', ')}) transmitted to ${targetTeam.name}.`);
    setTimeout(() => setSendSuccess(''), 8000);
  };

  // 2. Award +250 Coins to All Teams (Round Bonus)
  const handleAwardAllBonus = async () => {
    try {
      setLoading(true);
      const res = await awardRoundBonus(250);
      if (res && res.teams && Array.isArray(res.teams)) {
        setTeams(res.teams.map(formatTeam));
      }
      setNotice({
        type: 'success',
        text: 'Successfully credited +250 coins to all registered teams.'
      });
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Failed to award round bonus' });
    } finally {
      setLoading(false);
    }
  };

  // 3. Remove a Single Team
  const handleDeleteTeam = async (teamId, teamName) => {
    if (!window.confirm(`Are you sure you want to remove team "${teamName}" from the tournament?`)) {
      return;
    }
    try {
      setLoading(true);
      await deleteTeamFromDatabase(teamId);
      setTeams((prev) => prev.filter((t) => String(t.id) !== String(teamId)));
      if (String(selectedTeamId) === String(teamId)) {
        setSelectedTeamId('');
      }
      setNotice({ type: 'success', text: `Team "${teamName}" was removed successfully.` });
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Failed to delete team.' });
    } finally {
      setLoading(false);
    }
  };

  // 4. Clear Entire Database
  const handleClearDatabase = async () => {
    if (!window.confirm('⚠️ DANGER: Are you sure you want to CLEAR the entire tournament database?\n\nAll teams, rosters, and scores will be permanently wiped for a fresh start. Admin accounts will remain active.')) {
      return;
    }
    try {
      setLoading(true);
      await clearDatabaseFromAdmin();
      setTeams([]);
      setSelectedTeamId('');
      setSendTeamId('');
      setNotice({ type: 'success', text: 'Entire tournament database cleared successfully.' });
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Failed to clear database.' });
    } finally {
      setLoading(false);
    }
  };

  // 5. Manual Score Adjustment Submit (Handles Deductions, Level 4 Dares, and Bonuses)
  const submitManualUpdate = async (e) => {
    e.preventDefault();
    setNotice(null);

    const deductionAmount = Number(deduction);
    const bonusAmount = answer === 'yes' ? Number(bonus) : 0;
    const numberObtained = answer === 'yes' && number !== '' ? Number(number) : null;

    if (!Number.isInteger(deductionAmount) || deductionAmount < 0) {
      setNotice({ type: 'error', text: 'Enter a valid coin deduction amount.' });
      return;
    }

    setLoading(true);
    const targetTeamName = selectedTeam.name;
    const targetTeamId = selectedTeam.id;

    try {
      const response = await fetch(`${API_BASE_URL}/api/teams/admin/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: targetTeamId,
          teamName: targetTeamName,
          coinsDeducted: deductionAmount,
          isQuestionAnswered: answer === 'yes',
          bonusCoins: bonusAmount,
          numberObtained: numberObtained
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update');

      setNotice({
        type: 'success',
        text: answer === 'yes'
          ? `Updated ${targetTeamName}: balance adjusted and number ${numberObtained ?? 'none'} recorded.`
          : `Updated ${targetTeamName}: ₹${formatCoins(deductionAmount)} coins deducted.`
      });

      setDeduction('');
      setAnswer('no');
      setBonus('');
      setNumber('');
      await fetchTeamsFromBackend();
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <div className="login-page-container">
        <div className="login-card-wrapper" style={{ maxWidth: '440px' }}>
          {onSwitchToUserView && (
            <button className="login-back-btn" onClick={onSwitchToUserView} type="button">
              <Icon name="arrow-left" size={14} />
              <span>Back to Portal</span>
            </button>
          )}

          <article className="figma-card login-card">
            <div className="login-header">
              <div className="brand-mark-login" style={{ background: 'transparent', boxShadow: 'none' }}>
                <img src={mathsClubLogo} alt="Maths Club Logo" style={{ width: '52px', height: '52px', objectFit: 'contain' }} />
              </div>
              <h2>Admin Control Desk</h2>
              <p>Bingo Auction Arena • Conducted by Mathematics Club VITCC for TechnoVIT.</p>
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
                  onChange={(e) => setAdminUsername(e.target.value)}
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
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
              </div>

              <button className="login-submit-btn" type="submit" disabled={authLoading}>
                <span>{authLoading ? 'Signing in...' : 'Sign In to Control Desk'}</span>
                <Icon name="check" size={16} />
              </button>
            </form>
          </article>
        </div>
      </div>
    );
  }

  // IF AUTHENTICATED
  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" style={{ background: 'transparent', boxShadow: 'none' }}>
            <img src={mathsClubLogo} alt="Maths Club Logo" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
          </div>
          <div>
            <p className="eyebrow">Mathematics Club VITCC • TechnoVIT</p>
            <h1>Bingo Auction Arena · Admin Control Desk</h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Quick 250 Bonus Coins Button */}
          <button
            type="button"
            onClick={handleAwardAllBonus}
            disabled={loading}
            className="select-button"
            style={{
              background: '#047857',
              color: '#ffffff',
              borderColor: '#047857',
              padding: '8px 14px',
              fontWeight: 800,
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Icon name="gift" size={14} />
            <span>+250 Coins (All Teams Round Bonus)</span>
          </button>

          {/* Clear Tournament Database Button */}
          <button
            type="button"
            onClick={handleClearDatabase}
            disabled={loading}
            className="select-button"
            style={{
              background: '#fff1f2',
              color: '#be123c',
              borderColor: '#fecdd3',
              padding: '8px 12px',
              fontWeight: 800,
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            title="Clear all teams, rosters and scores"
          >
            <Icon name="alert" size={14} />
            <span>Clear Database</span>
          </button>

          <button
            type="button"
            onClick={handleAdminLogout}
            className="select-button"
            style={{ padding: '8px 12px', fontSize: '0.78rem', color: '#64748b', borderColor: '#cbd5e1', fontWeight: 700 }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {notice && (
        <div className={`notice ${notice.type}`} style={{ margin: '16px 0' }} role="status">
          <Icon name={notice.type === 'success' ? 'check' : 'alert'} size={18} />
          <span>{notice.text}</span>
        </div>
      )}

      {/* SECTION 1: SELECTED TEAM SUMMARY & MANUAL SCORE ADJUSTMENT */}
      <section className="dashboard-grid" style={{ marginTop: '24px' }}>
        {/* SELECTED TEAM CARD */}
        <article className="team-summary card" aria-labelledby="selected-team-title">
          <div className="card-heading">
            <div>
              <p className="section-kicker">Selected team</p>
              <h2 id="selected-team-title">{selectedTeam.name}</h2>
            </div>
            <span className="team-index">Set #{selectedTeam.bingo_card_set || 1}</span>
          </div>

          <div className="summary-metrics">
            <div className="metric">
              <div className="metric-icon coin-icon"><Icon name="coins" size={20} /></div>
              <div>
                <span>Current coins</span>
                <strong style={{ color: selectedTeam.coins < 0 ? '#a43c3c' : '#14213d' }}>
                  ₹ {formatCoins(selectedTeam.coins)}
                </strong>
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
              <div className="number-chips">
                {selectedTeam.numbers.map((n) => <b key={n}>{n}</b>)}
              </div>
            ) : (
              <p>No numbers collected yet.</p>
            )}
          </div>

          <div className="numbers-box" style={{ background: '#fffdf6', borderColor: '#fcedbe' }}>
            <span style={{ color: '#976100' }}>Required number to win:</span>
            {selectedTeamBingo.requiredNumbers.length > 0 ? (
              <div className="number-chips">
                {selectedTeamBingo.requiredNumbers.map((n) => (
                  <b key={n} style={{ background: '#fcedbe', color: '#976100' }}>#{n}</b>
                ))}
              </div>
            ) : (
              <p style={{ color: '#a0782b' }}>None yet (requires 4/5 marked in any line)</p>
            )}
          </div>

          {selectedTeam.id && (
            <button
              type="button"
              onClick={() => handleDeleteTeam(selectedTeam.id, selectedTeam.name)}
              className="select-button"
              style={{
                marginTop: '14px',
                width: '100%',
                padding: '8px 12px',
                fontSize: '0.8rem',
                color: '#be123c',
                borderColor: '#fecdd3',
                background: '#fff1f2',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Icon name="x" size={14} />
              <span>Remove Team "{selectedTeam.name}" from Event</span>
            </button>
          )}
        </article>

        {/* MANUAL OVERRIDE / SCORE ADJUSTMENT */}
        <section className="update-panel card">
          <div className="card-heading form-heading">
            <div>
              <p className="section-kicker">Direct Override</p>
              <h2>Manual Score Adjustment</h2>
            </div>
          </div>

          <form onSubmit={submitManualUpdate} noValidate>
            <label>
              <span>Team name</span>
              <select value={selectedTeamId} onChange={(e) => setSelectedTeamId(e.target.value)}>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (Balance: ₹{formatCoins(t.coins)})
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Coins to deduct (Allows Negative)</span>
              <div className="input-with-prefix">
                <span>₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 5,000"
                  value={deduction}
                  onChange={(e) => setDeduction(e.target.value)}
                />
              </div>
            </label>

            <fieldset>
              <legend>Award bonus / number?</legend>
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
                      placeholder="e.g. 5,000"
                      value={bonus}
                      onChange={(e) => setBonus(e.target.value)}
                    />
                  </div>
                </label>
                <label>
                  <span>Number obtained (1–25)</span>
                  <input
                    type="number"
                    min="1"
                    max="25"
                    placeholder="1–25"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                  />
                </label>
              </div>
            )}

            <button className="update-button" type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Record Directly'} <Icon name="arrow" size={18} />
            </button>
          </form>
        </section>
      </section>

      {/* SECTION 2: SEND QUESTION TO BIDDING TEAM */}
      <section style={{ marginTop: '24px' }}>
        <article className="update-panel card">
          <div className="card-heading form-heading">
            <div>
              <p className="section-kicker">Auction Dispatch</p>
              <h2>Send Question to Bidding Team</h2>
            </div>
            <div className="metric-icon" style={{ background: '#edf4ff', color: '#275b9e' }}>
              <Icon name="send" size={18} />
            </div>
          </div>

          {sendSuccess && (
            <div className="notice success" style={{ marginBottom: '14px' }}>
              <Icon name="check" size={16} />
              <span>{sendSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSendQuestionSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: '12px' }}>
              <label>
                <span>Select Winning Bidder Team</span>
                <select
                  value={sendTeamId || selectedTeamId}
                  onChange={(e) => setSendTeamId(e.target.value)}
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (Balance: ₹{formatCoins(t.coins)})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Target Number #</span>
                <input
                  type="number"
                  placeholder="e.g. 7"
                  min="1"
                  max="25"
                  value={sendNumberBidded}
                  onChange={(e) => setSendNumberBidded(e.target.value)}
                />
              </label>

              <label>
                <span>Initial Bid</span>
                <div className="input-with-prefix">
                  <span>₹</span>
                  <input
                    type="number"
                    placeholder="500"
                    value={initialBid}
                    onChange={(e) => setInitialBid(e.target.value)}
                  />
                </div>
              </label>

              <label>
                <span>Final Bid</span>
                <div className="input-with-prefix">
                  <span>₹</span>
                  <input
                    type="number"
                    placeholder="2000"
                    value={finalBid}
                    onChange={(e) => setFinalBid(e.target.value)}
                  />
                </div>
              </label>
            </div>

            <div className="numbers-box" style={{ marginTop: '6px', marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '4px' }}>
                <span>Bid Difference (Delta):</span>
                <strong>₹ {calculatedDelta.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                <span>Allowed Challenge Choices:</span>
                <strong style={{ color: '#275b9e' }}>
                  {eligibleLevelsPreview.map(lvl => `Level ${lvl}`).join(', ')}
                </strong>
              </div>
            </div>

            <button className="update-button" type="submit">
              Send Question Choice to Team <Icon name="arrow" size={16} />
            </button>
          </form>
        </article>
      </section>

      {/* SECTION 3: ALL TEAMS STANDINGS TABLE */}
      <section className="standings card" style={{ marginTop: '24px' }}>
        <div className="standings-heading">
          <div>
            <p className="section-kicker">Live Overview</p>
            <h2>All Team Records & Win Tracker</h2>
          </div>
          <span>{teams.length} Registered Teams</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th>Card Set</th>
                <th>Coins</th>
                <th>Numbers</th>
                <th>Required to Win</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => {
                const bEval = evaluateBingoCard(t.bingo_card_set || 1, t.numbers || []);
                const isHalted = Number(t.coins) < 0;

                return (
                  <tr key={t.id} className={t.id === selectedTeamId ? 'selected-row' : ''}>
                    <td>
                      <strong>{t.name}</strong>
                      {t.id === selectedTeamId && <span className="selected-tag">Selected</span>}
                    </td>
                    <td><span className="team-index" style={{ display: 'inline-grid' }}>Set #{t.bingo_card_set || 1}</span></td>
                    <td className="coins-cell" style={{ color: isHalted ? '#a43c3c' : '#273f64' }}>
                      ₹ {formatCoins(t.coins)}
                    </td>
                    <td>
                      {t.numbers.length > 0 ? (
                        <div className="table-numbers">{t.numbers.map((n) => <span key={n}>{n}</span>)}</div>
                      ) : <span className="empty-value">None</span>}
                    </td>
                    <td>
                      {bEval.requiredNumbers.length > 0 ? (
                        <div className="table-numbers">
                          {bEval.requiredNumbers.map((rn) => (
                            <span key={rn} style={{ background: '#fff7e2', color: '#976100' }}>
                              #{rn}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="empty-value">—</span>
                      )}
                    </td>
                    <td>
                      {isHalted ? (
                        <span style={{ color: '#a43c3c', fontWeight: 800, fontSize: '0.75rem' }}>
                          Halted (&lt;0)
                        </span>
                      ) : (
                        <span style={{ color: '#23734b', fontWeight: 800, fontSize: '0.75rem' }}>
                          Active
                        </span>
                      )}
                    </td>
                    <td style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button
                        className="select-button"
                        type="button"
                        onClick={() => {
                          setSelectedTeamId(t.id);
                          setSendTeamId(t.id);
                        }}
                      >
                        Select
                      </button>
                      <button
                        className="select-button"
                        type="button"
                        onClick={() => handleDeleteTeam(t.id, t.name)}
                        style={{ color: '#be123c', borderColor: '#fecdd3', background: '#fff1f2', padding: '6px 8px' }}
                        title={`Remove ${t.name}`}
                      >
                        <Icon name="x" size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
