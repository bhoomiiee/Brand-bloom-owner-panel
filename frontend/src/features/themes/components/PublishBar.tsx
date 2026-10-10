import React from 'react';
import { Button } from '../../../components/ui/Button';

export const PublishBar: React.FC<{ onPublish: () => void }> = ({ onPublish }) => {
  return (
    <div style={{ padding: '16px 0 0 0', borderTop: '1px solid var(--bb-border)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
      <Button onClick={onPublish}>Publish Live Theme ⚡</Button>
    </div>
  );
};
