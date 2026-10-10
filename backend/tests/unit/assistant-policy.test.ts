import { describe, it, expect } from 'vitest';
import { assistantPolicy } from '../../src/modules/assistant/assistant-policy.js';
import { METRIC_REGISTRY } from '../../src/modules/assistant/metric-registry.js';

describe('Assistant Policy & Metric Registry Unit Tests', () => {
  it('enforces metric query boundaries on approved metrics', () => {
    const approvedMetrics = METRIC_REGISTRY.map(m => m.id);
    expect(approvedMetrics).toEqual([
      'revenue',
      'paid-order-count',
      'average-order-value',
      'sales-by-product',
      'low-stock-products'
    ]);

    for (const metric of approvedMetrics) {
      expect(assistantPolicy.isQueryAllowed(metric)).toBe(true);
    }
  });

  it('strictly rejects unapproved or malicious metrics', () => {
    expect(assistantPolicy.isQueryAllowed('drop-database')).toBe(false);
    expect(assistantPolicy.isQueryAllowed('system-users')).toBe(false);
    expect(assistantPolicy.isQueryAllowed('admin-credentials')).toBe(false);
    expect(assistantPolicy.isQueryAllowed('')).toBe(false);
    expect(assistantPolicy.isQueryAllowed('arbitrary-query')).toBe(false);
  });
});
