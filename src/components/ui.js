import React, { useEffect } from 'react';

/* ── Level → colour mappings ─────────────────────────────── */
export const LEVEL_COLORS = {
  elevated: {
    text:   'var(--red)',
    bg:     'var(--red-bg)',
    border: 'var(--red-border)',
    label:  'ELEVATED',
  },
  watch: {
    text:   'var(--amber)',
    bg:     'var(--amber-bg)',
    border: 'var(--amber-border)',
    label:  'WATCH',
  },
  normal: {
    text:   'var(--green)',
    bg:     'var(--green-bg)',
    border: 'var(--green-border)',
    label:  'NORMAL',
  },
};

export const ACTION_COLORS = {
  ignore:   { text: 'var(--green)',  bg: 'var(--green-bg)',  border: 'var(--green-border)'  },
  monitor:  { text: 'var(--amber)',  bg: 'var(--amber-bg)',  border: 'var(--amber-border)'  },
  escalate: { text: 'var(--red)',    bg: 'var(--red-bg)',    border: 'var(--red-border)'    },
};

/* ── StatusBadge ─────────────────────────────────────────── */
export function StatusBadge({ level }) {
  const c = LEVEL_COLORS[level];
  return (
    <span style={{
      fontSize: 10,
      fontFamily: 'var(--fm)',
      fontWeight: 500,
      letterSpacing: '0.06em',
      padding: '3px 8px',
      borderRadius: 'var(--r-sm)',
      background: c.bg,
      color: c.text,
      border: `0.5px solid ${c.border}`,
    }}>
      {c.label}
    </span>
  );
}

/* ── ActionBadge ─────────────────────────────────────────── */
export function ActionBadge({ action }) {
  const c = ACTION_COLORS[action];
  return (
    <span style={{
      fontSize: 10,
      fontFamily: 'var(--fm)',
      fontWeight: 500,
      letterSpacing: '0.06em',
      padding: '3px 8px',
      borderRadius: 'var(--r-sm)',
      background: c.bg,
      color: c.text,
      border: `0.5px solid ${c.border}`,
      textTransform: 'uppercase',
    }}>
      {action}
    </span>
  );
}

/* ── StatusDot ───────────────────────────────────────────── */
export function StatusDot({ level, size = 8 }) {
  const c = LEVEL_COLORS[level];
  return (
    <span style={{
      display: 'inline-block',
      width: size,
      height: size,
      borderRadius: '50%',
      background: c.text,
      flexShrink: 0,
    }} />
  );
}

/* ── SectionLabel ────────────────────────────────────────── */
export function SectionLabel({ children }) {
  return (
    <p style={{
      fontSize: 11,
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.09em',
      color: 'var(--muted)',
      marginBottom: 10,
    }}>
      {children}
    </p>
  );
}

/* ── Card ────────────────────────────────────────────────── */
export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 'var(--r-md)',
      border: '0.5px solid var(--border)',
      boxShadow: 'var(--shadow-sm)',
      padding: '18px 20px',
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ── Divider ─────────────────────────────────────────────── */
export function Divider({ style = {} }) {
  return (
    <div style={{
      height: '0.5px',
      background: 'var(--border)',
      margin: '12px 0',
      ...style,
    }} />
  );
}

/* ── Toast ───────────────────────────────────────────────── */
export function Toast({ message, onDone }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [message, onDone]);

  return (
    <div style={{
      position: 'fixed',
      bottom: 28,
      right: 28,
      background: 'var(--text)',
      color: 'var(--surface)',
      padding: '10px 20px',
      borderRadius: 'var(--r-md)',
      fontSize: 13,
      fontWeight: 400,
      boxShadow: 'var(--shadow-md)',
      opacity: message ? 1 : 0,
      transform: message ? 'translateY(0)' : 'translateY(8px)',
      transition: 'opacity 0.2s ease, transform 0.2s ease',
      pointerEvents: 'none',
      zIndex: 999,
    }}>
      {message}
    </div>
  );
}
