import React, { useState, useEffect } from 'react';

export default function TopBar({ user, isAnalyst, isManager, onSignOut }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    function tick() {
      setTime(new Date().toUTCString().split(' ')[4] + ' UTC');
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const roleLabel = isAnalyst ? 'Analyst' : isManager ? 'Manager' : 'Viewer';
  const roleColor = isAnalyst ? 'var(--blue)' : 'var(--muted)';
  const roleBg    = isAnalyst ? 'var(--blue-bg)' : 'var(--bg)';
  const roleBorder = isAnalyst ? 'var(--blue-border)' : 'var(--border)';

  return (
    <header style={{
      background: 'var(--surface)',
      borderBottom: '0.5px solid var(--border)',
      padding: '0 28px',
      height: 52,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{
          fontFamily: 'var(--fm)',
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.14em',
          color: 'var(--muted)',
          textTransform: 'uppercase',
        }}>
          LiquidityIQ
        </span>
        <span style={{ color: 'var(--border)', fontSize: 18 }}>|</span>
        <span style={{ fontSize: 14, fontWeight: 500 }}>
          Market Risk Dashboard
        </span>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

        {/* Live clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--fm)', fontSize: 12, color: 'var(--muted)' }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--green)',
            animation: 'pulse 2s ease-in-out infinite',
            display: 'inline-block',
          }} />
          <span>Live</span>
          <span style={{ minWidth: 82, textAlign: 'right' }}>{time}</span>
        </div>

        {/* Divider */}
        {user && <div style={{ width: '0.5px', height: 20, background: 'var(--border)' }} />}

        {/* User identity */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Role badge */}
            <span style={{
              fontSize: 10,
              fontFamily: 'var(--fm)',
              fontWeight: 500,
              letterSpacing: '0.05em',
              padding: '3px 8px',
              borderRadius: 'var(--r-sm)',
              background: roleBg,
              color: roleColor,
              border: `0.5px solid ${roleBorder}`,
            }}>
              {roleLabel.toUpperCase()}
            </span>

            {/* Email */}
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              {user.email}
            </span>

            {/* Sign out */}
            <button
              onClick={onSignOut}
              style={{
                fontSize: 12,
                color: 'var(--muted)',
                background: 'none',
                border: '0.5px solid var(--border)',
                borderRadius: 'var(--r-sm)',
                padding: '4px 10px',
                cursor: 'pointer',
                transition: 'color 0.12s, border-color 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(1.35); }
        }
      `}</style>
    </header>
  );
}
