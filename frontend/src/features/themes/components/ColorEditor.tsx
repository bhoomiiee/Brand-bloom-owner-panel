import React from 'react';
import { Input } from '../../../components/ui/Input';

export const ColorEditor: React.FC<{ color: string; onChange: (c: string) => void }> = ({ color, onChange }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
      <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bb-burgundy)' }}>Brand Accent Color</label>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input
          type="color"
          value={color}
          onChange={e => onChange(e.target.value)}
          style={{ width: '42px', height: '42px', border: '1px solid var(--bb-border)', borderRadius: '8px', cursor: 'pointer', padding: '2px', background: 'var(--bb-white)' }}
        />
        <Input value={color} onChange={e => onChange(e.target.value)} style={{ width: '140px' }} />
      </div>
    </div>
  );
};
