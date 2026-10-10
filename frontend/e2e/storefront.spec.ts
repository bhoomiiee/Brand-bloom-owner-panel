import { test, expect } from '@playwright/test';

test.describe('Storefront E2E', () => {
  test('displays store home page', async ({ page }) => {
    await page.goto('/store/bloom-boutique');
  });
});
