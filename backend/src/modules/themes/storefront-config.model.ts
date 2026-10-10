import mongoose, { Schema, Document } from 'mongoose';

export interface IThemeSettings {
  themeId: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
    surface: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  banner?: {
    headline: string;
    subtitle: string;
    imageUrl?: string;
  };
  logoUrl?: string;
  sections: Array<{
    type: string;
    enabled: boolean;
    settings: Record<string, any>;
  }>;
}

export interface IStorefrontConfig extends Document {
  storeId: mongoose.Types.ObjectId;
  themeId: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
    surface: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  sections: Array<{
    type: string;
    enabled: boolean;
    settings: Record<string, any>;
  }>;
  draftConfig?: IThemeSettings;
  publishedConfig?: IThemeSettings;
  publishedAt?: Date;
}

const StorefrontConfigSchema = new Schema<IStorefrontConfig>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, unique: true },
  themeId: { type: String, default: 'minimal' },
  colors: {
    primary: { type: String, default: '#000000' },
    accent: { type: String, default: '#2563eb' },
    background: { type: String, default: '#ffffff' },
    surface: { type: String, default: '#f8fafc' }
  },
  typography: {
    headingFont: { type: String, default: 'Inter' },
    bodyFont: { type: String, default: 'Inter' }
  },
  sections: [{
    type: { type: String },
    enabled: { type: Boolean, default: true },
    settings: { type: Schema.Types.Mixed, default: {} }
  }],
  draftConfig: { type: Schema.Types.Mixed },
  publishedConfig: { type: Schema.Types.Mixed },
  publishedAt: { type: Date }
}, { timestamps: true });

export const StorefrontConfigModel = mongoose.model<IStorefrontConfig>('StorefrontConfig', StorefrontConfigSchema);
