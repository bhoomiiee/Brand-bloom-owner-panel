export const evidenceBuilderService = {
  build(storeId: string, intent: any, figures: any) {
    return {
      storeId,
      metric: intent.metric,
      version: '1.0',
      timeRange: intent.timeRange || 'all-time',
      provenance: {
        sourceCollection: intent.metric === 'low-stock-products' ? 'inventories' : 'orders',
        qualifyingStatuses: ['PAID', 'PROCESSING', 'FULFILLED', 'COMPLETED'],
        immutableSource: true
      },
      rawFigures: figures,
      computedAt: new Date().toISOString()
    };
  }
};
