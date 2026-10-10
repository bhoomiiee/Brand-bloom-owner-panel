export const mediaService = {
  async saveAsset(storeId: string, file: Express.Multer.File) {
    return {
      storeId,
      filename: file?.originalname || 'upload.png',
      url: `/uploads/${file?.filename || 'mock.png'}`,
      mimeType: file?.mimetype || 'image/png'
    };
  },

  async list(storeId: string) {
    return [{ storeId, url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c' }];
  }
};
