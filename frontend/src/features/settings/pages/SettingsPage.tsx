import React from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { StoreProfileForm } from '../components/StoreProfileForm';
import { EmailSettingsCard } from '../components/EmailSettingsCard';
import { BotanicalCornerFoliage, BotanicalCardAccent } from '../../../components/botanical/BotanicalDecorations';

export const SettingsPage: React.FC = () => {
  return (
    <div style={{ position: 'relative' }}>
      <BotanicalCornerFoliage position="top-right" size={200} opacity={0.25} />

      <PageHeader
        title="Store Settings & Configuration"
        subtitle="Configure store profile, currency, email delivery via Resend, and domain routing"
      />

      <div className="bb-card" style={{ padding: '28px 32px', position: 'relative' }}>
        <BotanicalCardAccent position="top-right" size={70} opacity={0.3} />
        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--bb-burgundy)' }}>
          Store Profile
        </h2>
        <StoreProfileForm />
      </div>

      <EmailSettingsCard />
    </div>
  );
};
