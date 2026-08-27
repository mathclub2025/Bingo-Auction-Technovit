import React, { useEffect, useState } from 'react';
import Icon from './Icon';

export default function BingoWarningModal({ warning, onClose }) {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!warning) return;
    setCountdown(10);

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
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      {/* Heartbeat CSS Animation */}
      <style>{`
        @keyframes heartbeatPulse {
          0% {
            transform: scale(1);
            box-shadow: 0 4px 14px rgba(217, 119, 6, 0.25);
          }
          14% {
            transform: scale(1.15);
            box-shadow: 0 0 28px rgba(245, 158, 11, 0.7);
          }
          28% {
            transform: scale(1);
            box-shadow: 0 4px 14px rgba(217, 119, 6, 0.25);
          }
          42% {
            transform: scale(1.15);
            box-shadow: 0 0 28px rgba(245, 158, 11, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 4px 14px rgba(217, 119, 6, 0.25);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 4px 14px rgba(217, 119, 6, 0.25);
          }
        }
        .heartbeat-chip {
          animation: heartbeatPulse 1.25s ease-in-out infinite;
        }
      `}</style>

      <div
        className="card"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '36px 28px 28px',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(217, 119, 6, 0.4), 0 0 0 2px #f59e0b',
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
            background: 'linear-gradient(90deg, #f59e0b, #d97706)',
            width: `${(countdown / 10) * 100}%`,
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

        {/* Main Headline */}
        <h2
          style={{
            fontSize: '1.65rem',
            fontWeight: 900,
            color: '#0f172a',
            margin: '8px 0 6px',
            lineHeight: 1.25,
            letterSpacing: '-0.02em'
          }}
        >
          <span style={{ color: '#d97706' }}>{teamName}</span> is about to win!
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#dc2626',
            margin: '0 0 24px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          Only 1 number left
        </p>

        {/* Heartbeat Flashing Required Number(s) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '14px',
            flexWrap: 'wrap',
            marginBottom: '28px',
            minHeight: '80px'
          }}
        >
          {requiredNumbers.length > 0 ? (
            requiredNumbers.map((num) => (
              <div
                key={num}
                className="heartbeat-chip"
                style={{
                  background: '#fef3c7',
                  border: '2.5px solid #f59e0b',
                  color: '#92400e',
                  fontSize: '2.2rem',
                  fontWeight: 900,
                  padding: '12px 32px',
                  borderRadius: '16px',
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: '0.04em',
                  display: 'inline-block'
                }}
              >
                #{num}
              </div>
            ))
          ) : (
            <div
              className="heartbeat-chip"
              style={{
                background: '#fef3c7',
                border: '2px solid #f59e0b',
                color: '#92400e',
                fontSize: '1.4rem',
                fontWeight: 900,
                padding: '12px 24px',
                borderRadius: '14px'
              }}
            >
              #1 Number Away
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="update-button"
          style={{
            width: '100%',
            padding: '13px',
            fontSize: '0.95rem',
            fontWeight: 800,
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
          <span>Understood ({countdown}s)</span>
          <Icon name="arrow" size={16} color="#ffffff" />
        </button>
      </div>
    </div>
  );
}
