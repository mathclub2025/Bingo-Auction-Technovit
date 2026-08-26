import React, { useMemo, useState, useEffect } from 'react';
import { initialTeams } from './data/mockTeams';

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

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  const paths = {
    shield: <path d="M12 3 4.5 6v5c0 5 3.2 8.5 7.5 10 4.3-1.5 7.5-5 7.5-10V6L12 3Z" />,
    coins: <><circle cx="12" cy="12" r="8.5" /><path d="M14.8 9.4c-.6-.6-1.5-.9-2.7-.9-1.7 0-2.9.8-2.9 2.1 0 3 5.7 1.3 5.7 4.1 0 1.3-1.2 2.2-3 2.2-1.2 0-2.4-.4-3.2-1.1M12 7v10" /></>,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
    check: <path d="m5 12 4.2 4.2L19 6.7" />,
    alert: <><path d="M12 3 2.8 19a1.3 1.3 0 0 0 1.1 2h16.2a1.3 1.3 0 0 0 1.1-2L12 3Z" /><path d="M12 9v4M12 17h.01" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function App() {
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
          if (!selectedTeamId || !formatted.some(t => t.id === selectedTeamId)) {
            setSelectedTeamId(formatted[0].id);
          }
        }
      }
    } catch (err) {
      console.warn('Backend server offline or unreachable, using local fallback:', err.message);
    }
  };

  useEffect(() => {
    fetchTeamsFromBackend();
    const interval = setInterval(fetchTeamsFromBackend, 3000);
    return () => clearInterval(interval);
  }, []);

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId) ?? teams[0] ?? { id: '', name: '', coins: 0, numbers: [] },
    [selectedTeamId, teams],
  );

  const resetForm = () => {
    setDeduction('');
    setAnswer('no');
    setBonus('');
    setNumber('');
  };

  const selectTeam = (teamId) => {
    setSelectedTeamId(teamId);
    setNotice(null);
    resetForm();
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
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/admin/update-team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: selectedTeam.id,
          teamName: selectedTeam.name,
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

      await fetchTeamsFromBackend();
      setNotice({
        type: 'success',
        text: answer === 'yes'
          ? `Updated ${selectedTeam.name}: number ${numberObtained ?? 'none'} recorded and balance adjusted.`
          : `Updated ${selectedTeam.name}: ${formatCoins(deductionAmount)} coins deducted.`,
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
        currentTeams.map((team) => (team.id === selectedTeamId ? updatedTeam : team)),
      );
      setNotice({
        type: 'success',
        text: `Updated ${selectedTeam.name}: ${formatCoins(deductionAmount)} coins deducted. (Offline mode)`
      });
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Icon name="grid" size={19} /></div>
          <div>
            <p className="eyebrow">VIT Chennai · Mathematics Club</p>
            <h1>Math Club Auction</h1>
          </div>
        </div>
        <div className="admin-status" aria-label="Admin status">
          <span className="status-dot" />
          <span>Source computer · Admin</span>
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
              <p className="section-kicker">Source computer controls</p>
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

            <button className="update-button" type="submit">
              Update record <Icon name="arrow" size={18} />
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
}

export default App;
