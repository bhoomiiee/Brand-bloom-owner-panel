import React from 'react';

export const ImportUploader: React.FC<{ onFileSelect: (f: File) => void }> = ({ onFileSelect }) => {
  return (
    <div style={{ border: '2px dashed #475569', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
      <input type="file" accept=".csv" onChange={e => e.target.files?.[0] && onFileSelect(e.target.files[0])} />
      <p style={{ marginTop: '12px', color: '#94a3b8', fontSize: '13px' }}>Upload a CSV file with headers: Title, SKU, Price, Stock</p>
    </div>
  );
};
