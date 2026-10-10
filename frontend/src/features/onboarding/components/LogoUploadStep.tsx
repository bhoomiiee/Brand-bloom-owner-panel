import React from 'react';
import { ImageUploader } from '../../../components/common/ImageUploader';
import { Button } from '../../../components/ui/Button';

export const LogoUploadStep: React.FC<{ onNext: () => void; onPrev: () => void }> = ({ onNext, onPrev }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3>Step 2: Upload Brand Logo</h3>
      <ImageUploader onUpload={() => {}} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="secondary" onClick={onPrev}>Back</Button>
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
};
