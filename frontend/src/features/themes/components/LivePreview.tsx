import React from 'react';

export const LivePreview: React.FC<{
  theme: string;
  primaryColor?: string;
  headline?: string;
  subtitle?: string;
}> = ({
  theme,
  primaryColor = '#6366f1',
  headline = 'Curated Elegance',
  subtitle = 'Experience modern commerce designed for discerning taste.'
}) => {
  const currentTheme = (theme || 'minimal').toLowerCase();

  return (
    <div style={{
      flex: 1,
      background: '#ffffff',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid #334155',
      minHeight: '560px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Browser Bar */}
      <div style={{
        background: '#f1f5f9',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
        </div>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginLeft: 'auto', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Preview: {currentTheme} Theme
        </span>
      </div>

      {/* DISTINCT THEME LAYOUT RENDERING */}
      {currentTheme === 'editorial' ? (
        /* EDITORIAL THEME: Magazine layout, serif typography, split editorial story */
        <div style={{ flex: 1, background: '#faf8f5', color: '#1c1917', padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #1c1917', paddingBottom: '16px' }}>
            <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '14px', letterSpacing: '0.1em' }}>ISSUE NO. 04 · SPRING REPERTOIRE</span>
            <span style={{ fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>THE JOURNAL</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', color: primaryColor, fontWeight: 700 }}>FEATURED NARRATIVE</span>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '38px', lineHeight: 1.15, margin: '12px 0', fontWeight: 400 }}>
                {headline}
              </h1>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', lineHeight: 1.6, color: '#57534e', margin: '0 0 24px 0' }}>
                {subtitle}
              </p>
              <button style={{
                padding: '12px 28px',
                background: 'transparent',
                color: '#1c1917',
                border: '1px solid #1c1917',
                fontFamily: 'Georgia, serif',
                fontSize: '14px',
                cursor: 'pointer',
                letterSpacing: '0.05em'
              }}>
                Read & Shop Collection →
              </button>
            </div>
            <div style={{ background: '#e7e5e4', height: '240px', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #d6d3d1' }}>
              <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#78716c', fontSize: '15px' }}>[ Editorial Still Life ]</span>
            </div>
          </div>
        </div>
      ) : currentTheme === 'bold' ? (
        /* BOLD THEME: High-voltage contrast, dark mode canvas, heavy block styling */
        <div style={{ flex: 1, background: '#090d16', color: '#f8fafc', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'inline-block', padding: '4px 12px', background: primaryColor, color: '#ffffff', fontWeight: 800, fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', borderRadius: '2px' }}>
              DROP 01 // LIVE NOW
            </div>
            <h1 style={{ fontSize: '44px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: '20px 0 12px 0', lineHeight: 1 }}>
              {headline}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '440px', lineHeight: 1.5, margin: 0 }}>
              {subtitle}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '32px' }}>
            {['RAW DENIM', 'UTILITY VEST', 'HEAVY HOODIE'].map((item, idx) => (
              <div key={idx} style={{ background: '#131b2e', border: '2px solid #1e293b', padding: '16px', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', color: primaryColor, fontWeight: 700 }}>0{idx + 1}</span>
                <div style={{ fontWeight: 800, fontSize: '13px', marginTop: '6px' }}>{item}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '28px' }}>
            <button style={{
              padding: '16px 36px',
              background: primaryColor,
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: '14px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: `0 8px 24px ${primaryColor}40`
            }}>
              CLAIM ACCESS
            </button>
          </div>
        </div>
      ) : currentTheme === 'boutique' ? (
        /* BOUTIQUE THEME: Warm ivory, luxury salon aesthetic, romantic ornament */
        <div style={{ flex: 1, background: '#fffcf7', color: '#292524', padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#a8a29e', marginBottom: '8px' }}>
            ATELIER & PROVISIONS
          </div>
          <div style={{ color: primaryColor, fontSize: '18px', marginBottom: '16px' }}>✦ ✦ ✦</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: 300, letterSpacing: '0.04em', margin: '0 0 16px 0', color: '#1c1917' }}>
            {headline}
          </h1>
          <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '16px', color: '#78716c', maxWidth: '440px', lineHeight: 1.6, margin: '0 0 32px 0' }}>
            {subtitle}
          </p>

          <div style={{ width: '100%', maxWidth: '420px', padding: '24px', background: '#ffffff', borderRadius: '16px', border: '1px solid #f5ebe0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a8a29e' }}>SEASONAL CAPSULE</span>
            <div style={{ fontSize: '18px', fontFamily: 'Georgia, serif', margin: '8px 0', color: '#1c1917' }}>Handcrafted Heritage</div>
            <button style={{
              marginTop: '12px',
              padding: '10px 24px',
              background: primaryColor,
              color: '#ffffff',
              border: 'none',
              borderRadius: '24px',
              fontSize: '13px',
              cursor: 'pointer',
              letterSpacing: '0.05em'
            }}>
              Discover Atelier
            </button>
          </div>
        </div>
      ) : (
        /* MINIMAL THEME: Clean, high-contrast typography, crisp whitespace */
        <div style={{ flex: 1, background: '#ffffff', color: '#0f172a', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '12px' }}>
            SPRING / SUMMER ESSENTIALS
          </span>
          <h1 style={{ fontSize: '40px', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 16px 0', color: '#0f172a' }}>
            {headline}
          </h1>
          <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '420px', lineHeight: 1.6, margin: '0 0 32px 0' }}>
            {subtitle}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{
              padding: '12px 28px',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer'
            }}>
              Shop All
            </button>
            <button style={{
              padding: '12px 28px',
              background: 'transparent',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer'
            }}>
              Lookbook
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
