import React from 'react';

export const Drawer: React.FC<{ isOpen: boolean; onClose: () => void; title?: string; children: React.ReactNode }> = ({
  isOpen, onClose, title, children
}) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ width: '400px', background: '#1e293b', height: '100%', padding: '24px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};
