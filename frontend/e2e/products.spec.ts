import { test, expect } from '@playwright/test';

test.describe('Products Catalog E2E', () => {
  test('lists products correctly', async ({ page }) => {
    await page.goto('/products');
  });
});
