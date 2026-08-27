import React, { useEffect, useState } from 'react';
import Icon from './Icon';

export default function BingoWarningModal({ warning, onClose }) {
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    if (!warning) return;
    setCountdown(15);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [warning, onClose]);

  if (!warning) return null;

  const teamName = warning.teamName || 'A Team';
  const requiredNumbers = Array.isArray(warning.requiredNumbers) ? warning.requiredNumbers : [];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.82)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px',
        animation: 'fadeIn 0.25s ease-out'
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '560px',
          width: '100%',
          padding: '32px',
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 60px -15px rgba(245, 158, 11, 0.4), 0 0 0 2px #f59e0b',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Top Progress bar for auto-dismiss */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '4px',
            background: '#f59e0b',
            width: `${(countdown / 15) * 100}%`,
            transition: 'width 1s linear'
          }}
        />

        {/* Close 'X' Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b'
          }}
          aria-label="Close modal"
        >
          <Icon name="x" size={16} />
        </button>

        {/* Warning Badge & Icon */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '999px',
            background: '#fef3c7',
            color: '#b45309',
            fontSize: '0.82rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '16px'
          }}
        >
          <Icon name="alert" size={16} color="#b45309" />
          <span>Bingo Match-Point Alert</span>
        </div>

        {/* Headline */}
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 12px',
            lineHeight: 1.3
          }}
        >
          <span style={{ color: '#d97706' }}>{teamName}</span> is 1 Number Away from Winning!
        </h2>

        <p style={{ color: '#475569', fontSize: '0.94rem', margin: '0 0 20px', lineHeight: 1.5 }}>
          This team has marked 4 out of 5 numbers in a line and is on the verge of completing a winning Bingo!
        </p>

        {/* Required Number Box (Matching exact UI style) */}
        <div
          style={{
            background: '#fffdf6',
            border: '1.5px dashed #fcd34d',
            borderRadius: '14px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#976100',
              fontWeight: 700,
              fontSize: '0.95rem'
            }}
          >
            <Icon name="target" size={18} color="#976100" />
            <span>Required number to win:</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {requiredNumbers.length > 0 ? (
              requiredNumbers.map((num) => (
                <div
                  key={num}
                  style={{
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    color: '#976100',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    padding: '8px 20px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)',
                    letterSpacing: '0.02em'
                  }}
                >
                  #{num}
                </div>
              ))
            ) : (
              <span style={{ color: '#976100', fontWeight: 600 }}>#Any winning line number</span>
            )}
          </div>
        </div>

        {/* Tactical Note */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px 16px',
            fontSize: '0.85rem',
            color: '#64748b',
            lineHeight: 1.45,
            marginBottom: '24px',
            textAlign: 'left'
          }}
        >
          <strong style={{ color: '#334155' }}>⚡ Tactical Notice:</strong> If{' '}
          <strong style={{ color: '#0f172a' }}>{teamName}</strong> acquires this number in an upcoming auction round,
          they will immediately complete their line and win the event. Plan your bids accordingly!
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="update-button"
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '0.98rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            border: 'none',
            color: '#ffffff',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span>Understood / Watch Out! ({countdown}s)</span>
          <Icon name="arrow" size={16} color="#ffffff" />
        </button>
      </div>
    </div>
  );
}
