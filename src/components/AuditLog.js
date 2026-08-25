import React, { useState } from 'react';
import { ActionBadge, LEVEL_COLORS, ACTION_COLORS } from './ui';

const FILTERS = [
  { id: 'all',      label: 'All' },
  { id: 'escalate', label: 'Escalated' },
  { id: 'monitor',  label: 'Monitored' },
  { id: 'ignore',   label: 'Ignored' },
];

export default function AuditLog({ auditLog }) {
  const [filter, setFilter] = useState('all');

  const visible = filter === 'all'
    ? auditLog
    : auditLog.filter(e => e.action === filter);

  return (
    <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 6 }}>
        {FILTERS.map(f => {
          const isActive = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--r-sm)',
                fontSize: 12,
                fontWeight: isActive ? 500 : 400,
                border: isActive ? '0.5px solid var(--border-md)' : '0.5px solid var(--border)',
                background: isActive ? 'var(--surface)' : 'var(--bg)',
                color: isActive ? 'var(--text)' : 'var(--muted)',
                cursor: 'pointer',
                transition: 'all 0.12s',
              }}
            >
              {f.label}
            </button>
          );
        })}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--hint)', alignSelf: 'center' }}>
          {visible.length} record{visible.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Empty state */}
      {visible.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--muted)' }}>
          <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.3 }}>▭</div>
          <p style={{ fontSize: 13 }}>
            {filter === 'all'
              ? 'No decisions recorded yet. Use the Record Decision tab to log your first entry.'
              : `No ${filter}d decisions recorded.`}
          </p>
        </div>
      )}

      {/* Entries */}
      {visible.map((entry, i) => (
        <AuditEntry key={entry.decisionId || entry.id || i} entry={entry} />
      ))}
    </div>
  );
}

function AuditEntry({ entry }) {
  const actionColor = ACTION_COLORS[entry.action] || ACTION_COLORS['monitor'];

  // entry.id is a number for local entries, entry.decisionId is a UUID from DynamoDB
  const entryRef = entry.decisionId
    ? entry.decisionId.slice(-6)
    : String(entry.id || '').slice(-6);

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 'var(--r-md)',
      border: '0.5px solid var(--border)',
      borderLeft: `3px solid ${actionColor.text}`,
      boxShadow: 'var(--shadow-sm)',
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>

      {/* Entry header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{entry.signalName}</span>
          <span style={{ fontSize: 11, fontFamily: 'var(--fm)', color: 'var(--muted)' }}>
            {entry.timestamp}
          </span>
        </div>
        <ActionBadge action={entry.action} />
      </div>

      {/* Snapshot grid */}
      <div>
        <p style={{
          fontSize: 10,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.09em',
          color: 'var(--hint)',
          marginBottom: 8,
        }}>
          Data at time of decision
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '4px 20px',
        }}>
          {(entry.snapshot || []).map((s, i) => {
            const levelColor = s.level && LEVEL_COLORS[s.level]
              ? LEVEL_COLORS[s.level].text
              : 'var(--text)';
            return (
              <div key={s.id || i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                fontFamily: 'var(--fm)',
                color: 'var(--muted)',
                padding: '3px 0',
              }}>
                <span>{s.name}</span>
                <span style={{ fontWeight: 500, color: levelColor }}>
                  {s.value}{s.unit}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reasoning */}
      <div>
        <p style={{
          fontSize: 10,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.09em',
          color: 'var(--hint)',
          marginBottom: 6,
        }}>
          Analyst reasoning
        </p>
        <div style={{
          fontSize: 12,
          color: 'var(--muted)',
          lineHeight: 1.65,
          background: 'var(--bg)',
          padding: '10px 13px',
          borderRadius: 'var(--r-sm)',
          borderLeft: '2px solid var(--border-md)',
        }}>
          {entry.reasoning}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 11,
        color: 'var(--hint)',
        fontFamily: 'var(--fm)',
      }}>
        <span>Entry #{entryRef}</span>
        {entry.analystEmail && (
          <span>{entry.analystEmail}</span>
        )}
      </div>
    </div>
  );
}