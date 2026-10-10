import React from 'react';
import { ImageUploader } from '../../../components/common/ImageUploader';

export const LogoEditor: React.FC = () => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Storefront Logo</label>
      <ImageUploader onUpload={() => {}} />
    </div>
  );
};
