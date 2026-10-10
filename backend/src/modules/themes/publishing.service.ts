export const publishingService = {
  publishDraft: async (storeId: string) => ({ storeId, status: 'PUBLISHED' })
};
