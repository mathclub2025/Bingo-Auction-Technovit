import React, { useState } from 'react';
import Icon from '../components/Icon';
import { mockAuctionRounds } from '../data/mockAuctionState';

export default function Auction({
  activeTeam,
  onUpdateTeamCoins,
  onAddTeamNumber,
  activeAuctionState,
  setActiveAuctionState
}) {
  const formatCoins = (value) =>
    new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(value);

  const roundData = mockAuctionRounds;
  const activeItem = roundData.activeItem;

  // Form states
  const [answer, setAnswer] = useState('');
  const [bidAmount, setBidAmount] = useState(6500);

  // Increments / Decrements for bid
  const adjustBid = (amount) => {
    setBidAmount(prev => Math.max(activeItem.basePrice, prev + amount));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Validation: Insufficient Coins state check
    if (bidAmount > activeTeam.coins) {
      setActiveAuctionState('insufficient_coins');
      return;
    }

    // 2. Validation: Answer evaluation
    if (answer.trim() !== activeItem.qualificationChallenge.correctAnswer) {
      // Deduct 1,000 Coins penalty for incorrect answer
      onUpdateTeamCoins(activeTeam.id, Math.max(0, activeTeam.coins - 1000));
      setActiveAuctionState('incorrect');
      return;
    }

    // 3. Validation: Success Correct Answer state
    onUpdateTeamCoins(activeTeam.id, activeTeam.coins - bidAmount);
    onAddTeamNumber(activeTeam.id, 12); // Award number 12
    setActiveAuctionState('correct');
  };

  const resetAuctionState = () => {
    setAnswer('');
    setBidAmount(6500);
    setActiveAuctionState('active');
  };

  return (
    <div className="figma-auction-container">
      {/* Live Auction Experience */}
      <div className="auction-live-workspace">
        
        {/* State: WAITING */}
        {activeAuctionState === 'waiting' && (
          <div className="figma-card figma-state-card waiting-state-border">
            <div className="figma-state-header">
              <Icon name="clock" size={24} className="spin-slow blue-icon" />
              <h3>Waiting for Round 3...</h3>
            </div>
            <p className="figma-state-desc">The auction master is preparing the next sequence. Review your team progress sheets in the meantime.</p>
          </div>
        )}

        {/* State: COMPLETED */}
        {activeAuctionState === 'completed' && (
          <div className="figma-card figma-state-card completed-state-border">
            <div className="figma-state-header">
              <Icon name="trophy" size={24} className="gold-icon" />
              <h3>Auction Completed!</h3>
            </div>
            <div className="completed-rank-info">
              <span>Final Rank:</span>
              <strong>{activeTeam.rank}th Place</strong>
            </div>
            <p className="figma-state-desc">Congratulations on completing the Fibonacci sequence challenge. Review your final standings.</p>
            <div className="completed-action-row">
              <button className="completed-btn primary" onClick={() => alert("Leaderboard: 1. Integral Innovators, 2. Theorem Titans...")} type="button">View Leaderboard</button>
              <button className="completed-btn secondary" onClick={resetAuctionState} type="button">Return Home</button>
            </div>
          </div>
        )}

        {/* State: CORRECT */}
        {activeAuctionState === 'correct' && (
          <div className="figma-card figma-state-card correct-state-border">
            <div className="figma-state-header">
              <Icon name="check" size={24} className="green-icon" />
              <h3>Correct Answer!</h3>
            </div>
            <p className="figma-state-desc">Number <strong>12</strong> successfully added to your collection.</p>
            <button className="figma-state-btn green" onClick={resetAuctionState} type="button">Continue</button>
          </div>
        )}

        {/* State: INCORRECT */}
        {activeAuctionState === 'incorrect' && (
          <div className="figma-card figma-state-card incorrect-state-border">
            <div className="figma-state-header">
              <Icon name="x" size={24} className="red-icon" />
              <h3>Incorrect Answer</h3>
            </div>
            <p className="figma-state-desc">Try again in the next round. Better luck next time. (1,000 Coins penalty deducted from balance)</p>
            <button className="figma-state-btn red" onClick={resetAuctionState} type="button">Dismiss</button>
          </div>
        )}

        {/* State: INSUFFICIENT COINS */}
        {activeAuctionState === 'insufficient_coins' && (
          <div className="figma-card figma-state-card insufficient-state-border">
            <div className="figma-state-header">
              <Icon name="alert" size={24} className="orange-icon" />
              <h3>Insufficient Coins</h3>
            </div>
            <p className="figma-state-desc">Your bid of <strong>{formatCoins(bidAmount)} Coins</strong> exceeds your remaining balance of <strong>{formatCoins(activeTeam.coins)} Coins</strong>.</p>
            <button className="figma-state-btn orange" onClick={() => setActiveAuctionState('active')} type="button">Adjust Bid</button>
          </div>
        )}

        {/* State: ACTIVE QUESTION / BIDDING */}
        {activeAuctionState === 'active' && (
          <div className="figma-auction-grid">
            {/* Left Card: Active Item Graphic */}
            <article className="figma-card active-round-card">
              <div className="round-card-header">
                <div>
                  <h3>{roundData.roundName}</h3>
                  <span className="item-id-tag">Item ID: {activeItem.id}</span>
                </div>
                <div className="round-timer-box">
                  <span className="timer-label">TIME REMAINING</span>
                  <span className="timer-countdown">{activeItem.timeRemaining}</span>
                </div>
              </div>

              <div className="math-graphic-display">
                <div className="math-large-symbol">{activeItem.symbol}</div>
                <div className="math-symbol-sub font-mono">({activeItem.symbolName})</div>
                <p className="math-symbol-desc">{activeItem.description}</p>
              </div>
            </article>

            {/* Right Card: Input Fields Form */}
            <section className="figma-card qualification-bid-card">
              <div className="qualification-header-block">
                <Icon name="shield" size={16} />
                <span>Qualification Challenge</span>
              </div>
              <p className="qualification-instructions">{activeItem.qualificationChallenge.question}</p>

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-input-group">
                  <label htmlFor="challenge-answer">
                    <span>Answer (Rounded Int)</span>
                  </label>
                  <input
                    id="challenge-answer"
                    type="text"
                    placeholder="e.g. 2"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                  />
                </div>

                <div className="form-input-group">
                  <label htmlFor="bid-amount-input">
                    <span>Bid Amount (1,000 Coin steps)</span>
                  </label>
                  <div className="bid-counter-control">
                    <button
                      className="counter-btn"
                      onClick={() => adjustBid(-1000)}
                      type="button"
                    >
                      -
                    </button>
                    <input
                      id="bid-amount-input"
                      type="text"
                      readOnly
                      value={`${formatCoins(bidAmount)} Coins`}
                      className="font-mono text-center"
                    />
                    <button
                      className="counter-btn"
                      onClick={() => adjustBid(1000)}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button className="sidebar-cta-btn place-bid-form-btn" type="submit">
                  <Icon name="coins" size={15} />
                  <span>Place Bid</span>
                </button>
              </form>

              {/* Success state info */}
              <div className="live-highest-bid-info">
                <span className="live-red-dot" />
                <span className="live-bid-label">LIVE AUCTION</span>
                <span className="live-bid-value">Highest Bid: <strong>5,500 Coins</strong> (Theorem Titans)</span>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* DEVELOPER SANDBOX - Separated visual preview drawer */}
      <section className="card developer-sandbox-panel">
        <details>
          <summary className="sandbox-header">
            <Icon name="shield" size={16} />
            <span>Developer States Gallery & Simulation Board (Figma Previews)</span>
            <span className="toggle-hint">Click to expand/collapse templates</span>
          </summary>
          
          <div className="sandbox-body">
            <p className="sandbox-description">
              Verify visual alignment with Figma designs. Cycle the active layout state, or inspect the preview cards below.
            </p>

            {/* Simulated Active Toggles */}
            <div className="sandbox-toggles">
              <strong>Simulate Active UI View State:</strong>
              <div className="btn-row">
                <button className={`sandbox-btn ${activeAuctionState === 'active' ? 'active' : ''}`} onClick={() => setActiveAuctionState('active')} type="button">Active Room</button>
                <button className={`sandbox-btn ${activeAuctionState === 'correct' ? 'active' : ''}`} onClick={() => setActiveAuctionState('correct')} type="button">Correct Answer</button>
                <button className={`sandbox-btn ${activeAuctionState === 'incorrect' ? 'active' : ''}`} onClick={() => setActiveAuctionState('incorrect')} type="button">Incorrect Answer</button>
                <button className={`sandbox-btn ${activeAuctionState === 'insufficient_coins' ? 'active' : ''}`} onClick={() => setActiveAuctionState('insufficient_coins')} type="button">Insufficient Coins</button>
                <button className={`sandbox-btn ${activeAuctionState === 'waiting' ? 'active' : ''}`} onClick={() => setActiveAuctionState('waiting')} type="button">Waiting State</button>
                <button className={`sandbox-btn ${activeAuctionState === 'completed' ? 'active' : ''}`} onClick={() => setActiveAuctionState('completed')} type="button">Completed Event</button>
              </div>
            </div>

            {/* Gallery Cards side-by-side as shown in Figma */}
            <h4 style={{ color: '#cbd5e0', marginTop: '24px', fontSize: '0.82rem' }}>System States Gallery:</h4>
            <div className="figma-states-gallery-layout">
              {/* Correct Answer */}
              <div className="figma-card figma-state-card correct-state-border preview-only">
                <div className="figma-state-header">
                  <Icon name="check" size={20} className="green-icon" />
                  <h3>Correct Answer!</h3>
                </div>
                <p className="figma-state-desc">Number <strong>12</strong> added to your collection.</p>
                <button className="figma-state-btn green" type="button">Continue</button>
              </div>

              {/* Incorrect Answer */}
              <div className="figma-card figma-state-card incorrect-state-border preview-only">
                <div className="figma-state-header">
                  <Icon name="x" size={20} className="red-icon" />
                  <h3>Incorrect Answer</h3>
                </div>
                <p className="figma-state-desc">Try again in the next round. Better luck next time.</p>
                <button className="figma-state-btn red" type="button">Dismiss</button>
              </div>

              {/* Insufficient Coins */}
              <div className="figma-card figma-state-card insufficient-state-border preview-only">
                <div className="figma-state-header">
                  <Icon name="alert" size={20} className="orange-icon" />
                  <h3>Insufficient Coins</h3>
                </div>
                <p className="figma-state-desc">Your bid exceeds your balance.</p>
                <button className="figma-state-btn orange" type="button">Adjust Bid</button>
              </div>

              {/* Waiting for round */}
              <div className="figma-card figma-state-card waiting-state-border preview-only">
                <div className="figma-state-header">
                  <Icon name="clock" size={20} className="blue-icon" />
                  <h3>Waiting for Round 3...</h3>
                </div>
                <p className="figma-state-desc">The auction master is preparing the next sequence.</p>
              </div>

              {/* Completed */}
              <div className="figma-card figma-state-card completed-state-border preview-only">
                <div className="figma-state-header">
                  <Icon name="trophy" size={20} className="gold-icon" />
                  <h3>Auction Completed!</h3>
                </div>
                <div className="completed-rank-info" style={{ margin: '8px 0' }}>
                  <span>Final Rank:</span>
                  <strong style={{ fontSize: '1.1rem' }}>4th Place</strong>
                </div>
                <p className="figma-state-desc" style={{ fontSize: '0.7rem' }}>Congratulations on completing the Fibonacci sequence challenge.</p>
              </div>
            </div>
          </div>
        </details>
      </section>
    </div>
  );
}
