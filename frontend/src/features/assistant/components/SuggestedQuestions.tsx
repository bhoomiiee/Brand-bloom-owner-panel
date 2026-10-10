import React from 'react';

export const SuggestedQuestions: React.FC<{ onSelect: (q: string) => void }> = ({ onSelect }) => {
  const suggestions = [
    'What is our total revenue?',
    'How many paid orders do we have?',
    'Which items are in low stock?'
  ];

  return (
    <div style={{ display: 'flex', gap: '8px', padding: '10px 20px', flexWrap: 'wrap', borderTop: '1px solid var(--bb-border)', background: 'var(--bb-white)' }}>
      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--bb-muted-text)', display: 'flex', alignItems: 'center' }}>
        Suggestions:
      </span>
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect(s)}
          style={{
            background: 'var(--bb-soft-blush)',
            border: '1px solid rgba(189, 124, 145, 0.4)',
            borderRadius: '999px',
            padding: '6px 14px',
            color: 'var(--bb-burgundy)',
            fontSize: '12.5px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bb-burgundy)';
            e.currentTarget.style.color = 'var(--bb-white)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bb-soft-blush)';
            e.currentTarget.style.color = 'var(--bb-burgundy)';
          }}
        >
          ✨ {s}
        </button>
      ))}
    </div>
  );
};
