import React, { useState } from 'react';
import { getSignalLevel, buildSnapshot } from '../data/signals';
import { StatusDot, StatusBadge, ActionBadge, SectionLabel, Card, Divider, LEVEL_COLORS, ACTION_COLORS } from './ui';

/**
 * RecordDecision
 * --------------
 * TODO (Backend integration): The handleSubmit function currently writes
 * directly to local state (auditLog). Replace the contents of handleSubmit
 * with a fetch() POST to your API Gateway endpoint:
 *
 *   const response = await fetch(`${API_BASE_URL}/decisions`, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ signalId, reasoning, action }),
 *   });
 *
 * The Lambda handler will assemble the snapshot and timestamp server-side.
 * On success, re-fetch the audit log to keep it in sync.
 */

export default function RecordDecision({
  signals,
  selectedSignalId,
  onSelectSignal,
  auditLog,
  onSubmit,
  onToast,
}) {
  const [reasoning, setReasoning] = useState('');
  const [action, setAction]       = useState(null);

  const activeSignal = signals.find(s => s.id === selectedSignalId) || signals[0];
  const level        = getSignalLevel(activeSignal);

  // Find the last decision recorded for the currently selected signal
  const lastDecision = auditLog.find(e => e.signalId === activeSignal.id);

  function handleSubmit() {
    if (!action) {
      onToast('Please select a decision action (Ignore, Monitor, or Escalate).');
      return;
    }
    if (reasoning.trim().length < 10) {
      onToast('Please add at least 10 characters of reasoning before submitting.');
      return;
    }

    const snapshot  = buildSnapshot(signals);
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0] + ' UTC';

    // TODO (Backend integration): Replace below with API call. See file header.
    onSubmit({
      signalId:   activeSignal.id,
      signalName: activeSignal.name,
      action,
      reasoning:  reasoning.trim(),
      snapshot,
      timestamp,
    });

    setReasoning('');
    setAction(null);
    onToast('Decision recorded successfully.');
  }

  const canSubmit = action !== null && reasoning.trim().length >= 10;

  return (
    <div style={{ padding: '20px 28px', display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 16 }}>

      {/* ── Left column: form ── */}
      <Card style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Signal chips */}
        <div>
          <SectionLabel>Select signal</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {signals.map(s => {
              const lvl = getSignalLevel(s);
              const isSelected = s.id === activeSignal.id;
              return (
                <button
                  key={s.id}
                  onClick={() => onSelectSignal(s.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 13px',
                    borderRadius: 'var(--r-sm)',
                    border: isSelected ? '1px solid var(--border-md)' : '0.5px solid var(--border)',
                    background: isSelected ? 'var(--surface)' : 'var(--bg)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border-color 0.12s, background 0.12s',
                  }}
                >
                  <StatusDot level={lvl} />
                  <span style={{ flex: 1, fontSize: 13 }}>{s.name}</span>
                  <span style={{ fontFamily: 'var(--fm)', fontSize: 12, color: LEVEL_COLORS[lvl].text, fontWeight: 500 }}>
                    {s.value}{s.unit}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Divider />

        {/* Reasoning */}
        <div>
          <SectionLabel>Analyst reasoning</SectionLabel>
          <textarea
            value={reasoning}
            onChange={e => setReasoning(e.target.value)}
            maxLength={2000}
            placeholder="Describe what you observe in this signal and why you are taking this action. Your notes will be preserved in the audit record…"
            style={{
              width: '100%',
              minHeight: 120,
              padding: '10px 12px',
              fontSize: 13,
              lineHeight: 1.6,
              border: '0.5px solid var(--border)',
              borderRadius: 'var(--r-sm)',
              background: 'var(--bg)',
              color: 'var(--text)',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--border-md)'; e.target.style.background = 'var(--surface)'; }}
            onBlur={e  => { e.target.style.borderColor = 'var(--border)';    e.target.style.background = 'var(--bg)'; }}
          />
          <p style={{ fontSize: 11, color: 'var(--hint)', marginTop: 4, textAlign: 'right' }}>
            {reasoning.trim().length} / 2000
          </p>
        </div>

        {/* Action buttons */}
        <div>
          <SectionLabel>Decision</SectionLabel>
          <div style={{ display: 'flex', gap: 8 }}>
            {['ignore', 'monitor', 'escalate'].map(a => {
              const c       = ACTION_COLORS[a];
              const isChosen = action === a;
              return (
                <button
                  key={a}
                  onClick={() => setAction(a)}
                  style={{
                    flex: 1,
                    padding: '9px 6px',
                    borderRadius: 'var(--r-sm)',
                    fontSize: 13,
                    fontWeight: isChosen ? 500 : 400,
                    border: isChosen ? `1px solid ${c.border}` : '0.5px solid var(--border)',
                    background: isChosen ? c.bg : 'var(--bg)',
                    color: isChosen ? c.text : 'var(--muted)',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.12s',
                  }}
                >
                  {a}
                </button>
              );
            })}
          </div>
        </div>

        <Divider />

        {/* Submit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              padding: '10px 22px',
              borderRadius: 'var(--r-sm)',
              fontSize: 13,
              fontWeight: 500,
              background: canSubmit ? 'var(--text)' : 'var(--border)',
              color: 'var(--surface)',
              border: 'none',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              opacity: canSubmit ? 1 : 0.5,
              transition: 'opacity 0.15s, background 0.15s',
            }}
          >
            Record decision
          </button>
          <p style={{ fontSize: 11, color: 'var(--hint)' }}>
            A snapshot of all current signal values will be captured automatically.
          </p>
        </div>
      </Card>

      {/* ── Right column: snapshot + last action ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Live snapshot */}
        <Card>
          <SectionLabel>Current data snapshot</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {signals.map((s, i) => {
              const lvl = getSignalLevel(s);
              const isLast = i === signals.length - 1;
              return (
                <div key={s.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: isLast ? 'none' : '0.5px solid var(--border)',
                  fontSize: 13,
                }}>
                  <span style={{ color: 'var(--muted)' }}>{s.name}</span>
                  <span style={{ fontFamily: 'var(--fm)', fontWeight: 500, color: LEVEL_COLORS[lvl].text }}>
                    {s.value}{s.unit}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Last decision on this signal */}
        <Card>
          <SectionLabel>Last decision — {activeSignal.shortName}</SectionLabel>
          {lastDecision ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <ActionBadge action={lastDecision.action} />
                <span style={{ fontSize: 11, fontFamily: 'var(--fm)', color: 'var(--muted)' }}>
                  {lastDecision.timestamp}
                </span>
              </div>
              <div style={{
                fontSize: 12,
                color: 'var(--muted)',
                lineHeight: 1.6,
                background: 'var(--bg)',
                padding: '9px 12px',
                borderRadius: 'var(--r-sm)',
                borderLeft: '2px solid var(--border-md)',
              }}>
                {lastDecision.reasoning}
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 12, color: 'var(--hint)' }}>No prior decision recorded for this signal.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
