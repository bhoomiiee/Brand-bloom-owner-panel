import React from 'react';

export const ErrorState: React.FC<{ message?: string; onRetry?: () => void }> = ({
  message = 'Failed to load data.', onRetry
}) => {
  return (
    <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
      <p style={{ color: '#ef4444', marginBottom: '12px' }}>{message}</p>
      {onRetry && <button onClick={onRetry} style={{ padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px' }}>Retry</button>}
    </div>
  );
};
