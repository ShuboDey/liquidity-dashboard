import React from 'react';
import { getSignalLevel } from '../data/signals';
import SignalCard from './SignalCard';
import { Card, SectionLabel } from './ui';

export default function SignalMonitor({
  signals,
  signalsLoading,
  signalsAsOf,
  selectedSignalId,
  onSelectSignal,
  onGoToDecision,
  onRefresh,
}) {
  const levels   = signals.map(s => getSignalLevel(s));
  const elevated = signals.filter((_, i) => levels[i] === 'elevated');

  const counts = {
    elevated: levels.filter(l => l === 'elevated').length,
    watch:    levels.filter(l => l === 'watch').length,
    normal:   levels.filter(l => l === 'normal').length,
  };
  const total = signals.length;

  function handleCardClick(signalId) {
    onSelectSignal(signalId);
    onGoToDecision();
  }

  return (
    <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Data source bar */}
      <div style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        fontSize:       12,
        color:          'var(--muted)',
      }}>
        <span>
          {signalsLoading
            ? 'Fetching live data from FRED…'
            : signalsAsOf
              ? `Live data — FRED API · as of ${signalsAsOf}`
              : 'Sample data (no FRED API configured)'}
        </span>
        <button
          onClick={onRefresh}
          disabled={signalsLoading}
          style={{
            fontSize:    12,
            color:       signalsLoading ? 'var(--hint)' : 'var(--muted)',
            background:  'none',
            border:      '0.5px solid var(--border)',
            borderRadius: 'var(--r-sm)',
            padding:     '4px 10px',
            cursor:      signalsLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {signalsLoading ? 'Refreshing…' : '↻ Refresh'}
        </button>
      </div>

      {/* Alert banner */}
      {elevated.length > 0 && (
        <div style={{
          background:  'var(--red-bg)',
          border:      '0.5px solid var(--red-border)',
          borderRadius: 'var(--r-md)',
          padding:     '10px 16px',
          display:     'flex',
          alignItems:  'center',
          gap:         10,
          fontSize:    13,
          color:       'var(--red)',
        }}>
          <span style={{
            width:      8,
            height:     8,
            borderRadius: '50%',
            background: 'var(--red)',
            flexShrink: 0,
            animation:  'pulse 1.5s ease-in-out infinite',
          }} />
          <strong>{elevated.length} signal{elevated.length > 1 ? 's' : ''} at elevated level</strong>
          <span style={{ color: 'var(--muted)', marginLeft: 2 }}>
            — {elevated.map(s => s.shortName).join(', ')}. Review and record a decision.
          </span>
        </div>
      )}

      {/* Signal grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {signals.map(signal => (
          <SignalCard
            key={signal.id}
            signal={signal}
            selected={signal.id === selectedSignalId}
            onClick={() => handleCardClick(signal.id)}
          />
        ))}
      </div>

      {/* Overall posture */}
      <Card>
        <SectionLabel>Overall risk posture</SectionLabel>
        <div style={{ display: 'flex', gap: 3, height: 6, borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
          {counts.normal   > 0 && <div style={{ flex: counts.normal,   background: 'var(--green)', opacity: 0.7, borderRadius: 2 }} />}
          {counts.watch    > 0 && <div style={{ flex: counts.watch,    background: 'var(--amber)', opacity: 0.7, borderRadius: 2 }} />}
          {counts.elevated > 0 && <div style={{ flex: counts.elevated, background: 'var(--red)',   opacity: 0.85, borderRadius: 2 }} />}
        </div>
        <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--muted)' }}>
          {[
            { label: 'Normal',   color: 'var(--green)', count: counts.normal },
            { label: 'Watch',    color: 'var(--amber)', count: counts.watch },
            { label: 'Elevated', color: 'var(--red)',   count: counts.elevated },
          ].map(({ label, color, count }) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
              {label}: {count}/{total}
            </span>
          ))}
        </div>
      </Card>

      <p style={{ fontSize: 12, color: 'var(--hint)', textAlign: 'center' }}>
        Click a signal card to open the decision form for that signal.
      </p>
    </div>
  );
}
