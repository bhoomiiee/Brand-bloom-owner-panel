import React from 'react';
import { OnboardingWizard } from '../components/OnboardingWizard';

export const OnboardingPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '40px 20px' }}>
      <OnboardingWizard />
    </div>
  );
};
