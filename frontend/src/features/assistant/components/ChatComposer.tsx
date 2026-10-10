import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';

export const ChatComposer: React.FC<{ onSend: (q: string) => void; disabled?: boolean }> = ({ onSend, disabled }) => {
  const [val, setVal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!val.trim()) return;
    onSend(val);
    setVal('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        gap: '12px',
        padding: '16px 20px',
        borderTop: '1px solid var(--bb-border)',
        background: 'var(--bb-warm-offwhite)'
      }}
    >
      <input
        type="text"
        placeholder="Ask a question (e.g., 'What is my total revenue?' or 'Which items have low stock?')..."
        value={val}
        onChange={e => setVal(e.target.value)}
        disabled={disabled}
        style={{
          flex: 1,
          padding: '11px 16px',
          background: 'var(--bb-white)',
          border: '1px solid var(--bb-border)',
          borderRadius: '10px',
          color: 'var(--bb-dark-text)',
          fontSize: '14px',
          outline: 'none',
          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.02)'
        }}
      />
      <Button type="submit" disabled={disabled || !val.trim()}>
        Ask AI
      </Button>
    </form>
  );
};
