import React from 'react';

export const HeroBanner: React.FC<{ headline?: string; subhead?: string }> = ({
  headline = 'Curated Modern Living',
  subhead = 'Timeless silhouettes, sustainable textiles, and refined everyday essentials.'
}) => {
  return (
    <section style={{
      padding: '100px 40px', textAlign: 'center', background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
      borderBottom: '1px solid #f1f5f9'
    }}>
      <h1 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '16px', color: '#0f172a' }}>
        {headline}
      </h1>
      <p style={{ fontSize: '18px', color: '#64748b', maxWidth: '600px', margin: '0 auto 32px auto', lineHeight: 1.6 }}>
        {subhead}
      </p>
      <button style={{
        padding: '14px 36px', background: '#0f172a', color: '#ffffff',
        border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer'
      }}>
        Explore New Arrivals
      </button>
    </section>
  );
};
