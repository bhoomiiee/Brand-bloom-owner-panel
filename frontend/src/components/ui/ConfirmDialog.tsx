import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export const ConfirmDialog: React.FC<{
  isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p style={{ color: '#94a3b8', marginBottom: '20px' }}>{message}</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>Confirm</Button>
      </div>
    </Modal>
  );
};
