import React from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(61, 32, 43, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(5px)'
      }}
    >
      <div
        className="bb-card"
        style={{
          background: 'var(--bb-white)',
          padding: '28px',
          width: '90%',
          maxWidth: '540px',
          border: '1px solid var(--bb-border)',
          boxShadow: '0 20px 40px -8px rgba(99, 45, 64, 0.25)',
          color: 'var(--bb-dark-text)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--bb-burgundy)' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--bb-muted-text)',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 600
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
