import React from 'react';

export default function TabBar({ activeTab, onTabChange, auditCount }) {
  const tabs = [
    { id: 'signals',  label: 'Signal Monitor' },
    { id: 'decision', label: 'Record Decision' },
    { id: 'audit',    label: 'Audit Log', badge: auditCount },
  ];

  return (
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '0.5px solid var(--border)',
      padding: '0 28px',
      display: 'flex',
      gap: 0,
      flexShrink: 0,
    }}>
      {tabs.map(tab => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              padding: '10px 20px',
              fontSize: 13,
              fontWeight: isActive ? 500 : 400,
              color: isActive ? 'var(--text)' : 'var(--muted)',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${isActive ? 'var(--text)' : 'transparent'}`,
              marginBottom: -1,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              transition: 'color 0.15s, border-color 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
            {tab.badge > 0 && (
              <span style={{
                fontSize: 10,
                fontFamily: 'var(--fm)',
                background: 'var(--bg)',
                color: 'var(--muted)',
                padding: '1px 6px',
                borderRadius: 10,
                lineHeight: 1.6,
              }}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
