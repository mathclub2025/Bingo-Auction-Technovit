import React, { useState, useMemo, useEffect } from 'react';
import { io } from 'socket.io-client';
import Icon from '../components/Icon';
import Footer from '../components/Footer';
import { addTeammateToDatabase } from '../services/api';
import { evaluateBingoCard, BINGO_CARD_SETS } from '../data/bingoGrids';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function UserDashboard({
  activeTeam,
  teams = [],
  activeRoundName,
  onNavigate,
  onAddTeammate,
}) {
  const [teammateRegInput, setTeammateRegInput] = useState('');
  const [customTeammateName, setCustomTeammateName] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Question & Auction Flow States
  const [activeSocket, setActiveSocket] = useState(null);
  const [questionOffer, setQuestionOffer] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [level5PptNotice, setLevel5PptNotice] = useState(null);
  const [questionResult, setQuestionResult] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  // Global Bingo Winner Modal
  const [globalWinner, setGlobalWinner] = useState(null);

  // Auto-dismiss feedback message after 20 seconds
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => {
        setFeedbackMessage(null);
      }, 20000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  // Connect Socket for Live Interactive Auction & Questions
  useEffect(() => {
    const socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
    });
    setActiveSocket(socket);

    socket.on('connect', () => {
      socket.emit('join_dashboard', {
        teamId: activeTeam.id,
        teamName: activeTeam.name || activeTeam.team_name,
        role: 'participant'
      });
    });

    socket.on('auction:question_offered', (data) => {
      if (String(data.teamId) === String(activeTeam.id)) {
        setQuestionOffer(data);
        setActiveQuestion(null);
        setLevel5PptNotice(null);
        setQuestionResult(null);
      }
    });

    socket.on('auction:team_question_offered', (data) => {
      if (String(data.teamId) === String(activeTeam.id)) {
        setQuestionOffer(data);
        setActiveQuestion(null);
        setLevel5PptNotice(null);
        setQuestionResult(null);
      }
    });

    socket.on('auction:level_5_ppt', (data) => {
      if (String(data.teamId) === String(activeTeam.id)) {
        setQuestionOffer(null);
        setActiveQuestion(null);
        setLevel5PptNotice(data);
      }
    });

    socket.on('auction:question_started', (data) => {
      if (String(data.teamId) === String(activeTeam.id)) {
        setQuestionOffer(null);
        setLevel5PptNotice(null);
        setActiveQuestion(data);
        setSelectedOption(null);
        setTimerRemaining(data.timerSeconds || 30);
        setIsSubmittingAnswer(false);
      }
    });

    socket.on('auction:question_result', (data) => {
      if (String(data.teamId) === String(activeTeam.id)) {
        setActiveQuestion(null);
        setQuestionResult(data);
      }
    });

    socket.on('bingo:winner', (data) => {
      setGlobalWinner(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [activeTeam.id]);

  // Countdown timer for active question
  useEffect(() => {
    if (!activeQuestion || timerRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAnswerSubmit(null, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeQuestion, timerRemaining]);

  const handleSelectLevel = (chosenLevel) => {
    if (!activeSocket || !questionOffer) return;
    activeSocket.emit('team:select_level', {
      teamId: activeTeam.id,
      level: chosenLevel,
      initialBid: questionOffer.initialBid,
      finalBid: questionOffer.finalBid,
      numberBidded: questionOffer.numberBidded
    });
    setQuestionOffer(null);
  };

  const handleAnswerSubmit = (optionToSubmit, isTimeout = false) => {
    if (isSubmittingAnswer || !activeQuestion || !activeSocket) return;
    setIsSubmittingAnswer(true);

    const answer = optionToSubmit !== undefined && optionToSubmit !== null ? optionToSubmit : selectedOption;

    activeSocket.emit('team:submit_answer', {
      teamId: activeTeam.id,
      questionId: activeQuestion.questionId,
      selectedOption: answer,
      isTimeout: Boolean(isTimeout),
      finalBid: activeQuestion.finalBid,
      numberBidded: activeQuestion.numberBidded,
      level: activeQuestion.level
    });
  };

  const formatCoins = (value) =>
    new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(value || 0);

  const currentCoins = Number(activeTeam.coins) ?? 50000;
  const isHaltedDueToNegative = currentCoins < 0;

  const teamMembers = activeTeam.members && activeTeam.members.length > 0
    ? activeTeam.members
    : [
        {
          name: activeTeam.captain?.name || activeTeam.captain_name || (activeTeam.name || activeTeam.team_name) + ' Captain',
          regNo: activeTeam.captain?.regNo || activeTeam.captain_reg_no || '22BCE1000',
          role: 'Captain',
          addedAt: 'Initial Registration',
        },
      ];

  const numbersList = activeTeam.numbers || activeTeam.numbers_collected || [];
  const bingoCardSet = activeTeam.bingo_card_set || activeTeam.bingoCardSet || 1;

  const bingoStatus = useMemo(() => {
    return evaluateBingoCard(bingoCardSet, numbersList);
  }, [bingoCardSet, numbersList]);

  const handleAddTeammateSubmit = async (e) => {
    e.preventDefault();
    setFeedbackMessage(null);

    const regNo = teammateRegInput.trim().toUpperCase();
    const name = customTeammateName.trim();

    if (!regNo) {
      setFeedbackMessage({
        type: 'error',
        text: 'Please enter teammate Registration Number (e.g. 22BSE0845).',
      });
      return;
    }

    if (!name) {
      setFeedbackMessage({
        type: 'error',
        text: 'Please enter teammate Name (e.g. Ananya Sharma).',
      });
      return;
    }

    const alreadyInTeam = teamMembers.some(
      (m) => (m.reg_no || m.regNo || '').toUpperCase() === regNo
    );

    if (alreadyInTeam) {
      setFeedbackMessage({
        type: 'error',
        text: `Student with Registration Number "${regNo}" is already in your team!`,
      });
      return;
    }

    const newMember = {
      name,
      regNo,
      reg_no: regNo,
      role: 'Teammate',
      addedAt: 'Just Now',
      added_at: new Date().toISOString()
    };

    try {
      if (activeTeam.id) {
        await addTeammateToDatabase(activeTeam.id, { name, regNo, role: 'Teammate' });
      }

      if (onAddTeammate) {
        onAddTeammate(activeTeam.id, newMember);
      }

      setFeedbackMessage({
        type: 'success',
        text: `Added ${name} (${regNo}) to ${activeTeam.name || activeTeam.team_name}!`,
      });

      setTeammateRegInput('');
      setCustomTeammateName('');
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Failed to save teammate to database.',
      });
    }
  };

  const currentTeamName = activeTeam.name || activeTeam.team_name || 'Team';
  const captainMember = (teamMembers && teamMembers.find((m) => (m.role || '').toLowerCase() === 'captain')) || teamMembers[0];
  const displayCaptainName = activeTeam.captain_name || activeTeam.captain?.name || captainMember?.name || '';
  const displayCaptainRegNo = activeTeam.captain_reg_no || activeTeam.captain?.regNo || captainMember?.reg_no || captainMember?.regNo || '';

  return (
    <div className="figma-dashboard">
      {/* CONSTRAINT BANNER: NEGATIVE BALANCE HALT STATE */}
      {isHaltedDueToNegative && (
        <div className="notice error" style={{ marginBottom: '20px', padding: '16px 20px', borderRadius: '10px' }}>
          <Icon name="alert" size={20} />
          <div>
            <strong style={{ display: 'block', fontSize: '0.95rem' }}>Account Temporarily Halted</strong>
            <span>You are not allowed to play until your coins are greater than 0. (Current Balance: ₹{formatCoins(currentCoins)} Coins)</span>
          </div>
        </div>
      )}

      {/* GLOBAL BINGO WINNER OVERLAY */}
      {globalWinner && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 33, 61, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '36px',
              textAlign: 'center',
              background: '#fff'
            }}
          >
            <div className="metric-icon coin-icon" style={{ width: '60px', height: '60px', margin: '0 auto 16px' }}>
              <Icon name="trophy" size={32} />
            </div>
            <p className="section-kicker" style={{ color: '#aa6b00' }}>Tournament Champions</p>
            <h1 style={{ fontSize: '1.6rem', margin: '8px 0 14px', letterSpacing: '-0.03em' }}>
              {globalWinner.teamName} has won the bingo auction arena event
            </h1>
            <p style={{ color: '#61708a', fontSize: '0.92rem', marginBottom: '24px' }}>
              Congratulations to {globalWinner.teamName} for completing the winning Bingo line! First Prize awarded.
            </p>
            <button
              className="update-button"
              onClick={() => setGlobalWinner(null)}
              style={{ margin: '0 auto' }}
            >
              Continue Viewing Dashboard
            </button>
          </div>
        </div>
      )}

      {/* STEP 1 MODAL: LEVEL SELECTION */}
      {questionOffer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 33, 61, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9000,
            padding: '20px'
          }}
        >
          <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '28px', background: '#fff' }}>
            <div className="card-heading form-heading">
              <div>
                <p className="section-kicker">Auction Challenge</p>
                <h2>Select Question Level</h2>
              </div>
              <div className="metric-icon number-icon">
                <Icon name="grid" size={18} />
              </div>
            </div>

            <div className="numbers-box" style={{ marginTop: '0', marginBottom: '16px' }}>
              {questionOffer.numberBidded && (
                <div style={{ marginBottom: '4px' }}>
                  <span>Target Number Card: <strong>#{questionOffer.numberBidded}</strong></span>
                </div>
              )}
              <span>Bid Difference: <strong>₹{questionOffer.delta.toLocaleString()}</strong></span>
            </div>

            <div style={{ display: 'grid', gap: '10px', marginBottom: '16px' }}>
              {[1, 2, 3, 4].map((lvl) => {
                const isEligible = questionOffer.eligibleLevels.includes(lvl);
                const levelLabels = {
                  1: 'Level 1: 30s Timer • +500 Bonus Coins',
                  2: 'Level 2: 45s Timer • +1,000 Bonus Coins',
                  3: 'Level 3: 60s Timer • +2,000 Bonus Coins',
                  4: 'Level 4: Offline PPT Dare/Puzzle Round (+5,000 Bonus Coins)'
                };

                return (
                  <button
                    key={lvl}
                    disabled={!isEligible}
                    onClick={() => handleSelectLevel(lvl)}
                    className="select-button"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: '8px',
                      opacity: isEligible ? 1 : 0.4,
                      cursor: isEligible ? 'pointer' : 'not-allowed',
                      textAlign: 'left',
                      borderColor: isEligible ? (lvl === 4 ? '#b45309' : '#265da8') : '#e2e8f0',
                      background: isEligible ? (lvl === 4 ? '#fffbeb' : '#ffffff') : '#f8fafc'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isEligible && lvl === 4 ? '#92400e' : 'inherit' }}>
                        Level {lvl} {lvl === 4 && '★ (PPT Dare/Puzzle)'}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: isEligible && lvl === 4 ? '#b45309' : '#70809b' }}>{levelLabels[lvl]}</div>
                    </div>
                    {isEligible && <Icon name="arrow" size={14} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2 MODAL: QUESTION WITH ULTRA-PROMINENT COUNTDOWN TIMER (LEVELS 1–3) */}
      {activeQuestion && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div className="card" style={{ maxWidth: '620px', width: '100%', padding: '0', background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)' }}>
            
            {/* PROMINENT HIGH-VISIBILITY TIMER BANNER */}
            <div
              style={{
                background: timerRemaining <= 10
                  ? 'linear-gradient(135deg, #b91c1c, #ef4444)'
                  : 'linear-gradient(135deg, #0f766e, #0d9488)',
                color: '#ffffff',
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease',
                boxShadow: timerRemaining <= 10 ? '0 0 25px rgba(239, 68, 68, 0.6)' : 'none'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9, fontWeight: 700 }}>
                  Level {activeQuestion.level} Challenge • +{formatCoins(activeQuestion.bonusCoins)} Coins
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 600, opacity: 0.95 }}>
                  {timerRemaining <= 10 ? '⚠️ TIME RUNNING OUT!' : 'Solve within allotted time:'}
                </div>
              </div>

              {/* GIANT COUNTDOWN CLOCK */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '8px 18px',
                  borderRadius: '12px',
                  border: '1.5px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <Icon name="clock" size={24} />
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '1.75rem',
                    fontWeight: 900,
                    letterSpacing: '0.05em',
                    lineHeight: 1
                  }}
                >
                  00:{timerRemaining.toString().padStart(2, '0')}s
                </span>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div style={{ height: '6px', background: '#e2e8f0', width: '100%' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.max(0, Math.min(100, (timerRemaining / (activeQuestion.timerSeconds || 30)) * 100))}%`,
                  background: timerRemaining <= 10 ? '#dc2626' : '#10b981',
                  transition: 'width 1s linear, background-color 0.3s ease'
                }}
              />
            </div>

            <div style={{ padding: '24px 28px' }}>
              <div className="numbers-box" style={{ padding: '18px 20px', marginBottom: '20px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px' }}>
                <p style={{ margin: 0, fontSize: '1.08rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.5 }}>
                  {activeQuestion.question}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '22px' }}>
                {activeQuestion.options.map((opt, idx) => {
                  const isSelected = selectedOption === opt;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isSubmittingAnswer}
                      onClick={() => setSelectedOption(opt)}
                      className="select-button"
                      style={{
                        padding: '14px 16px',
                        textAlign: 'center',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        borderRadius: '10px',
                        background: isSelected ? '#eff6ff' : '#ffffff',
                        borderColor: isSelected ? '#2563eb' : '#cbd5e1',
                        color: isSelected ? '#1d4ed8' : '#1e293b',
                        boxShadow: isSelected ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <button
                className="update-button"
                disabled={!selectedOption || isSubmittingAnswer}
                onClick={() => handleAnswerSubmit(selectedOption)}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  borderRadius: '10px'
                }}
              >
                <span>{isSubmittingAnswer ? 'Verifying...' : 'Confirm & Submit Answer'}</span>
                <Icon name="check" size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 MODAL: LEVEL 4 PPT NOTICE */}
      {level5PptNotice && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 33, 61, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9000,
            padding: '20px'
          }}
        >
          <div className="card" style={{ maxWidth: '460px', width: '100%', padding: '28px', textAlign: 'center', background: '#fff' }}>
            <div className="metric-icon coin-icon" style={{ margin: '0 auto 14px' }}>
              <Icon name="shield" size={20} />
            </div>
            <p className="section-kicker">Level 4 Challenge</p>
            <h2 style={{ fontSize: '1.25rem', margin: '6px 0 14px' }}>Please refer the ppt question displayed</h2>
            <p style={{ color: '#61708a', fontSize: '0.86rem', marginBottom: '20px' }}>
              Your choice has been transmitted to the host desk. The host will evaluate your dare/puzzle on stage.
            </p>
            <button
              className="update-button"
              onClick={() => setLevel5PptNotice(null)}
              style={{ margin: '0 auto' }}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* STEP 4 MODAL: QUESTION RESULT */}
      {questionResult && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 33, 61, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9000,
            padding: '20px'
          }}
        >
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '26px', textAlign: 'center', background: '#fff' }}>
            <div
              className="metric-icon"
              style={{
                margin: '0 auto 12px',
                background: questionResult.isCorrect ? '#effbf4' : '#fff5f5',
                color: questionResult.isCorrect ? '#23734b' : '#a44949'
              }}
            >
              <Icon name={questionResult.isCorrect ? 'check' : 'alert'} size={20} />
            </div>

            <h2 style={{ fontSize: '1.22rem', margin: '4px 0 8px' }}>
              {questionResult.isCorrect ? 'Correct Solution' : (questionResult.isTimeout ? 'Time Expired' : 'Incorrect Answer')}
            </h2>

            <div className="numbers-box" style={{ textAlign: 'left', margin: '14px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.84rem' }}>
                <span style={{ color: '#70809b' }}>Coins Deducted:</span>
                <strong style={{ color: '#a44949' }}>-₹{questionResult.coinsDeducted?.toLocaleString()}</strong>
              </div>
              {questionResult.isCorrect && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.84rem' }}>
                    <span style={{ color: '#70809b' }}>Bonus Added:</span>
                    <strong style={{ color: '#23734b' }}>+₹{questionResult.bonusAdded?.toLocaleString()}</strong>
                  </div>
                  {questionResult.numberWon && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.84rem' }}>
                      <span style={{ color: '#70809b' }}>Number Won:</span>
                      <strong style={{ color: '#265da8' }}>#{questionResult.numberWon}</strong>
                    </div>
                  )}
                </>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '6px', marginTop: '6px', fontSize: '0.84rem' }}>
                <span>New Coin Balance:</span>
                <strong>₹{questionResult.newCoins?.toLocaleString()}</strong>
              </div>
            </div>

            <button
              className="update-button"
              onClick={() => setQuestionResult(null)}
              style={{ width: '100%' }}
            >
              Continue Playing
            </button>
          </div>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="dashboard-grid">
        {/* Left Column: Team Identity + Teammates Management */}
        <div>
          <article className="team-summary card">
            <div className="card-heading">
              <div>
                <p className="section-kicker">My Team</p>
                <h2>{currentTeamName}</h2>
              </div>
              <span className="team-index">Set #{bingoCardSet}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', padding: '8px 12px', background: '#f8faff', borderRadius: '8px', border: '1px solid #e9eef7' }}>
              <Icon name="shield" size={14} />
              <span style={{ fontSize: '0.78rem', color: '#71809a' }}>Captain:</span>
              <strong style={{ fontSize: '0.84rem' }}>{displayCaptainName}</strong>
              <span style={{ fontSize: '0.76rem', color: '#275b9e', fontFamily: 'DM Mono, monospace' }}>({displayCaptainRegNo})</span>
            </div>

            <div className="summary-metrics">
              <div className="metric">
                <div className="metric-icon coin-icon"><Icon name="coins" size={20} /></div>
                <div>
                  <span>Current Coins</span>
                  <strong style={{ color: isHaltedDueToNegative ? '#a44949' : '#14213d' }}>
                    ₹ {formatCoins(currentCoins)}
                  </strong>
                </div>
              </div>

              <div className="metric">
                <div className="metric-icon number-icon"><Icon name="grid" size={19} /></div>
                <div>
                  <span>Numbers Collected</span>
                  <strong>{numbersList.length}</strong>
                </div>
              </div>
            </div>

            <div className="numbers-box">
              <span>Numbers obtained</span>
              {numbersList.length > 0 ? (
                <div className="number-chips">
                  {numbersList.map((n) => <b key={n}>{n}</b>)}
                </div>
              ) : (
                <p>No numbers collected yet.</p>
              )}
            </div>

            <div className="numbers-box" style={{ background: '#fffdf6', borderColor: '#fcedbe' }}>
              <span style={{ color: '#976100', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon name="target" size={14} />
                <span>Required number to win:</span>
              </span>
              {bingoStatus.requiredNumbers.length > 0 ? (
                <div className="number-chips">
                  {bingoStatus.requiredNumbers.map((num) => (
                    <b key={num} style={{ background: '#fcedbe', color: '#976100' }}>#{num}</b>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#a0782b' }}>None yet (requires 4/5 marked in any line)</p>
              )}
            </div>
          </article>

          {/* Add Team Member Card */}
          <article className="update-panel card" style={{ marginTop: '22px' }}>
            <div className="card-heading form-heading">
              <div>
                <p className="section-kicker">Roster</p>
                <h2>Add Team Members</h2>
              </div>
              <div className="metric-icon number-icon">
                <Icon name="user-plus" size={18} />
              </div>
            </div>

            {feedbackMessage && (
              <div className={`notice ${feedbackMessage.type}`} style={{ marginBottom: '14px' }}>
                <Icon name={feedbackMessage.type === 'success' ? 'check' : 'alert'} size={16} />
                <span>{feedbackMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleAddTeammateSubmit}>
              <label>
                <span>Registration Number *</span>
                <input
                  type="text"
                  placeholder="e.g. 22BSE0845"
                  value={teammateRegInput}
                  onChange={(e) => setTeammateRegInput(e.target.value)}
                />
              </label>

              <label>
                <span>Teammate Name *</span>
                <input
                  type="text"
                  placeholder="e.g. Ananya Sharma"
                  value={customTeammateName}
                  onChange={(e) => setCustomTeammateName(e.target.value)}
                />
              </label>

              <button className="update-button" type="submit">
                <span>Add Teammate to Roster</span> <Icon name="check" size={16} />
              </button>
            </form>
          </article>
        </div>

        {/* Right Column: Allotted Bingo Card Matrix & Registered Roster */}
        <div>
          {/* ALLOTTED BINGO CARD 5x5 MATRIX */}
          <article className="team-summary card" style={{ marginBottom: '22px' }}>
            <div className="card-heading form-heading">
              <div>
                <p className="section-kicker">Confidential Card</p>
                <h2>Allotted Bingo Card (Set #{bingoCardSet})</h2>
              </div>
              <span className="team-index" style={{ display: 'inline-grid' }}>5×5 Matrix</span>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '6px', marginBottom: '14px' }}>
              Complete any 1 Row, Column, or Diagonal to win the tournament. Won numbers are highlighted in green.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '6px',
                background: '#f8fafc',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0'
              }}
            >
              {(BINGO_CARD_SETS[bingoCardSet] || BINGO_CARD_SETS[1]).map((row, rIdx) =>
                row.map((num, cIdx) => {
                  const isMarked = numbersList.includes(num);
                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      style={{
                        aspectRatio: '1',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isMarked ? '#ecfdf5' : '#ffffff',
                        border: isMarked ? '2px solid #10b981' : '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontFamily: "'DM Mono', monospace",
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        color: isMarked ? '#047857' : '#1e3a8a',
                        boxShadow: isMarked ? '0 2px 5px rgba(16, 185, 129, 0.2)' : '0 1px 2px rgba(0,0,0,0.02)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>{num}</span>
                    </div>
                  );
                })
              )}
            </div>
          </article>

          <article className="team-summary card">
            <div className="card-heading form-heading">
              <div>
                <p className="section-kicker">Team Details</p>
                <h2>Registered Teammates ({teamMembers.length})</h2>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
              {teamMembers.map((member, idx) => {
                const mName = member.name || member.captain_name || `Teammate #${idx + 1}`;
                const mReg = member.regNo || member.reg_no || member.captain_reg_no || 'N/A';
                const mRole = member.role || (idx === 0 ? 'Captain' : 'Teammate');

                return (
                  <div
                    key={member.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: '#f8faff',
                      border: '1px solid #e9eef7',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="metric-icon number-icon" style={{ width: '32px', height: '32px', fontSize: '0.8rem', fontWeight: 800 }}>
                        {mName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{mName}</div>
                        <span style={{ fontSize: '0.75rem', color: '#70809b', fontFamily: 'DM Mono, monospace' }}>{mReg}</span>
                      </div>
                    </div>
                    <span className="selected-tag">{mRole}</span>
                  </div>
                );
              })}
            </div>
          </article>
        </div>
      </div>

      {/* Opponent Leaderboard Table */}
      <section className="standings card" style={{ marginTop: '24px' }}>
        <div className="standings-heading">
          <div>
            <p className="section-kicker">Live Overview</p>
            <h2>Tournament Leaderboard & Competing Teams</h2>
          </div>
          <span>{teams.length} Registered Teams</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th>Coins</th>
                <th>Numbers</th>
                <th>Required to Win</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => {
                const isCurrent = String(t.id) === String(activeTeam.id) || (t.name || t.team_name) === currentTeamName;
                const tNumbers = t.numbers || t.numbers_collected || [];
                const tCoins = Number(t.coins) || 0;
                const tSet = t.bingo_card_set || t.bingoCardSet || 1;
                const tBingo = evaluateBingoCard(tSet, tNumbers);

                return (
                  <tr key={t.id} className={isCurrent ? 'selected-row' : ''}>
                    <td>
                      <strong>{t.name}</strong>
                      {isCurrent && <span className="selected-tag">Your Team</span>}
                    </td>
                    <td className="coins-cell" style={{ color: tCoins < 0 ? '#a43c3c' : '#273f64' }}>
                      ₹ {formatCoins(tCoins)}
                    </td>
                    <td>
                      {tNumbers.length > 0 ? (
                        <div className="table-numbers">{tNumbers.map((n) => <span key={n}>{n}</span>)}</div>
                      ) : <span className="empty-value">None</span>}
                    </td>
                    <td>
                      {tBingo.requiredNumbers.length > 0 ? (
                        <div className="table-numbers">
                          {tBingo.requiredNumbers.map((rn) => (
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
                      {tCoins < 0 ? (
                        <span style={{ color: '#a43c3c', fontWeight: 800, fontSize: '0.75rem' }}>Halted</span>
                      ) : (
                        <span style={{ color: '#23734b', fontWeight: 800, fontSize: '0.75rem' }}>Active</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <Footer />
    </div>
  );
}
