import { test, expect } from '@playwright/test';

test.describe('Catalog Import E2E', () => {
  test('displays CSV upload dropzone', async ({ page }) => {
    await page.goto('/imports');
  });
});
