import React from 'react';
import { getSignalLevel, getDelta, getBarPercent } from '../data/signals';
import { StatusBadge, LEVEL_COLORS } from './ui';

export default function SignalCard({ signal, selected, onClick }) {
  const level = getSignalLevel(signal);
  const delta = getDelta(signal);
  const barPct = getBarPercent(signal);
  const color = LEVEL_COLORS[level].text;
  const deltaPositive = delta.startsWith('+');

  // A rising value is bad for "higherIsBetter=false" signals and vice-versa
  const deltaIsBad = signal.higherIsBetter ? deltaPositive === false : deltaPositive;

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--r-md)',
        border: selected
          ? `1.5px solid ${color}`
          : '0.5px solid var(--border)',
        boxShadow: selected ? `0 0 0 3px ${LEVEL_COLORS[level].bg}` : 'var(--shadow-sm)',
        padding: '16px 18px 14px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.1s',
        transform: selected ? 'translateY(-1px)' : 'none',
      }}
    >
      {/* Left colour stripe */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        background: color,
        borderRadius: 'var(--r-md) 0 0 var(--r-md)',
      }} />

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingLeft: 10,
        marginBottom: 10,
      }}>
        <span style={{
          fontSize: 11,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--muted)',
        }}>
          {signal.name}
        </span>
        <StatusBadge level={level} />
      </div>

      {/* Value */}
      <div style={{
        paddingLeft: 10,
        fontFamily: 'var(--fm)',
        fontSize: 30,
        fontWeight: 500,
        color,
        lineHeight: 1,
        marginBottom: 6,
      }}>
        {signal.value}{signal.unit}
      </div>

      {/* Meta row */}
      <div style={{
        paddingLeft: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 11,
        color: 'var(--muted)',
        marginBottom: 10,
      }}>
        <span>{signal.description}</span>
        <span style={{
          fontFamily: 'var(--fm)',
          color: deltaIsBad ? 'var(--red)' : 'var(--green)',
          fontWeight: 500,
        }}>
          {delta}
        </span>
      </div>

      {/* Fill bar */}
      <div style={{
        margin: '0 10px 8px',
        height: 3,
        background: 'var(--bg)',
        borderRadius: 2,
      }}>
        <div style={{
          height: 3,
          width: `${barPct}%`,
          background: color,
          borderRadius: 2,
          transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Threshold */}
      <div style={{
        paddingLeft: 10,
        fontSize: 11,
        color: 'var(--hint)',
        fontFamily: 'var(--fm)',
      }}>
        Threshold: {signal.threshold}{signal.unit}
      </div>
    </div>
  );
}
