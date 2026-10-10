import { StorefrontConfigModel } from './storefront-config.model.js';
import { THEME_PRESETS } from './theme-registry.js';

export const themesService = {
  async getThemes() {
    return THEME_PRESETS;
  },

  async getStorefrontConfig(storeId: string) {
    let cfg = await StorefrontConfigModel.findOne({ storeId });
    if (!cfg) {
      const initialSettings = {
        themeId: 'minimal',
        colors: { primary: '#111827', accent: '#3b82f6', background: '#ffffff', surface: '#f9fafb' },
        typography: { headingFont: 'Inter', bodyFont: 'Inter' },
        banner: { headline: 'Curated Essentials', subtitle: 'Modern craftsmanship for everyday living' },
        sections: [
          { type: 'hero', enabled: true, settings: { headline: 'Curated Essentials' } },
          { type: 'featured-products', enabled: true, settings: { limit: 8 } }
        ]
      };
      cfg = await StorefrontConfigModel.create({
        storeId,
        themeId: 'minimal',
        colors: initialSettings.colors,
        typography: initialSettings.typography,
        sections: initialSettings.sections,
        draftConfig: initialSettings,
        publishedConfig: initialSettings,
        publishedAt: new Date()
      });
    }
    return cfg;
  },

  async updateConfig(storeId: string, data: any) {
    const cfg = await this.getStorefrontConfig(storeId);
    const updatedDraft = {
      themeId: data.themeId || cfg.draftConfig?.themeId || cfg.themeId,
      colors: data.colors || cfg.draftConfig?.colors || cfg.colors,
      typography: data.typography || cfg.draftConfig?.typography || cfg.typography,
      banner: data.banner || cfg.draftConfig?.banner,
      logoUrl: data.logoUrl || cfg.draftConfig?.logoUrl,
      sections: data.sections || cfg.draftConfig?.sections || cfg.sections
    };

    return StorefrontConfigModel.findOneAndUpdate(
      { storeId },
      { draftConfig: updatedDraft },
      { new: true }
    );
  },

  async publish(storeId: string) {
    const cfg = await this.getStorefrontConfig(storeId);
    const toPublish = cfg.draftConfig || {
      themeId: cfg.themeId,
      colors: cfg.colors,
      typography: cfg.typography,
      sections: cfg.sections
    };

    return StorefrontConfigModel.findOneAndUpdate(
      { storeId },
      {
        publishedConfig: toPublish,
        publishedAt: new Date(),
        themeId: toPublish.themeId,
        colors: toPublish.colors,
        typography: toPublish.typography,
        sections: toPublish.sections
      },
      { new: true }
    );
  }
};
