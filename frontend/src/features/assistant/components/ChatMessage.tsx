import React from 'react';

export const ChatMessage: React.FC<{ sender: 'user' | 'assistant'; text: string }> = ({ sender, text }) => {
  const isUser = sender === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <div
        style={{
          maxWidth: '82%',
          padding: '14px 20px',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          fontSize: '14px',
          lineHeight: 1.55,
          background: isUser ? 'var(--bb-burgundy)' : 'var(--bb-soft-blush)',
          color: isUser ? 'var(--bb-white)' : 'var(--bb-dark-text)',
          border: isUser ? '1px solid var(--bb-burgundy-dark)' : '1px solid rgba(189, 124, 145, 0.3)',
          boxShadow: isUser ? '0 2px 8px rgba(99, 45, 64, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.03)'
        }}
      >
        {!isUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontSize: '11.5px', fontWeight: 700, color: 'var(--bb-burgundy)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>🌸</span> BrandBloom AI Intelligence
          </div>
        )}
        {text}
      </div>
    </div>
  );
};
