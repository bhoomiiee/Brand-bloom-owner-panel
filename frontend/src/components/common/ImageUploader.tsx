import React from 'react';

export const ImageUploader: React.FC<{ onUpload: (url: string) => void }> = ({ onUpload }) => {
  return (
    <div style={{ border: '2px dashed #475569', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
      <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>Upload image or enter URL</p>
      <input
        type="text"
        placeholder="https://images.unsplash.com/..."
        style={{ padding: '8px 12px', width: '80%', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
        onBlur={e => { if (e.target.value) onUpload(e.target.value); }}
      />
    </div>
  );
};
