import React from 'react';

export const ProgressIndicator: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#94a3b8' }}>
        <span>Store Setup</span>
        <span>Step {currentStep} of {totalSteps}</span>
      </div>
      <div style={{ height: '6px', background: '#334155', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{ width: `${(currentStep / totalSteps) * 100}%`, height: '100%', background: '#6366f1', transition: 'width 0.3s ease' }} />
      </div>
    </div>
  );
};
