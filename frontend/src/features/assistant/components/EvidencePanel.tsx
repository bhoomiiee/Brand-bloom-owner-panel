import React from 'react';

export const EvidencePanel: React.FC<{ evidence: any }> = ({ evidence }) => {
  return (
    <div
      style={{
        margin: '8px 0 0 16px',
        padding: '10px 14px',
        background: 'var(--bb-warm-offwhite)',
        borderRadius: '8px',
        border: '1px solid var(--bb-border)',
        borderLeft: '3px solid var(--bb-dusty-rose)',
        fontSize: '12.5px',
        color: 'var(--bb-dark-text)'
      }}
    >
      <strong style={{ color: 'var(--bb-burgundy)' }}>✓ Verified Audit Trail:</strong> Metric [<code>{evidence.queryIntent?.metric}</code>] calculated directly from database records.
    </div>
  );
};
