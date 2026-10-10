import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { ThemeGallery } from '../components/ThemeGallery';
import { ColorEditor } from '../components/ColorEditor';
import { TypographyEditor } from '../components/TypographyEditor';
import { LogoEditor } from '../components/LogoEditor';
import { BannerEditor } from '../components/BannerEditor';
import { LivePreview } from '../components/LivePreview';
import { PublishBar } from '../components/PublishBar';
import { useToast } from '../../../components/feedback/ToastProvider';
import { Button } from '../../../components/ui/Button';
import { themesApi } from '../api/themes.api';
import { BotanicalCornerFoliage, BotanicalCardAccent } from '../../../components/botanical/BotanicalDecorations';

export const ThemeEditorPage: React.FC = () => {
  const [theme, setTheme] = useState('minimal');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [headline, setHeadline] = useState('Curated Elegance');
  const [subtitle, setSubtitle] = useState('Experience modern commerce designed for discerning taste.');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    themesApi.getConfig()
      .then(cfg => {
        const active = cfg.draftConfig || cfg;
        if (active.themeId) setTheme(active.themeId);
        if (active.colors?.primary) setPrimaryColor(active.colors.primary);
        if (active.banner?.headline) setHeadline(active.banner.headline);
        if (active.banner?.subtitle) setSubtitle(active.banner.subtitle);
      })
      .catch(err => {
        console.error('Failed to load theme configuration', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await themesApi.updateConfig({
        themeId: theme,
        colors: { primary: primaryColor },
        banner: { headline, subtitle }
      });
      showToast('Theme draft saved successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save theme draft', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // First ensure draft is saved
      await themesApi.updateConfig({
        themeId: theme,
        colors: { primary: primaryColor },
        banner: { headline, subtitle }
      });
      // Then publish
      await themesApi.publish();
      showToast('Theme published to live storefront!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to publish theme', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <BotanicalCornerFoliage position="top-right" size={200} opacity={0.25} />

      <PageHeader
        title="Theme Studio & Website Upgrades"
        subtitle="Customize and publish your customer-facing BrandBloom storefront styling and theme presets"
        actions={
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="secondary" onClick={handleSaveDraft} disabled={isSaving || isPublishing}>
              {isSaving ? 'Saving Draft...' : 'Save Draft'}
            </Button>
            <Button onClick={handlePublish} disabled={isSaving || isPublishing}>
              {isPublishing ? 'Publishing...' : 'Publish Live Theme ⚡'}
            </Button>
          </div>
        }
      />

      {/* Website Upgrades Banner with foliage accents */}
      <div
        className="bb-card-blush"
        style={{
          padding: '20px 24px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <BotanicalCardAccent position="top-right" size={80} opacity={0.4} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '18px' }}>🌿</span>
            <h3 style={{ fontSize: '15.5px', fontWeight: 700, margin: 0, color: 'var(--bb-burgundy)' }}>
              BrandBloom Visual Theme Preset: Option 4 (Burgundy + Dusty Rose + Blush)
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--bb-dark-text)', lineHeight: 1.4 }}>
            Tailored botanical aesthetic applied. Changes saved here update your headless storefront instantly once published.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ color: 'var(--bb-muted-text)', padding: '32px' }}>Loading theme settings...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '32px' }}>
          <div className="bb-card" style={{ padding: '24px', position: 'relative' }}>
            <BotanicalCardAccent position="bottom-right" size={60} opacity={0.25} />
            <ThemeGallery activeTheme={theme} onSelect={setTheme} />
            <ColorEditor color={primaryColor} onChange={setPrimaryColor} />
            <TypographyEditor />
            <BannerEditor />
            <LogoEditor />
            <PublishBar onPublish={handlePublish} />
          </div>
          <div className="bb-card" style={{ padding: '8px', background: 'var(--bb-warm-offwhite)' }}>
            <LivePreview theme={theme} primaryColor={primaryColor} headline={headline} subtitle={subtitle} />
          </div>
        </div>
      )}
    </div>
  );
};
